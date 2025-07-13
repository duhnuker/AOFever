import express, { Router } from 'express';
import { getAtpMatchFilters, getWtaMatchFilters, getAtpPlayerStats, getWtaPlayerStats } from '../controllers/matchHistoryController.js';

const router: Router = express.Router();

router.get('/atpmatchfilters', getAtpMatchFilters);
router.get('/atpplayerstats', getAtpPlayerStats);
router.get('/wtamatchfilters', getWtaMatchFilters);
router.get('/wtaplayerstats', getWtaPlayerStats);

export default router;