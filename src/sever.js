// Use require for everything (CommonJS style)
require('dotenv').config();
const express = require('express');
const configViewEngine = require('./config/viewEngine');
const app = express();
const port = process.env.PORT || 8080;
const m_webRoutes = require('./routes/m_web');
const hostname = process.env.HOST_NAME;

// Middleware for parsing JSON and forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware setup (must come before routes)
const session = require('express-session');
app.use(session({
    secret: '123456', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use `true` if using HTTPS
}));

// Setup view engine
configViewEngine(app);

// Define routes (must come after session middleware)
app.use('/', m_webRoutes);

// Start the server
app.listen(port, hostname, () => {
    console.log(`Server is running on port ${port}`);
});
