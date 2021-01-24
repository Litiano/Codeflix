import {ComponentNameToClassKey} from "@material-ui/core/styles/overrides";
import {PaletteOptions, PaletteColorOptions} from "@material-ui/core/styles/createPalette";


declare module "@material-ui/core/styles/overrides" {
    interface ComponentNameToClassKey {
        MUIDataTable: any;
        MUIDataTableToolbar: any;
        MUIDataTableHeadCell: any;
        MuiTableSortLabel: any;
        MUIDataTableSelectCell: any;
        MUIDataTableBodyCell: any;
        MUIDataTableToolbarSelect: any;
        MUIDataTableBodyRow: any;
        MuiTablePagination: any;
        MUIDataTablePagination: any;
    }
}

declare module "@material-ui/core/styles/createPalette"; {
    interface PaletteOptions {
        //success?: PaletteColorOptions
    }
}
