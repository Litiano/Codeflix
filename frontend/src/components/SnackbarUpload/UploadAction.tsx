// @flow
import * as React from 'react';
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {Fade, IconButton, ListItemSecondaryAction} from "@material-ui/core";
import {CheckCircle as CheckCircleIcon, Error as ErrorIcon} from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import {Upload} from "../../store/upload/types";
import {useDispatch} from "react-redux";
import {Creators} from "../../store/upload";
import {hasError, isFinished} from "../../store/upload/getters";
import {useEffect, useState} from "react";
import {useDebounce} from "use-debounce";

interface UploadActionProps {
    upload: Upload;
    hover: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
    successIcon: {
        color: theme.palette.success.main,
    },
    errorIcon: {
        color: theme.palette.error.main,
    },
}));

const UploadAction: React.FC<UploadActionProps> = (props) => {
    const classes = useStyles();
    const {upload, hover} = props;
    const dispatch = useDispatch();
    const error = hasError(upload);
    const [show, setShow] = useState(false);
    const [debouncedShow] = useDebounce(show, 2500);

    useEffect(() => {
        setShow(isFinished(upload));
    }, [upload]);

    return debouncedShow ? (
        <Fade in={show} timeout={{enter: 1000}}>
            <ListItemSecondaryAction>
                <span hidden={hover}>
                    {
                        upload.progress === 1 && !error && (
                            <IconButton className={classes.successIcon} edge={'end'}>
                                <CheckCircleIcon/>
                            </IconButton>
                        )
                    }
                    {
                        error && (
                            <IconButton className={classes.errorIcon} edge={'end'}>
                                <ErrorIcon/>
                            </IconButton>
                        )
                    }
                </span>
                <span hidden={!hover}>
                    <IconButton
                        color={'primary'}
                        edge={'end'}
                        onClick={() => dispatch(Creators.removeUpload({id: upload.video.id}))}
                    >
                        <DeleteIcon/>
                    </IconButton>
                </span>
            </ListItemSecondaryAction>
        </Fade>
    ) : null;
};

export default UploadAction;
