const Menu = require('../models/Menu');

exports.createMenu = async (req, res) => {
  try {
    const { text, url, parent } = req.body;
    const menu = new Menu({
      text,
      url,
      parent: parent || null
    });
    const savedMenu = await menu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find().populate('parent');
    
    const buildMenuTree = (items, parentId = null) => {
      const result = [];
      for (let item of items) {
        if (String(item.parent?._id) === String(parentId) || (!item.parent && !parentId)) {
          const children = buildMenuTree(items, item._id);
          const menuItem = {
            _id: item._id,
            text: item.text,
            url: item.url,
            parent: item.parent,
          };
          if (children.length > 0) {
            menuItem.children = children;
          }
          result.push(menuItem);
        }
      }
      return result;
    };

    const menuTree = buildMenuTree(menus);
    res.json(menuTree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id).populate('parent');
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { text, url, parent } = req.body;
    const menu = await Menu.findByIdAndUpdate(
      req.params.id,
      { text, url, parent: parent || null },
      { new: true }
    ).populate('parent');
    
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const childMenus = await Menu.find({ parent: req.params.id });
    if (childMenus.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete menu with sub-menus. Please delete sub-menus first.'
      });
    }

    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};