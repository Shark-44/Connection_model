import cron from "node-cron";
import Token from "../models/Token.js";
import { Op } from "sequelize";

export const startTokenCleaner = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const deleted = await Token.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() },
        },
      });

      console.log(
        `🧹 Purge des tokens expirés effectuée. ${deleted} token(s) supprimé(s).`
      );
    } catch (error) {
      console.error("❌ Erreur lors de la purge des tokens :", error);
    }
  });

  console.log("⏲️ Cron de purge des tokens initialisé.");
};
