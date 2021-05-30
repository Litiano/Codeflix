import * as React from 'react';
import AsyncAutocomplete, {AsyncAutocompleteComponent} from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography, useTheme} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../utils/http/genre-http";
import {Category, Genre} from "../../../utils/models";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {getGenresFromCategory} from "../../../utils/model-filter";
import {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from "react";

interface GenreFieldProps extends RefAttributes<GenreFieldProps> {
    genres: Genre[];
    setGenres: (genres: Genre[]) => void;
    categories: Category[];
    setCategories: (categories: Category[]) => void;
    error: any;
    disabled?: boolean;
    FormControlPros?: FormControlProps;
}

export interface GenreFieldComponent {
    clear: () => void;
}

export const GenreField = React.forwardRef<GenreFieldComponent, GenreFieldProps> ((props, ref) => {
    const {genres, setGenres, error, disabled, categories, setCategories} = props;
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(genres, setGenres);
    const {removeItem: removeCategory} = useCollectionManager(categories, setCategories);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;
    const theme = useTheme();

    function fetchOptions(searchText) {
        return autocompleteHttp(
            genreHttp.list({
                queryOptions: {search: searchText, all: ''}
            })
        ).then(data => data.data)
    }

    useImperativeHandle(ref, () => ({
        clear: () => autocompleteRef.current.clear()
    }));

    return (
        <>
            <AsyncAutocomplete
                ref={autocompleteRef}
                fetchOptions={fetchOptions}
                AutocompleteProps={{
                    autoSelect: false,
                    clearOnEscape: true,
                    freeSolo: true,
                    disabled: disabled,
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                    onChange: (event, value) => addItem(value),
                }}
                TextFieldProps={{
                    label: 'Gêneros',
                    error: error !== undefined,
                }}
            />
            <FormHelperText style={{height: theme.spacing(3)}}>
                Escolha os gêneros do vídeo
            </FormHelperText>
            <FormControl
                fullWidth
                margin={'normal'}
                error={error !== undefined}
                disabled={!!disabled}
                {...props.FormControlPros}
            >
                {
                    !!genres.length &&
                        <GridSelected>
                            {
                                genres.map((genre, key) => (
                                    <GridSelectedItem onDelete={() => {
                                        const categoriesWithOneGenre = categories.filter(category => {
                                            const genresFromCategory = getGenresFromCategory(genres, category);
                                            return genresFromCategory.length === 1 && genresFromCategory[0].id === genre.id;
                                        });
                                        categoriesWithOneGenre.forEach(cat => {
                                            removeCategory(cat);
                                        });
                                        removeItem(genre)
                                    }} xs={12} key={key}>
                                        <Typography noWrap>{genre.name}</Typography>
                                    </GridSelectedItem>
                                ))
                            }
                        </GridSelected>
                }
                {
                    error && <FormHelperText>{error.message}</FormHelperText>
                }
            </FormControl>
        </>
    );
});

export default GenreField;
