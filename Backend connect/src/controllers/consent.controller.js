import User from "../models/user.model.js";
import UserConsent from "../models/userConsent.js";

/**
 * Fonction réutilisable pour créer ou mettre à jour le consentement
 * sans écriture inutile en BDD.
 */
export const setConsent = async (userId, cookieConsent = null, marketingConsent = null) => {
  try {
    // On récupère la ligne existante
    const existingConsent = await UserConsent.findOne({
      where: { user_id: userId }
    });

    if (existingConsent) {
      const noChange =
        existingConsent.cookie_consent === cookieConsent &&
        existingConsent.marketing_consent === marketingConsent;

      if (noChange) {
        console.log("Consentement identique, aucune mise à jour nécessaire.");
        return existingConsent;
      }

      // Mise à jour seulement si changement réel
      return await existingConsent.update({
        cookie_consent: cookieConsent,
        marketing_consent: marketingConsent,
        updated_at: new Date(),
      });
    }

    // Si pas encore de consentement, création
    return await UserConsent.create({
      user_id: userId,
      cookie_consent: cookieConsent,
      marketing_consent: marketingConsent,
      updated_at: new Date(),
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du consentement :", error.message);
    throw error;
  }
};

/**
 * Controller pour modification manuelle du consentement
 * (depuis espace utilisateur connecté).
 */
export const updateConsent = async (req, res) => {
  try {
    const { userId, cookieConsent, marketingConsent } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId requis."
      });
    }

    await setConsent(userId, cookieConsent, marketingConsent);

    return res.status(200).json({
      success: true,
      message: "Consentement mis à jour avec succès."
    });

  } catch (error) {
    console.error("Erreur updateConsent:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du consentement.",
      error: error.message,
    });
  }
};

/**
 * Controller RGPD : droit à l’oubli (anonymisation complète)
 */
export const requestRightToBeForgotten = async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({
        success: false,
        message: "userId et email requis."
      });
    }

    // Vérifier utilisateur
    const user = await User.findByPk(userId);
    if (!user || user.email !== email) {
      return res.status(400).json({
        success: false,
        message: "Utilisateur non trouvé ou email incorrect."
      });
    }

    // Anonymisation
    await user.update({
      username: `utilisateur_supprimé_${userId}`,
      email: `supprimé_${userId}@exemple.com`,
      password: null,
    });

    // Suppression des consentements
    await UserConsent.destroy({ where: { user_id: userId } });

    return res.status(200).json({
      success: true,
      message: "Vos données personnelles ont été anonymisées conformément au RGPD."
    });

  } catch (error) {
    console.error("Erreur droit à l'oubli :", error);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la demande de droit à l'oubli.",
      error: error.message,
    });
  }
};
0