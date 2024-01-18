import Joi from 'joi';

export const instantDrawValidation = Joi.object({
    numberOfWinners: Joi.string().required(),
});
