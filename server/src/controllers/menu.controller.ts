import { Request, Response } from 'express';
import MenuItem from '../models/menuItem';
import { deleteImage } from '../middleware/upload.middleware';

// ✅ Helper function to transform menu item
const transformMenuItem = (item: any) => ({
  id: item._id.toString(),
  name: item.name,
  description: item.description,
  category: item.category,
  price: item.price,
  image: item.image,
  available: item.available,
  // ✅ Special menu fields
  isSpecial: item.isSpecial || false,
  originalPrice: item.originalPrice,
  discountPercentage: item.discountPercentage,
  specialBadge: item.specialBadge,
  specialDescription: item.specialDescription,
  validUntil: item.validUntil,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// Get all menu items
export const getAllMenuItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, available, search, isSpecial } = req.query;

    // Build filter object
    const filter: any = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (available !== undefined) {
      filter.available = available === 'true';
    }

    // ✅ Filter by special status
    if (isSpecial !== undefined) {
      filter.isSpecial = isSpecial === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // ✅ Sort: Special items first, then by creation date
    const menuItems = await MenuItem.find(filter).sort({ isSpecial: -1, createdAt: -1 });

    // ✅ Use transform helper
    const transformedItems = menuItems.map(transformMenuItem);

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

    // ✅ Use transform helper
    res.status(200).json(transformMenuItem(menuItem));
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
    const { 
      name, 
      description, 
      category, 
      price, 
      available,
      // ✅ Special menu fields
      isSpecial,
      originalPrice,
      discountPercentage,
      specialBadge,
      specialDescription,
      validUntil
    } = req.body;

    // Validate required fields
    if (!name || !description || !category) {
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

    // ✅ Prepare menu item data
    const menuItemData: any = {
      name,
      description,
      category,
      image: `menu-images/${req.file.filename}`,
      available: available === 'true',
      isSpecial: isSpecial === 'true',
    };

    // ✅ Handle pricing based on special status
    if (menuItemData.isSpecial) {
      // Special item - use discount pricing
      if (!originalPrice || !discountPercentage) {
        // Delete uploaded image
        deleteImage(`menu-images/${req.file.filename}`);
        
        res.status(400).json({
          success: false,
          message: 'Original price and discount percentage are required for special items',
        });
        return;
      }

      menuItemData.originalPrice = parseFloat(originalPrice);
      menuItemData.discountPercentage = parseFloat(discountPercentage);
      menuItemData.specialBadge = specialBadge || 'hot';
      menuItemData.specialDescription = specialDescription || '';
      menuItemData.validUntil = validUntil ? new Date(validUntil) : undefined;
      menuItemData.price = Math.round(
        menuItemData.originalPrice - (menuItemData.originalPrice * menuItemData.discountPercentage / 100)
      );
    } else {
      // Regular item - direct price
      if (!price) {
        deleteImage(`menu-images/${req.file.filename}`);
        
        res.status(400).json({
          success: false,
          message: 'Price is required for regular items',
        });
        return;
      }
      menuItemData.price = parseFloat(price);
    }

    // Create menu item
    const menuItem = await MenuItem.create(menuItemData);

    res.status(201).json(transformMenuItem(menuItem));
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
    const { 
      name, 
      description, 
      category, 
      price, 
      available,
      isSpecial,
      originalPrice,
      discountPercentage,
      specialBadge,
      specialDescription,
      validUntil
    } = req.body;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found',
      });
      return;
    }

    // Update basic fields
    if (name) menuItem.name = name;
    if (description) menuItem.description = description;
    if (category) menuItem.category = category;
    if (available !== undefined) menuItem.available = available === 'true';

    if (isSpecial !== undefined) {
      menuItem.isSpecial = isSpecial === 'true';
    }
    if (menuItem.isSpecial) {
      if (originalPrice) menuItem.originalPrice = parseFloat(originalPrice);
      if (discountPercentage) menuItem.discountPercentage = parseFloat(discountPercentage);
      if (specialBadge) menuItem.specialBadge = specialBadge as any;
      if (specialDescription !== undefined) menuItem.specialDescription = specialDescription;
      if (validUntil) menuItem.validUntil = new Date(validUntil);
      
      if (menuItem.originalPrice && menuItem.discountPercentage) {
        menuItem.price = Math.round(
          menuItem.originalPrice - (menuItem.originalPrice * menuItem.discountPercentage / 100)
        );
      }
    } else {
      if (price) menuItem.price = parseFloat(price);
      menuItem.originalPrice = undefined;
      menuItem.discountPercentage = undefined;
      menuItem.specialBadge = undefined;
      menuItem.specialDescription = undefined;
      menuItem.validUntil = undefined;
    }

    if (req.file) {
      deleteImage(menuItem.image);
      menuItem.image = `menu-images/${req.file.filename}`;
    }

    await menuItem.save();

    res.status(200).json(transformMenuItem(menuItem));
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    
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

    deleteImage(menuItem.image);

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

    res.status(200).json(transformMenuItem(menuItem));
  } catch (error: any) {
    console.error('Error toggling availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message,
    });
  }
};

// ✅ NEW: Get today's special items (for user dashboard)
export const getTodaySpecials = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();

    const specials = await MenuItem.find({
      isSpecial: true,
      available: true,
      validUntil: { $gte: today },
    }).sort({ createdAt: -1 });

    res.status(200).json(specials.map(transformMenuItem));
  } catch (error: any) {
    console.error('Error fetching specials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch special items',
      error: error.message,
    });
  }
};