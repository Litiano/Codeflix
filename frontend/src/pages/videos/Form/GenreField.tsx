import * as React from 'react';
import AsyncAutocomplete from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import genreHttp from "../../../utils/http/genre-http";
import {Genre} from "../../../utils/models";
import useCollectionManager from "../../../hooks/useCollectionManager";

interface GenreFieldProps {
    genres: Genre[];
    setGenres: (genres: Genre[]) => void;
    error: any;
    disabled?: boolean;
    FormControlPros?: FormControlProps;
}
export const GenreField:React.FC<GenreFieldProps> = (props) => {
    const {genres, setGenres, error, disabled} = props;
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(genres, setGenres);

    function fetchOptions(searchText) {
        return autocompleteHttp(
            genreHttp.list({
                queryOptions: {search: searchText, all: ''}
            })
        ).then(data => data.data)
    }

    return (
        <>
            <AsyncAutocomplete
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
                                    <GridSelectedItem onClick={() => removeItem(genre)} xs={12} key={key}>
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
}

export default GenreField;
