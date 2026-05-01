import dotenv from "dotenv";
import app from "../server.js";
import ServerlessHttp from "serverless-http";
dotenv.config();

export default ServerlessHttp(app);
