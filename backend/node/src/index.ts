import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", async (req: Request, res: Response) => {
    res.send("Hello World");
});

app.use('/api', router);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
