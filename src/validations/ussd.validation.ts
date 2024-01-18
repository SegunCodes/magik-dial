import Joi from 'joi';

export const getProductsValidation = Joi.object({
    sessionid: Joi.string().required()
});

export const selectProductValidation = Joi.object({
    sessionid: Joi.string().required(),
    productid: Joi.string().required(),
    msisdn: Joi.string().required(),
});

export const processWinValidation = Joi.object({
    sessionid: Joi.string().required(),
    input: Joi.string().required(),
    msisdn: Joi.string().required(),
});

export const bankDetailsValidation = Joi.object({
    msisdn: Joi.string().required(),
    bankAccount: Joi.string().required(),
    bankName: Joi.string().required(),
    AccountName: Joi.string().required(),
});