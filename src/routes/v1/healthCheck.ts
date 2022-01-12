import express from 'express';
import controller from '../../controllers/v1/healthCheck';

const app = express.Router();

app.get('/ping', controller.serverHealthCheck);

export = app;
