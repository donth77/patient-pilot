import { Router } from "express";
import { patientRoutes } from "./patients.js";
import { providerRoutes } from "./providers.js";

const router = Router();

router.use("/providers", providerRoutes);
router.use("/patients", patientRoutes);

export default router;
