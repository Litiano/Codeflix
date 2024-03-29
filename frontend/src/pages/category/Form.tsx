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
import {useContext, useEffect, useState} from "react";
import {useParams, useHistory} from "react-router-dom";
import {useSnackbar} from "notistack";
import {Category} from "../../utils/models";
import SubmitActions from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import LoadingContext from "../../components/loading/LoadingContext";

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255)
});

export const Form = () => {
    const {id} = useParams();
    const [, setCategory] = useState<Category | null>(null);
    const loading = useContext(LoadingContext);
    const history = useHistory();
    const {enqueueSnackbar} = useSnackbar();

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        errors,
        reset,
        watch,
        trigger,
        formState
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            is_active: true,
            name: '',
            description: ''
        }
    });

    useSnackbarFormError(formState.submitCount, errors);

    useEffect(() => {
        register({name: 'is_active'})
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getCategory() {
            try {
                const {data} = await categoryHttp.get(id);
                setCategory(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            }
        })();
    }, [id, reset, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        try {
            const http = id ? categoryHttp.update(id, formData) : categoryHttp.create(formData);
            const {data} = await http;
            enqueueSnackbar('Categoria salva com sucesso!', {variant: 'success'});
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
            enqueueSnackbar('Erro ao salvar categoria!', {variant: 'error'})
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
                                   formState.submitCount++;
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
