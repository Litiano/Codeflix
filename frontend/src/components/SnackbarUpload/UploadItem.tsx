import * as React from 'react';
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {Divider, ListItem, ListItemIcon, ListItemText, Tooltip, Typography} from "@material-ui/core";
import {Movie as MovieIcon} from "@material-ui/icons";
import UploadProgress from "../UploadProgress";
import {Upload} from "../../store/upload/types";
import UploadAction from "./UploadAction";
import {hasError} from "../../store/upload/getters";
import {useState} from "react";

const useStyles = makeStyles((theme: Theme) => ({
    listItem: {
        paddingTop: '7px',
        paddingBottom: '7px',
        height: '53px',
    },
    movieIcon: {
        color: theme.palette.error.main,
        minWidth: '40px',
    },
    listItemText: {
        marginLeft: '6px',
        marginRight: '4px',
        color: theme.palette.text.secondary,
    },
}));

interface UploadItemProps {
    upload: Upload;
}

const UploadItem: React.FC<UploadItemProps> = (props) => {
    const classes = useStyles();
    const {upload} = props;
    const error = hasError(upload);
    const [itemHover, setItemHover] = useState(false);

    return (
        <>
            <Tooltip
                disableFocusListener
                disableTouchListener
                title={error ? 'Nao foi possível fazer upload.' : ''}
                placement={'left'}
            >
                <ListItem
                    className={classes.listItem}
                    button
                    onMouseOver={() => setItemHover(true)}
                    onMouseLeave={() => setItemHover(false)}
                >
                    <ListItemIcon className={classes.movieIcon}>
                        <MovieIcon/>
                    </ListItemIcon>
                    <ListItemText primary={
                        <Typography noWrap variant={'subtitle2'} color={'inherit'}>{upload.video.title}</Typography>
                    }/>
                    <UploadProgress size={30} uploadOrFile={upload}/>
                    <UploadAction upload={upload} hover={itemHover}/>
                </ListItem>
            </Tooltip>
            <Divider component={'li'}/>
        </>
    );
};

export default UploadItem;
