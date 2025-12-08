/**
 * CORS Configuration
 * Defines allowed origins and credentials for cross-origin requests
 */

export const getCorsConfig = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3006',
    'http://localhost:3007',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];

  // Add production origins if available
  if (process.env.NODE_ENV === 'production') {
    if (process.env.API_BASE_URL) {
      allowedOrigins.push(process.env.API_BASE_URL);
    }
  }

  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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
