import express from 'express';
import controller from '../../controllers/v1/evmChain';
import extractJWT from '../../middleware/extractJWT';

const app = express.Router();

app.post('/tokenBalance', extractJWT, controller.getTokenBalance);
app.get('/get/supply/mtrl', controller.getSupplyMtrl);

export = app;
