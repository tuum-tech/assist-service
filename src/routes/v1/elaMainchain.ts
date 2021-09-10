import express from 'express';
import controller from '../../controllers/v1/elaMainchain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
// router.get('/get/blockInfo/blockNumber/:blockNumber', extractJWT, controller.getBlockInfoByBlockNumber);

export = router;
