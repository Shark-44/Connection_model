import User from "./user.model.js";
import UserConsent from "./userConsent.js";

User.hasOne(UserConsent, {
  as: "consent",
  foreignKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

UserConsent.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});
