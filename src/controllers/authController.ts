import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { sendLoginNotification } from '../utils/email';

dotenv.config();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin_password';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // For a single-user CMS, we check against env vars (or a hash)
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    // Send login alert email
    await sendLoginNotification(req.ip || 'unknown', req.headers['user-agent'] || 'unknown');

    return res.redirect('/dashboard');
  }

  res.render('login', { error: 'Invalid credentials' });
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.redirect('/login');
};
