 // app.js
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('API is running!');
  });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
