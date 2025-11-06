import express from 'express';
import { verifyAdmin, verifyToken, verifyUser } from '../utils/verifyToken.js';
import { deleteUser, getUser, getUserRole, getUsers, updateUser, checkPhoneExists, changePassword } from '../controllers/user.js';


const router = express.Router();

router.get('/check-phone', checkPhoneExists);
router.put('/change-password', verifyToken, changePassword);
router.get('/', verifyAdmin, getUsers);
router.get('/:id', verifyUser, getUser);
router.put('/update/:id', verifyUser, updateUser);
router.delete('/:id', verifyAdmin, deleteUser);
router.get("/role/:id", getUserRole);

export default router;