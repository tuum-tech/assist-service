import express from 'express';
import controller from '../../controllers/v1/healthCheck';

const router = express.Router();

router.get('/ping', controller.serverHealthCheck);

export = router;
