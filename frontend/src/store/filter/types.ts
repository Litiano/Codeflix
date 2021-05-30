import {AnyAction} from 'redux';

export interface Pagination {
    page: number;
    per_page: number;
}

export interface Order {
    sort: string | null;
    dir: 'asc' | 'desc' | 'none' | undefined;
}

export interface FilterState {
    search: string | {value, [key: string]: any} | null;
    pagination: Pagination;
    order: Order;
    extraFilter?: {[key: string]: any};
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string | {value, [key: string]: any} | null
    }
}

export interface SetPageAction extends AnyAction {
    payload: {
        page: number
    }
}

export interface SetPerPageAction extends AnyAction {
    payload: {
        per_page: number,
    }
}

export interface SetOrderAction extends AnyAction {
    payload: {
        sort: string | null,
        dir: 'asc' | 'desc' | 'none' | undefined,
    }
}

export interface UpdateExtraFilterAction extends AnyAction {
    payload: {[key: string]: any}
}

export interface SetResetAction extends AnyAction {
    payload: {
        state: FilterState,
    }
}

export type FilterActions = SetSearchAction | SetPerPageAction | SetPageAction | SetOrderAction | UpdateExtraFilterAction | SetResetAction;
