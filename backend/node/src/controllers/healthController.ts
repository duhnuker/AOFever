import { Request, Response } from 'express';
import axios from 'axios';

const FASTAPI_BASE_URL = process.env.FASTAPI_URL || "http://localhost:8000";

export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const fastapiResponse = await axios.get(`${FASTAPI_BASE_URL}/health`, {
            timeout: 5000
        });

        res.json({
            status: 'healthy',
            service: 'AOFever Express API',
            fastapi: {
                status: fastapiResponse.data.status,
                modelLoaded: fastapiResponse.data.model_loaded
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Health check failed:', error);
        
        res.status(503).json({
            status: 'unhealthy',
            service: 'AOFever Express API',
            fastapi: {
                status: 'unavailable',
                error: axios.isAxiosError(error) ? error.message : 'Unknown error'
            },
            timestamp: new Date().toISOString()
        });
    }
};
