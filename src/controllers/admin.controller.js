import Admin from '../models/admin.model.js';
import { catchError } from '../utils/error-response.js';
import { adminValidator } from '../utils/admin.validation.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generate-token.js';
import jwt from 'jsonwebtoken';
import { transporter } from '../utils/mailer.js';

export class AdminController {
    async createSuperAdmin(req, res) {
        try {
            const { error, value } = adminValidator(req.body);
            if (error) {
                catchError(res, 400, error);
            }
            const { username, password } = value;
            const checkSuperAdmin = await Admin.findOne({ role: 'superadmin' });
            if (checkSuperAdmin) {
                catchError(res, 409, 'Super admin already exist');
            };
            const hashedPassword = await decode(password, 7);
            const superadmin = await Admin.create({
                username, hashedPassword, role: 'superadmin'
            });
            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: superadmin
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async createAdmin(req, res) {
        try {
            const { error, value } = adminValidator(req.body);
            if (error) {
                catchError(res, 400, error);
            }
            const { username, password } = value;
            const hashedPassword = await decode(password, 7);
            const admin = await Admin.create({
                username, hashedPassword, role: 'admin'
            });
            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: admin
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async signinAdmin(req, res) {
        try {
            const { username, password } = req.body;
            const admin = await Admin.findOne({ username });
            if (!admin) {
                catchError(res, 404, 'Admin not found');
            }
            const isMatchPassword = await encode(password, admin.hashedPassword);
            if (!isMatchPassword) {
                catchError(res, 400, 'Invalid password');
            }
            const payload = { id: admin._id, role: admin.role };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 30 * 24 * 60 * 60 * 1000
            });
            const mailMessage = {
                from: process.env.SMTP_USER,
                to: 'dilshod7861@gmail.com',
                subject: 'Full stack N20',
                text: 'Danggg',
            };
            transporter.sendMail(mailMessage, function(err, info){
                if (err){
                    console.log(`Error on sending to mail: ${err}`)
                    catchError(res, 400, err);
                }else{
                    console.log(info);
                }
            });
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: accessToken
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async accessToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                catchError(res, 401, 'Refresh token not found');
            }
            const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                catchError(res, 401, 'Refresh token expired');
            }
            const payload = { id: decodedToken.id, role: decodedToken.role };
            const accessToken = generateAccessToken(payload);
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: accessToken
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async signoutAdmin(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                catchError(res, 401, 'Refresh token not found');
            }
            const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
            if (!decodedToken) {
                catchError(res, 401, 'Refresh token expired');
            }
            res.clearCookie('refreshToken');
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            catchError(res, 500, error);
        }
    }

    async getAllAdmins(_, res) {
        try {
            const admins = await Admin.find();
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: admins
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async getAdminById(req, res) {
        try {
            const admin = await AdminController.findById(req.params.id);
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: admin
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async updateAdminById(req, res) {
        try {
            await this.findById(req.params.id);
            const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: updatedAdmin
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    async deleteAdminById(req, res) {
        try {
            const admin = await this.findById(req.params.id);
            if (admin.role === 'superadmin') {
                catchError(res, 400, `Danggg\nSuper admin cannot be delete`);
            };
            await Admin.findByIdAndDelete(id);
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }

    static async findById(id) {
        try {
            const admin = await Admin.findById(id);
            if (!admin) {
                catchError(res, 404, `Admin not found by ID ${id}`);
            }
            return admin;
        } catch (error) {
            catchError(res, 500, error.message);
        }
    }
}
