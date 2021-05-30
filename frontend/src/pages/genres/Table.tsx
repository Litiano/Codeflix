import * as React from 'react';
import {useContext, useEffect, useRef, useState} from "react";
import {Chip, IconButton} from "@material-ui/core";
import {parseISO, format} from 'date-fns';
import map from "lodash/map";
import genreHttp from "../../utils/http/genre-http";
import {Category, Genre, ListResponse, YesNoTypeMap} from "../../utils/models";
import DefaultTable, {makeActionStyles, MuiDataTableRefComponent, TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {MuiThemeProvider} from "@material-ui/core/styles";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../utils/vendor/yup";
import {invert} from "lodash";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import categoryHttp from "../../utils/http/category-http";
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
        options: {
            filter: false
        }
    },
    {
        name: 'categories',
        label: 'Categorias',
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: []
            },
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{map(value, 'name').join(', ')}</span>
            }
        }
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            filterOptions: {
                names: yesNoNames
            },
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return value ? <Chip label={'Sim'} color={'primary'}/> : <Chip label={'Não'} color={'secondary'}/>
            }
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
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<Genre[]>([]);
    const snackbar = useSnackbar();
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const subscribed = useRef(true);
    const [, setCategories] = useState<Category[]>();
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();

    const {
        columns,
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords,
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null),
                    is_active: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !yesNoNames.includes(value) ? undefined : value;
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        {categories: debouncedState.extraFilter.categories.join(',')}
                    ),
                    ...(
                        debouncedState.extraFilter.is_active &&
                        {is_active: debouncedState.extraFilter.is_active}
                    )
                } : undefined;
            },
            getStateFromUrl: (queryParams) => {
                return {
                    categories: queryParams.get('categories'),
                    is_active: queryParams.get('is_active')
                }
            }
        }
    });

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories as never;
    (columnCategories.options as any).filterList = categoriesFilterValue ? [categoriesFilterValue] : [];

    const indexColumnIsAtive = columns.findIndex(c => c.name === 'is_active');
    const columnIsActive = columns[indexColumnIsAtive];
    const isActiveFilterValue = filterState.extraFilter && filterState.extraFilter.is_active as never;
    (columnIsActive.options as any).filterList = isActiveFilterValue ? [isActiveFilterValue] : [];

    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData();
        return () => {
            subscribed.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filterManager.cleanSearchText(debouncedFilterState.search), // eslint-disable-line react-hooks/exhaustive-deps
        debouncedFilterState.pagination.page,
        debouncedFilterState.pagination.per_page,
        debouncedFilterState.order,
        JSON.stringify(debouncedFilterState.extraFilter), // eslint-disable-line react-hooks/exhaustive-deps
    ]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                if (isSubscribed) {
                    const {data} = await categoryHttp.list({queryOptions: {all: ''}});
                    setCategories(data.data);
                    (columnCategories.options as any).filterOptions.names = data.data.map(category => category.name);
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações', {variant: 'error'})
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function getData() {
        filterManager.pushHistory();
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await genreHttp.list<ListResponse<Genre>>({
                queryOptions: {
                    search: filterManager.cleanSearchText(filterState.search),
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.sort,
                    dir: filterState.order.dir,
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.categories &&
                        {categories: debouncedFilterState.extraFilter.categories.join(',')}
                    ),
                    ...(
                        debouncedFilterState.extraFilter &&
                        debouncedFilterState.extraFilter.is_active &&
                        {is_active: invert(YesNoTypeMap)[debouncedFilterState.extraFilter.is_active]}
                    )
                }
            });
            setData(data.data);
            setTotalRecords(data.meta.total);
            setOpenDeleteDialog(false);
        } catch (error) {
            if (genreHttp.isCancelRequest(error)) {
                return;
            }
            console.error(error);
            snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
        }
    }

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete.data
            .map((value) => data[value.index].id)
            .join(',');
        genreHttp.deleteCollection({ids})
            .then((response) => {
                snackbar.enqueueSnackbar('Registros excluídos com sucesso!', {variant: 'success'});
                const page = filterState.pagination.page;

                if (rowsToDelete.data.length === data.length && page > 1) {
                    filterManager.changePage(page - 2)
                } else {
                    getData();
                }
            }).catch((error) => {
            console.error(error);
            snackbar.enqueueSnackbar('Não foi possível excluir os registros', {variant: 'error'});
        });
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DeleteDialog open={openDeleteDialog} handleClose={deleteRows}/>
            <DefaultTable
                columns={columnsDefinition}
                title='Listagem de gêneros'
                data={data}
                loading={loading}
                ref={tableRef}
                options={{
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions: filterManager.rowsPerPageOptions,
                    count: totalRecords,
                    serverSide: true,
                    onFilterChange: (column, filterList) => {
                        const columnIndex = columns.findIndex(c => c.name === column);
                        filterManager.changeExtraFilter({
                            [column as string]: filterList[columnIndex].length ? filterList[columnIndex] : null
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
