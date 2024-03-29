// @flow
import * as React from 'react';
import {IconButton, Tooltip} from "@material-ui/core";
import ClearAllIcon from '@material-ui/icons/ClearAll'
import {makeStyles} from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
    iconButton: (theme as any).overrides.MUIDataTableToolbar.icon
}));

interface FilterResetButtonProps {
    handleClick: () => void;
}

export const FilterResetButton: React.FC<FilterResetButtonProps> = (props) => {
    const classes = useStyles();
    return (
        <Tooltip title={'Limpar busca'}>
            <IconButton className={classes.iconButton} onClick={props.handleClick}>
                <ClearAllIcon/>
            </IconButton>
        </Tooltip>
    );
};
