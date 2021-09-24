import express from 'express';
import controller from '../../controllers/v1/user';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/payment/createTx', extractJWT, controller.paymentCreateTx);
router.post('/payment/signTx', extractJWT, controller.paymentSignTx);
router.get('/get/all', extractJWT, controller.getAllUsers);
router.get('/get/newUserStats', extractJWT, controller.getNewUserStats);

export = router;
