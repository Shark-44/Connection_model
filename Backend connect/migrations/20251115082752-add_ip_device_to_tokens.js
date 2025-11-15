export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('tokens', 'ip', {
    type: Sequelize.STRING(45),
    allowNull: true,
  });
  await queryInterface.addColumn('tokens', 'device', {
    type: Sequelize.STRING(512),
    allowNull: true,
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('tokens', 'ip');
  await queryInterface.removeColumn('tokens', 'device');
}
