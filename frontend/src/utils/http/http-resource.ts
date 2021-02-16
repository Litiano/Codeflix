import {AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource} from "axios";
import axios from 'axios';
import { serialize } from 'object-to-formdata';

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
        data = this.makeSendData(data);
        return this.http.post<T>(this.resource, data);
    }

    update<T = any>(id: number | string, data): Promise<AxiosResponse<T>> {
        data._method = 'PUT';
        data = this.makeSendData(data);
        return this.http.post<T>(this.resource + '/' + id, data);
    }

    delete<T = any>(id: number | string): Promise<AxiosResponse<T>> {
        return this.http.delete<T>(this.resource + '/' + id);
    }

    deleteCollection<T = any>(queryParams): Promise<AxiosResponse<T>> {
        const config: AxiosRequestConfig = {};
        if (queryParams) {
            config.params = queryParams;
        }
        return this.http.delete<T>(this.resource, config);
    }

    isCancelRequest(error) {
        return axios.isCancel(error);
    }

    private makeSendData(data): FormData | object {
        return this.containsFile(data) ? this.getFormData(data) : data;
    }

    private getFormData(data: object): FormData {
        return serialize(
            data,
            {
                booleansAsIntegers: true,
            }
        );
    }

    private containsFile(data): boolean {
        return Object.values(data).filter(el => el instanceof File).length !== 0;
    }
}
