import { Router } from "express";
import { authenticateProvider } from "../middleware/auth";
import { getProviderRef } from "../services/firestore";
import { Provider } from "../types";

const router = Router();

// Get provider profile
router.get("/profile", authenticateProvider, async (req: any, res) => {
  try {
    const providerDoc = await getProviderRef(req.providerId).get();

    if (!providerDoc.exists) {
      return res.status(404).json({ error: "Provider not found" });
    }

    const provider: Provider = {
      ...(providerDoc.data() as Provider),
    };
    res.json(provider);
  } catch (error) {
    console.error("Error fetching provider:", error);
    res.status(500).json({ error: "Failed to fetch provider" });
  }
});

// Update provider profile
router.put("/profile", authenticateProvider, async (req: any, res) => {
  try {
    const { name, email, contactInfo } = req.body;
    const updateData: Partial<Provider> = {
      ...(name && { name }),
      ...(email && { email }),
      ...(contactInfo && { contactInfo }),
      updatedAt: new Date() as any,
    };

    await getProviderRef(req.providerId).update(updateData);
    res.json({ message: "Provider updated successfully" });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ error: "Failed to update provider" });
  }
});

export { router as providerRoutes };
