import {AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource} from "axios";
import axios from 'axios';

export default class HttpResource {

    private cancelList: CancelTokenSource|null = null;

    constructor(protected http: AxiosInstance, protected resource: string) {

    }

    list<T = any>(options?: {queryOptions?}): Promise<AxiosResponse<T>> {
        if (this.cancelList) {
            this.cancelList.cancel('list cancelled');
        }
        this.cancelList = axios.CancelToken.source();

        const config:AxiosRequestConfig = {
            cancelToken: this.cancelList.token,
        };
        if (options && options.queryOptions) {
            config.params = options.queryOptions;
        }

        return this.http.get<T>(this.resource, config);
    }

    get<T = any>(id: number | string): Promise<AxiosResponse<T>> {
        return this.http.get<T>(this.resource + '/' + id);
    }

    create<T = any>(data): Promise<AxiosResponse<T>> {
        return this.http.post<T>(this.resource, data);
    }

    update<T = any>(id: number | string, data): Promise<AxiosResponse<T>> {
        return this.http.put<T>(this.resource + '/' + id, data);
    }

    delete<T = any>(id: number | string): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(this.resource + '/' + id);
    }

    isCancelRequest(error) {
        return axios.isCancel(error);
    }
}
