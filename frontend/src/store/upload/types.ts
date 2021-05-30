import {Video} from "../../utils/models";
import {AxiosError} from "axios";
import {AnyAction} from "redux";

export interface FileUpload {
    fileField: string;
    filename: string;
    progress: number;
    error?: AxiosError;
}

export interface Upload {
    video: Video;
    progress: FileUpload["progress"];
    files: FileUpload[];
}

export interface UploadModule {
    upload: UploadState;
}

export interface UploadState {
    uploads: Upload[];
}

export interface FileInfo {
    file: File,
    fileField: FileUpload["fileField"],
}

export interface AddUploadAction extends AnyAction {
    payload: {
        video: Video;
        files: Array<FileInfo>;
    };
}

export interface RemoveUploadAction extends AnyAction {
    payload: {
        id: Video["id"];
    };
}

export interface UpdateProgressAction extends AnyAction {
    payload: {
        video: Video;
        fileField: FileUpload["fileField"];
        progress: Upload["progress"];
    };
}

export interface SetUploadErroAction extends AnyAction {
    payload: {
        video: Video;
        fileField: FileUpload["fileField"];
        error: FileUpload["error"]
    }
}

export type Actions = AddUploadAction | RemoveUploadAction | UpdateProgressAction | SetUploadErroAction;
