import express from 'express';
import controller from '../../controllers/v1/eidSidechain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.post('/create/didTx', extractJWT, controller.createDIDTx);
router.get('/get/didTxes', extractJWT, controller.getAllDIDTxes);
router.get('/get/didTx/confirmationId/:confirmationId', extractJWT, controller.getDIDTxFromConfirmationId);

export = router;
