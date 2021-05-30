import {
    FilterActions,
    SetOrderAction,
    SetPageAction,
    SetPerPageAction,
    SetSearchAction,
    FilterState,
    SetResetAction, UpdateExtraFilterAction
} from "./types";
import {createActions, createReducer} from 'reduxsauce';

export const {Types, Creators} = createActions<{
    SET_SEARCH: string,
    SET_PAGE: string,
    SET_PER_PAGE: string,
    SET_ORDER: string,
    SET_RESET: string,
    UPDATE_EXTRA_FILTER: string,
}, {
    setSearch(payload: SetSearchAction['payload']): SetSearchAction,
    setPage(payload: SetPageAction['payload']): SetPageAction,
    setPerPage(payload: SetPerPageAction['payload']): SetPerPageAction,
    setOrder(payload: SetOrderAction['payload']): SetOrderAction,
    setReset(payload: SetResetAction['payload']): SetResetAction,
    updateExtraFilter(payload: UpdateExtraFilterAction['payload']): UpdateExtraFilterAction,
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setReset: ['payload'],
    updateExtraFilter: ['payload'],
});

export const INITIAL_STATE: FilterState = {
    search: '',
    pagination: {
        page: 1,
        per_page: 15,
    },
    order: {
        sort: null,
        dir: undefined,
    }
}

const reducer = createReducer<FilterState, FilterActions>(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
    [Types.SET_RESET]: setReset,
    [Types.UPDATE_EXTRA_FILTER]: updateExtraFilter,
});
export default reducer;

function setSearch(state = INITIAL_STATE, action: SetSearchAction): FilterState {
    return {
        ...state,
        search: action.payload.search || '',
        pagination: {
            ...state.pagination,
            page: 1
        }
    }
}

function setPage(state = INITIAL_STATE, action: SetPageAction): FilterState {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: action.payload.page
        }
    }
}

function setPerPage(state = INITIAL_STATE, action: SetPerPageAction): FilterState {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            per_page: action.payload.per_page
        }
    }
}

function setOrder(state = INITIAL_STATE, action: SetOrderAction): FilterState {
    return {
        ...state,
        order: {
            dir: action.payload.dir,
            sort: action.payload.sort,
        }
    }
}

function setReset(state = INITIAL_STATE, action: SetResetAction): FilterState {
    return action.payload.state;
}

function updateExtraFilter(state = INITIAL_STATE, action: UpdateExtraFilterAction): FilterState {
    return {
        ...state,
        extraFilter: {
            ...state.extraFilter,
            ...action.payload,
        }
    }
}
