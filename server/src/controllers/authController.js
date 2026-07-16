import {
  loginUser,
  registerUser,
} from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: result,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful.",
    data: result,
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: {
      user: req.user.toPublicProfile(),
    },
  });
});