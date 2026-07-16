import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { generateToken } from "../utils/generateToken.js";

export async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists.",
      [
        {
          field: "email",
          code: "EMAIL_ALREADY_EXISTS",
          message: "An account with this email already exists.",
        },
      ]
    );
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  return {
    user: user.toPublicProfile(),
    token: generateToken(user._id.toString()),
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select(
    "+password +isActive"
  );

  const credentialsAreValid =
    user && (await user.comparePassword(password));

  if (!credentialsAreValid) {
    throw new ApiError(401, "Invalid email or password.", [
      {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
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

  return {
    user: user.toPublicProfile(),
    token: generateToken(user._id.toString()),
  };
}