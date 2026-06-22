import express from 'express';
import authRouter from './auth';
import groupsRouter from './groups';
import paymentsRouter from './payments';
import webhooksRouter from './webhooks';
import adminRouter from './admin';
import walletRouter from './wallet';
import notificationsRouter from './notifications';
import configRouter from './config';

const v1Router = express.Router();

v1Router.use(authRouter);
v1Router.use(groupsRouter);
v1Router.use(paymentsRouter);
v1Router.use(webhooksRouter);
v1Router.use(adminRouter);
v1Router.use(walletRouter);
v1Router.use(notificationsRouter);
v1Router.use(configRouter);

export default v1Router;
