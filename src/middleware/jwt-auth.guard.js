import { catchError } from '../utils/error-response.js';
import jwt from 'jsonwebtoken';

export const JwtAuthGuard = (req, res, next) => {
    try {
        const auth = req.headers?.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            catchError(res, 401, 'Authorization error');
        }
        const token = auth.split(' ')[1];
        if (!token) {
            catchError(res, 401, 'Token not found');
        }
        const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        if (!decodedData) {
            catchError(res, 401, 'Token expired');
        }
        req.user = decodedData;
        next();
    } catch (error) {
        catchError(res, 500, error.message);
    }
}