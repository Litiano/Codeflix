import * as React from 'react';
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {Image as ImageIcon, Movie as MovieIcon} from "@material-ui/icons";
import {Grid, ListItem, Typography} from "@material-ui/core";
import UploadProgress from "../../components/UploadProgress";
import UploadAction from "./UploadAction";
import {FileUpload, Upload} from "../../store/upload/types";

interface UploadItemProps {
    uploadOrFile: Upload | FileUpload;
}

const useStyles = makeStyles((theme: Theme) => ({
    icon: {
        color: theme.palette.error.main,
        minWidth: '40px',
    },
    gridTitle: {
        display: 'flex',
        color: '#999999',
    },
}));

const UploadItem: React.FC<UploadItemProps> = (props) => {
    const classes = useStyles();
    const {uploadOrFile} = props;

    function makeIcon() {
        if (true) {
            return <MovieIcon className={classes.icon}/>
        }
        return <ImageIcon className={classes.icon}/>
    }
    return (
        <ListItem>
            <Grid container alignItems={'center'}>
                <Grid className={classes.gridTitle} item xs={12} md={9}>
                    {makeIcon()}
                    <Typography color={'inherit'}>
                        {props.children}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Grid container direction={'row'} alignItems={'center'} justify={'flex-end'}>
                        <UploadProgress size={48} uploadOrFile={uploadOrFile}/>
                        <UploadAction uploadOrFile={uploadOrFile}/>
                    </Grid>
                </Grid>
            </Grid>
        </ListItem>
    );
};

export default UploadItem;
