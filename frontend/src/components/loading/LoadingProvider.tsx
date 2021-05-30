import * as React from 'react';
import LoadingContext from "./LoadingContext";
import {useEffect, useMemo, useState} from "react";
import {
    addGlobalRequestInterceptor,
    addGlobalResponseInterceptor,
    removeGlobalRequestInterceptor,
    removeGlobalResponseInterceptor
} from "../../utils/http";

export const LoadingProvider = (props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [countRequest, setCountRequest] = useState<number>(0);

    useMemo(() => {
        let isSubscribed = true;
        const requestIds = addGlobalRequestInterceptor((config) => {
            if (isSubscribed && !ignoreLoading(config.headers)) {
                setLoading(true);
                setCountRequest((prevCountRequest => prevCountRequest + 1));
            }
            return config;
        });

        const responseIds = addGlobalResponseInterceptor((response) => {
            if (isSubscribed && !ignoreLoading(response?.config?.headers)) {
                decrementCountRequest();
            }
            return response;
        }, (error) => {
            if (isSubscribed && !ignoreLoading(error?.config?.headers)) {
                decrementCountRequest();
            }
            return Promise.reject(error);
        });

        return () => {
            isSubscribed = false;
            removeGlobalRequestInterceptor(requestIds);
            removeGlobalResponseInterceptor(responseIds);
        }
    }, [true]); // eslint-disable-line

    function ignoreLoading(headers: object|undefined): boolean {
        return headers && headers.hasOwnProperty('x-ignore-loading') && headers['x-ignore-loading'];
    }

    function decrementCountRequest() {
        setCountRequest((prevCountRequest => prevCountRequest - 1));
    }

    useEffect(() => {
        if (countRequest === 0) {
            setLoading(false);
        }
    }, [countRequest])

    return (
        <LoadingContext.Provider value={loading}>
            {props.children}
        </LoadingContext.Provider>
    );
};

export default LoadingProvider;
