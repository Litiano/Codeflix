import * as React from 'react';
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {Divider, Fade, IconButton} from "@material-ui/core";
import {CheckCircle as CheckCircleIcon, Error as ErrorIcon} from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import {Link} from "react-router-dom";
import EditIcon from "@material-ui/icons/Edit";
import {FileUpload, Upload} from "../../store/upload/types";
import {Creators} from "../../store/upload";
import {useDispatch} from "react-redux";
import {hasError, isFinished, isUploadType} from "../../store/upload/getters";
import {useEffect, useState} from "react";
import {useDebounce} from "use-debounce";

interface UploadActionProps {
    uploadOrFile: Upload | FileUpload;
}

const useStyles = makeStyles((theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main,
        marginLeft: theme.spacing(1),
    },
    errorIcon: {
        color: theme.palette.error.main,
        marginLeft: theme.spacing(1),
    },
    divider: {
        height: '20px',
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
}));

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const classes = useStyles();
    const {uploadOrFile} = props;
    const dispatch = useDispatch();
    const error = hasError(uploadOrFile);
    const [show, setShow] = useState(false);
    const videoId = (uploadOrFile as any)?.video?.id;
    const activeActions = isUploadType(uploadOrFile);
    const [debouncedShow] = useDebounce(show, 2500);

    useEffect(() => {
        setShow(isFinished(uploadOrFile));
    }, [uploadOrFile]);

    return debouncedShow ? (
        <Fade in timeout={{enter: 1000}}>
            <>
                {
                    uploadOrFile.progress === 1 && !error && (<CheckCircleIcon className={classes.successIcon}/>)
                }
                {
                    error && <ErrorIcon className={classes.errorIcon}/>
                }
                {
                    activeActions && (
                        <>
                            <Divider className={classes.divider} orientation={'vertical'}/>
                            <IconButton onClick={() => dispatch(Creators.removeUpload({id: videoId}))}>
                                <DeleteIcon color={'primary'}/>
                            </IconButton>
                            <IconButton component={Link} to={`/videos/${videoId}/edit`}>
                                <EditIcon color={'primary'}/>
                            </IconButton>
                        </>
                    )
                }
            </>
        </Fade>
    ) : null;
};

export default UploadAction;
