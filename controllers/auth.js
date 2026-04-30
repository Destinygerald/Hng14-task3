import { generatePKCE } from "../utils/pcke.js";
import crypto from "node:crypto";
// import { logger } from "../utils/logger.js";
import { APIError } from "../middleware/error-handler.js";
import axios from "axios";
import { UserRepository } from "../repository/user-repository.js";
import { TokenRepository } from "../repository/token-repository.js";
import { generateAccess, generateRefresh } from "../utils/tokenizer.js";

const userModel = new UserRepository();
const tokenModel = new TokenRepository();

const GITHUB_AUTH_URL = process.env.GITHUB_AUTH_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export async function githubAuth(req, res) {
  //logger.info(`GET /auth/github endpoint hit`);
  const { verifier, challenge } = generatePKCE();

  const state = crypto.randomBytes(16).toString("hex");

  req.session.code_verifier = verifier;
  req.session.state = state;

  const githubAuthUrl = GITHUB_AUTH_URL.replace("<client_id>", CLIENT_ID)
    .replace("<redirect_uri>", REDIRECT_URI)
    .replace("<state>", state)
    .replace("<challenge>", challenge);

  //logger.info(
  // "GET /auth/github: Redirecting to github authentication - ",
  // githubAuthUrl,
  //);
  res.redirect(githubAuthUrl);
}

export async function githubAuthCallback(req, res) {
  const { code, state, mode } = req.query;

  if (state !== req.session.state) {
    // logger.warn("GET /auth/github State Mismatch. Potential CSRF attack");
    throw new APIError("State Mismatch. Potential CSRF attack", 400);
  }

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      code_verifier: req.session.code_verifier,
      redirect_uri: REDIRECT_URI,
    },
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  const accessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  });

  const githubData = userResponse.data;

  const userExists = await userModel.getUser(githubData.id.toString());
  const { login: username, id, email, avatar_url } = githubData;
  const parsedData = {
    email: email || "",
    avatar_url,
    username,
    role: "analyst",
    is_active: true,
    github_id: id.toString(),
    last_login_at: new Date(),
  };

  const isFirstUser = await userModel.findAll();
  if (isFirstUser[0]) {
    parsedData.role = "admin";
  }

  let user;

  if (!userExists) {
    user = await userModel.create(parsedData);
  } else {
    user = await userModel.editUser(parsedData);
  }

  const access_token = generateAccess(user);
  const refresh_token = generateRefresh();

  const rfshToken = await tokenModel.create({
    token: refresh_token,
    userId: user.id,
    // expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  req.session.user = {
    id: user.id,
    role: user.role,
    username: user.username,
  };

  res.cookie("session_user", "1", {
    httpOnly: true,
    sameSite: "lax",
  });

  // if (mode === "cli") {
  return res.status(200).json({
    status: "success",
    access_token,
    refresh_token,
    username: user.username,
  });
  // }

  // return res.redirect(process.env.WEB_URL + "/dashboard");
}

export async function refreshToken(req, res) {
  const { refresh_token } = req.body;

  const existing = await tokenModel.getTokenData(refresh_token);

  if (!existing) {
    throw new APIError("Invalid refresh token", 401);
  }

  if (existing.expiresAt < new Date()) {
    await tokenModel.deleteToken(refresh_token);

    throw new APIError("Invalid refresh token", 401);
  }

  await tokenModel.deleteToken(refresh_token);

  const newRefresh = generateRefresh();

  const newRfshToken = await tokenModel.create({
    token: newRefresh,
    userId: existing.user.id,
  });

  const access = generateAccess(existing.user);

  return res.status(200).json({
    status: "success",
    access_token: access,
    refresh_token: newRefresh,
  });
}

export async function logout(req, res) {
  const { refresh_token } = req.body;

  if (refresh_token) {
    await tokenModel.deleteToken(refresh_token);
  }

  req.session.destroy(() => {});

  res.clearCookie("session_user");

  res.json({
    status: "success",
    message: "Logged out",
  });
}

export async function whoami(req, res) {
  if (req.session.user) {
    return res.json({
      status: "success",
      data: req.session.user,
    });
  }

  return res.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
}
