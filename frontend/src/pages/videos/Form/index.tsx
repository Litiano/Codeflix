import React, {createRef, MutableRefObject, useCallback, useContext, useEffect, useRef, useState} from 'react';
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
    FormControlLabel,
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
import GenreField, {GenreFieldComponent} from "./GenreField";
import CategoryField, {CategoryFieldComponent} from "./CategoryField";
import {omit, zipObject} from 'lodash';
import CastMemberField, {CastMemberFieldComponent} from "./CastMemberField";
import {getCategoriesFromGenre} from "../../../utils/model-filter";
import {InputFileComponent} from "../../../components/InputFile";
import useSnackbarFormError from "../../../hooks/useSnackbarFormError";
import LoadingContext from "../../../components/loading/LoadingContext";
import {useDispatch} from "react-redux";
import {FileInfo} from "../../../store/upload/types";
import {Creators} from "../../../store/upload";
import SnackbarUpload from "../../../components/SnackbarUpload";

const useStyles = makeStyles((theme: Theme) => ({
    cardUpload: {
        borderRadius: '4px',
        backgroundColor: '#F5F5F5',
        margin: theme.spacing(2, 0),
    },
    cardOpened: {
        borderRadius: '4px',
        backgroundColor: '#F5F5F5',
    },
    cardContentOpened: {
        paddingBottom: theme.spacing(2) + 'px !important',
    }
}))

const fileFields = Object.keys(VideoFileFieldMap);

export const Form = () => {
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const {id} = useParams();
    const loading = useContext(LoadingContext);
    const [video, setVideo] = useState<Video | null>(null);
    const theme = useTheme();
    const dispatch = useDispatch();
    const isGreaterMd = useMediaQuery(theme.breakpoints.up('md'));
    const classes = useStyles();
    const castMemberRef = useRef() as MutableRefObject<CastMemberFieldComponent>;
    const genreRef = useRef() as MutableRefObject<GenreFieldComponent>;
    const categoryRef = useRef() as MutableRefObject<CategoryFieldComponent>;
    const uploadsRef = useRef(
        zipObject(fileFields, fileFields.map(() => createRef()))
    ) as MutableRefObject<{[key: string]: MutableRefObject<InputFileComponent>}>;

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
            .required()
            .test({
                test: (genres: any, options) => {
                    let hasCategory: any = true;
                    genres.forEach((genre) => {
                        let categories = getCategoriesFromGenre(watch('categories'), genre).length !== 0;
                        if (!categories) {
                            hasCategory = options.createError({
                                message: `O gênero ${genre.name} não possui categoria selecionada.`,
                            });
                        }
                    });
                    return hasCategory;
                }
            }),
        categories: yup.array()
            .label('Categorias')
            .min(1)
            .required(),
        cast_members: yup.array()
            .label('Membros do elenco')
            .min(1)
            .required(),
        rating: yup.string()
            .label('Classificação')
            .required(),
        opened: yup.boolean(),
    });

    const {register, handleSubmit, getValues, setValue, errors, reset, watch, trigger, formState} = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            title: '',
            description: '',
            year_launched: '',
            duration: '',
            rating: '',
            opened: false,
            genres: [],
            categories: [],
            cast_members: [],
        }
    });

    const resetForm = useCallback((data) => {
        Object.keys(uploadsRef.current).forEach((field) => {
            uploadsRef.current[field].current.clear();
        });
        castMemberRef.current.clear();
        genreRef.current.clear();
        categoryRef.current.clear();
        reset(data);
    }, [uploadsRef, castMemberRef, genreRef, categoryRef, reset]);

    useSnackbarFormError(formState.submitCount, errors);

    useEffect(() => {
        ['rating', 'opened', 'genres', 'categories', 'cast_members', ...fileFields].forEach((name) => {
            register({name: name as any});
        });
    }, [register]);

    useEffect(() => {
        if (!id) {
            return;
        }

        (async function getVideo() {
            try {
                const {data} = await videoHttp.get(id);
                setVideo(data.data);
                resetForm(data.data);
            } catch (error) {
                console.error(error);
                enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            }
        })();
    }, [id, resetForm, enqueueSnackbar]);

    async function onSubmit(formData, event) {
        try {
            const sendData = omit(formData, ['categories', 'genres', 'cast_members', ...fileFields]);
            sendData['categories_id'] = formData.categories.map(category => category.id);
            sendData['genres_id'] = formData.genres.map(genre => genre.id);
            sendData['cast_members_id'] = formData.cast_members.map(castMember => castMember.id);

            const http = id ? videoHttp.update(id, sendData) : videoHttp.create(sendData);
            const {data} = await http;
            enqueueSnackbar('Vídeo salvo com sucesso!', {variant: 'success'});
            setVideo(data.data);
            uploadFiles(data.data);
            id && resetForm(video);
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
            enqueueSnackbar('Erro ao salvar vídeo!', {variant: 'error'})
        }
    }

    function uploadFiles(video: Video) {
        const files: FileInfo[] = fileFields
            .filter(fileField => getValues()[fileField])
            .map(fileField => ({fileField, file: getValues()[fileField]}));

        if (!files.length) {
            return;
        }

        dispatch(Creators.addUpload({video, files}));

        enqueueSnackbar('', {
            key: 'snackbar-upload',
            persist: true,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            content: (key, message) => {
                const id = key as any;
                return <SnackbarUpload id={id}/>
            },
        });
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
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <CastMemberField
                                ref={castMemberRef}
                                castMembers={watch('cast_members')}
                                setCastMembers={(value) => {
                                    setValue('cast_members', value, {shouldValidate: true})
                                }}
                                error={errors.cast_members}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <GenreField
                                ref={genreRef}
                                genres={watch('genres')}
                                error={errors.genres}
                                disabled={loading}
                                categories={watch('categories')}
                                setCategories={(value) => setValue('categories', value, {shouldValidate: true})}
                                setGenres={
                                    (value) => setValue('genres', value, {shouldValidate: true})
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <CategoryField
                                ref={categoryRef}
                                genres={watch('genres')}
                                error={errors.categories}
                                disabled={loading}
                                categories={watch('categories')}
                                setCategories={
                                    (value) => setValue('categories', value, {shouldValidate: true})
                                }
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                    <RatingField
                        value={String(watch('rating'))}
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
                                ref={uploadsRef.current['thumb_file']}
                                accept={'image/*'}
                                setValue={(value) => setValue('thumb_file', value)}
                                label={'Thumb'}
                            />
                            <UploadField
                                ref={uploadsRef.current['banner_file']}
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
                                ref={uploadsRef.current['trailer_file']}
                                accept={'video/mp4'}
                                setValue={(value) => setValue('trailer_file', value)}
                                label={'Trailer'}
                            />
                            <UploadField
                                ref={uploadsRef.current['video_file']}
                                accept={'video/mp4'}
                                setValue={(value) => setValue('video_file', value)}
                                label={'Principal'}
                            />
                        </CardContent>
                    </Card>
                    <Card className={classes.cardOpened}>
                        <CardContent className={classes.cardContentOpened}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name={'opened'}
                                        color={'primary'}
                                        onChange={
                                            () => {
                                                setValue('opened', getValues()['opened'])
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
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
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
}
