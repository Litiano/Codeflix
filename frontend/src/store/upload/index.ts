import {
    Actions,
    AddUploadAction,
    FileUpload,
    RemoveUploadAction,
    SetUploadErroAction,
    UploadState,
    UpdateProgressAction
} from "./types";
import {createActions, createReducer} from 'reduxsauce';
import update from 'immutability-helper';
import {Video} from "../../utils/models";

export const {Types, Creators} = createActions<{
    ADD_UPLOAD: string,
    REMOVE_UPLOAD: string,
    UPDATE_PROGRESS: string,
    SET_UPLOAD_ERROR: string,
}, {
    addUpload(payload: AddUploadAction['payload']): AddUploadAction,
    removeUpload(payload: RemoveUploadAction['payload']): RemoveUploadAction,
    updateProgress(payload: UpdateProgressAction['payload']): UpdateProgressAction,
    setUploadError(payload: SetUploadErroAction['payload']): SetUploadErroAction,
}>({
    addUpload: ['payload'],
    removeUpload: ['payload'],
    updateProgress: ['payload'],
    setUploadError: ['payload'],
});

export const INITIAL_STATE: UploadState = {
    uploads: []
}

const reducer = createReducer<UploadState, Actions>(INITIAL_STATE, {
    [Types.ADD_UPLOAD]: addUpload,
    [Types.REMOVE_UPLOAD]: removeUpload,
    [Types.UPDATE_PROGRESS]: updateProgress,
    [Types.SET_UPLOAD_ERROR]: setUploadError,
});

export default reducer;

function addUpload(state = INITIAL_STATE, action: AddUploadAction): UploadState {
    if (action.payload.files.length === 0) {
        return state;
    }

    const index = findIndexUpload(state, action.payload.video.id);
    if (index !== -1 && state.uploads[index].progress < 1) {
        return state;
    }

    const uploads = index === -1
        ? state.uploads
        : update(state.uploads, {
            $splice: [[index, 1]]
        });

    return {
        uploads: [
            ...uploads,
            {
                video: action.payload.video,
                progress: 0,
                files: action.payload.files.map(file => ({
                    fileField: file.fileField,
                    filename: file.file.name,
                    progress: 0,
                })),
            },
        ]
    }
}

function removeUpload(state = INITIAL_STATE, action: RemoveUploadAction): UploadState {
    const uploads = state.uploads.filter(upload => upload.video.id !== action.payload.id);
    if (uploads.length === state.uploads.length) {
        return state;
    }

    return {
        uploads: uploads
    }
}

function updateProgress(state = INITIAL_STATE, action: UpdateProgressAction): UploadState {
    const {indexUpload, indexFile} = findIndexUploadAndFIle(state, action.payload.video.id, action.payload.fileField);

    if (indexFile === undefined || indexUpload === undefined) {
        return state;
    }

    const upload = state.uploads[indexUpload];
    const file = upload.files[indexFile];

    if (file.progress === action.payload.progress) {
        return state;
    }

    const uploads = update(state.uploads, {
        [indexUpload]: {
            $apply(upload) {
                const files = update(upload.files, {
                    [indexFile]: {
                        $set: {...file, progress: action.payload.progress}
                    }
                });
                const progress = calculateGlobalProgress(files);
                return {...upload, progress, files}
            },
        }
    });

    return {uploads};
}

function setUploadError(state = INITIAL_STATE, action: SetUploadErroAction): UploadState {
    const {indexUpload, indexFile} = findIndexUploadAndFIle(state, action.payload.video.id, action.payload.fileField);

    if (indexFile === undefined || indexUpload === undefined) {
        return state;
    }

    const upload = state.uploads[indexUpload];
    const file = upload.files[indexFile];

    const uploads = update(state.uploads, {
        [indexUpload]: {
            files: {
                [indexFile]: {
                    $set: {...file, error: action.payload.error, progress: 1}
                }
            }
        }
    });

    return {uploads};
}

function findIndexUpload(state: UploadState, id: Video["id"]): number {
    return state.uploads.findIndex((upload) => upload.video.id === id);
}

function findIndexFile(files: FileUpload[], fileField: FileUpload["fileField"]): number {
    return files.findIndex((file) => file.fileField === fileField);
}

function findIndexUploadAndFIle(state: UploadState, videoId: Video["id"], fileField: FileUpload["fileField"]): {indexUpload?: number, indexFile?: number} {
    const indexUpload = findIndexUpload(state, videoId);
    if (indexUpload === -1) {
        return {};
    }

    const upload = state.uploads[indexUpload];
    const indexFile = findIndexFile(upload.files, fileField);

    return indexFile === -1 ? {} : {indexFile: indexFile, indexUpload: indexUpload};
}

function calculateGlobalProgress(files: FileUpload[]): number {
    const countFiles = files.length;
    if (countFiles === 0) {
        return 0;
    }

    const sumProgress = files.reduce((sum, file) => sum + file.progress, 0);

    return sumProgress / countFiles;
}
