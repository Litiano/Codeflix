import * as React from 'react';
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {CircularProgress, Fade} from "@material-ui/core";
import {grey} from "@material-ui/core/colors";
import {FileUpload, Upload} from "../store/upload/types";
import {hasError} from "../store/upload/getters";

interface UploadProgressProps {
    size: number;
    uploadOrFile: Upload | FileUpload;
}

const useStyles = makeStyles((theme: Theme) => ({
    progressContainer: {
        position: 'relative',
    },
    progressBackground: {
        color: grey['300'],
    },
    progress: {
        position: 'absolute',
        left: 0,
    },
}));

const UploadProgress: React.FC<UploadProgressProps> = (props) => {
    const classes = useStyles();
    const {size, uploadOrFile} = props;
    const error = hasError(uploadOrFile);

    return (
        <Fade in={uploadOrFile.progress < 1} timeout={{enter: 100, exit: 2000}}>
            <div className={classes.progressContainer}>
                <CircularProgress
                    variant={'static'}
                    size={size}
                    className={classes.progressBackground}
                    value={100}
                />
                <CircularProgress
                    variant={'static'}
                    size={size}
                    className={classes.progress}
                    value={error ? 0 : uploadOrFile.progress * 100}
                />
            </div>
        </Fade>
    );
};

export default UploadProgress;
