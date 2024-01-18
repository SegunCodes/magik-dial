import Joi from 'joi';

export const smsCodeValidation = Joi.object({
    code: Joi.string().required()
});

export const smsGameTypeValidation = Joi.object({
    gametype: Joi.string().required()
});

export const smsGameResultValidation = Joi.object({
    resultType: Joi.string().required()
});