import { Router } from "express";
import { authenticateProvider } from "../middleware/auth.js";
import { getPatientsCollection, getPatientRef } from "../services/firestore.js";
import { Patient } from "../types/index.js";
import {
  validatePatient,
  validatePatientUpdate,
} from "../middleware/validation.js";

const router = Router();

// Apply authentication to all patient routes
router.use(authenticateProvider);

// Create patient
router.post("/", validatePatient, async (req: any, res) => {
  try {
    const { firstName, middleName, lastName, dateOfBirth, status, address } =
      req.body;

    if (!firstName || !lastName || !dateOfBirth || !status || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const patientData: Omit<Patient, "id"> = {
      firstName,
      middleName: middleName || null,
      lastName,
      dateOfBirth,
      status,
      address,
      createdAt: new Date() as any,
      updatedAt: new Date() as any,
    };

    const docRef = await getPatientsCollection(req.providerId).add(patientData);
    res.status(201).json({ id: docRef.id, ...patientData });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

// List patients with optional filtering
router.get("/", async (req: any, res) => {
  try {
    const { status, limit = 50, offset = 0, orderBy = "lastName" } = req.query;

    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt(offset);

    let query = getPatientsCollection(req.providerId)
      .orderBy(orderBy)
      .offset(parsedOffset)
      .limit(parsedLimit);

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const patients: Patient[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Patient),
    }));

    res.json({
      patients,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        count: patients.length,
        hasMore: patients.length === parsedLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get patient by ID
router.get("/:id", async (req: any, res) => {
  try {
    const patientDoc = await getPatientRef(req.providerId, req.params.id).get();

    if (!patientDoc.exists) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const patient: Patient = {
      ...(patientDoc.data() as Patient),
    };
    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

// Update patient
router.put("/:id", validatePatientUpdate, async (req: any, res) => {
  try {
    const { firstName, middleName, lastName, dateOfBirth, status, address } =
      req.body;

    const updateData: Partial<Patient> = {
      ...(firstName && { firstName }),
      ...(middleName !== undefined && { middleName }),
      ...(lastName && { lastName }),
      ...(dateOfBirth && { dateOfBirth }),
      ...(status && { status }),
      ...(address && { address }),
      updatedAt: new Date() as any,
    };

    await getPatientRef(req.providerId, req.params.id).update(updateData);
    res.json({ message: "Patient updated successfully" });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// Delete patient
router.delete("/:id", async (req: any, res) => {
  try {
    await getPatientRef(req.providerId, req.params.id).delete();
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

export { router as patientRoutes };
