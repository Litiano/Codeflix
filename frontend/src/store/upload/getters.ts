import {FileUpload, Upload} from "./types";

export function countInProgress(uploads: Upload[]): number {
    return uploads.filter(upload => !isFinished(upload)).length;
}

export function isFinished(uploadOrFile: Upload | FileUpload): boolean {
    return uploadOrFile.progress === 1 || hasError(uploadOrFile);
}

export function hasError(uploadOrFile: Upload | FileUpload): boolean {
    if (isUploadType(uploadOrFile)) {
        const upload = uploadOrFile as Upload;

        return upload.files.some(file => file.error);
    } else {
        const file = uploadOrFile as FileUpload;

        return file.error !== undefined;
    }
}

export function isUploadType(uploadOrFile: Upload | FileUpload) {
    return 'video' in uploadOrFile;
}
