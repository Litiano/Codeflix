import {useSnackbar} from "notistack";
import axios from "axios";
import {useCallback} from "react";

const useHttpHandled = () => {
    const {enqueueSnackbar} = useSnackbar();

    return useCallback(async (request: Promise<any>) => {
        try {
            const {data} = await request;
            return data;
        } catch (e) {
            if (!axios.isCancel(e)) {
                console.error(e);
                enqueueSnackbar('Não foi possível carregar as informações.', {variant: 'error'});
            }
            throw e;
        }
    }, [enqueueSnackbar]);
}

export default useHttpHandled;
