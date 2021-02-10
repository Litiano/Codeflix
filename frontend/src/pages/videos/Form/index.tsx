import React, {useEffect, useState} from 'react';
import * as yup from "../../../utils/vendor/yup";
import {useSnackbar} from "notistack";
import {useHistory, useParams} from "react-router-dom";
import {Video, VideoFileFieldMap} from "../../../utils/models";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import videoHttp from "../../../utils/http/video-http";
import {DefaultForm} from "../../../components/DefaultForm";
import {
    Card, CardContent,
    Checkbox,
    FormControlLabel, FormHelperText,
    Grid,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import SubmitActions from "../../../components/SubmitActions";
import {RatingField} from "./RatingField";
import {UploadField} from "./UploadField";
import {Theme} from "@material-ui/core/styles";
import {makeStyles} from "@material-ui/styles";
import GenreField from "./GenreField";
import CategoryField from "./CategoryField";

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: '4px',
        backgroundColor: '#F5F5F5',
        margin: theme.spacing(2, 0),
    }
}))
const validationSchema = yup.object().shape({
    title: yup.string()
        .label('Título')
        .required()
        .max(255),
    description: yup.string()
        .label('Sinopse')
        .required(),
    year_launched: yup.number()
        .label('Ano de lançamento')
        .min(1)
        .required(),
    duration: yup.number()
        .label('Duração')
        .min(1)
        .required(),
    genres: yup.array()
        .label('Gêneros')
        .min(1)
        .required(),
    categories: yup.array()
        .label('Categorias')
        .min(1)
        .required(),
    rating: yup.string()
        .label('Classificação')
        .required(),
    opened: yup.boolean(),
});

const fileFields = Object.keys(VideoFileFieldMap);

export const Form = () => {
    const snackbar = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [, setVideo] = useState<Video | null>(null);
    const theme = useTheme();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const classes = useStyles();

    const {register, handleSubmit, getValues, setValue, errors, reset, watch, trigger} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            title: '',
            description: '',
            year_launched: '',
            duration: '',
            rating: '',
            opened: false,
            thumb_file: null,
            banner_file: null,
            trailer_file: null,
            video_file: null,
            genres: [],
            categories: [],
        }
    });

    useEffect(() => {
        ['rating', 'opened', 'genres', 'categories', ...fileFields].forEach((name) => {
            register({name: name as any});
        });
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getCastMember() {
            setLoading(true);
            try {
                const {data} = await videoHttp.get(id);
                setVideo(data.data);
                reset(data.data);
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSubmit(formData, event) {
        setLoading(true);
        try {
            const http = id ? videoHttp.update(id, formData) : videoHttp.create(formData);
            const {data} = await http;
            snackbar.enqueueSnackbar('Vídeo salvo com sucesso!', {variant: 'success'});
            setTimeout(() => {
                if (event) {
                    if (id) {
                        history.replace(`/videos/${id}/edit`);
                    } else {
                        history.push(`/videos/${data.data.id}/edit`);
                    }
                } else {
                    history.push('/videos')
                }
            });
        } catch (error) {
            console.error(error);
            snackbar.enqueueSnackbar('Erro ao salvar vídeo!', {variant: 'error'})
        } finally {
            setLoading(false);
        }
    }

    return (
        <DefaultForm
            GridItemProps={{xs: 12}}
            onSubmit={handleSubmit(onSubmit)}
            >
            <Grid container spacing={5}>
                <Grid item xs={12} md={6}>
                    <TextField
                        name={'title'}
                        label={'Título'}
                        fullWidth
                        variant={"outlined"}
                        inputRef={register()}
                        error={errors.title !== undefined}
                        helperText={errors.title && errors.title.message}
                        InputLabelProps={{shrink: true}}
                        disabled={loading}
                    />
                    <TextField
                        name={'description'}
                        label={'Sinopse'}
                        multiline
                        rows={4}
                        margin={'normal'}
                        fullWidth
                        variant={"outlined"}
                        inputRef={register()}
                        error={errors.description !== undefined}
                        helperText={errors.description && errors.description.message}
                        InputLabelProps={{shrink: true}}
                        disabled={loading}
                    />
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <TextField
                                name={'year_launched'}
                                label={'Ano de lançamento'}
                                type={'number'}
                                margin={'normal'}
                                fullWidth
                                variant={"outlined"}
                                inputRef={register()}
                                error={errors.year_launched !== undefined}
                                helperText={errors.year_launched && errors.year_launched.message}
                                InputLabelProps={{shrink: true}}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name={'duration'}
                                label={'Duração'}
                                type={'number'}
                                margin={'normal'}
                                fullWidth
                                variant={"outlined"}
                                inputRef={register()}
                                error={errors.duration !== undefined}
                                helperText={errors.duration && errors.duration.message}
                                InputLabelProps={{shrink: true}}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                    Elenco
                    <br/>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                genres={watch('genres')}
                                error={errors.genres}
                                disabled={loading}
                                setGenres={
                                    (value) => setValue('genres', value, {shouldValidate: true})
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                                categories={watch('categories')}
                                setCategories={
                                    (value) => setValue('categories', value, {shouldValidate: true})
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormHelperText>
                                Escolha os gêneros do vídeo
                            </FormHelperText>
                            <FormHelperText>
                                Escolha pelo menos uma categoria de cada gênero
                            </FormHelperText>
                        </Grid>
                    </Grid>
                    <br/>
                    Gêneros e ctegorias
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={watch('rating')}
                        setValue={(value) => setValue('rating', value, {shouldValidate: true})}
                        error={errors.rating}
                        FormControlPros={{
                            margin: isGreaterMd ? 'none' : 'normal',
                            disabled: loading,
                        }}
                    />
                    <br/>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={'primary'} variant={'h6'}>Imagens</Typography>
                            <UploadField
                                accept={'image/*'}
                                setValue={(value) => setValue('thumb_file', value)}
                                label={'Thumb'}
                            />
                            <UploadField
                                accept={'image/*'}
                                setValue={(value) => setValue('banner_file', value)}
                                label={'Banner'}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardUpload}>
                        <CardContent>
                            <Typography color={'primary'} variant={'h6'}>
                                Videos
                            </Typography>
                            <UploadField
                                accept={'video/mp4'}
                                setValue={(value) => setValue('trailer_file', value)}
                                label={'Trailer'}
                            />
                            <UploadField
                                accept={'video/mp4'}
                                setValue={(value) => setValue('video_file', value)}
                                label={'Principal'}
                            />
                        </CardContent>
                    </Card>
                    <br/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name={'opened'}
                                color={'primary'}
                                onChange={
                                    () => {
                                        setValue('opened', !getValues()['opened'])
                                    }
                                }
                                checked={watch('opened')}
                                disabled={loading}
                            />
                            }
                        label={
                            <Typography color={'primary'} variant={'subtitle2'}>
                                Quero que este conteúdo apareça na seção lançamento
                            </Typography>
                        }
                        labelPlacement={'end'}
                    />
                </Grid>
            </Grid>
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
}
