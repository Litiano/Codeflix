import * as React from 'react';
import {MUIDataTableColumn} from "mui-datatables";
import {useEffect, useState} from "react";
import {parseISO, format} from 'date-fns';
import categoryHttp from "../../utils/http/category-http";
import {BadgeNo, BadgeYes} from "../../components/Badge";
import {Category, ListResponse} from "../../utils/models";
import DefaultTable, {TableColumn} from '../../components/Table';
import {useSnackbar} from "notistack";

const columnsDefinition: TableColumn[] = [
    {
        name: 'id',
        label: 'ID',
        options: {
            sort: false,
        },
        width: '30%',
    },
    {
        name: 'name',
        label: 'Nome',
        width: '43%',
    },
    {
        name: 'is_active',
        label: 'Ativo',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return value ? <BadgeYes/> : <BadgeNo/>
            }
        },
        width: '4%',
    },
    {
        name: 'created_at',
        label: 'Criado em',
        options: {
            customBodyRender(value, tableMeta, updateValue): JSX.Element {
                return <span>{format(parseISO(value), 'dd/MM/yyyy')}</span>
            }
        },
        width: '10%',
    },
    {
        name: 'actions',
        label: 'Ações',
        width: '13%',
    },
];

type Props = {

};
const Table = (props: Props) => {
    const snackbar = useSnackbar();
    const [data, setData] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        let isCancelled = false;
        (async () => {
            setLoading(true);
            try {
                const {data} = await categoryHttp.list<ListResponse<Category>>();
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
            <DefaultTable
                columns={columnsDefinition}
                title='Listagem de categorias'
                data={data}
                loading={loading}
            />
        </div>
    );
};

export default Table;
