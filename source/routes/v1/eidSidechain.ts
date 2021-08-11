import express from 'express';
import controller from '../../controllers/v1/eidSidechain';
import extractJWT from '../../middleware/extractJWT';

const router = express.Router();

router.post('/create/didTx', controller.createDIDTx);
router.get('/get/didTxes', controller.getAllDIDTxes);
router.get('/get/didTx/confirmationId/:confirmationId', controller.getDIDTxFromConfirmationId);
// router.post('/create/didTx', extractJWT, controller.createDIDTx);
// router.get('/get/didTxes', extractJWT, controller.getAllDIDTxes);

export = router;
