const { Region, Users } = require("../models");

const getRegions = async (req, res) => {
  const regions = await Region.findAll({
    attributes: ["name"],
  });
  return res.status(200).json({ code: 200, data: regions });
};

module.exports = { getRegions };
