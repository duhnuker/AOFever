import express, { Router } from 'express';
import { predictMensWinnerController } from '../controllers/predictWinnerController.js';
import { healthCheck } from '../controllers/healthController.js';

const router: Router = express.Router();

router.get('/health', healthCheck);

router.post('/predictmenswinner', predictMensWinnerController);

export default router;
