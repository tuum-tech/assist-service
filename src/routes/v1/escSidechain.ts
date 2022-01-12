import express from 'express';
import controller from '../../controllers/v1/escSidechain';
import extractJWT from '../../middleware/extractJWT';

const app = express.Router();

app.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
app.post('/tokenBalance', extractJWT, controller.getTokenBalance);

export = app;
