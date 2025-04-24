import express from 'express';
import { config } from 'dotenv';
import { connectDB } from './db/index.js';
import adminRouter from './routes/admin.routes.js';
import cookieParser from 'cookie-parser';
config();

const app = express();
const PORT = +process.env.PORT;

app.use(express.json());
app.use(cookieParser());
await connectDB();

app.use('/admin', adminRouter);

app.listen(PORT, () => console.log('Server running on port', PORT));
