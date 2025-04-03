import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import session from 'express-session';
import MemoryStoreFactory from 'memorystore';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize environment variables
dotenv.config();

// Your database connection string should come from .env
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();
const PORT = process.env.PORT || 5000;
const MemoryStore = MemoryStoreFactory(session);

// Format dates to be compatible with the frontend's expectations
function formatDatesInObject(obj) {
  if (!obj) return obj;

  const result = { ...obj };
  for (const key in result) {
    if (result[key] instanceof Date) {
      // Format dates in a way the frontend components expect
      // Use numeric values that are always valid JavaScript dates
      result[key] = result[key].getTime();
    } else if (
      typeof result[key] === 'string' &&
      (key.includes('_at') || key.includes('date') || key.includes('time'))
    ) {
      try {
        // Try to parse the string as a date
        const date = new Date(result[key]);
        // If it's a valid date, convert to timestamp
        if (!isNaN(date.getTime())) {
          result[key] = date.getTime();
        }
      } catch (e) {
        // If parsing fails, keep the original value
        console.warn(`Failed to parse date for ${key}: ${result[key]}`);
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Recursively process nested objects
      result[key] = formatDatesInObject(result[key]);
    }
  }
  return result;
}

// Convert Date to MySQL datetime format
function toMySQLDateTime(date = new Date()) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Function to fix invalid dates in the database
async function fixDatabaseDates() {
  console.log('Checking and fixing database dates...');

  try {
    const connection = await getConnection();

    // 1. Fix contacts table
    await connection.query(`
      UPDATE contacts 
      SET created_at = NOW() 
      WHERE created_at IS NULL 
         OR created_at = '0000-00-00 00:00:00'
         OR STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') IS NULL
    `);

    // 2. Fix content table
    await connection.query(`
      UPDATE content 
      SET updated_at = NOW() 
      WHERE updated_at IS NULL 
         OR updated_at = '0000-00-00 00:00:00'
         OR STR_TO_DATE(updated_at, '%Y-%m-%d %H:%i:%s') IS NULL
    `);

    // 3. Fix page_views table
    await connection.query(`
      UPDATE page_views 
      SET updated_at = NOW() 
      WHERE updated_at IS NULL 
         OR updated_at = '0000-00-00 00:00:00'
         OR STR_TO_DATE(updated_at, '%Y-%m-%d %H:%i:%s') IS NULL
    `);

    // 4. Fix users table
    await connection.query(`
      UPDATE users 
      SET created_at = NOW() 
      WHERE created_at IS NULL 
         OR created_at = '0000-00-00 00:00:00'
         OR STR_TO_DATE(created_at, '%Y-%m-%d %H:%i:%s') IS NULL
    `);

    console.log('Date fix complete!');
    await connection.end();
  } catch (error) {
    console.error('Error fixing dates:', error);
  }
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }
      console.log(logLine);
    }
  });

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'softy-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
    store: new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    }),
  })
);

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, 'Имя пользователя обязательно'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

const insertContactSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Пожалуйста, введите корректный email'),
  message: z.string().min(10, 'Сообщение должно содержать минимум 10 символов'),
});

// Database connection
async function getConnection() {
  return await mysql.createConnection(DATABASE_URL);
}

// Database helper functions
async function getUserByUsername(username) {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    await connection.end();

    if (rows.length > 0) {
      return formatDatesInObject(rows[0]);
    }
    return undefined;
  } catch (error) {
    console.error('Database error in getUserByUsername:', error);
    return undefined;
  }
}

async function createContact(contact) {
  try {
    const connection = await getConnection();
    const now = toMySQLDateTime();

    const [result] = await connection.execute(
      'INSERT INTO contacts (name, email, message, is_read, created_at) VALUES (?, ?, ?, ?, ?)',
      [contact.name, contact.email, contact.message, false, now]
    );

    // Get the inserted contact
    const [rows] = await connection.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [result.insertId]
    );

    await connection.end();
    return formatDatesInObject(rows[0]);
  } catch (error) {
    console.error('Database error in createContact:', error);
    throw error;
  }
}

async function getContacts() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    await connection.end();
    return rows.map((row) => formatDatesInObject(row));
  } catch (error) {
    console.error('Database error in getContacts:', error);
    throw error;
  }
}

async function markContactAsRead(id) {
  try {
    const connection = await getConnection();
    await connection.execute(
      'UPDATE contacts SET is_read = TRUE WHERE id = ?',
      [id]
    );

    // Get the updated contact
    const [rows] = await connection.execute(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    await connection.end();
    return formatDatesInObject(rows[0]);
  } catch (error) {
    console.error('Database error in markContactAsRead:', error);
    throw error;
  }
}

async function deleteContact(id) {
  try {
    const connection = await getConnection();

    // Check if contact exists first
    const [checkRows] = await connection.execute(
      'SELECT id FROM contacts WHERE id = ?',
      [id]
    );

    if (checkRows.length === 0) {
      await connection.end();
      return false;
    }

    await connection.execute('DELETE FROM contacts WHERE id = ?', [id]);

    await connection.end();
    return true;
  } catch (error) {
    console.error('Database error in deleteContact:', error);
    throw error;
  }
}

async function getContent() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM content ORDER BY section, `key`'
    );
    await connection.end();
    return rows.map((row) => formatDatesInObject(row));
  } catch (error) {
    console.error('Database error in getContent:', error);
    throw error;
  }
}

