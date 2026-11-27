import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

export const createSocket = (token) =>
  io(SOCKET_URL, { auth: token ? { token } : {} });