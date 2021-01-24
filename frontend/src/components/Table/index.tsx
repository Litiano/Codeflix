// @flow
import * as React from 'react';
import MUIDataTable, {MUIDataTableOptions, MUIDataTableProps} from "mui-datatables";
import {merge} from 'lodash';

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
    }
};

interface TableProps extends MUIDataTableProps {

}

const Table: React.FC<TableProps> = (props) => {
    const newProps = merge({options: defaultOptions}, props);

    return (
        <MUIDataTable {...newProps}/>
    );
};

export default Table;
