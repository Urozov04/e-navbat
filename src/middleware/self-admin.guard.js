import { catchError } from "../utils/error-response.js";

export const SelfGuard = (req, res, next) => {
    try {
        const user = req?.user;
        if (user.role === 'superadmin' || user.id == req.params?.id) {
            next();
        }
        else {
            catchError(res, 403, 'Forbidden user');
        }
    } catch (error) {
        catchError(res, 500, error.message);
    }
}