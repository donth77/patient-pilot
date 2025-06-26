import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

interface AuthenticatedRequest extends Request {
  providerId?: string;
}

export const authenticateProvider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "No valid authorization token provided" });
    }

    const token = authHeader.substring(7); //  Extract token after "Bearer " (7 chars)
    const decodedToken = await getAuth().verifyIdToken(token);
    req.providerId = decodedToken.uid;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid authentication token" });
  }
};
