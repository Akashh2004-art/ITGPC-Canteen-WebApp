import { Request, Response } from 'express';
import MenuItem from '../models/menuItem';
import { deleteImage } from '../middleware/upload.middleware';

// Get all menu items
export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, available, search } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (available !== undefined) {
      filter.available = available === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 });

    // ✅ FIX: Transform _id to id for frontend compatibility
    const transformedItems = menuItems.map(item => ({
      id: item._id.toString(),  // Convert _id to id as string
      name: item.name,
      description: item.description,
      category: item.category,
      price: item.price,
      image: item.image,
      available: item.available,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    res.status(200).json(transformedItems);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu items',
      error: error.message,
    });
  }
};

// Get single menu item by ID
export const getMenuItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    // ✅ FIX: Transform _id to id
    const transformedItem = {
      id: menuItem._id.toString(),
      name: menuItem.name,
      description: menuItem.description,
      category: menuItem.category,
      price: menuItem.price,
      image: menuItem.image,
      available: menuItem.available,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };

    res.status(200).json(transformedItem);
  } catch (error: any) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch menu item',
      error: error.message,
    });
  }
};

// Create new menu item
export const createMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, price, available } = req.body;

    // Validate required fields
    if (!name || !description || !category || !price) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    // Check if image uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
      return;
    }

    // Create menu item with relative image path
    const menuItem = await MenuItem.create({
      name,
      description,
      category,
      price: parseFloat(price),
      image: `menu-images/${req.file.filename}`,
      available: available === 'true',
    });

    res.status(201).json(menuItem);
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    
    // Delete uploaded image if item creation fails
    if (req.file) {
      deleteImage(`menu-images/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: error.message,
    });
  }
};

// Update menu item
export const updateMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category, price, available } = req.body;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    // Update fields
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (category) menuItem.category = category;
    if (price) menuItem.price = parseFloat(price);
    if (available !== undefined) menuItem.available = available === 'true';

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image
      deleteImage(menuItem.image);
      
      // Set new image
      menuItem.image = `menu-images/${req.file.filename}`;
    }

    await menuItem.save();

    res.status(200).json(menuItem);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    
    // Delete uploaded image if update fails
    if (req.file) {
      deleteImage(`menu-images/${req.file.filename}`);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: error.message,
    });
  }
};

// Delete menu item
export const deleteMenuItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    // Delete image file
    deleteImage(menuItem.image);

    // Delete from database
    await MenuItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: error.message,
    });
  }
};

// Toggle menu item availability
export const toggleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { available } = req.body;

    if (available === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide availability status',
      });
      return;
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      id,
      { available },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    res.status(200).json(menuItem);
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message,
    });
  }
};