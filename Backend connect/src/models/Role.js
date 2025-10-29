module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        name: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        }
    });
    return Role;
};
