import express from 'express';
import controller from '../../controllers/v1/eidSidechain';
import extractJWT from '../../middleware/extractJWT';

const app = express.Router();

app.post('/publish/didTx', extractJWT, controller.publishDIDTx);
app.get('/get/didTxes', extractJWT, controller.getAllDIDTxes);
app.get('/get/didTx/confirmationId/:confirmationId', extractJWT, controller.getDIDTxFromConfirmationId);
app.get('/get/didTx/stats', extractJWT, controller.getDIDTxStats);
app.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
app.post('/tokenBalance', extractJWT, controller.getTokenBalance);

export = app;
