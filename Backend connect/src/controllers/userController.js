import pool from '../config/db.js';  // Importe la pool de connexions

export const login = async (req, res, next) => {
  const { name, password } = req.body;

  try {
    // Exemple de requête SQL pour vérifier l'utilisateur
    const [users] = await pool.query(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );

    if (users.length === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    const user = users[0];

    // Logique pour vérifier le mot de passe et les tentatives échouées
    if (user.failed_attempts >= 3) {
      const lastAttempt = new Date(user.last_failed_attempt);
      const now = new Date();
      if ((now - lastAttempt) < 15 * 60 * 1000) {
        return res.status(403).send("Trop de tentatives échouées. Essayez plus tard.");
      }
    }

    // Attache l'utilisateur à la requête pour les middlewares suivants
    req.user = user;
    next();
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).send("Erreur serveur");
  }
};

export const createuser = async (req, res) => {

  const { username, email, password } = req.body;

  try {
    // Insère un nouvel utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );

    res.status(201).json({ userId: result.insertId });
  } catch (err) {
    console.error("Erreur lors de la création de l'utilisateur :", err);
    res.status(500).send("Erreur serveur");
  }
};

export const logout = (req, res) => {
  res.clearCookie("auth_token").clearCookie("userId").sendStatus(200);
};
