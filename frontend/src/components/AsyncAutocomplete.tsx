import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {CircularProgress, TextField, TextFieldProps} from "@material-ui/core";
import {RefAttributes, useContext, useEffect, useImperativeHandle, useState} from "react";
import {useDebounce} from "use-debounce";
import LoadingContext from "./loading/LoadingContext";

interface AsyncAutocompleteProps extends RefAttributes<AsyncAutocompleteComponent> {
    fetchOptions: (searchText) => Promise<any>;
    debounceTime?: number;
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<AutocompleteProps<any, any, any, any>, 'renderInput' | 'options'>;
}

export interface AsyncAutocompleteComponent {
    clear: () => void;
}

export const AsyncAutocomplete = React.forwardRef<AsyncAutocompleteComponent, AsyncAutocompleteProps> ((props, ref) => {
    const {AutocompleteProps, debounceTime = 300, fetchOptions} = props;
    const {freeSolo, onOpen, onClose, onInputChange} = props.AutocompleteProps as any;
    const [open, setOpen] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [debouncedSearchText] = useDebounce(searchText, debounceTime);
    const loading = useContext(LoadingContext);
    const [options, setOptions] = useState<[]>([]);
    const textFieldProps: TextFieldProps = {
        margin: 'normal',
        variant: 'outlined',
        fullWidth: true,
        InputLabelProps: {
            shrink: true,
        },
        ...(props.TextFieldProps && {...props.TextFieldProps}),
    };

    const autocompleteProps: AutocompleteProps<any, any, any, any> = {
        loadingText: 'Carregando...',
        noOptionsText: 'Nenhum item encontrado.',
        ...(AutocompleteProps && {...AutocompleteProps}),
        open: open,
        options: options,
        loading: loading,
        inputValue: searchText,
        onOpen(event) {
            setOpen(true);
            onOpen && onOpen(event);
        },
        onClose(event, reason) {
            setOpen(false);
            onClose && onClose(event, reason);
        },
        onInputChange(event, value, reason) {
            setSearchText(value);
            onInputChange && onInputChange(event, value, reason);
        },
        renderInput: (params) => {
            return <TextField
                {...params}
                {...textFieldProps}
                InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <>
                            {loading && <CircularProgress color={'inherit'} size={20}/>}
                            {params.InputProps.endAdornment}
                        </>
                    ),
                }}
            />
        }
    };

    useEffect(() => {
        if (!open && !freeSolo) {
            setOptions([]);
        }
    }, [open, freeSolo]);

    useEffect(() => {
        if (!open || (debouncedSearchText === '' && freeSolo)) {
            return;
        }
        let isSubscribed = true;
        (async () => {
            try {
                if (isSubscribed) {
                    const data = await fetchOptions(debouncedSearchText);
                    setOptions(data);
                }
            } catch(error) {
                console.error(error);
            }
        })();
        return () => {
            isSubscribed = false;
        }
    }, [freeSolo, debouncedSearchText, open, fetchOptions]);

    useImperativeHandle(ref, () => ({
        clear: () => {
            setSearchText('');
            setOptions([]);
        }
    }));

    return (
        <Autocomplete {...autocompleteProps}/>
    );
});

export default AsyncAutocomplete;
