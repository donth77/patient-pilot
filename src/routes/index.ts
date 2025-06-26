import { Router } from "express";
import { patientRoutes } from "./patients";
import { providerRoutes } from "./providers";

const router = Router();

router.use("/providers", providerRoutes);
router.use("/patients", patientRoutes);

export default router;
