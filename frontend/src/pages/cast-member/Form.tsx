import * as React from 'react';
import {useEffect, useState} from 'react';
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

const validationSchema = yup.object().shape({
    name: yup.string().label('Nome').required().max(255),
    type: yup.number().label('Tipo').required(),
});

export const Form = () => {
    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [, setCastMember] = useState<CastMember | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const {register, handleSubmit, getValues, setValue, errors, reset, watch, trigger} = useForm({
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
        <DefaultForm onSubmit={handleSubmit(onSubmit)} GridItemProps={{xs: 12, md: 6}}>
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
