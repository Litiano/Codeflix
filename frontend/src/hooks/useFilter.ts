import {Dispatch, Reducer, useCallback, useEffect, useMemo, useReducer, useState} from "react";
import reducer, {Creators} from "../store/filter";
import {FilterActions, FilterState} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";
import {isEqual} from "lodash";
import {useDebounce} from 'use-debounce';
import {useHistory} from 'react-router';
import {LocationDescriptor} from 'history';
import * as yup from "../utils/vendor/yup";
import {MuiDataTableRefComponent} from "../components/Table";
import {ObjectSchema} from "../utils/vendor/yup";
import { useLocation } from "react-router-dom";

interface FilterManagerOptions {
    state: FilterState;
    schema: ObjectSchema<any>;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    dispatch: Dispatch<FilterActions>;
}

interface ExtraFilter {
    getStateFromUrl: (queryParams: URLSearchParams) => any;
    formatSearchParams: (debouncedState: FilterState) => any;
    createValidationSchema: () => any;
}

interface UseFilterOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter;
}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const {search: locationSearch, pathname: locationPathname, state: locationState} = useLocation();
    const {rowsPerPage, rowsPerPageOptions, columns, extraFilter} = options;
    const schema = useMemo(() => {
        return yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform(value => isNaN(value) || !rowsPerPageOptions.includes(parseInt(value)) ? undefined : value)
                    .default(rowsPerPage),
            }),
            order: yup.object().shape({
                sort: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = columns.filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name);
                        return columnsName.includes(value) ? value : undefined;
                    })
                    .default(null),
                dir: yup.string()
                    .nullable()
                    .transform(value => !value || ['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default(null),
            }),
            ...(
                extraFilter && {
                    extraFilter: extraFilter.createValidationSchema()
                }
            )
        });
    }, [rowsPerPageOptions, rowsPerPage, columns, extraFilter]);

    const stateFromUrl = useMemo(() => {
        const queryParams = new URLSearchParams(locationSearch.substr(1));

        return schema.cast({
            search: queryParams.get('search'),
            pagination: {
                page: queryParams.get('page'),
                per_page: queryParams.get('per_page'),
            },
            order: {
                sort: queryParams.get('sort'),
                dir: queryParams.get('dir'),
            },
            ...(
                extraFilter && {
                    extraFilter: extraFilter.getStateFromUrl(queryParams)
                }
            )
        });
    }, [locationSearch, schema, extraFilter]);

    const cleanSearchText = useCallback((text) => {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }

        return newText;
    }, []);

    const formatSearchParams = useCallback((state, extraFilter) => {
        const search = cleanSearchText(state.search);
        const page = state.pagination.page;
        const order = state.order;
        const perPage = state.pagination.per_page;

        return {
            ...(search && search !== '' && {search: search}),
            ...(page !== 1 && {page: page}),
            ...(order.sort && order),
            ...(perPage !== rowsPerPage && {per_page: perPage}),
            ...(extraFilter && extraFilter.formatSearchParams(state)),
        }
    }, [cleanSearchText, rowsPerPage]);

    const INITIAL_STATE = stateFromUrl as FilterState; //@todo remover as FilterState causa erro de compilação.
    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const filterManager = new FilterManager({...options, schema, dispatch, state: filterState});
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);

    useEffect(() => {
        console.log('history replace');
        history.replace({
            pathname: locationPathname,
            search: '?' + new URLSearchParams(formatSearchParams(stateFromUrl, extraFilter)),
            state: stateFromUrl,
        });
    }, [history, locationPathname, stateFromUrl, extraFilter, formatSearchParams]);

    useEffect(() => {
        const newLocation: LocationDescriptor = {
            pathname: locationPathname,
            search: '?' + new URLSearchParams(formatSearchParams(debouncedFilterState, extraFilter)),
            state: {
                ...debouncedFilterState,
                search: cleanSearchText(debouncedFilterState.search)
            },
        }

        if (isEqual(locationState, debouncedFilterState)) {
            return;
        }

        history.push(newLocation);
    }, [
        history,
        locationPathname,
        locationState,
        debouncedFilterState,
        formatSearchParams,
        extraFilter,
        cleanSearchText,
    ]);

    filterManager.state = filterState;
    filterManager.applyOrderInColumns();

    return {
        columns: filterManager.columns,
        cleanSearchText,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema;
    state: FilterState;
    dispatch: Dispatch<FilterActions>;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;

    constructor(options: FilterManagerOptions) {
        const {schema, columns, rowsPerPage, tableRef, dispatch, state} = options;
        this.schema = schema;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.tableRef = tableRef;
        this.dispatch = dispatch;
        this.state = state
    }

    private resetTablePagination() {
        this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
        this.tableRef.current.changePage(0);
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({search: value}))
    }
    debouncedChangeSearch(value) {
        this.dispatch(Creators.setSearch({search: value || ''}));
    }

    changePage(page) {
        this.dispatch(Creators.setPage({page: page + 1 }))
    }

    changeRowsPerPage(perPage){
        this.dispatch(Creators.setPerPage({per_page: perPage}))
    }

    changeColumnSort(changedColumn, direction) {
        this.dispatch(Creators.setOrder({sort: changedColumn, dir: direction}));
        this.resetTablePagination();
    }

    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data));
    }

    resetFilter() {
        const INITIAL_STATE = {
            ...this.schema.cast({}),
            //search: {value: null, update: true}
            search: ''
        };
        this.dispatch(Creators.setReset({
            state: INITIAL_STATE
        }));
        this.resetTablePagination();
    }

    applyOrderInColumns() {
        this.columns = this.columns.map((column) => {
            return column.name === this.state.order.sort && column.options ? (
                {
                    ...column,
                    options: {
                        ...column.options,
                        sortDirection: this.state.order.dir
                    }
                }
            ) : column;
        });
    }
}
