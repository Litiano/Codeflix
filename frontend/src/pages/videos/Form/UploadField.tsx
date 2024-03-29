// @flow
import * as React from 'react';
import {
    Button,
    FormControl,
    FormControlProps,
} from "@material-ui/core";
import InputFile, {InputFileComponent} from "../../../components/InputFile";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import {MutableRefObject, RefAttributes, useImperativeHandle, useRef} from "react";

interface UploadFieldProps extends RefAttributes<UploadFieldProps> {
    accept: string;
    setValue: (value) => void;
    label: string;
    error?: any;
    formControlPros?: FormControlProps
}

export interface UploadFieldPropsComponent {
    clear: () => void;
}

export const UploadField = React.forwardRef<UploadFieldPropsComponent, UploadFieldProps> ((props, ref) => {
    const inputFileRef = useRef() as MutableRefObject<InputFileComponent>;
    const {setValue, error, label, accept} = props;

    useImperativeHandle(ref, () => ({
        clear: () => inputFileRef.current.clear(),
    }));

    return (
        <FormControl
            fullWidth
            margin={'normal'}
            error={error !== undefined}
            {...props.formControlPros}
        >
            <InputFile
                ref={inputFileRef}
                TextFieldProps={{
                    label: label,
                    InputLabelProps: {
                        shrink: true,
                    },
                    style: {
                        backgroundColor: 'white',
                    },
                }}
                InputFileProps={{
                    accept: accept,
                    onChange: (event => {
                        if (event.target.files && event.target.files.length) {
                            event.target.files.length && setValue(event.target.files[0])
                        }
                    })
                }}
                ButtonFile={
                    <Button
                        endIcon={<CloudUploadIcon/>}
                        variant={'contained'}
                        color={'primary'}
                        onClick={() => inputFileRef.current.openWindow()}
                    >
                        Adicionar
                    </Button>
                }
            />
        </FormControl>
    );
});
