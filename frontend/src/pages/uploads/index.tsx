import * as React from 'react';
import {Page} from "../../components/Page";
import {
    Card,
    CardContent, Divider,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary, Grid, List,
    Typography
} from "@material-ui/core";
import UploadItem from "./UploadItem";
import {makeStyles} from "@material-ui/styles";
import {Theme} from "@material-ui/core/styles";
import {ExpandMore} from "@material-ui/icons";
import {useSelector} from "react-redux";
import {Upload, UploadModule} from "../../store/upload/types";
import {VideoFileFieldMap} from "../../utils/models";

const useStyles = makeStyles((theme: Theme) => ({
    panelSummary: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    expandedIcon: {
        color: theme.palette.primary.contrastText,
    },
}));

const Uploads = () => {
    const classes = useStyles();
    const uploads = useSelector<UploadModule, Upload[]>((state) => state.upload.uploads);

    return (
        <Page title={'Uploads'}>
            {
                uploads.map((upload, key) => (
                    <Card elevation={5} key={key}>
                        <CardContent>
                            <UploadItem uploadOrFile={upload}>{upload.video.title}</UploadItem>
                        </CardContent>
                        <ExpansionPanel style={{margin: 0}}>
                            <ExpansionPanelSummary
                                className={classes.panelSummary}
                                expandIcon={<ExpandMore className={classes.expandedIcon}/>}
                            >
                                <Typography>Ver detalhes</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails style={{padding: '0px'}}>
                                <Grid item xs={12}>
                                    <List dense style={{padding: '0px'}}>
                                        {
                                            upload.files.map((file, key) => (
                                                <React.Fragment key={key}>
                                                    <Divider/>
                                                    <UploadItem uploadOrFile={file}>
                                                        {`${VideoFileFieldMap[file.fileField]} - ${file.filename}`}
                                                    </UploadItem>
                                                </React.Fragment>
                                            ))
                                        }
                                    </List>
                                </Grid>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </Card>
                ))
            }
        </Page>
    );
};

export default Uploads;
