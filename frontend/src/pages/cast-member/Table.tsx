import * as React from 'react';
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {parseISO, format} from 'date-fns';
import castMemberHttp from "../../utils/http/cast-member-http";
import {CastMember, CastMemberTypeMap, ListResponse} from "../../utils/models";
import DefaultTable, {makeActionStyles, MuiDataTableRefComponent, TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {MuiThemeProvider} from "@material-ui/core/styles";
import useFilter from "../../hooks/useFilter";
import * as yup from '../../utils/vendor/yup';
import {invert} from 'lodash';
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import LoadingContext from "../../components/loading/LoadingContext";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import DeleteDialog from "../../components/DeleteDialog";

const castMemberNames = Object.values(CastMemberTypeMap);

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        options: {
            sort: false,
            filter: false
        },
        width: '30%',
    },
    {
        name: 'name',
        label: 'Nome',
        options: {
            filter: false,
        }
    },
    {
        name: 'type',
        label: 'Tipo',
        options: {
            filterOptions: {
                names: castMemberNames
            },
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypeMap[value];
            },
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            filter: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            sort: false,
            filter: false,
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return (
                    <IconButton
                        color={'secondary'}
                        component={Link}
                        to={`/cast-members/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                );
            },
        }
    },
];

type Props = {

};
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];
const debounceTime = 500;

const Table = (props: Props) => {
    const [data, setData] = useState<CastMember[]>([]);
    const {enqueueSnackbar} = useSnackbar();
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const subscribed = useRef(true);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const extraFilter = useMemo(() => (
        {
            createValidationSchema: () => {
                return yup.object().shape({
                    type: yup.string()
                        .nullable()
                        .oneOf(castMemberNames)
                        .transform(value => {
                            return !value || !castMemberNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.type &&
                        {type: debouncedState.extraFilter.type}
                    ),
                    ...(
                        debouncedState.extraFilter.is_active &&
                        {is_active: debouncedState.extraFilter.is_active}
                    )
                } : undefined;
            },
            getStateFromUrl: (queryParams) => {
                return {
                    type: queryParams.get('type')
                }
            }
        }
    ), []);

    const {
        columns,
        filterManager,
        filterState,
        cleanSearchText,
        debouncedFilterState,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter
    });

    const searchText = cleanSearchText(filterState.search);
    const indexColumnType = columns.findIndex(c => c.name === 'type');
    const columnType = columns[indexColumnType];
    const typeFilterValue = filterState.extraFilter && filterState.extraFilter.type as never;
    (columnType.options as any).filterList = typeFilterValue ? [typeFilterValue] : [];

    const getData = useCallback(async ({search, page, per_page, sort, dir, type}) => {
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>({
                queryOptions: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(type && {type: invert(CastMemberTypeMap)[type]}),
                }
            });
            setData(data.data);
            setTotalRecords(data.meta.total);
            setOpenDeleteDialog(false);
        } catch (error) {
            if (castMemberHttp.isCancelRequest(error)) {
                return;
            }
            console.error(error);
            enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
        }
    }, [enqueueSnackbar, setTotalRecords, setOpenDeleteDialog]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
            type: debouncedFilterState?.extraFilter?.type,
        });
        return () => {
            subscribed.current = false;
        }
    }, [
        getData,
        searchText,
        debouncedFilterState,
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        debouncedFilterState.extraFilter,
    ]);

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete.data
            .map((value) => data[value.index].id)
            .join(',');
        castMemberHttp.deleteCollection({ids})
            .then((response) => {
                enqueueSnackbar('Registros excluídos com sucesso!', {variant: 'success'});
                const page = filterState.pagination.page;

                if (rowsToDelete.data.length === data.length && page > 1) {
                    filterManager.changePage(page - 2)
                } else {
                    getData({
                        search: searchText,
                        page: filterState.pagination.page,
                        per_page: filterState.pagination.per_page,
                        sort: filterState.order.sort,
                        dir: filterState.order.dir,
                        type: debouncedFilterState?.extraFilter?.type,
                    });
                }
            }).catch((error) => {
            console.error(error);
            enqueueSnackbar('Não foi possível excluir os registros', {variant: 'error'});
        });
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                columns={columnsDefinition}
                title='Listagem de membros'
                data={data}
                loading={loading}
                ref={tableRef}
                options={{
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions: rowsPerPageOptions,
                    count: totalRecords,
                    serverSide: true,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                         filterManager.changeExtraFilter({
                            [column as string]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
                        })
                    },
                    customToolbar: () => (
                        <FilterResetButton handleClick={() => filterManager.resetFilter()}/>
                    ),
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction),
                    onRowsDelete: (rowsDeleted) => {
                        setRowsToDelete(rowsDeleted);
                        return false;
                    },
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;
