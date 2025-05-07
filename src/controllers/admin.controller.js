import Admin from '../models/admin.model.js';
import { adminValidator } from '../validations/admin.validation.js';
import { catchError } from '../utils/error-response.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-token.js';
import jwt from 'jsonwebtoken';
import { transporter } from '../utils/mailer.js';
import { otpGenerator } from '../utils/otp-generator.js';
import { getCache, setCache } from '../utils/cache.js';
import { refTokenwriteCookie } from '../utils/write-cookie.js';

export class AdminController {
  async createSuperAdmin(req, res) {
    try {
      const { error, value } = adminValidator(req.body);
      if (error) {
        return catchError(res, 400, error);
      }
      const { username, password } = value;

      const checkSuperAdmin = await Admin.findOne({ role: 'superadmin' });
      if (checkSuperAdmin) {
        return catchError(res, 409, 'superadmin already exist');
      }
      const hashedPassword = await encode(password, 7);
      const newSuperAdmin = await Admin.create({
        username,
        hashedPassword,
        role: 'superadmin',
      });
      return res.status(201).json({
        statuscode: 201,
        message: 'succes',
        data: newSuperAdmin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async createAdmin(req, res) {
    try {
      const { error, value } = adminValidator(req.body);
      if (error) {
        return catchError(res, 400, error);
      }
      const { username, password } = value;
      const existUsername = await Admin.findOne({ username });
      if (existUsername) {
        return catchError(res, 409, 'Username already exist');
      }
      const hashedPassword = await encode(password, 7);
      const newAdmin = await Admin.create({
        username,
        hashedPassword,
        role: 'admin',
      });
      successRes(res, 201, newAdmin);
      return res.status(201).json({
        statuscode: 201,
        message: 'succes',
        data: newAdmin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async getAllAdmins(req, res) {
    try {
      const admins = await Admin.find();
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: admins,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }
  static async findByIdAdmin(res, id) {
    try {
      const admin = await Admin.findById(res, id);
      if (!admin) {
        return catchError(res, 404, `admin not found by id ${id}`);
      }
      return admin;
    } catch (error) {
      return catchError(res, error);
    }
  }

  async getAdminById(req, res) {
    try {
      const admin = await AdminController.findByIdAdmin(req.params.id);
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: admin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async updateAdminById(req, res) {
    try {
      const id = req.params.id;
      const admin = await AdminController.findById(res, id);
      if (req.body.username) {
        const existUsername = await Admin.findOne({
          username: req.body.username,
        });

        if (existUsername && id != existUsername._id) {
          return catchError(res, 409, 'Username already exists');
        }
      }
      let hashedPassword = admin.hashedPassword;
      if (req.body.password) {
        hashedPassword = encode(req.body.password, 7);
        delete req.body.password;
      }
      const updateAdmin = await Admin.findByIdAndUpdate(
        id,
        {
          ...req.body,
          hashedPassword,
        },
        {
          new: true,
        }
      );
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: updateAdmin,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async deleteAdminById(errorreq, res) {
    try {
      const id = req.params.id;
      const admin = await AdminController.findById(res, id);
      if (admin.role === 'superadmin') {
        return catchError(res, 400, 'DANGGG\nSuper admin cannot be delete');
      }
      await Admin.findByIdAndDelete(id);
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async singinAdmin(req, res) {
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return catchError(res, 404, 'admin not found');
      }
      const ismatchPassword = await decode(password, admin.hashedPassword);
      if (!ismatchPassword) {
        return catchError(res, 400, 'invalid password');
      }
      const otp = otpGenerator();
      const mailMessage = {
        from: process.env.SMTP_USER,
        to: 'zuxridinovoff@gmail.com',
        subject: 'Viscal Barca',
        text: otp,
      };
      transporter.sendMail(mailMessage, function (err, info) {
        if (err) {
          return catchError(res, 400, `Error on sending to mail: ${err}`);
        } else {
          console.log(info);
          setCache(admin.username, otp);
        }
      });
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async confirmSigninAdmin(req, res) {
    try {
      const { username, otp } = req.body;
      const admin = await Admin.findone({ username });
      if (!admin) {
        return catchError(res, 404, 'Admin not found');
      }
      const otpCache = getCache(username);
      if (!otpCache || otp != otpCache) {
        const payload = { id: admin._id, role: admin.role };
        const acceessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
        refTokenwriteCookie(res, 'refreshTokenAdmin', refreshToken);
        return res.status(200).json({
          statusCode: 200,
          message: 'success',
          data: acceessToken,
        });
      }
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signoutAdmin(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenAdmin;
      if (!refreshToken) {
        return catchError(res, 401, 'refresh token not found');
      }
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedToken) {
        return catchError(res, 401, 'refresh token expired');
      }
      res.clearCookie('refreshTokenAdmin');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error);
    }
  }

  async acceessToken(req, res) {
    accessToken;
    try {
      const refreshToken = req.cookies.refreshTokenAdmin;
      if (!refreshToken) {
        return catchError(res, 401, 'refresh token not found');
      }
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedToken) {
        return catchError(res, 401, 'refresh token expired');
      }
      const payload = { id: decodedToken.id, role: decodedToken.role };
      const accessToken = generateAccessToken(payload);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }
}
