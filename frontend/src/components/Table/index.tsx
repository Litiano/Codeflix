// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {merge, omit, cloneDeep} from 'lodash';
import {MuiThemeProvider, useMediaQuery, useTheme} from "@material-ui/core";
import {Theme} from "@material-ui/core/styles";

export interface TableColumn extends MUIDataTableColumn {
    width?: string
}

const defaultOptions: MUIDataTableOptions = {
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: 'Nenhum registro encontrado',
            toolTip: 'Classificar',
        },
        filter: {
            all: 'Todos',
            title: 'FILTROS',
            reset: 'LIMPAR',
        },
        pagination: {
            displayRows: 'de',
            next: 'Próxima página',
            previous: 'Página anterior',
            jumpToPage: 'Ir para página',
            rowsPerPage: 'Por página',
        },
        selectedRows: {
            delete: 'Excluir',
            deleteAria: 'Excluir registros selecionados',
            text: 'Registro(s) selecionado(s)',
        },
        toolbar: {
            search: 'Busca',
            downloadCsv: 'Download CSV',
            filterTable: 'Filtrar Tabelas',
            print: 'Imprimir',
            viewColumns: 'Ver colunas',
        },
        viewColumns: {
            title: 'Ver Colunas',
            titleAria: 'Ver/Esconder colunas da Tabela',
        },
    },
};

interface TableProps extends MUIDataTableProps {
    columns: TableColumn[],
    loading?: boolean,
}

const Table: React.FC<TableProps> = (props) => {

    function extractMuiDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'));
    }

    function setColumnsWidth(columns: TableColumn[]) {
        columns.forEach((column, key) => {
            if (column.width) {
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key+2})`] = {
                    width: column.width
                }
            }
        })
    }

    function applyLoading() {
        const textLabels = (newProps.options as any).textLabels;
        textLabels.body.noMatch = newProps.loading === true ? 'Carregando...' : textLabels.body.noMatch;
    }

    function getOriginalMuiDataTableProps() {
        return omit(newProps, 'loading');
    }

    function applyResponsive() {
        newProps.options.responsive = isSmOrDown ? 'standard' : 'simple';
    }

    const theme = cloneDeep<Theme>(useTheme());
    const isSmOrDown = useMediaQuery(theme.breakpoints.down('sm'));

    const newProps = merge(
        {options: cloneDeep(defaultOptions)},
        props,
        {columns: extractMuiDataTableColumns(props.columns)},
    );

    applyLoading();
    applyResponsive();
    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps}/>
        </MuiThemeProvider>
    );
};

export default Table;

export function makeActionStyles(column) {
    return (theme) => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testid^="MuiDataTableBodyCell-${column}"]`;
        (copyTheme.overrides as any).MUIDataTableBodyCell.root[selector] = {
            paddingTop: '0px',
            paddingBottom: '0px',
        };

        return copyTheme;
    }
}
