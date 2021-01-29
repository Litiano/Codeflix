import * as React from 'react';
import {
    Checkbox,
    FormControlLabel,
    TextField,
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import categoryHttp from "../../utils/http/category-http";
import * as yup from '../../utils/vendor/yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useEffect, useState} from "react";
import {useParams, useHistory} from "react-router-dom";
import {useSnackbar} from "notistack";
import {Category} from "../../utils/models";
import SubmitActions from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255)
});

export const Form = () => {
    const {id} = useParams();
    const [, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const snackbar = useSnackbar();

    const {register, handleSubmit, getValues, setValue, errors, reset, watch, trigger} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            is_active: true,
            name: '',
            description: ''
        }
    });

    useEffect(() => {
        register({name: 'is_active'})
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getCategory() {
            setLoading(true);
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = id ? categoryHttp.update(id, formData) : categoryHttp.create(formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Categoria salva com sucesso!', {variant: 'success'});
            setTimeout(() => {
                if (event) {
                    if (id) {
                        history.replace(`/categories/${id}/edit`);
                    } else {
                        history.push(`/categories/${data.data.id}/edit`);
                    }
                } else {
                    history.push('/categories')
                }
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Erro ao salvar categoria!', {variant: 'error'})
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultForm onSubmit={handleSubmit(onSubmit)} GridItemProps={{xs: 12, md: 6}}>
            <TextField
                name={'name'}
                label={'Nome'}
                fullWidth
                variant={"outlined"}
                inputRef={register()}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
                disabled={loading}
            />
            <TextField
                name={'description'}
                label={'Descrição'}
                multiline
                rows={4}
                fullWidth
                variant={'outlined'}
                margin={'normal'}
                inputRef={register()}
                error={errors.description !== undefined}
                helperText={errors.description && errors.description.message}
                InputLabelProps={{shrink: true}}
                disabled={loading}
            />
            <FormControlLabel
                label="Ativo?"
                labelPlacement={'end'}
                control={
                    <Checkbox
                        checked={watch('is_active')}
                        onChange={() => setValue('is_active', !getValues()['is_active'])}
                        name="is_active"
                        color={'primary'}
                        disabled={loading}
                    />
                }
            />
            <SubmitActions disabledButtons={loading}
                           handleSave={
                               async () => {
                                   const result = await trigger();
                                   if (result) {
                                       await onSubmit(getValues(), null)
                                   }
                               }
                           }
            />
        </DefaultForm>
    );
};

export default Form;
