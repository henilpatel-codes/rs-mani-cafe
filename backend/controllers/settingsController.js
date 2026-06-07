// controllers/settingsController.js
const RestaurantSettings = require('../models/RestaurantSettings');

const getSettings = async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) settings = await RestaurantSettings.create({});
    res.json(settings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    if (!settings) settings = await RestaurantSettings.create(req.body);
    else Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

module.exports = { getSettings, updateSettings };
