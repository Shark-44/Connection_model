import User from "./user.model.js";
import UserConsent from "./userConsent.js";


User.hasOne(UserConsent, {
  foreignKey: "user_id",
  as: "consent",
});

UserConsent.belongsTo(User, {
  foreignKey: "user_id",
});
