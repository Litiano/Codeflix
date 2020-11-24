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

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1),
        }
    }
});

export const Form = () => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: 'outlined',
        className: classes.submit,
    }

    const [categories, setCategories] = useState<any[]>([]);
    const {register, handleSubmit, getValues, setValue, watch} = useForm({
        defaultValues: {
            categories_id: []
        }
    });

    useEffect(() => {
        register({name: 'categories_id'})
    }, [register]);

    useEffect(() => {
        categoryHttp
            .list()
            .then(
                (response) => setCategories(response.data.data)
            );
    }, []);

    function onSubmit(formData, event) {
        genreHttp
            .create(formData)
            .then(response => {
                console.log(response)
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField name={'name'} label={'Nome'} fullWidth variant={"outlined"} inputRef={register}/>
            <TextField select name={'categories_id'} value={watch('categories_id')}
                       label={'Categorias'} margin={'normal'} variant={'outlined'} fullWidth
                       onChange={(e) => {
                           setValue('categories_id', e.target.value);
                       }}
                       SelectProps={{multiple: true}}
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
