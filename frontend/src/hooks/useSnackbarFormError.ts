import {useSnackbar} from "notistack";
import {useEffect} from "react";

const useSnackbarFormError = (submitCount, errors) => {
    const snackbar = useSnackbar();
    useEffect(() => {
        const hasError = Object.keys(errors).length !== 0;
        if (submitCount > 0 && hasError) {
            snackbar.enqueueSnackbar(
                'Formulário inválido. Reveja os campos marcados em vermelho.',
                {variant: 'error'}
            );
            for (let key in errors) {
                if (errors.hasOwnProperty(key) && errors[key].message) {
                    snackbar.enqueueSnackbar(errors[key].message, {variant: 'error'});
                }
            }
        }
    }, [submitCount]); // eslint-disable-line
}

export default useSnackbarFormError;
