import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {Category, Genre, ListResponse, Video} from "../../utils/models";
import DefaultTable, {makeActionStyles, MuiDataTableRefComponent, TableColumn} from "../../components/Table";
import map from "lodash/map";
import {IconButton} from "@material-ui/core";
import {format, parseISO} from "date-fns";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {useSnackbar} from "notistack";
import useFilter from "../../hooks/useFilter";
import * as yup from "../../utils/vendor/yup";
import videoHttp from "../../utils/http/video-http";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import categoryHttp from "../../utils/http/category-http";
import genreHttp from "../../utils/http/genre-http";
import DeleteDialog from "../../components/DeleteDialog";
import useDeleteCollection from "../../hooks/useDeleteCollection";
import LoadingContext from "../../components/loading/LoadingContext";

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
        name: 'title',
        label: 'Título',
        options: {
            filter: false
        }
    },
    {
        name: 'genres',
        label: 'Gêneros',
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
                        to={`/videos/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<Video[]>([]);
    const loading = useContext(LoadingContext);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const [, setCategories] = useState<Category[]>();
    const [, setGenres] = useState<Genre[]>();
    const {openDeleteDialog, setOpenDeleteDialog, rowsToDelete, setRowsToDelete} = useDeleteCollection();
    const extraFilter = useMemo(() => (
        {
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null),
                    genres: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(',');
                        })
                        .default(null),
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter ? {
                    ...(
                        debouncedState.extraFilter.categories &&
                        {categories: debouncedState.extraFilter.categories.join(',')}
                    ),
                    ...(
                        debouncedState.extraFilter.genres &&
                        {genres: debouncedState.extraFilter.genres.join(',')}
                    ),
                } : undefined;
            },
            getStateFromUrl: (queryParams) => {
                return {
                    categories: queryParams.get('categories'),
                    genres: queryParams.get('genres')
                }
            }
        }
    ), []);

    const {
        columns,
        filterManager,
        cleanSearchText,
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
        extraFilter
    });
    const searchText = cleanSearchText(filterState.search);

    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories as never;
    (columnCategories.options as any).filterList = categoriesFilterValue ? [categoriesFilterValue] : [];

    const indexColumnGenres = columns.findIndex(c => c.name === 'genres');
    const columnGenres = columns[indexColumnGenres];
    const genresFilterValue = filterState.extraFilter && filterState.extraFilter.genres as never;
    (columnGenres.options as any).filterList = genresFilterValue ? [genresFilterValue] : [];

    const getData = useCallback(async ({search, page, per_page, sort, dir, categories, genres}) => {
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await videoHttp.list<ListResponse<Video>>({
                queryOptions: {
                    search,
                    page,
                    per_page,
                    sort,
                    dir,
                    ...({categories: categories?.join(',')}),
                    ...({genres: genres?.join(',')}),
                }
            });
            setData(data.data);
            setTotalRecords(data.meta.total);
            setOpenDeleteDialog(false);
        } catch (error) {
            if (videoHttp.isCancelRequest(error)) {
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
            categories: debouncedFilterState?.extraFilter?.categories,
            genres: debouncedFilterState?.extraFilter?.genres,
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
                enqueueSnackbar('Não foi possível carregar as informações', {variant: 'error'})
            }
        })();
    }, [columnCategories.options, enqueueSnackbar]);

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                if (isSubscribed) {
                    const {data} = await genreHttp.list({queryOptions: {all: ''}});
                    setGenres(data.data);
                    (columnGenres.options as any).filterOptions.names = data.data.map(genre => genre.name);
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar('Não foi possível carregar as informações', {variant: 'error'})
            }
        })();
    }, [columnGenres.options, enqueueSnackbar]);

    function deleteRows(confirmed: boolean) {
        if (!confirmed) {
            setOpenDeleteDialog(false);
            return;
        }
        const ids = rowsToDelete.data
            .map((value) => data[value.index].id)
            .join(',');
        videoHttp.deleteCollection({ids})
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
                        categories: debouncedFilterState?.extraFilter?.categories,
                        genres: debouncedFilterState?.extraFilter?.genres,
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
                title='Listagem de vídeos'
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
}

export default Table;
