import express, { Router } from 'express';
import { getAtpMatchFilters, getWtaMatchFilters } from '../controllers/matchHistoryController.js';

const router: Router = express.Router();

router.get('/atpdata', getAtpMatchFilters);
router.get('/wtadata', getWtaMatchFilters);

export default router;