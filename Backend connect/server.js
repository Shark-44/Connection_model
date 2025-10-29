import express from 'express';
import dotenv from 'dotenv';
import app from './src/app.js'; // si tu suis ma structure proposée
dotenv.config();

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`✅ Serveur Node.js en ligne sur le port ${PORT}`);
});
