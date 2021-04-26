import express from 'express';
import querystring from 'querystring';
import cors from 'cors';
import { token } from './Token';
import { authorize, validateClient, validateRedirectUrl, validateScopes } from './Authorize';
import { register } from './Register';
import authenticate from '../middleware/authenticate';
import User from '../models/user';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

router.get('/authorize', async (req, res, next) => {
  try {
    const client = await validateClient(req.query.client_id);
    if (!client) {
      return res.render('error', { message: 'Invalid client identification', messageClass: 'alert-danger' });
    }

    const redirectUrl = validateRedirectUrl(req.query.redirect_url, client);

    if (!redirectUrl) {
      return res.render('error', { message: 'Invalid or missing redirect url', messageClass: 'alert-danger' });
    }

    const scopes = await validateScopes(req.query.scope, redirectUrl);
    const returnTo = querystring.stringify({ return_to: req.originalUrl });
    const accessDenied = querystring.stringify({ error: 'access_denied' });

    res.render('authorize', {
      scopes,
      client: client.clientName,
      accessDenied: `${redirectUrl}?${accessDenied}`,
      returnTo
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/authorize', authorize);
router.post('/token', cors(), token);

router.get('/register', (_req, res) => {
  res.render('register');
});
router.post('/register', register);

router.get('/secure', cors(), authenticate('profile'), async (req: AuthenticatedRequest, res, _next) => {
  if (req.user) {
    console.log(req.user);
    const user = await User.findById(req.user);
    if (user) {
      return res.json({ email: user.email });
    }
  }
  return res.status(404).json({ error: 'No user found' });
});

export default router;
