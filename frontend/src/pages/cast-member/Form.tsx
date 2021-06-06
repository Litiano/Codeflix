import * as React from 'react';
import {useContext, useEffect, useState} from 'react';
import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup,
    TextField
} from "@material-ui/core";
import {useForm} from "react-hook-form";
import castMemberHttp from "../../utils/http/cast-member-http";
import * as yup from "../../utils/vendor/yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {useSnackbar} from "notistack";
import {useHistory, useParams} from "react-router-dom";
import {CastMember} from "../../utils/models";
import SubmitActions from "../../components/SubmitActions";
import {DefaultForm} from "../../components/DefaultForm";
import useSnackbarFormError from "../../hooks/useSnackbarFormError";
import LoadingContext from "../../components/loading/LoadingContext";

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    type: yup.number().label('Tipo').required(),
});

export const Form = () => {
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [, setCastMember] = useState<CastMember | null>(null);
    const loading = useContext(LoadingContext);

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
            name: '',
            type: undefined,
        }
    });

    useSnackbarFormError(formState.submitCount, errors);

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getCastMember() {
            try {
                const {data} = await castMemberHttp.get(id);
                setCastMember(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            }
        })();
    }, [id, reset, enqueueSnackbar]);

    useEffect(() => {
        register({name: 'type'})
    }, [register]);

    async function onSubmit(formData, event) {
        try {
            const http = id ? castMemberHttp.update(id, formData) : castMemberHttp.create(formData);
            const {data} = await http;
            enqueueSnackbar('Membro salvo com sucesso!', {variant: 'success'});
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
            enqueueSnackbar('Erro ao salvar membro!', {variant: 'error'});
        }
    }

    return (
        <DefaultForm
            onSubmit={handleSubmit(onSubmit)}
            GridItemProps={{xs: 12, md: 6}}>
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
