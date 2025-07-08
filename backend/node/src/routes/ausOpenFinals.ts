import express, { Router } from 'express';
import { 
    getAoMensSinglesFinals, 
    getAoMensDoublesFinals, 
    getAoWomensSinglesFinals, 
    getAoWomensDoublesFinals 
} from '../controllers/ausOpenFinalsController.js';

const router: Router = express.Router();

router.get('/aomenssinglesfinals', getAoMensSinglesFinals);
router.get('/aomensdoublesfinals', getAoMensDoublesFinals);
router.get('/aowomenssinglesfinals', getAoWomensSinglesFinals);
router.get('/aowomensdoublesfinals', getAoWomensDoublesFinals);

export default router;
