import * as React from 'react';
import {
    Box,
    Button,
    ButtonProps,
    TextField,
    Theme,
    makeStyles,
    Radio,
    FormControl,
    FormLabel, RadioGroup, FormControlLabel, FormHelperText
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import castMemberHttp from "../../utils/http/cast-member-http";
import {useEffect, useState} from "react";
import * as yup from "../../utils/vendor/yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";
import {useHistory, useParams} from "react-router-dom";
import {CastMember} from "../../utils/models";

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

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    type: yup.number().label('Tipo').required(),
});

export const Form = () => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [castMember, setCastMember] = useState<CastMember|null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const buttonProps: ButtonProps = {
        variant: 'contained',
        className: classes.submit,
        color: 'secondary',
        disabled: loading,
    };

    const {register, handleSubmit, getValues, setValue, errors, reset, watch} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            name: '',
            type: undefined,
        }
    });

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getCastMember() {
            setLoading(true);
            try {
                const {data} = await castMemberHttp.get(id);
                setCastMember(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        register({name: 'type'})
    }, [register]);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = id ? castMemberHttp.update(id, formData) : castMemberHttp.create(formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Membro salvo com sucesso!', {variant: 'success'});
            setTimeout(() => {
                if (event) {
                    if (id) {
                        history.replace(`/cast-members/${id}/edit`);
                    } else {
                        history.push(`/cast-members/${data.data.id}/edit`)
                    }
                } else {
                    history.push('/cast-members')
                }
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Erro ao salvar membro!', {variant: 'error'});
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
                inputRef={register}
                disabled={loading}
                error={errors.name !== undefined}
                helperText={errors.name && errors.name.message}
                InputLabelProps={{shrink: true}}
            />
            <FormControl
                margin={'normal'}
                error={errors.type !== undefined}
                disabled={loading}
            >
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup
                    aria-label="Tipo"
                    name="type"
                    onChange={(e) => {
                        setValue('type', parseInt(e.target.value));
                    }}
                    value={String(watch('type'))}
                >
                    <FormControlLabel value={'1'} control={<Radio color={'primary'}/>} label="Diretor"/>
                    <FormControlLabel value={'2'} control={<Radio color={'primary'}/>} label="Ator"/>
                </RadioGroup>
                {
                    errors.type && <FormHelperText id={'type-helper-text'}>{errors.type.message}</FormHelperText>
                }
            </FormControl>
            <Box dir={'rtl'}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type={'submit'}>Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};

export default Form;
