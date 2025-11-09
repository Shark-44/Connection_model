import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserConsent = sequelize.define(
  "UserConsent",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Référence à la table, pas au modèle
        key: "id",
      },
      onDelete: "CASCADE",
    },
    cookie_consent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    marketing_consent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_consents",
    timestamps: false,
  }
);

export default UserConsent;
