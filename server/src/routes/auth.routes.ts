import express from 'express';
import { 
  signup, 
  login, 
  googleSignup, 
  googleLogin,
  checkAdminAvailability 
} from '../controllers/auth.controller';

const router = express.Router();


router.get('/admin/availability', checkAdminAvailability);


router.post('/signup', signup);


router.post('/login', login);


router.post('/google-signup', googleSignup);


router.post('/google-login', googleLogin);

export default router;