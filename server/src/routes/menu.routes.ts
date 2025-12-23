import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../controllers/menu.controller';
import { upload } from '../middleware/upload.middleware';
// import { authenticateAdmin } from '../middleware/auth.middleware'; // Uncomment when ready

const router = express.Router();

// Public routes (or add auth later)
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);

// Protected routes (add authenticateAdmin middleware when ready)
router.post('/', upload.single('image'), createMenuItem);
router.put('/:id', upload.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/availability', toggleAvailability);

export default router;