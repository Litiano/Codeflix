import * as React from 'react';
import MUIDataTable, {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {parseISO, format} from 'date-fns';
import castMemberHttp from "../../utils/http/cast-member-http";
import {CastMember, ListResponse} from "../../utils/models";

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
            customBodyRender(value, tableMeta, updateValue) {
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
    const [data, setData] = useState<CastMember[]>([]);

    useEffect(() => {
        let isCancelled = false;
        (async () => {
            const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
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
            <MUIDataTable columns={columnsDefinition} title='Listagem de membros' data={data}/>
        </div>
    );
};

export default Table;
