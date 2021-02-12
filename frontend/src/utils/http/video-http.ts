import HttpResource from "./http-resource";
import {httpVideo} from "./index";
import {AxiosResponse} from "axios";

class VideoHttpResource extends HttpResource
{
    update<T = any>(id: number | string, data): Promise<AxiosResponse<T>> {
        return this.http.post<T>(this.resource + '/' + id, data);
    }
}

const videoHttp = new VideoHttpResource(httpVideo, 'videos');
export default videoHttp;
