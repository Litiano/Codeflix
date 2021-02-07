import {Dispatch, Reducer, useEffect, useReducer, useState} from "react";
import reducer, {Creators} from "../store/filter";
import {FilterActions, FilterState} from "../store/filter/types";
import {MUIDataTableColumn} from "mui-datatables";
import {debounce, isEqual} from "lodash";
import {useDebounce} from 'use-debounce';
import {useHistory} from 'react-router';
import {History, LocationDescriptor} from 'history';
import * as yup from "../utils/vendor/yup";
import {MuiDataTableRefComponent} from "../components/Table";

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter;
}

interface ExtraFilter {
    getStateFromUrl: (queryParams: URLSearchParams) => any;
    formatSearchParams: (debouncedState: FilterState) => any;
    createValidationSchema: () => any;
}

interface UseFilterOptions extends Omit<FilterManagerOptions, 'history'> {

}

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const filterManager = new FilterManager({...options, history});
    const INITIAL_STATE = filterManager.getStateFromUrl();
    const [filterState, dispatchFilterState] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE);
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    filterManager.state = filterState;
    filterManager.dispatch = dispatchFilterState;
    filterManager.debouncedState = debouncedFilterState;

    filterManager.applyOrderInColumns();

    useEffect(() => {
        filterManager.replaceHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        columns: filterManager.columns,
        filterManager,
        filterState,
        debouncedFilterState,
        dispatchFilterState,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema;
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    debouncedSetSearch;
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter;
    debouncedState: FilterState = null as any;

    constructor(options: FilterManagerOptions) {
        const {columns, rowsPerPage, rowsPerPageOptions, debounceTime} = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.debounceTime = debounceTime;
        this.debouncedSetSearch = debounce(this.debouncedChangeSearch, this.debounceTime);
        this.history = options.history;
        this.tableRef = options.tableRef;
        this.extraFilter = options.extraFilter;
        this.createValidationSchema();
    }

    private resetTablePagination() {
        this.tableRef.current.changeRowsPerPage(this.rowsPerPage);
        this.tableRef.current.changePage(0);
    }

    changeSearch(value) {
        this.debouncedSetSearch(value);
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

    cleanSearchText(text) {
        let newText = text;
        if (text && text.value !== undefined) {
            newText = text.value;
        }

        return newText;
    }

    replaceHistory() {
        this.history.replace({
            pathname: this.history.location.pathname,
            search: '?' + new URLSearchParams(this.formatSearchParams() as any),
            state: this.debouncedState,
        });
    }

    pushHistory() {
        const newLocation: LocationDescriptor = {
            pathname: this.history.location.pathname,
            search: '?' + new URLSearchParams(this.formatSearchParams() as any),
            state: {
                ...this.debouncedState,
                search: this.cleanSearchText(this.debouncedState.search)
            },
        }

        const oldState = this.history.location.state;
        const nextState = this.debouncedState;
        if (isEqual(oldState, nextState)) {
            return;
        }

        this.history.push(newLocation);
    }

    private formatSearchParams() {
        const search = this.cleanSearchText(this.debouncedState.search);
        const page = this.debouncedState.pagination.page;
        const order = this.debouncedState.order;
        const perPage = this.debouncedState.pagination.per_page;

        return {
            ...(search && search !== '' && {search: search}),
            ...(page !== 1 && {page: page}),
            ...(order.sort && order),
            ...(perPage !== this.rowsPerPage && {per_page: perPage}),
            ...(this.extraFilter && this.extraFilter.formatSearchParams(this.debouncedState)),
        }
    }

    getStateFromUrl() {
        const queryParams = new URLSearchParams(this.history.location.search.substr(1));

        return this.schema.cast({
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
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromUrl(queryParams)
                }
            )
        });
    }

    private createValidationSchema() {
        this.schema = yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(''),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform(value => isNaN(value) || !this.rowsPerPageOptions.includes(parseInt(value)) ? undefined : value)
                    .default(this.rowsPerPage),
            }),
            order: yup.object().shape({
                sort: yup.string()
                    .nullable()
                    .transform(value => {
                        const columnsName = this.columns.filter(column => !column.options || column.options.sort !== false)
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
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        });
    }
}
