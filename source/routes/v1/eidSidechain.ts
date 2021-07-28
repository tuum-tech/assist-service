import express from 'express';
import controller from '../../controllers/v1/eidSidechain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.get('/get/didTxs', extractJWT, controller.getAllDIDTxs);
router.post('/create/didTx', extractJWT, controller.createDIDTx);

export = router;
