import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpVideo} from "../../utils/http";
import {Chip} from "@material-ui/core";
import {parseISO, format} from 'date-fns';
import map from "lodash/map";

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'categories',
        label: 'Categorias',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{map(value, 'name').join(', ')}</span>
            }
        }
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return value ? <Chip label={'Sim'} color={'primary'}/> : <Chip label={'Não'} color={'secondary'}/>
            }
        }
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        }
    },
];

type Props = {

};
const Table = (props: Props) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        httpVideo.get('genres').then(response => {
            setData(response.data.data);
        })
    }, []);

    return (
        <div>
            <MUIDataTable columns={columnsDefinition} title='Listagem de gêneros' data={data}/>
        </div>
    );
};

export default Table;
