// @flow
import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import useCollectionManager from "../../../hooks/useCollectionManager";
import {Category, Genre} from "../../../utils/models";
import categoryHttp from "../../../utils/http/category-http";

interface CategoryFieldProps {
    categories: Category[];
    setCategories: (genres: Category[]) => void;
    genres: Genre[];
    error: any;
    disabled?: boolean;
    FormControlPros?: FormControlProps;
}
export const CategoryField:React.FC<CategoryFieldProps> = (props) => {
    const autocompleteHttp = useHttpHandled();
    const {categories, setCategories, genres, error, disabled} = props;
    const {addItem, removeItem} = useCollectionManager(categories, setCategories);

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

    return (
        <>
            <AsyncAutocomplete
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
                                categories.map((category, key) => (
                                    <GridSelectedItem onClick={() => removeItem(category)} xs={12} key={key}>
                                        <Typography noWrap>{category.name}</Typography>
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
}

export default CategoryField;
