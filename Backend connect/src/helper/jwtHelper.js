import jwt from 'jsonwebtoken';

export const encodeJWT = (payload) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h" });
};

export const decodeJWT = (token) => {
  return jwt.verify(token, process.env.TOKEN_SECRET);
};
