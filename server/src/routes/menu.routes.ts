import express from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getTodaySpecials,
} from '../controllers/menu.controller';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

router.get('/', getAllMenuItems);
router.get('/specials', getTodaySpecials);
router.get('/:id', getMenuItemById);

router.post('/', upload.single('image'), createMenuItem);
router.put('/:id', upload.single('image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/availability', toggleAvailability);

export default router;