import express from 'express';
import './config/express.config';
const app = express();
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
dotenv.config();

//importing routes
import { router } from './routes/routes';
import { authRoutes } from './routes/auth/auth.routes';
import { adminRoutes } from './routes/admin/admin.routes';
import {bankRoutes } from './routes/auth/bank.routes'
import { partnerRoutes } from './routes/partner/partner.routes'
import { smsRoutes } from './routes/sms/sms.routes';
import './config/db'; 

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.set('view engine', 'ejs');
app.get('/simulator', (req, res) => {
  res.render('index');
});

//route definition
app.use('/', router);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/bank', bankRoutes);
app.use('/partner', partnerRoutes);
app.use('/sms', smsRoutes);

// Define server configuration
const PORT = process.env.PORT || 3002;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});