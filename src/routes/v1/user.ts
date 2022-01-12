import express from 'express';
import controller from '../../controllers/v1/user';
import extractJWT from '../../middleware/extractJWT';

const app = express.Router();

app.get('/validate', extractJWT, controller.validateToken);
app.post('/register', controller.register);
app.post('/login', controller.login);
app.post('/payment/createTx', extractJWT, controller.paymentCreateTx);
app.post('/payment/signTx', extractJWT, controller.paymentSignTx);
app.get('/get/all', extractJWT, controller.getAllUsers);
app.get('/get/newUserStats', extractJWT, controller.getNewUserStats);

export = app;
