import axios, {AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

export const httpVideo = axios.create({
    baseURL: process.env.REACT_APP_MICRO_VIDEO_API_URL
});

const instances: AxiosInstance[] = [httpVideo];

export function addGlobalRequestInterceptor(
    onFulfilled?: (value: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
    onRejected?: (error: any) => any
) {
    const ids: number[] = [];
    for (let key in instances) {
        const id = instances[key].interceptors.request.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalRequestInterceptor(ids: number[]) {
    ids.forEach((id, index) => {
        instances[index].interceptors.request.eject(id);
    });
}

export function addGlobalResponseInterceptor(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: AxiosError) => any
) {
    const ids: number[] = [];
    for (let key in instances) {
        const id = instances[key].interceptors.response.use(onFulfilled, onRejected);
        ids.push(id);
    }

    return ids;
}

export function removeGlobalResponseInterceptor(ids: number[]) {
    ids.forEach((id, index) => {
        instances[index].interceptors.response.eject(id);
    });
}
