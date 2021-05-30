import * as React from 'react';
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {parseISO, format} from 'date-fns';
import categoryHttp from "../../utils/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse, YesNoTypeMap} from "../../utils/models";
import DefaultTable, {makeActionStyles, TableColumn, MuiDataTableRefComponent} from '../../components/Table';
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import useFilter from "../../hooks/useFilter";
import {invert} from "lodash";
import * as yup from "../../utils/vendor/yup";
import LoadingContext from "../../components/loading/LoadingContext";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import DeleteDialog from "../../components/DeleteDialog";

const yesNoNames = Object.values(YesNoTypeMap);
const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        options: {
            sort: false,
            filter: false,
        },
        width: '30%',
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
        options: {
            filter: false,
        },
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            filterOptions: {
                names: yesNoNames
            },
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        },
        width: '4%',
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            },
            filter: false,
        },
        width: '10%',
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
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon/>
                    </IconButton>
                );
            }
        }
    },
];

type Props = {

};

const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50];
const debounceTime = 500;

const Table = (props: Props) => {
    const {enqueueSnackbar} = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([]);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const loading = useContext(LoadingContext);
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const extraFilter = useMemo(() => (
        {
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.is_active &&
                        {is_active: debouncedState.extraFilter.is_active}
                    )
                } : undefined;
            },
            getStateFromUrl: (queryParams) => {
                return {
                    is_active: queryParams.get('is_active')
                }
            },
            createValidationSchema: () => {
                return yup.object().shape({
                    is_active: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !yesNoNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                })
            },
        }
    ), []);

    const {
        columns,
        filterManager,
        cleanSearchText,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage: rowsPerPage,
        rowsPerPageOptions: rowsPerPageOptions,
        tableRef: tableRef,
        extraFilter
    });

    const indexColumnIsAtive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsAtive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];
    const searchText = cleanSearchText(debouncedFilterState.search);

    const getData = useCallback(async ({search, page, per_page, sort, dir, is_active}) => {
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryOptions: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...(is_active && {is_active: invert(YesNoTypeMap)[is_active]}),
                }
            });
            setData(data.data);
            setTotalRecords(data.meta.total);
            setOpenDeleteDialog(false);
        } catch (error) {
            if (categoryHttp.isCancelRequest(error)) {
                return;
            }
            console.error(error);
            enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
        }
    }, [setTotalRecords, setOpenDeleteDialog, enqueueSnackbar]);

    useEffect(() => {
        subscribed.current = true;
        getData({
            search: searchText,
            page: debouncedFilterState.pagination.page,
            per_page: debouncedFilterState.pagination.per_page,
            sort: debouncedFilterState.order.sort,
            dir: debouncedFilterState.order.dir,
            is_active: debouncedFilterState?.extraFilter?.is_active,
        });

        return () => {
            subscribed.current = false;
        }
    }, [
        searchText,
        getData,
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
        categoryHttp.deleteCollection({ids})
            .then((response) => {
                enqueueSnackbar('Registros excluídos com sucesso!', {variant: 'success'});
                const page = filterState.pagination.page;

                if (rowsToDelete.data.length === data.length && page > 1) {
                    filterManager.changePage(page - 2)
                } else {
                    getData({
                        search: searchText,
                        page: debouncedFilterState.pagination.page,
                        per_page: debouncedFilterState.pagination.per_page,
                        sort: debouncedFilterState.order.sort,
                        dir: debouncedFilterState.order.dir,
                        is_active: debouncedFilterState?.extraFilter?.is_active,
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
                columns={columns}
                title='Listagem de categorias'
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
}

export default Table;
