import express from 'express';
import controller from '../../controllers/v1/eidSidechain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.post('/publish/didTx', extractJWT, controller.publishDIDTx);
router.get('/get/didTxes', extractJWT, controller.getAllDIDTxes);
router.get('/get/didTx/confirmationId/:confirmationId', extractJWT, controller.getDIDTxFromConfirmationId);
router.get('/get/didTx/stats', extractJWT, controller.getDIDTxStats);
router.get('/get/blockInfo/latest', extractJWT, controller.getBlockInfoLatest);
router.post('/tokenBalance', extractJWT, controller.getTokenBalance);

export = router;
