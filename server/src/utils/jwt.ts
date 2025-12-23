import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ITGPC2019';
const JWT_EXPIRE = '30d';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};