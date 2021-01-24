// @flow
import * as React from 'react';
import {Chip, createMuiTheme, MuiThemeProvider} from "@material-ui/core";
import theme from "../theme";

const theme1 = createMuiTheme({
    palette: {
        primary: theme.palette.success,
        secondary: theme.palette.secondary
    }
})

export const BadgeYes = () => {
    return (
        <MuiThemeProvider theme={theme1}>
            <Chip label={'Sim'} color={'primary'}/>
        </MuiThemeProvider>
    );
};

export const BadgeNo = () => {
    return (
        <MuiThemeProvider theme={theme1}>
            <Chip label={'Não'} color={'secondary'}/>
        </MuiThemeProvider>
    );
};
