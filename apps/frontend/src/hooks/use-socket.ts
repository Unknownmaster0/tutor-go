import { useEffect, useState, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { createSocketConnection, disconnectSocket, connectSocket } from '@/lib/socket-client';

export interface UseSocketOptions {
  url: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
  onReconnect?: (attemptNumber: number) => void;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export const useSocket = (options: UseSocketOptions): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef<Map<string, (...args: any[]) => void>>(new Map());

  useEffect(() => {
    const socketInstance = createSocketConnection({
      url: options.url,
      autoConnect: options.autoConnect,
    });

    setSocket(socketInstance);

    // Connection event handlers
    const handleConnect = () => {
      setIsConnected(true);
      options.onConnect?.();
    };

    const handleDisconnect = (reason: string) => {
      setIsConnected(false);
      options.onDisconnect?.(reason);
    };

    const handleError = (error: Error) => {
      options.onError?.(error);
    };

    const handleReconnect = (attemptNumber: number) => {
      options.onReconnect?.(attemptNumber);
    };

    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('error', handleError);
    socketInstance.on('reconnect', handleReconnect);

    if (options.autoConnect) {
      socketInstance.connect();
    }

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('error', handleError);
      socketInstance.off('reconnect', handleReconnect);

      // Clean up all registered listeners
      listenersRef.current.forEach((handler, event) => {
        socketInstance.off(event, handler);
      });
      listenersRef.current.clear();

      disconnectSocket();
    };
  }, [options.url, options.autoConnect]);

  const connect = useCallback(() => {
    connectSocket();
  }, []);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setIsConnected(false);
  }, []);

  const emit = useCallback(
    (event: string, data: any) => {
      socket?.emit(event, data);
    },
    [socket],
  );

  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (socket) {
        socket.on(event, handler);
        listenersRef.current.set(event, handler);
      }
    },
    [socket],
  );

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      if (socket) {
        if (handler) {
          socket.off(event, handler);
        } else {
          socket.off(event);
        }
        listenersRef.current.delete(event);
      }
    },
    [socket],
  );

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
};
