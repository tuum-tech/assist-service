import express from 'express';
import controller from '../../controllers/v1/eidSidechain';

const router = express.Router();

router.get('/get/didTxs', controller.getAllDIDTxs);
router.post('/create/didTx', controller.createDIDTx);

export = router;
