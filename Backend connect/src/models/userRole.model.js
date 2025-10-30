import sequelize from "../config/database.js";
import User from "./user.model.js";
import Role from "./role.model.js";

const UserRole = sequelize.define(
  "UserRole",
  {},
  {
    tableName: "user_roles",
    timestamps: false,
  }
);

// Association N:N
User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id" });

export { UserRole, User, Role };
