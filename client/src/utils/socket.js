import { io } from "socket.io-client";
import { SOCKET_URL } from "./config.js";


export const createSocket = (token) =>
  io(SOCKET_URL, { auth: token ? { token } : {} });