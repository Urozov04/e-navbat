import Doctor from '../models/doctor.model.js';
import { catchError } from '../utils/error-response.js';
import { doctorValidator } from '../validations/doctor.validation.js';
import { otpGenerator } from '../utils/otp-generator.js';
import { getCache, setCache } from '../utils/cache.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-token.js';
import { refTokenwriteCookie } from '../utils/write-cookie.js';

export class DoctorController {
  async createDoctor(req, res) {
    try {
      const { error, value } = doctorValidator(req.body);
      if (error) {
        return catchError(res, 400, error);
      }
      const existPhone = await Doctor.findOne({
        phoneNumber: value.phoneNumber,
      });
      if (existPhone) {
        return catchError(res, 409, 'Phone number already exist');
      }
      const doctor = await Doctor.create(value);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: doctor,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signinDoctor(req, res) {
    try {
      const { phoneNumber } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });
      if (!doctor) {
        return catchError(res, 404, 'Doctor not found');
      }

      const otp = otpGenerator();

      setCache(phoneNumber, otp);
      return res.status(200).json({
        statusCode: 200,
        message: 'succuss',
        data: otp,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async confirmSigninDoctor(req, res) {
    try {
      const { phoneNumber, otp } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });
      if (!doctor) {
        return catchError(res, 400, 'Wrong phone number');
      }
      const otpCache = getCache(phoneNumber);
      if (!otpCache || otpCache !== otp) {
        return catchError(res, 400, 'OTP expired');
      }
      const payload = { id: doctor._id, is_doctor: true };
      const acceessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      refTokenwriteCookie(res, "refreshTokenDoctor", refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: "success",
        data: acceessToken
      })
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signoutDoctor(req, res) {
      try {
        const refreshToken = req.cookies.refreshTokenDoctor;
        if (!refreshToken) {
          return catchError(res, 401, 'refresh token doctor not found');
        }
        const decodedToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_KEY
        );
        if (!decodedToken) {
          return catchError(res, 401, 'refresh token doctor expired');
        }
        res.clearCookie('refreshToken');
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
        const refreshToken = req.cookies.refreshTokenDoctor;
        if (!refreshToken) {
          return catchError(res, 401, 'refresh token doctor not found');
        }
        const decodedToken = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_KEY
        );
        if (!decodedToken) {
          return catchError(res, 401, 'refresh token doctor expired');
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

  async getAllDoctors (_, res){
    try {
      const doctors = await Doctor.find();
      return res.status(200).json({
        statusCode: 200,
        message: "success",
        data: doctors
      });
    } catch (error) {
      return catchError(res, 500, error.message)
    }
  }

  async getDoctorById(req, res) {
    try {
      const doctor = await DoctorController.findDoctorById(res, req.params.id);
      return res.status(200).json({
        statusCode: 200,
        message: "success",
        data: doctor
      })
    } catch (error) {
      return catchError(res, 500, error.message)
    }
  }

    async updateDoctorById(req, res) {
    try {
      const id = req.params.id;
      await DoctorController.findDoctorById(res, id);
      if (req.body.phoneNumber) { 
        const existUsername = await Doctor.findOne({
          phoneNumber: req.body.phoneNumber,
        });
      }
      if (existPhone && id != existPhone._id) {
        return catchError(res, 409, 'Phone number already exists');
      }
      const updateDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: updateDoctor,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async deleteDoctorById(req, res) {
    try {
      const id = req.params.id;
      await DoctorController.findDoctorById(res, id);
      await Doctor.findByIdAndDelete(id)
      return res.status(200).json({
        statuscode: 200,
        message: 'succes',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  static async findDoctorById(res, id){
    try {
      const doctor = await Doctor.findById(id);
      if(!doctor) {
        return catchError(res, 404, `Doctor not found by ID ${id}`);
      }
      return doctor;
    } catch (error) {
      return catchError(res, 500, error.message)
    }
  }
}
