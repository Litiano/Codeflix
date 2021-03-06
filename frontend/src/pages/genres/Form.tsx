import * as React from 'react';
import {
    Box,
    Button,
    ButtonProps,
    Checkbox,
    TextField,
    Theme,
    makeStyles,
    FormControlLabel,
    MenuItem
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import genreHttp from "../../utils/http/genre-http";
import {watch} from "fs";
import {useEffect, useState} from "react";
import categoryHttp from "../../utils/http/category-http";
import {useHistory, useParams} from "react-router-dom";
import {useSnackbar} from "notistack";
import * as yup from "../../utils/vendor/yup";
import {yupResolver} from "@hookform/resolvers/yup";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1),
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    categories_id: yup.array().label('Categorias').min(1),
});

export const Form = () => {
    const classes = useStyles();
    const [loading, setLoading] = useState<boolean>(false);
    const history = useHistory();
    const snackbar = useSnackbar();
    const [categories, setCategories] = useState<any[]>([]);
    const {id} = useParams();
    const [genre, setGenre] = useState<{id: string} | null>(null);

    const buttonProps: ButtonProps = {
        color: 'secondary',
        variant: 'contained',
        className: classes.submit,
        disabled: loading,
    }

    const {register, handleSubmit, getValues, setValue, errors, reset, watch} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: '',
            categories_id: [],
        }
    });

    useEffect(() => {
        register({name: 'categories_id'})
    }, [register]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const promises = [categoryHttp.list()];
            if (id) {
                promises.push(genreHttp.get(id));
            }
            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);
                setCategories(categoriesResponse.data.data);
                if (id) {
                    setGenre(genreResponse.data.data);
                    reset({
                        ...genreResponse.data.data,
                        categories_id: genreResponse.data.data.categories.map(category => category.id)
                    });
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = id ? genreHttp.update(id, formData) : genreHttp.create(formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Gênero salvo com sucesso!', {variant: 'success'});
            setTimeout(() => {
                if (event) {
                    if (id) {
                        history.replace(`/genres/${id}/edit`);
                    } else {
                        history.push(`/genres/${data.data.id}/edit`);
                    }
                } else {
                    history.push('/genres')
                }
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Erro ao salvar gênero!', {variant: 'error'})
        } finally {
            setLoading(false);
        }
        genreHttp
            .create(formData)
            .then(response => {
                console.log(response)
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                name={'name'}
                label={'Nome'}
                fullWidth
                variant={"outlined"}
                inputRef={register}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
                disabled={loading}
            />
            <TextField select
                       name={'categories_id'}
                       value={watch('categories_id')}
                       label={'Categorias'}
                       margin={'normal'}
                       variant={'outlined'}
                       fullWidth
                       onChange={(e) => {
                           setValue('categories_id', e.target.value);
                       }}
                       SelectProps={{multiple: true}}
                       error={errors.categories_id !== undefined}
                       helperText={errors.categories_id && (errors.categories_id as any)?.message}
                       InputLabelProps={{shrink: true}}
                       disabled={loading}
            >
                <MenuItem value={''} disabled>
                    <em>Selecione as categorias</em>
                </MenuItem>
                {
                    categories.map(
                        (category, key) => (
                            <MenuItem key={key} value={category.id}>{category.name}</MenuItem>
                        )
                    )
                }
            </TextField>
            <FormControlLabel
                control={<Checkbox defaultChecked name="is_active" inputRef={register}/>}
                label="Ativo?"
            />
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;
