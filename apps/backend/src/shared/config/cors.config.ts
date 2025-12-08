/**
 * CORS Configuration
 * Defines allowed origins and credentials for cross-origin requests
 */

export const getCorsConfig = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const gatewayUrl = process.env.GATEWAY_URL || 'http://localhost:8000';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000', // Frontend
    'http://localhost:8000', // API Gateway (new port)
    'http://127.0.0.1:3000', // Frontend (127.0.0.1 variant)
    'http://127.0.0.1:8000', // API Gateway (127.0.0.1 variant)
    gatewayUrl, // Dynamic gateway URL from env
  ];

  // Add production origins if available
  if (process.env.NODE_ENV === 'production') {
    if (process.env.API_BASE_URL) {
      allowedOrigins.push(process.env.API_BASE_URL);
    }
  }

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log rejected origins for debugging
        console.warn(`CORS request rejected from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 3600,
  };
};

export const getSocketIoCorsConfig = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  return {
    origin: frontendUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  };
};
