import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mealRoutes from './routes/mealRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);

const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('API is running!');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;