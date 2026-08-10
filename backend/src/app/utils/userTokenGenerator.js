import { StatusCodes } from "http-status-codes";
import { envVars } from "../config/env.js";

import { generateToken, verifyToken } from "./jwt.js";
import DevBuildError from "../lib/DevBuildError.js";

//  CREATE USER TOKENS

export const createUserTokens = (user) => {
  const jwtPayload = {
    id: user.id, // Standardized to 'id'
    email: user.email,
    role: user.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_TOKEN,
    envVars.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
};
//  CREATE NEW ACCESS TOKEN USING REFRESH TOKEN

export const createNewAccessTokenUsingRefreshToken = async (
  prisma,
  refreshToken,
) => {
  const verifyRefreshToken = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_TOKEN,
  );

  const isUser = await prisma.users.findUnique({
    where: { email: verifyRefreshToken.email },
  });

  if (!isUser) {
    throw new DevBuildError("User does not exist", StatusCodes.BAD_REQUEST);
  }

  const jwtPayload = {
    id: isUser.id,
    email: isUser.email,
    role: isUser.role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN,
  );

  return accessToken;
};

export const createImpersonationTokens = (user, systemOwnerId) => {
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    isImpersonated: true,
    impersonatorId: systemOwnerId,
  };

  const accessToken = generateToken(
    jwtPayload,
    envVars.JWT_SECRET_TOKEN,
    envVars.JWT_EXPIRES_IN,
  );

  const refreshToken = generateToken(
    jwtPayload,
    envVars.JWT_REFRESH_TOKEN,
    envVars.JWT_REFRESH_EXPIRES_IN,
  );

  return { accessToken, refreshToken };
};
