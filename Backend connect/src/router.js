import express from 'express';
import { login, createuser, logout } from './controllers/userController.js';

const router = express.Router();

router.post('/login', login);
router.post('/admin-user', createuser);
router.post('/logout', logout);

export default router;
