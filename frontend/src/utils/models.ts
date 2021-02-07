export interface ListResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface GetResponse<T> {
    data: T
}

interface Timestamps {
    readonly created_at: string;
    readonly updated_at: string;
}

interface SoftDeletes {
    readonly deleted_at: string;
}

export interface Category extends Timestamps, SoftDeletes {
    readonly id: string;
    name: string;
    description: string;
    is_active: boolean;
}

export interface Genre extends Timestamps, SoftDeletes {
    readonly id: string;
    name: string;
    categories: Category[];
    is_active: boolean;
}

export interface CastMember extends Timestamps, SoftDeletes {
    readonly id: string;
    name: string;
    type: number;
}

export const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator',
}

export const YesNoTypeMap = {
    0: 'Não',
    1: 'Sim'
}
