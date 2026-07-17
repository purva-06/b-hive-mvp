import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication is required.", [
      {
        code: "AUTHENTICATION_REQUIRED",
        message: "Provide a Bearer token.",
      },
    ]);
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new ApiError(401, "Authentication is required.", [
      {
        code: "AUTHENTICATION_REQUIRED",
        message: "Provide a Bearer token.",
      },
    ]);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    });
  } catch {
    throw new ApiError(
      401,
      "The authentication token is invalid or expired.",
      [
        {
          code: "INVALID_AUTHENTICATION_TOKEN",
          message: "The authentication token is invalid or expired.",
        },
      ]
    );
  }

  const user = await User.findById(decoded.userId).select("+isActive");

  if (!user) {
    throw new ApiError(401, "The user associated with this token no longer exists.", [
      {
        code: "TOKEN_USER_NOT_FOUND",
        message: "The user associated with this token no longer exists.",
      },
    ]);
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account is currently inactive.", [
      {
        code: "ACCOUNT_INACTIVE",
        message: "This account is currently inactive.",
      },
    ]);
  }

  req.user = user;

  next();
});
export const optionalProtect = asyncHandler(
  async (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      req.user = null;
      return next();
    }

    const token = authorization
      .slice("Bearer ".length)
      .trim();

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;

    try {
      decoded = jwt.verify(token, env.jwtSecret, {
        algorithms: ["HS256"],
      });
    } catch {
      throw new ApiError(
        401,
        "The authentication token is invalid or expired.",
        [
          {
            code: "INVALID_AUTHENTICATION_TOKEN",
            message:
              "The authentication token is invalid or expired.",
          },
        ]
      );
    }

    const user = await User.findById(
      decoded.userId
    ).select("+isActive");

    if (!user) {
      throw new ApiError(
        401,
        "The user associated with this token no longer exists.",
        [
          {
            code: "TOKEN_USER_NOT_FOUND",
            message:
              "The user associated with this token no longer exists.",
          },
        ]
      );
    }

    if (!user.isActive) {
      throw new ApiError(
        403,
        "This account is currently inactive.",
        [
          {
            code: "ACCOUNT_INACTIVE",
            message:
              "This account is currently inactive.",
          },
        ]
      );
    }

    req.user = user;

    next();
  }
);