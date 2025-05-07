import Appointment from '../models/appointment.model.js';
import { appointmentValidator } from '../validation/appointment.validation.js';
import { catchError } from '../utils/error-response.js';

export class AppointmentController {
  async createAppointment(req, res) {
    try {
      const { error, value } = appointmentValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const appointment = await Appointment.create(value);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: appointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAllApointments(_, res) {
    try {
      const appointments = await Appointment.find()
        .populate('patientId')
        .populate('graphId');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: appointments,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAppointmentById(req, res) {
    try {
      const appointment = await AppointmentController.findAppointmentById(
        req.params.id,
        res
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: appointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async updateAppointmentById(req, res) {
    try {
      const id = req.params.id;
      await AppointmentController.findAppointmentById(id, res);
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedAppointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async deleteAppointmentById(req, res) {
    try {
      const id = req.params.id;
      await AppointmentController.findAppointmentById(id, res);
      await Appointment.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findAppointmentById(id, res) {
    try {
      const appointment = await Appointment.findById(id)
        .populate('patientId')
        .populate('graphId');
      if (!appointment) {
        return catchError(404, 'Appointment not found', res);
      }
      return appointment;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
