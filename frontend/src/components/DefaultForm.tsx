// @flow
import * as React from 'react';
import {Grid, GridProps, makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => {
    return {
        gridItem: {
            padding: theme.spacing(1, 0)
        }
    }
});

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridItemProps?: GridProps;
    GridContainerProps?: GridProps;
}

export const DefaultForm: React.FC<DefaultFormProps> = (props) => {

    const {GridContainerProps, GridItemProps, ...others} = props;
    const classes = useStyles();

    return (
        <form {...others}>
            <Grid container {...GridContainerProps}>
                <Grid item {...GridItemProps} className={classes.gridItem}>
                    {props.children}
                </Grid>
            </Grid>
        </form>
    );
};
