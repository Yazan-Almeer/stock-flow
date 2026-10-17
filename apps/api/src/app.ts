import express from 'express';
import cors from 'cors';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health Check Endpoint (Phase 1 Requirement)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'stockflow-api', timestamp: new Date().toISOString() });
});