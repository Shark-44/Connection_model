import express from 'express';
import { createuser, login } from './controllers/userController.js';
import { hashPassword } from './middlewares/auth.js';

const router = express.Router();

router.post('/admin-user', hashPassword, createuser);
router.post('/login', login);

export default router;

