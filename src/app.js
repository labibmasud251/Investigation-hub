const express = require('express');
const cors = require('cors');
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
require('./config/passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/investigations', require('./routes/investigations'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Error handling
app.use(errorHandler);

module.exports = app; 