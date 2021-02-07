import * as React from 'react';
import {InputAdornment, TextField, TextFieldProps} from "@material-ui/core";
import {MutableRefObject, useImperativeHandle, useRef, useState} from "react";

export interface InputFileProps {
    ButtonFile: React.ReactNode;
    InputFileProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    TextFieldProps?: TextFieldProps;
}

export interface InputFileComponent {
    openWindow: () => void;
}

const InputFile = React.forwardRef<InputFileComponent, InputFileProps>((props, ref) => {
    const inputFileRef = useRef() as MutableRefObject<HTMLInputElement>;
    const [fileName, setFileName] = useState<string>('');

    const textFieldProps: TextFieldProps = {
        variant: 'outlined',
        ...props.TextFieldProps,
        InputProps: {
            ...(
                props.TextFieldProps && props.TextFieldProps.InputProps && {...props.TextFieldProps.InputProps}
            ),
            ...props.TextFieldProps?.InputProps,
            readOnly: true,
            endAdornment: (
                <InputAdornment position={'end'}>
                    {props.ButtonFile}
                </InputAdornment>
            ),
        },
        value: fileName,
    };

    const inputFileProps: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> = {
        ...props.InputFileProps,
        hidden: true,
        ref: inputFileRef,
        type: 'file',
        onChange(event) {
            const files = event.target.files;
            if (files && files.length) {
                setFileName(Array.from(files).map(file => file.name).join(', '));
            }
            if (props.InputFileProps && props.InputFileProps.onChange) {
                props.InputFileProps.onChange(event);
            }
        }
    }

    useImperativeHandle(ref, () => ({
        openWindow: () => inputFileRef.current.click(),
    }));

    return (
        <>
            <input {...inputFileProps}/>
            <TextField {...textFieldProps}/>
        </>
    );
});

export default InputFile;
