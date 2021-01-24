import * as React from 'react';
import {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {parseISO, format} from 'date-fns';
import categoryHttp from "../../utils/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../utils/models";
import DefaultTable from '../../components/Table';

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
                return value ? <BadgeYes/> : <BadgeNo/>
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
    const [data, setData] = useState<Category[]>([]);

    useEffect(() => {
        let isCancelled = false;
        (async () => {
            const {data} = await categoryHttp.list<ListResponse<Category>>();
            if (!isCancelled) {
                setData(data.data);
            }
        })();

        return () => {
            isCancelled = true;
        }
    }, []);

    return (
        <div>
            <DefaultTable columns={columnsDefinition} title='Listagem de categorias' data={data}/>
        </div>
    );
};

export default Table;
