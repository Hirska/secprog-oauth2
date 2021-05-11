import express, { Response } from 'express';
import cors from 'cors';
import { token } from './Token';
import { getAuthorize, postAuthorize } from './Authorize';
import { register } from './Register';
import authenticate from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';
import { registerClient } from './registerClient';
import { modifyEmail } from './Secure';

const router = express.Router();

router.get('/authorize', getAuthorize);
router.post('/authorize', postAuthorize);

router.post('/token', cors(), token);

router.get('/register', (_req, res) => res.render('register'));
router.post('/register', register);

router.post('/client', authenticate('client:write'), registerClient);

router.get('/secure', cors(), authenticate('profile'), (req: AuthenticatedRequest, res: Response) =>
  res.json(req.user?.email)
);

router.post('/email', authenticate('profile:write'), modifyEmail);

export default router;
