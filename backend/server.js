import express from 'express';
import cors from 'cors';
import todoRouter from './routes/todo.js';
import verifyToken from './middleware/auth.js';

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// Protected routes
app.use('/todos', verifyToken, todoRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error('***GLOBAL ERROR HANDLER***\n', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
