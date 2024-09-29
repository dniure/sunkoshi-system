const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());

// Import and use routes (will be added later)
// Example: app.use('/api/orders', ordersRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
