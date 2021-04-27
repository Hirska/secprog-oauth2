import Joi from 'joi';

export const emailSchema = Joi.string().email();

export const urlSchema = Joi.string().uri({ scheme: ['https', 'http'] });
