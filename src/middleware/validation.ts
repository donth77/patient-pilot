import { Request, Response, NextFunction } from "express";
import { validateDateOfBirth } from "../utils/validation.js";

export const validatePatient = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dateOfBirth } = req.body;

  if (dateOfBirth) {
    const dateValidation = validateDateOfBirth(dateOfBirth);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        message: dateValidation.message,
      });
    }
  }

  next();
};

export const validatePatientUpdate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dateOfBirth } = req.body;

  if (dateOfBirth !== undefined) {
    const dateValidation = validateDateOfBirth(dateOfBirth);
    if (!dateValidation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        message: dateValidation.message,
      });
    }
  }

  next();
};
