import { Router } from 'express';
import { getUsers, createUser, updateUser, loginUser, getUserById, getUserByEmail, deleteUser } from '../controllers/users.controller.js';
import verifyToken from '../middlewares/verifyToken.js';

const router = Router();


//GET
router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.get('/email/:correo', verifyToken, getUserByEmail);

//POST
router.post('/', createUser);
router.post('/login', loginUser);

//PUT || UPDATE
router.put('/:id', verifyToken, updateUser);

//DELETE
router.delete('/:id', verifyToken, deleteUser);


export default router;
