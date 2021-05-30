// @flow
import * as React from 'react';
import {Video, videoRatings} from "../utils/models";
import {Typography, makeStyles} from "@material-ui/core";
import {find} from 'lodash';

const useStyles = makeStyles({
    root: {
        width: '36px',
        height: '36px',
        fontSize: '1.2em',
        color: '#fff',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
});

interface RatingProps extends Pick<Video, 'rating'> {

}

const Rating: React.FC<RatingProps> = (props: RatingProps) => {
    const classes = useStyles();
    return (
        <Typography
            className={classes.root}
            style={{
                backgroundColor: find(videoRatings, {value: props.rating})?.color
            }}
        >
            {props.rating}
        </Typography>
    );
};

export default Rating;
