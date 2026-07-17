import { Router } from "express";

import {
  getCurrentUser,
  login,
  register,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

router.post("/login", validateRequest(loginSchema), login);

router.get("/me", protect, getCurrentUser);

export default router;