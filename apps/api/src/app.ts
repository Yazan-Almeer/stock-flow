import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { corsOptions } from './config/cors';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import branchesRouter from './modules/branches/branches.routes';
import categoriesRouter from './modules/categories/categories.routes';
import productRouter from './modules/products/product.routes';
import inventoryRouter from './modules/inventory/inventory.routes';
import transferRouter from './modules/transfers/transfer.routes';
import replenishmentRouter from './modules/replenishment/replenishment.routes';
import reportsRouter from './modules/reports/reports.routes';

const app = express();

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'stockflow-api',
    timestamp: new Date().toISOString() 
  });
});

// API v1 Routes
const v1Router = express.Router();
v1Router.use('/auth', authRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/branches', branchesRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/products', productRouter);
v1Router.use('/inventory', inventoryRouter);
v1Router.use('/transfers', transferRouter);
v1Router.use('/replenishment', replenishmentRouter);
v1Router.use('/reports', reportsRouter);

app.use('/api/v1', v1Router);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
