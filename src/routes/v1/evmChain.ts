import express from 'express';
import controller from '../../controllers/v1/evmChain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.post('/tokenBalance', extractJWT, controller.getTokenBalance);
router.get('/get/supply/mtrl', controller.getSupplyMtrl);

export = router;
