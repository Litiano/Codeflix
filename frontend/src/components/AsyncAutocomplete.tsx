import * as React from 'react';
import {Autocomplete, AutocompleteProps} from "@material-ui/lab";
import {CircularProgress, TextField, TextFieldProps} from "@material-ui/core";
import {useEffect, useState} from "react";
import {useDebounce} from "use-debounce";

interface AsyncAutocompleteProps {
    fetchOptions: (searchText) => Promise<any>;
    debounceTime?: number;
    TextFieldProps?: TextFieldProps;
    AutocompleteProps?: Omit<AutocompleteProps<any, any, any, any>, 'renderInput' | 'options'>;
}

export const AsyncAutocomplete: React.FC<AsyncAutocompleteProps> = (props) => {
    const {AutocompleteProps, debounceTime = 300} = props;
    const {freeSolo, onOpen, onClose, onInputChange} = props.AutocompleteProps as any;
    const [open, setOpen] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [debouncedSearchText] = useDebounce(searchText, debounceTime);
    const [loading, setLoading] = useState<boolean>(false);
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
            setLoading(true);
            try {
                if (isSubscribed) {
                    const data = await props.fetchOptions(debouncedSearchText);
                    setOptions(data);
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => {
            isSubscribed = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [freeSolo ? debouncedSearchText : open]);

    return (
        <Autocomplete {...autocompleteProps}/>
    );
}

export default AsyncAutocomplete;