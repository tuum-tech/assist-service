import express from 'express';
import controller from '../../controllers/v1/elaMainchain';
import extractJWT from '../../middleware/extractJWT';

const app = express.Router();

app.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
// router.get('/get/blockInfo/blockNumber/:blockNumber', extractJWT, controller.getBlockInfoByBlockNumber);
app.get('/get/supply/ela', controller.getSupplyEla);

export = app;
