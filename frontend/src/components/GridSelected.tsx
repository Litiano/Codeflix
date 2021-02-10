// @flow
import * as React from 'react';
import {createStyles, Grid, GridProps, makeStyles} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            backgroundColor: '#F1F1F1',
            borderRadius: '4px',
            padding: theme.spacing(1, 1),
            color: theme.palette.secondary.main,
        }
    })
)

interface GridSelectedProps extends GridProps {

}

const GridSelected: React.FC<GridSelectedProps> = (props) => {
    const classes = useStyles();

    return (
        <Grid container wrap={'wrap'} className={classes.root} {...props}>
            {props.children}
        </Grid>
    );
};

export default GridSelected;
