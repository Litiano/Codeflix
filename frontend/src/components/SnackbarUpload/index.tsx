import * as React from 'react';
import {Card, CardActions, Collapse, IconButton, List, Typography} from "@material-ui/core";
import {Close as CloseIcon, ExpandMore as ExpandMoreIcon} from "@material-ui/icons";
import {useSnackbar} from "notistack";
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {useState} from "react";
import classnames from 'classnames';
import UploadItem from "./UploadItem";
import {useSelector} from "react-redux";
import {Upload, UploadModule} from "../../store/upload/types";
import {countInProgress} from "../../store/upload/getters";

interface SnackbarUploadProps {
    id: string | number;
}

const useStyles = makeStyles((theme: Theme) => ({
    card: {
        width: 450,
    },
    cardActionRoot: {
        padding: '8px 8px 8px 16px',
        backgroundColor: theme.palette.primary.main,
    },
    title: {
        fontWight: 'bold',
        color: theme.palette.primary.contrastText,
    },
    icons: {
        marginLeft: 'auto !important',
        color: theme.palette.primary.contrastText,
    },
    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {duration: theme.transitions.duration.shortest}),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
        transition: theme.transitions.create('transform', {duration: theme.transitions.duration.shortest}),
    },
    list: {
        paddingTop: 0,
        paddingBottom: 0,
    },
}));

const SnackbarUpload = React.forwardRef<any, SnackbarUploadProps>((props, ref) => {
    const {id} = props;
    const {closeSnackbar} = useSnackbar();
    const classes = useStyles();
    const [expanded, setExpanded] = useState<boolean>(true);
    const uploads = useSelector<UploadModule, Upload[]>((state) => state.upload.uploads);
    const totalInProgress = countInProgress(uploads);

    return (
        <Card ref={ref} className={classes.card}>
            <CardActions classes={{root: classes.cardActionRoot}}>
                <Typography variant={'subtitle2'} className={classes.title}>
                    Fazendo upload de {totalInProgress} vídeo(s)
                </Typography>
                <div className={classes.icons}>
                    <IconButton color={'inherit'} onClick={() => setExpanded(!expanded)}>
                        <ExpandMoreIcon className={classnames(classes.expand, {[classes.expandOpen]: !expanded})}/>
                    </IconButton>
                    <IconButton color={'inherit'} onClick={() => closeSnackbar(id)}>
                        <CloseIcon/>
                    </IconButton>
                </div>
            </CardActions>
            <Collapse in={expanded}>
                <List className={classes.list}>
                    {
                        uploads.map((upload, key) => (
                            <UploadItem key={key} upload={upload}/>
                        ))
                    }
                </List>
            </Collapse>
        </Card>
    );
});

export default SnackbarUpload;
