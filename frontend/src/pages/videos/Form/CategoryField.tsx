// @flow
import * as React from 'react';
import AsyncAutocomplete, {AsyncAutocompleteComponent} from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography, makeStyles, useTheme} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {Category, Genre} from "../../../utils/models";
import categoryHttp from "../../../utils/http/category-http";
import {getGenresFromCategory} from "../../../utils/model-filter";
import {grey} from "@material-ui/core/colors";
import {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from "react";

interface CategoryFieldProps extends RefAttributes<CategoryFieldProps> {
    categories: Category[];
    setCategories: (genres: Category[]) => void;
    genres: Genre[];
    error: any;
    disabled?: boolean;
    FormControlPros?: FormControlProps;
}

export interface CategoryFieldComponent {
    clear: () => void;
}

const useStyle = makeStyles(() => ({
    genresSubTitle: {
        fontSize: '0.8rem',
        color: grey['000000'],
    }
}));

export const CategoryField = React.forwardRef<CategoryFieldComponent, CategoryFieldProps> ((props, ref) => {
    const autocompleteHttp = useHttpHandled();
    const {categories, setCategories, genres, error, disabled} = props;
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);
    const classes = useStyle();
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;
    const theme = useTheme();

    function fetchOptions(searchText) {
        return autocompleteHttp(
            categoryHttp.list({
                queryOptions: {
                    genres: genres.map(genre => genre.id).join(','),
                    all: ''
                }
            })
        ).then(data => data.data);
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
                    freeSolo: false,
                    getOptionLabel: option => option.name,
                    disabled: genres.length === 0 || disabled,
                    onChange: (event, value) => addItem(value),
                }}
                TextFieldProps={{
                    label: 'Categorias',
                    error: error !== undefined,
                }}
            />

            <FormHelperText style={{height: theme.spacing(3)}}>
                Escolha ao menos uma categoria de cada gênero
            </FormHelperText>
            <FormControl
                fullWidth
                margin={'normal'}
                error={error !== undefined}
                disabled={!!disabled}
                {...props.FormControlPros}
            >
                {
                    !!categories.length &&
                        <GridSelected>
                            {
                                categories.map((category, key) => {
                                    const genresFromCategory = getGenresFromCategory(genres, category)
                                        .map(genre => genre.name)
                                        .join(', ');
                                    return (
                                        <GridSelectedItem onDelete={() => removeItem(category)} xs={12} key={key}>
                                            <Typography noWrap>{category.name}</Typography>
                                            <Typography noWrap className={classes.genresSubTitle}>
                                                Gêneros: {genresFromCategory}
                                            </Typography>
                                        </GridSelectedItem>
                                    )
                                })
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

export default CategoryField;
