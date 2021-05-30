import {Creators, Types} from './index';
import {eventChannel, END} from 'redux-saga'
import {actionChannel, take, call, put} from 'redux-saga/effects';
import {AddUploadAction, FileInfo} from "./types";
import {Video} from "../../utils/models";
import videoHttp from "../../utils/http/video-http";

export function* uploadWatcherSaga() {
    const newFilesChannel = yield actionChannel(Types.ADD_UPLOAD);

    while (true) {
        const {payload}: AddUploadAction = yield take(newFilesChannel);
        for (const fileInfo of payload.files) {
            try {
                const response = yield call(uploadFile, {video: payload.video, fileInfo: fileInfo})
                console.log(response);
            } catch (error) {
                console.log(error);
            }
        }
        console.log(payload);
    }
}

function* uploadFile({video, fileInfo}: { video: Video, fileInfo: FileInfo }) {
    const eventChannel = yield call(sendUpload, {id: video.id, fileInfo: fileInfo});
    while (true) {
        try {
            const {progress, response} = yield take(eventChannel);
            if (response) {
                return response;
            }
            yield put(Creators.updateProgress({progress, video, fileField: fileInfo.fileField}));
        } catch (error) {
            yield put(Creators.setUploadError({video, fileField: fileInfo.fileField, error}));
            throw error;
        }
    }
}

function sendUpload({id, fileInfo}: { id: Video["id"], fileInfo: FileInfo }) {
    return eventChannel(emitter => {
        videoHttp.partialUpdate(
            id,
            {
                [fileInfo.fileField]: fileInfo.file
            },
            {
                config: {
                    headers: {
                        'x-ignore-loading': true,
                    },
                    onUploadProgress(progressEvent: ProgressEvent) {
                        if (progressEvent.lengthComputable) {
                            const progress = progressEvent.loaded / progressEvent.total;
                            emitter({progress});
                        }
                    }
                }
            }
        )
            .then(response => emitter({response}))
            .catch(error => emitter(error))
            .finally(() => emitter(END))
        ;
        const unsubscribe = () => {
        };

        return unsubscribe;
    });
}
