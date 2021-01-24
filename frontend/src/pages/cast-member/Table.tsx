import * as React from 'react';
import {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {parseISO, format} from 'date-fns';
import castMemberHttp from "../../utils/http/cast-member-http";
import {CastMember, ListResponse} from "../../utils/models";
import DefaultTable from '../../components/Table';
import {useSnackbar} from "notistack";

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
    const snackbar = useSnackbar();
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;
        (async () => {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.list<ListResponse<CastMember>>();
                if (!isCancelled) {
                    setData(data.data);
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isCancelled = true;
        }
    }, []);

    return (
        <div>
            <DefaultTable columns={columnsDefinition} title='Listagem de membros' data={data} loading={loading}/>
        </div>
    );
};

export default Table;
