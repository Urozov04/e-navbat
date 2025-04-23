import Admin from '../models/admin.model.js';
import { catchError } from '../utils/error-response.js';
import { adminValidator } from '../utils/admin.validation.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generate-token.js';

export class AdminController {
    async createSuperAdmin(req, res) {
        try {
            const { error, value } = adminValidator(req.body);
            if (error) {
                throw new Error(`Error on creating super admin: ${error}`);
            }
            const { username, password } = value;
            const checkSuperAdmin = await Admin.findOne({ role: 'superadmin' });
            if (checkSuperAdmin) {
                return res.status(409).json({
                    statusCode: 409,
                    message: 'Super admin already exist'
                });
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
            catchError(error, res);
        }
    }

    async createAdmin(req, res) {
        try {
            const { error, value } = adminValidator(req.body);
            if (error) {
                throw new Error(`Error on creating admin: ${error}`);
            }
            const { username, password } = value;
            const hashedPassword = await decode(password, 7);
            const newAdmin = await Admin.create({
                username, hashedPassword, role: 'admin'
            });
            return res.status(201).json({
                statusCode: 201,
                message: 'success',
                data: newAdmin
            });
        } catch (error) {
            catchError(error, res);
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
            catchError(error, res);
        }
    }

    async getAdminById(req, res) {
        try {
            const id = req.params.id;
            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: admin
            });
        } catch (error) {
            catchError(error, res);
        }
    }

    async updateAdminById(req, res) {
        try {
            const id = req.params.id;
            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, { new: true });
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: updatedAdmin
            });
        } catch (error) {
            catchError(error, res);
        }
    }

    async deleteAdminById(req, res) {
        try {
            const id = req.params.id;
            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }
            if (admin.role === 'superadmin') {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Danggg"
                });
            };
            await Admin.findByIdAndDelete(id);
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {}
            });
        } catch (error) {
            catchError(error, res);
        }
    }

    async signinAdmin(req, res) {
        try {
            const { username, password } = req.body;
            const admin = await Admin.findOne({ username });
            if (!admin) {
                throw new Error('Admin not found');
            }
            const isMatchPassword = await encode(password, admin.hashedPassword);
            if (!isMatchPassword) {
                throw new Error('Invalid password');
            }
            const payload = { id: admin._id, role: admin.role };
            const accessToken = generateAccessToken(payload);
            const refreshToken = generateRefreshToken(payload);
            return res.status(200).json({
                statusCode: 200,
                message: 'success',
                data: {
                    accessToken, refreshToken
                }
            });
        } catch (error) {
            catchError(error, res);
        }
    }
}
