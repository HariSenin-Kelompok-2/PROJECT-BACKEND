"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    await queryInterface.bulkInsert(
      "Carts",
      [
        {
          id: crypto.randomUUID(),
          priceId: "0030d395-1e25-4c76-a481-1e678876c331",
          usersId: "5194f115-92c4-405c-905e-a37aaee94ad4",
        },
        {
          id: crypto.randomUUID(),
          priceId: "f122d34b-bc15-4e54-a243-aa78aa43fa58",
          usersId: "5194f115-92c4-405c-905e-a37aaee94ad4",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};