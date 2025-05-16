const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Get JWT secret from environment variables or use a default (for development only)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

const authController = {
  // Register a new user
  async register(req, res) {
    try {
      const { email, password, name } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User with this email already exists' 
        });
      }
      
      // Create new user
      const user = await User.create({
        email,
        password,
        name
      });
      
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      
      // Set JWT token in cookie - Use 'jwt' as the cookie name to match frontend middleware
      res.cookie('jwt', token, cookieOptions);
      
      // Return success response
      res.status(201).json({
        success: true,
        message: 'Registration successful'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register. Please try again.' 
      });
    }
  },
  
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Check if password is correct
      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
      
      // Generate JWT token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
      });
      
      // Set JWT token in cookie - Use 'jwt' as the cookie name to match frontend middleware
      res.cookie('jwt', token, cookieOptions);
      
      // Create user object without password
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role || 'user'
      };
      
      // Return success response with user data
      res.json({
        success: true,
        message: 'Login successful',
        user: userData
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to login. Please try again.' 
      });
    }
  },
  
  // Logout user
  async logout(req, res) {
    try {
      res.clearCookie('jwt'); // Clear the 'jwt' cookie
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to logout. Please try again.' 
      });
    }
  },
  
  // Get current user
  async getMe(req, res) {
    try {
      // User is already attached to req by the auth middleware
      const userData = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name || '',
        role: req.user.role || 'user'
      };
      
      res.json({
        success: true,
        user: userData
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user data.' 
      });
    }
  }
};

module.exports = authController; 