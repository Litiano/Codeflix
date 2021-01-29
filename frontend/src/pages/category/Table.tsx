import * as React from 'react';
import {useEffect, useReducer, useRef, useState} from "react";
import {parseISO, format} from 'date-fns';
import categoryHttp from "../../utils/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../utils/models";
import DefaultTable, {makeActionStyles, TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";
import {MuiThemeProvider} from "@material-ui/core/styles";
import {IconButton} from "@material-ui/core";
import {Link} from "react-router-dom";
import EditIcon from '@material-ui/icons/Edit';
import {FilterResetButton} from "../../components/Table/FilterResetButton";
import {debounce} from "lodash";
import reducer, {INITIAL_STATE, Creators} from "../../store/search";

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        options: {
            sort: false,
        },
        width: '30%',
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
        options: {},
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
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
        },
        width: '10%',
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
        options: {
            sort: false,
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

const Table = (props: Props) => {
    const snackbar = useSnackbar();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchState, dispatchSearchState] = useReducer(reducer, INITIAL_STATE);
    const subscribed = useRef(true);

    const columns = columnsDefinition.map((column) => {
        if (column.name === searchState.order.sort && column.options) {
            column.options.sortDirection = searchState.order.dir;
        }
        return column;
    });

    useEffect(() => {
        subscribed.current = true;
        getData();

        return () => {
            subscribed.current = false;
        }
    }, [
        searchState.search,
        searchState.pagination.page,
        searchState.pagination.per_page,
        searchState.order,
    ]);

    const debounceHandleOnSearchChange = debounce(dispatchSearchState, 500);

    async function getData() {
        setLoading(true);
        try {
            if (!subscribed.current) {
                return;
            }
            const {data} = await categoryHttp.list<ListResponse<Category>>({
                queryOptions: {
                    search: searchState.search,
                    page: searchState.pagination.page,
                    per_page: searchState.pagination.per_page,
                    sort: searchState.order.sort,
                    dir: searchState.order.dir,
                }
            });
            setData(data.data);
            // setSearchState((prevState => ({
            //     ...prevState,
            //     pagination: {
            //         ...prevState.pagination,
            //         total: data.meta.total,
            //     }
            // })));
        } catch (error) {
            if (categoryHttp.isCancelRequest(error)) {
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
                columns={columns}
                title='Listagem de categorias'
                data={data}
                loading={loading}
                options={{
                    searchText: searchState.search as any,
                    page: searchState.pagination.page - 1,
                    rowsPerPage: searchState.pagination.per_page,
                    count: searchState.pagination.total,
                    serverSide: true,
                    customToolbar: () => (
                        <FilterResetButton handleClick={() => {
                            //dispatchSearchState({})
                        }}/>
                    ),
                    onSearchChange: (value) => debounceHandleOnSearchChange(Creators.setSearch({search: value || ''})),
                    onChangePage: (page) => dispatchSearchState(Creators.setPage({page: page + 1})),
                    onChangeRowsPerPage: (perPage) => dispatchSearchState(Creators.setPerPage({per_page: perPage})),
                    onColumnSortChange: (changedColumn, direction) => {
                        dispatchSearchState(Creators.setOrder({sort: changedColumn, dir: direction}));
                    }
                }}
            />
        </MuiThemeProvider>
    );
}

export default Table;
