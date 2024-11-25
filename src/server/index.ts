import express from 'express';
import { connectDB } from './db';
import { Purchase } from './models/Purchase';
import { User } from './models/User';

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.get('/api/purchases', async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

app.post('/api/purchases', async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

app.put('/api/purchases/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update purchase' });
  }
});

app.post('/api/auth', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ 
      success: true,
      user: {
        username: user.username,
        role: user.role,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Initialize default users if they don't exist
async function initializeUsers() {
  try {
    const users = [
      { username: 'director', password: '1234', role: 'director' },
      { username: 'finance', password: '1234', role: 'finance' },
    ];

    for (const user of users) {
      await User.findOneAndUpdate(
        { username: user.username },
        user,
        { upsert: true }
      );
    }
    console.log('Default users initialized');
  } catch (error) {
    console.error('Failed to initialize users:', error);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initializeUsers();
});