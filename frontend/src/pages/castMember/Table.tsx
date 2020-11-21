import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpVideo} from "../../utils/http";
import {Chip} from "@material-ui/core";
import {parseISO, format} from 'date-fns';

const CastMemberTypes = {
    1: 'Diretor',
    2: 'Ator',
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
    },
    {
        name: 'type',
        label: 'Tipo',
        options: {
            customBodyRender(value: 1|2, tableMeta, updateValue) {
                return <span>{CastMemberTypes[value]}</span>
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
        httpVideo.get('cast_members').then(response => {
            setData(response.data.data);
        })
    }, []);

    return (
        <div>
            <MUIDataTable columns={columnsDefinition} title='Listagem de membros' data={data}/>
        </div>
    );
};

export default Table;
