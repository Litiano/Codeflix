/* eslint-disable no-template-curly-in-string */
import {setLocale} from "yup";

const ptBr = {
    mixed: {
        required: '${path} é obrigatório'
    },
    string: {
        max: '${path} precisa ter no máximo ${max} caracteres',
        min: '${path} precisa ter no mínimo ${min} caracteres',
    },
    number: {
        min: '${path} precisa ser no mínimo ${min}',
    },
    array: {
        min: '${path} precisa ter no mínimo ${min} items',
    }
}

setLocale(ptBr);

export * from 'yup';
