import express from 'express';
import querystring from 'querystring';
import { token } from './Token';
import { authorize, validateClient, validateRedirectUrl, validateScopes } from './Authorize';
import { register } from './Register';
import authenticate from '../middleware/authenticate';
const router = express.Router();

router.get('/authorize', async (req, res, next) => {
  try {
    const client = await validateClient(req.query.client_id);
    if (!client) {
      return res.render('authenticate', { message: 'Invalid client identification', messageClass: 'alert-danger' });
    }

    const redirectUrl = validateRedirectUrl(req.query.redirect_url, client);

    if (!redirectUrl) {
      return res.render('authenticate', { message: 'Invalid or missing redirect url', messageClass: 'alert-danger' });
    }

    const scopes = await validateScopes(req.query.scope, redirectUrl);
    const returnTo = querystring.stringify({ return_to: req.originalUrl });
    const accessDenied = querystring.stringify({ error: 'access_denied' });

    res.render('authenticate', {
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
router.post('/token', token);

router.get('/register', (_req, res) => {
  res.render('register');
});
router.post('/register', register);

router.get('/secure', authenticate('profile'), (_req, res, _next) => {
  res.json('this is secured endpoint');
});

export default router;
