import express from 'express';
import controller from '../../controllers/v1/escSidechain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
router.post('/tokenBalance', extractJWT, controller.getTokenBalance);

export = router;