async function updateContent(id, value) {
  try {
    const connection = await getConnection();
    const now = toMySQLDateTime();

    await connection.execute(
      'UPDATE content SET value = ?, updated_at = ? WHERE id = ?',
      [value, now, id]
    );

    // Get the updated content
    const [rows] = await connection.execute(
      'SELECT * FROM content WHERE id = ?',
      [id]
    );

    await connection.end();
    return formatDatesInObject(rows[0]);
  } catch (error) {
    console.error('Database error in updateContent:', error);
    throw error;
  }
}

async function incrementPageView(path) {
  try {
    const connection = await getConnection();
    const now = toMySQLDateTime();

    // Check if path exists
    const [checkRows] = await connection.execute(
      'SELECT * FROM page_views WHERE path = ?',
      [path]
    );

    if (checkRows.length > 0) {
      // Update existing view
      const existing = checkRows[0];
      await connection.execute(
        'UPDATE page_views SET count = ?, updated_at = ? WHERE id = ?',
        [existing.count + 1, now, existing.id]
      );

      // Get updated record
      const [rows] = await connection.execute(
        'SELECT * FROM page_views WHERE id = ?',
        [existing.id]
      );

      await connection.end();
      return formatDatesInObject(rows[0]);
    } else {
      // Create new view
      const [result] = await connection.execute(
        'INSERT INTO page_views (path, count, updated_at) VALUES (?, ?, ?)',
        [path, 1, now]
      );

      // Get the inserted record
      const [rows] = await connection.execute(
        'SELECT * FROM page_views WHERE id = ?',
        [result.insertId]
      );

      await connection.end();
      return formatDatesInObject(rows[0]);
    }
  } catch (error) {
    console.error('Database error in incrementPageView:', error);
    throw error;
  }
}

async function getPageViews() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM page_views ORDER BY count DESC'
    );
    await connection.end();
    return rows.map((row) => formatDatesInObject(row));
  } catch (error) {
    console.error('Database error in getPageViews:', error);
    throw error;
  }
}

// API Routes

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const contactData = insertContactSchema.safeParse(req.body);
    if (!contactData.success) {
      return res
        .status(400)
        .json({ message: contactData.error.errors[0].message });
    }

    const result = await createContact(contactData.data);
    res.json(result);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all contacts (admin only)
app.get('/api/admin/contacts', requireAuth, async (_req, res) => {
  try {
    const contacts = await getContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark contact as read
app.post('/api/admin/contacts/:id/read', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    const contact = await markContactAsRead(id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete contact
app.delete('/api/admin/contacts/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid contact ID' });
    }

    const success = await deleteContact(id);
    if (!success) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all content
app.get('/api/admin/content', requireAuth, async (_req, res) => {
  try {
    const content = await getContent();
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update content
app.patch('/api/admin/content/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }

    const { value } = req.body;
    if (!value || typeof value !== 'string') {
      return res.status(400).json({ message: 'Invalid value' });
    }

    const content = await updateContent(id, value);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get page views statistics
app.get('/api/admin/statistics', requireAuth, async (_req, res) => {
  try {
    const pageViews = await getPageViews();
    res.json(pageViews);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Increment page view
app.post('/api/page-view', async (req, res) => {
  try {
    const { path } = req.body;
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ message: 'Invalid path' });
    }

    const pageView = await incrementPageView(path);
    res.json(pageView);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const loginData = loginSchema.safeParse(req.body);
    if (!loginData.success) {
      return res.status(400).json({ message: 'Invalid login data' });
    }

    const { username, password } = loginData.data;
    console.log('Login attempt for user:', username);

    const user = await getUserByUsername(username);
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Found user, comparing password...');

    if (user.password !== password) {
      console.log('Password mismatch for user:', username);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;
    req.session.isAdmin = true;

    return res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res
      .status(500)
      .json({ message: 'Error during login', details: error.message });
  }
});

// Logout endpoint
app.post('/api/auth/logout', requireAuth, (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// Auth status check
app.get('/api/auth/status', requireAuth, (req, res) => {
  res.json({ authenticated: true });
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.end();
    res.json({ success: true, message: 'Database connection successful' });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Error details:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Fix database dates before starting the server
fixDatabaseDates()
  .then(() => {
    // Serve static files from the dist directory
    const distPath = path.join(__dirname, 'dist/public');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));

      // Handle SPA routing - send all non-API requests to React app
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });

      // Start the server
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error(`Error: Build directory not found at ${distPath}`);
      console.error(
        'Please run "npm run build" before starting the production server'
      );
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('Failed to fix database dates:', error);
    process.exit(1);
  });
