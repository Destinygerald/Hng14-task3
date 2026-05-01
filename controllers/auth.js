import { generatePKCE } from "../utils/pcke.js";
import crypto from "node:crypto";
import { APIError } from "../middleware/error-handler.js";
import axios from "axios";
import { UserRepository } from "../repository/user-repository.js";
import { TokenRepository } from "../repository/token-repository.js";
import { generateAccess, generateRefresh } from "../utils/tokenizer.js";
import jwt from "jsonwebtoken";

const userModel = new UserRepository();
const tokenModel = new TokenRepository();

const GITHUB_AUTH_URL = process.env.GITHUB_AUTH_URL;
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export async function githubAuth(req, res) {
  const { verifier, challenge } = generatePKCE();
  const state = crypto.randomBytes(16).toString("hex");

  // ✅ Store verifier + state in signed cookies instead of session
  res.cookie("pkce_verifier", verifier, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
  });
  res.cookie("oauth_state", state, {
    httpOnly: true,
    signed: true,
    sameSite: "lax",
  });

  const githubAuthUrl = GITHUB_AUTH_URL.replace("<client_id>", CLIENT_ID)
    .replace("<redirect_uri>", REDIRECT_URI)
    .replace("<state>", state)
    .replace("<challenge>", challenge);

  res.redirect(githubAuthUrl);
}

export async function githubAuthCallback(req, res) {
  const { code, state, mode } = req.query;

  // ✅ Read from signed cookies instead of session
  const savedState = req.signedCookies.oauth_state;
  const verifier = req.signedCookies.pkce_verifier;

  if (state !== savedState) {
    throw new APIError("State Mismatch. Potential CSRF attack", 400);
  }

  // ✅ Clear PKCE cookies — no longer needed
  res.clearCookie("pkce_verifier");
  res.clearCookie("oauth_state");

  const tokenResponse = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      code_verifier: verifier, // ✅ from cookie
      redirect_uri: REDIRECT_URI,
    },
    { headers: { Accept: "application/json" } },
  );

  const accessToken = tokenResponse.data.access_token;

  const userResponse = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `bearer ${accessToken}` },
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
  if (isFirstUser[0]) parsedData.role = "admin";

  const user = userExists
    ? await userModel.editUser(parsedData)
    : await userModel.create(parsedData);

  const access_token = generateAccess(user);
  const refresh_token = generateRefresh();

  await tokenModel.create({ token: refresh_token, userId: user.id });

  // ✅ No req.session.user — identity lives in the JWT now
  res.cookie("session_user", "1", { httpOnly: true, sameSite: "lax" });

  return res.status(200).json({
    status: "success",
    access_token,
    refresh_token,
    username: user.username,
  });
}

export async function refreshToken(req, res) {
  const { refresh_token } = req.body;
  const existing = await tokenModel.getTokenData(refresh_token);

  if (!existing) throw new APIError("Invalid refresh token", 401);

  if (existing.expiresAt < new Date()) {
    await tokenModel.deleteToken(refresh_token);
    throw new APIError("Invalid refresh token", 401);
  }

  await tokenModel.deleteToken(refresh_token);

  const newRefresh = generateRefresh();
  await tokenModel.create({ token: newRefresh, userId: existing.user.id });

  const access = generateAccess(existing.user);

  return res.status(200).json({
    status: "success",
    access_token: access,
    refresh_token: newRefresh,
  });
}

export async function logout(req, res) {
  const { refresh_token } = req.body;

  if (refresh_token) await tokenModel.deleteToken(refresh_token);

  // ✅ Just clear cookies — no session to destroy
  res.clearCookie("session_user");
  res.clearCookie("pkce_verifier");
  res.clearCookie("oauth_state");

  res.json({ status: "success", message: "Logged out" });
}

export async function whoami(req, res) {
  // ✅ Read identity from JWT instead of session
  const auth = req.headers["authorization"];
  const token = auth?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      status: "success",
      data: { id: user.id, role: user.role, username: user.username },
    });
  } catch {
    return res.status(401).json({ status: "error", message: "Unauthorized" });
  }
}
