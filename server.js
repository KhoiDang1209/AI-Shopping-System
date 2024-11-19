const express = require('express');
const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public'));

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
