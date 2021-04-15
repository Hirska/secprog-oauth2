import express from 'express';
import { token } from './Token';
import { authorize } from './Authorize';
import { register } from './Register';
const router = express.Router();

router.get('/authorize', (_req, res) => {
  res.render('authenticate');
});

router.post('/authorize', authorize);
router.post('/token', token);

router.get('/register', (_req, res) => {
  res.render('register');
});
router.post('/register', register);

export default router;
