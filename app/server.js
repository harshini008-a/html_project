const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(cors());
// Increase the payload size limit to 50mb to handle large Base64 images
app.use(express.json({ limit: '50mb' }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/restaurant_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// Multer for File Uploads
const upload = multer();

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
});

const menuSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: String,
  rating: Number,
  quantity: Number,
  image: String,
  description: String
});

const cartSchema = new mongoose.Schema({
  userId: String,
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    quantity: { type: Number, required: true }
  }]
});

const orderSchema = new mongoose.Schema({
  userId: String,
  username: String,
  items: [{
    name: String,
    quantity: Number,
    price: String,
    image: String
  }],
  total: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
  userId: String,
  username: String,
  tableNumber: String,
  date: Date,
  time: String,
  guests: Number,
  status: String
});

const paymentSchema = new mongoose.Schema({
  userId: String,
  billing: {
    fullName: String,
    email: String,
    phone: String,
    address: String
  },
  payment: {
    cardNumber: String,
    cardholderName: String,
    expiryDate: String,
    cvv: String
  },
  amount: Number,
  quantity: Number,
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const receiptSchema = new mongoose.Schema({
  userId: String,
  username: String,
  email: String,
  quantity: Number,
  totalAmount: Number,
  purchaseDate: String,
  items: [{
    name: String,
    quantity: Number,
    price: String
  }]
});

const tableSchema = new mongoose.Schema({
  number: String,
  capacity: Number,
  image: String
});

const User = mongoose.model('User', userSchema);
const Menu = mongoose.model('Menu', menuSchema, 'menu');
const Cart = mongoose.model('Cart', cartSchema);
const Order = mongoose.model('Order', orderSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Payment = mongoose.model('Payment', paymentSchema, 'payments');
const Receipt = mongoose.model('Receipt', receiptSchema);
const Table = mongoose.model('Table', tableSchema);

// Middleware for Authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    role
  });
  await user.save();
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, 'secret_key', { expiresIn: '1h' });
  res.json({
    success: true,
    token,
    userId: user._id,
    username: user.username,
    role: user.role
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (role && user.role !== role) {
    return res.status(403).json({ success: false, message: `Account is not registered as ${role}` });
  }
  const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, 'secret_key', { expiresIn: '1h' });
  res.json({
    success: true,
    token,
    userId: user._id,
    username: user.username,
    role: user.role
  });
});

// User Route to Fetch User Details
app.get('/api/users/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('username email role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Menu Routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ success: false, message: 'Error fetching menu items' });
  }
});

app.post('/api/admin/menu', authenticate, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

  const { name, category, price, rating, quantity, description } = req.body;
  if (!name || !category || !price || !rating || !quantity || !req.file) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const image = `data:image/${path.extname(req.file.originalname).slice(1).toLowerCase()};base64,${req.file.buffer.toString('base64')}`;
  const menuItem = new Menu({
    name,
    category,
    price,
    rating: Number(rating),
    quantity: Number(quantity),
    image,
    description: description || 'A delicious dish prepared with fresh ingredients.'
  });

  await menuItem.save();
  res.json({ success: true, message: 'Menu item added successfully' });
});

app.get('/api/admin/menu', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const menuItems = await Menu.find();
  const groupedMenus = {};
  menuItems.forEach(item => {
    if (!groupedMenus[item.category]) {
      groupedMenus[item.category] = { category: item.category, description: item.description || '', items: [] };
    }
    groupedMenus[item.category].items.push(item);
  });
  res.json(Object.values(groupedMenus));
});

app.put('/api/admin/menu/:id', authenticate, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const { name, category, price, rating } = req.body;
  const updateData = { name, category, price, rating: Number(rating) };
  if (req.file) {
    updateData.image = `data:image/${path.extname(req.file.originalname).slice(1).toLowerCase()};base64,${req.file.buffer.toString('base64')}`;
  }
  await Menu.findByIdAndUpdate(req.params.id, updateData);
  res.json({ success: true, message: 'Menu item updated successfully' });
});

app.delete('/api/admin/menu/:id', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  await Menu.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Menu item deleted successfully' });
});

