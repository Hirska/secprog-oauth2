import express from 'express';
import querystring from 'querystring';
import { token } from './Token';
import { authorize, validateClient, validateRedirectUrl, validateScopes } from './Authorize';
import { register } from './Register';
const router = express.Router();

router.get('/authorize', async (req, res, next) => {
  try {
    const client = await validateClient(req.query.client_id);
    if (client === null) {
      return res.render('authenticate', { message: 'Invalid client identification', messageClass: 'alert-danger' });
    }

    const redirectUrl = validateRedirectUrl(req.query.redirect_url, client);

    if (redirectUrl === null) {
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

export default router;
