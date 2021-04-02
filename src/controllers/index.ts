import express from 'express';
import Auth from './Authentication';
import Token from './Token';
import Authorize from './Authorize';
const router = express.Router();

router.get('/authenticate', (_req, res) => {
  res.render('authenticate');
});
router.post('/authenticate', Authorize.authorize);
router.post('/register', Auth.register);

router.post('/access_token', Token.token);

export default router;
