import { GrantType, CodeChallengeMethod, ResponseType } from '../types';
import * as z from 'zod';
import isURL from 'validator/lib/isURL';

export const responseTypeSchema = z.nativeEnum(ResponseType);
export const stringSchema = z.string();
export const optStringSchema = z.string().optional();
export const uuidSchema = z.string().uuid();

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const newUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirm']
  });

export const codeChallengeSchema = z.object({
  codeChallenge: z.string(),
  codeChallengeMethod: z.nativeEnum(CodeChallengeMethod).optional()
});

export const uriSchema = z.string().refine(
  (val) => {
    return isURL(val, {
      protocols: ['http', 'https'],
      require_protocol: true,
      /*TODO: Set require tld to false when localhost is no longer needed*/ require_tld: false
    });
  },
  {
    message: 'Invalid email'
  }
);

export const tokenRequestSchema = z.object({
  grant_type: z.nativeEnum(GrantType),
  code: z.string(),
  client_id: z.string().uuid().optional(),
  client_secret: z.string().optional(),
  redirect_uri: uriSchema.optional(),
  code_verifier: z.string().optional()
});

export const newClientSchema = z.object({
  clientName: z.string(),
  isConfidential: z.boolean(),
  redirectUris: z.array(uriSchema).nonempty()
});

export default {
  userSchema,
  newUserSchema
};
