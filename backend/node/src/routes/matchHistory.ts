import express, { Router } from 'express';
import { getAtpData, getWtaData } from '../controllers/matchHistoryController.js';

const router: Router = express.Router();

router.get('/atpdata', getAtpData);
router.get('/wtadata', getWtaData);

export default router;