// Cart Routes
app.post('/api/cart/:userId', authenticate, async (req, res) => {
  const { itemId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ success: false, message: 'Invalid item ID' });
  }

  const menuItem = await Menu.findById(itemId);
  if (!menuItem) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  if (quantity > menuItem.quantity) {
    return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
  }

  let cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) {
    cart = new Cart({ userId: req.params.userId, items: [] });
  }

  const existingItem = cart.items.find(i => i.item && i.item.toString() === itemId);
  if (existingItem) {
    if (existingItem.quantity + quantity > menuItem.quantity) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
    }
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ item: new mongoose.Types.ObjectId(itemId), quantity });
  }

  try {
    await cart.save();
    res.json({ success: true, message: 'Item added to cart successfully' });
  } catch (err) {
    console.error('Error saving cart:', err);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

app.put('/api/cart/:userId/:itemName', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const decodedItemName = decodeURIComponent(req.params.itemName);
    console.log('Updating cart for user:', req.params.userId, 'item:', decodedItemName, 'quantity:', quantity);
    const cart = await Cart.findOne({ userId: req.params.userId }).populate('items.item');
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    console.log('Cart items:', cart.items);
    const item = cart.items.find(i => i.item && i.item.name === decodedItemName);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }
    if (quantity === 0) {
      cart.items = cart.items.filter(i => i.item && i.item.name !== decodedItemName);
    } else {
      item.quantity = quantity;
    }
    await cart.save();
    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

app.get('/api/cart/:userId', authenticate, async (req, res) => {
  try {
    const populate = req.query.populate === 'true';
    let query = Cart.findOne({ userId: req.params.userId });
    if (populate) {
      query = query.populate('items.item');
    }
    const cart = await query.exec();
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.json([]);
    }
    const validItems = cart.items.filter(item => item.item !== null);
    res.json(validItems);
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch cart' });
  }
});

app.delete('/api/cart/:userId', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) {
      cart = new Cart({ userId: req.params.userId, items: [] });
    }
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
});

// Order Routes
app.post('/api/orders', authenticate, async (req, res) => {
  const { userId, username, items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'No items in the order' });
  }

  try {
    const order = new Order({
      userId,
      username,
      items,
      total,
      status: 'Pending',
      createdAt: new Date()
    });
    await order.save();
    res.json({ success: true, message: 'Order placed successfully' });
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ success: false, message: 'Error placing order' });
  }
});

app.get('/api/orders/:userId', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

app.get('/api/admin/orders', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const orders = await Order.find();
  res.json(orders);
});

// Booking Routes
app.get('/api/tables', async (req, res) => {
  const tables = await Table.find();
  res.json(tables);
});

app.post('/api/booking', authenticate, async (req, res) => {
  const { userId, username, date, time, guests, tableNumber } = req.body;
  const booking = new Booking({ userId, username, date, time, guests, tableNumber, status: 'Confirmed' });
  await booking.save();
  res.json({ success: true, message: 'Table booked successfully' });
});

app.get('/api/bookings/:userId', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

app.get('/api/admin/bookings', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  const bookings = await Booking.find();
  res.json(bookings);
});

// Payment Routes
app.post('/api/payment', authenticate, async (req, res) => {
  try {
    const { userId, billing, payment, amount, quantity, items } = req.body;

    // Validate required fields
    if (!userId || !billing || !billing.fullName || !billing.email || !payment || !payment.cardNumber || !payment.expiryDate || !payment.cvv || !amount || !quantity || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'All required fields, including items, must be provided' });
    }

    // Basic card number validation (16 digits)
    if (!/^\d{16}$/.test(payment.cardNumber)) {
      return res.status(400).json({ success: false, message: 'Invalid card number' });
    }

    // Basic expiry date validation (MM/YY)
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiryDate)) {
      return res.status(400).json({ success: false, message: 'Invalid expiry date' });
    }

    // Basic CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(payment.cvv)) {
      return res.status(400).json({ success: false, message: 'Invalid CVV' });
    }

    const paymentRecord = new Payment({
      userId,
      billing,
      payment,
      amount,
      quantity,
      status: 'paid',
      createdAt: new Date()
    });

    await paymentRecord.save();

    // Fetch user details for the receipt
    const user = await User.findById(userId).select('username email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create a receipt using the items provided in the request
    const receipt = new Receipt({
      userId,
      username: user.username,
      email: user.email,
      quantity,
      totalAmount: amount,
      purchaseDate: new Date().toISOString(),
      items
    });

    await receipt.save();

    // Clear the cart after payment and receipt creation
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ success: true, message: 'Payment recorded and receipt created successfully', paymentId: paymentRecord._id, receiptId: receipt._id });
  } catch (err) {
    console.error('Error processing payment:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to process payment' });
  }
});

app.get('/api/admin/payments', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
});

// Receipt Routes
app.post('/api/receipts', authenticate, async (req, res) => {
  const { userId, username, email, quantity, totalAmount, purchaseDate, items } = req.body;
  const receipt = new Receipt({ userId, username, email, quantity, totalAmount, purchaseDate, items: items || [] });
  await receipt.save();
  res.json({ success: true, message: 'Receipt saved successfully', receiptId: receipt._id });
});

app.get('/api/receipts/:userId', authenticate, async (req, res) => {
  const receipts = await Receipt.find({ userId: req.params.userId });
  res.json(receipts);
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));