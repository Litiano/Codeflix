import * as React from 'react';
import {Box, Button, ButtonProps, Checkbox, FormControlLabel, makeStyles, TextField, Theme} from "@material-ui/core";
import {useForm} from "react-hook-form";
import categoryHttp from "../../utils/http/category-http";
import * as yup from '../../utils/vendor/yup';
import {yupResolver} from '@hookform/resolvers/yup';
import {useEffect, useState} from "react";
import {useParams, useHistory} from "react-router-dom";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1),
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255)
});

export const Form = () => {
    const classes = useStyles();
    const {id} = useParams();
    const [category, setCategory] = useState<{id: string} | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const snackbar = useSnackbar();

    const buttonProps: ButtonProps = {
        color: 'secondary',
        variant: 'contained',
        className: classes.submit,
        disabled: loading,
    }

    const {register, handleSubmit, getValues, setValue, errors, reset, watch} = useForm({
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

        async function getCategory() {
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
        }
        getCategory();
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
        <form onSubmit={handleSubmit(onSubmit)}>
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
            <Box dir={'rtl'}>
                <Button {...buttonProps} color={"primary"} onClick={() => onSubmit(getValues(), null)}>
                    Salvar
                </Button>
                <Button {...buttonProps} type={'submit'}>
                    Salvar e continuar editando
                </Button>
            </Box>
        </form>
    );
};

export default Form;
