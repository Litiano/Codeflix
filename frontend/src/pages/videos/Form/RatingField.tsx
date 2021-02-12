// @flow
import * as React from 'react';
import {
    Box,
    FormControl,
    FormControlLabel,
    FormControlLabelProps, FormControlProps,
    FormHelperText,
    FormLabel,
    Radio,
    RadioGroup
} from "@material-ui/core";
import {videoRatings} from "../../../utils/models";
import Rating from "../../../components/Rating";

interface RatingFieldProps {
    value: string;
    setValue: (value) => void;
    error: any;
    FormControlPros?: FormControlProps
}

const ratings:FormControlLabelProps[] = [];

videoRatings.forEach((rating) => {
    ratings.push(
        {
            value: rating.value,
            control: <Radio color={'primary'}/>,
            label: <Rating rating={rating.value as any}/>,
            labelPlacement: 'top',
        }
    )
})

export const RatingField: React.FC<RatingFieldProps> = (props) => {
    const {value, setValue, error} = props;
    return (
        <FormControl
            error={error !== undefined}
            {...props.FormControlPros}
        >
            <FormLabel component="legend">Classificação</FormLabel>
            <Box paddingTop={1}>
                <RadioGroup
                    aria-label="Tipo"
                    name="type"
                    onChange={(e) => {
                        setValue(e.target.value);
                    }}
                    value={value}
                    row
                >
                    {
                        ratings.map(
                            (props, key) => <FormControlLabel key={key} {...props}/>
                        )
                    }
                </RadioGroup>
            </Box>
            {
                error && <FormHelperText>{error.message}</FormHelperText>
            }
        </FormControl>
    );
};
