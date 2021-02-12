import * as React from 'react';
import AsyncAutocomplete, {AsyncAutocompleteComponent} from "../../../components/AsyncAutocomplete";
import GridSelected from "../../../components/GridSelected";
import GridSelectedItem from "../../../components/GridSelectedItem";
import {FormControl, FormControlProps, FormHelperText, Typography} from "@material-ui/core";
import useHttpHandled from "../../../hooks/useHttpHandled";
import {CastMember, CastMemberTypeMap} from "../../../utils/models";
import useCollectionManager from "../../../hooks/useCollectionManager";
import castMemberHttp from "../../../utils/http/cast-member-http";
import {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from "react";

interface CastMemberFieldProps extends RefAttributes<CastMemberFieldProps>{
    castMembers: CastMember[];
    setCastMembers: (castMembers: CastMember[]) => void;
    error: any;
    disabled?: boolean;
    FormControlPros?: FormControlProps;
}

export interface CastMemberFieldComponent {
    clear: () => void;
}

export const CastMemberField = React.forwardRef<CastMemberFieldComponent, CastMemberFieldProps>((props, ref) => {
    const {castMembers, setCastMembers, error, disabled} = props;
    const autocompleteHttp = useHttpHandled();
    const {addItem, removeItem} = useCollectionManager(castMembers, setCastMembers);
    const autocompleteRef = useRef() as MutableRefObject<AsyncAutocompleteComponent>;

    function fetchOptions(searchText) {
        return autocompleteHttp(
            castMemberHttp.list({
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
                    label: 'Membros do elenco',
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
                    !!castMembers.length &&
                        <GridSelected>
                            {
                                castMembers.map((castMember, key) => (
                                    <GridSelectedItem onDelete={() => {
                                        removeItem(castMember)
                                    }} xs={12} md={6} key={key}>
                                        <Typography noWrap>{castMember.name} ({CastMemberTypeMap[castMember.type]})</Typography>
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

export default CastMemberField;
