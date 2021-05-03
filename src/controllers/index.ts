import express, { Response } from 'express';
import cors from 'cors';
import { token } from './Token';
import { getAuthorize, postAuthorize } from './Authorize';
import { register } from './Register';
import authenticate from '../middleware/authenticate';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

router.get('/authorize', getAuthorize);
router.post('/authorize', postAuthorize);

router.post('/token', cors(), token);

router.get('/register', (_req, res) => res.render('register'));
router.post('/register', register);

router.get('/secure', cors(), authenticate('profile'), (req: AuthenticatedRequest, res: Response) =>
  res.json(req.user?.email)
);

export default router;
