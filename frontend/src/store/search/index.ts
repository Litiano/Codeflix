import {Actions, SetOrderAction, SetPageAction, SetPerPageAction, SetSearchAction, State} from "./types";
import {createActions, createReducer} from 'reduxsauce';

export const {Types, Creators} = createActions<{
    SET_SEARCH: string,
    SET_PAGE: string,
    SET_PER_PAGE: string,
    SET_ORDER: string,
}, {
    setSearch(payload: SetSearchAction['payload']): SetSearchAction,
    setPage(payload: SetPageAction['payload']): SetPageAction,
    setPerPage(payload: SetPerPageAction['payload']): SetPerPageAction,
    setOrder(payload: SetOrderAction['payload']): SetOrderAction,
}>({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
});

export const INITIAL_STATE: State = {
    search: '',
    pagination: {
        page: 1,
        total: 0,
        per_page: 10
    },
    order: {
        sort: null,
        dir: undefined,
    }
}

const reducer = createReducer<State, Actions>(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
});
export default reducer;

function setSearch(state = INITIAL_STATE, action: SetSearchAction): State {
    return {
        ...state,
        search: action.payload.search || '',
        pagination: {
            ...state.pagination,
            page: 1
        }
    }
}

function setPage(state = INITIAL_STATE, action: SetPageAction): State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: action.payload.page
        }
    }
}

function setPerPage(state = INITIAL_STATE, action: SetPerPageAction): State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            per_page: action.payload.per_page
        }
    }
}

function setOrder(state = INITIAL_STATE, action: SetOrderAction): State {
    return {
        ...state,
        order: {
            dir: action.payload.dir,
            sort: action.payload.sort,
        }
    }
}
