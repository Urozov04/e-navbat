import { Patient } from '../models/patient.model.js';
import { patientValidation } from '../validations/patient.validation.js';
import { catchError } from '../utils/error-response.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import { refTokenwriteCookie } from '../utils/write-cookie.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-token.js';

export class PatientController {
  async signupPatient(req, res) {
    try {
      const { error, value } = patientValidation(req.body);
      if (error) {
        return catchError(res, 400, error);
      }
      const { fullName, phoneNumber, password, address, age, gender } = value;
      const existPhone = await Patient.findOne({ phoneNumber });
      if (existPhone) {
        return catchError(res, 409, 'Phone number already exist');
      }
      const hashedPassword = await encode(password, 7);
      const patient = await Patient.create({
        fullName,
        phoneNumber,
        address,
        age,
        gender,
      });
      const payload = { id: patient._id, is_patient: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      refTokenwriteCookie(res, 'refreshTokenPatient', refreshToken);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signinPatient(req, res) {
    try {
      const { phoneNumber, password } = req.body;
      const patient = await Patient.findOne({ phoneNumber });
      const isMatchPass = await decode(password, patient.hashedPassword);
      if (!patient || isMatchPass) {
        return catchError(res, 400, 'Phone number or password incorrect');
      }
      const payload = { id: patient._id, is_patient: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      refTokenwriteCookie(res, 'refreshTokenPatient', refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async signoutPatient(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenDoctor;
      if (!refreshToken) {
        return catchError(res, 401, 'refresh token patient not found');
      }
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedToken) {
        return catchError(res, 401, 'refresh token patient expired');
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
        return catchError(res, 401, 'refresh token patient not found');
      }
      const decodedToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedToken) {
        return catchError(res, 401, 'refresh token patient expired');
      }
      const payload = { id: decodedToken.id, is_patient: true };
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

  async getAllPatients(req, res) {
    try {
      const patients = await Patient.find();
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: patients,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async getPatientById(req, res) {
    try {
      const patient = await PatientController.findPatientById(
        res,
        req.params.id
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: patient,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async updatePatientById(req, res) {
    try {
      const id = req.params.id;
      const patient = await PatientController.findPatientById(res, id);
      if (req.body.phoneNumber) {
        const existPhone = await Patient.findOne({
          phoneNumber: req.body.phoneNumber,
        });
        if (existPhone && id != existPhone._id) {
          return catchError(res, 409, 'Phone number already exist');
        }
      }
      let hashedPassword = patient.hashedPassword;
      if (req.body.password) {
        hashedPassword = encode(req.body.password, 7);
        delete req.body.password;
      }
      const updatedPatient = await Patient.findByIdAndUpdate(
        id,
        {
          ...req.body,
          hashedPassword,
        },
        { new: true }
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedPatient,
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  async deletePatientById(req, res) {
    try {
      const id = req.params.id;
      await PatientController.findPatientById(res, id);
      await -Patient.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }

  static async findPatientById(res, id) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        return catchError(res, 404, 'Patient not found');
      }
      return patient;
    } catch (error) {
      return catchError(res, 500, error.message);
    }
  }
}
