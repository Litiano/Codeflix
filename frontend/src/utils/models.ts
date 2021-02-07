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

interface GenreVideo extends Omit<Genre, 'categories'> {

}

export const VideoFileFieldMap = {
    'video_file': 'Principal',
    'thumb_file': 'Thumbnail',
    'trailer_file': 'Trailer',
    'banner_file': 'Banner',
}

interface VideoRating {
    color: string;
    value: string;
}
export const videoRatings: VideoRating[] = [
    {
        color: '#398549',
        value: 'L',
    },
    {
        color: '#20A3D4',
        value: '10',
    },
    {
        color: '#E79738',
        value: '12',
    },
    {
        color: '#E35E00',
        value: '14',
    },
    {
        color: '#D00003',
        value: '16',
    },
    {
        color: '#000000',
        value: '18',
    },
];

export interface Video extends Timestamps, SoftDeletes {
    readonly id: string;
    title: string;
    description: string;
    year_launched: number;
    opened: boolean;
    rating: 'L' | '10' | '12' | '14' | '16' | '18';
    duration: number;
    cast_members: CastMember[];
    genres: GenreVideo[];
    categories: Category[];
    video_file_url: string;
    thumb_file_url: string;
    trailer_file_url: string;
    banner_file_url: string;
}

export const CastMemberTypeMap = {
    1: 'Diretor',
    2: 'Ator',
}

export const YesNoTypeMap = {
    0: 'Não',
    1: 'Sim'
}
