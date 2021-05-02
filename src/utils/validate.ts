import Joi from 'joi';

export const urlSchema = Joi.string().uri({ scheme: ['https', 'http'] });
