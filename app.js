const express = require('express');
const connectDB = require('./config/db');
const menuRoutes = require('./routes/menu');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/menus', menuRoutes);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});