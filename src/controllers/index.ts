import express from 'express';
import Auth from './Authentication';
import { token } from './Token';
import { authorize } from './Authorize';
const router = express.Router();

router.get('/authorize', (_req, res) => {
  res.render('authenticate');
});
router.post('/authorize', authorize);
router.post('/register', Auth.register);

router.post('/token', token);

export default router;
