import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {httpVideo} from "../../utils/http";
import {Chip} from "@material-ui/core";
import {parseISO, format} from 'date-fns';
import categoryHttp from "../../utils/http/category-http";

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: 'name',
        label: 'Nome',
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

interface Category {
    id: string;
    name: string;
}

type Props = {

};
const Table = (props: Props) => {
    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        categoryHttp.list<{data: Category[]}>().then(({data}) => {
            setData(data.data);
        })
    }, []);

    return (
        <div>
            <MUIDataTable columns={columnsDefinition} title='Listagem de categorias' data={data}/>
        </div>
    );
};

export default Table;
