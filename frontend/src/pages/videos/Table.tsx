import React, {useEffect, useRef, useState} from 'react';
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
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Video[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>;
    const [, setCategories] = useState<Category[]>();
    const [, setGenres] = useState<Genre[]>();

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
    });


    const indexColumnCategories = columns.findIndex(c => c.name === 'categories');
    const columnCategories = columns[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter && filterState.extraFilter.categories as never;
    (columnCategories.options as any).filterList = categoriesFilterValue ? [categoriesFilterValue] : [];

    const indexColumnGenres = columns.findIndex(c => c.name === 'genres');
    const columnGenres = columns[indexColumnGenres];
    const genresFilterValue = filterState.extraFilter && filterState.extraFilter.genres as never;
    (columnGenres.options as any).filterList = genresFilterValue ? [genresFilterValue] : [];

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
                snackbar.enqueueSnackbar('Não foi possível carregar as informações', {variant: 'error'})
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    async function getData() {
        setLoading(true);
        filterManager.pushHistory();
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await videoHttp.list<ListResponse<Video>>({
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
                        debouncedFilterState.extraFilter.genres &&
                        {genres: debouncedFilterState.extraFilter.genres.join(',')}
                    ),
                }
            });
            setData(data.data);
            setTotalRecords(data.meta.total);
        } catch (error) {
            if (videoHttp.isCancelRequest(error)) {
                return;
            }
            console.error(error);
            snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
        } finally {
            setLoading(false);
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
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
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction)
                }}
            />
        </MuiThemeProvider>
    );
}

export default Table;
