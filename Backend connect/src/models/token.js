import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.model.js"; // attention au nom cohérent

class Token extends Model {}

Token.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    jti: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hashToken: {
      type: DataTypes.STRING(512), 
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ip: {                  
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    device: {             
      type: DataTypes.STRING(512),
      allowNull: true,
    },
  },
  {
    tableName: "tokens",
    sequelize,
    timestamps: false,
  }
);

// Association
User.hasMany(Token, { foreignKey: "userId", onDelete: "CASCADE" });
Token.belongsTo(User, { foreignKey: "userId" });

export default Token;
