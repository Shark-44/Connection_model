'use strict';

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('users', 'otp_send', {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  });
  await queryInterface.addColumn('users', 'otp_last_sent', {
    type: Sequelize.DATE,
    allowNull: true,
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('users', 'otp_send');
  await queryInterface.removeColumn('users', 'otp_last_sent');
};
