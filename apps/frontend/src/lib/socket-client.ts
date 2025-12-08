import { io, Socket } from 'socket.io-client';
import { tokenStorage } from './token-storage';

let socket: Socket | null = null;

export interface SocketConfig {
  url: string;
  autoConnect?: boolean;
}

export const createSocketConnection = (config: SocketConfig): Socket => {
  // If socket exists and is connected, return it
  if (socket?.connected) {
    return socket;
  }

  // If socket exists but not connected, disconnect and recreate
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const token = tokenStorage.getAccessToken();

  socket = io(config.url, {
    autoConnect: config.autoConnect ?? false,
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const connectSocket = (): void => {
  if (socket && !socket.connected) {
    const token = tokenStorage.getAccessToken();
    socket.auth = { token };
    socket.connect();
  }
};

// For testing purposes
export const resetSocket = (): void => {
  socket = null;
};
