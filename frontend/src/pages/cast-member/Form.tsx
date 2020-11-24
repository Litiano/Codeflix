import * as React from 'react';
import {
    Box,
    Button,
    ButtonProps,
    Checkbox,
    TextField,
    Theme,
    makeStyles,
    Radio,
    FormControl,
    FormLabel, RadioGroup, FormControlLabel
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import castMemberHttp from "../../utils/http/cast-member-http";
import {useEffect} from "react";

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1),
        },
        type: {
            margin: theme.spacing(1),
        },
    }
});

export const Form = () => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: 'outlined',
        className: classes.submit,
    }

    const {register, handleSubmit, getValues} = useForm();

    function onSubmit(formData, event) {
        castMemberHttp
            .create(formData)
            .then(response => {
                console.log(response)
            })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField name={'name'} label={'Nome'} fullWidth variant={"outlined"} inputRef={register}/>
            <FormControl margin={'normal'}>
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup aria-label="Tipo" name="type">
                    <FormControlLabel value="1" control={<Radio/>} label="Diretor" inputRef={register}/>
                    <FormControlLabel value="2" control={<Radio/>} label="Ator" inputRef={register}/>
                </RadioGroup>
            </FormControl>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;
