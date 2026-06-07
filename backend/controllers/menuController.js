// controllers/menuController.js
const MenuItem = require('../models/MenuItem');

const getMenuItems = async (req, res) => {
  try {
    const { search, category, available } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (available === 'true') query.isAvailable = true;
    const items = await MenuItem.find(query).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPopularItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ orderCount: -1 }).limit(6);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addMenuItem = async (req, res) => {
  try {
    const { name, category, price, image, description, isVeg, spiceLevel } = req.body;
    const item = await MenuItem.create({ name, category, price, image, description, isVeg, spiceLevel });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMenuItems, getPopularItems, addMenuItem, updateMenuItem, toggleAvailability, deleteMenuItem };
