module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {}, {
        timestamps: false
    });
    return UserRole;
};
