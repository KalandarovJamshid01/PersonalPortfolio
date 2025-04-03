import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import {
  insertContactSchema,
  loginSchema,
  insertContentSchema,
} from '@shared/schema';
import { ZodError } from 'zod';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { getConnection } from './db';

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(
    session({
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: 'your-secret-key', // в реальном проекте использовать переменную окружения
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === 'production' },
    })
  );

  // Middleware для проверки аутентификации
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Публичные маршруты
  app.post('/api/contact', async (req, res) => {
    try {
      const contact = insertContactSchema.parse(req.body);
      const result = await storage.createContact(contact);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // Маршруты для работы с сообщениями
  app.get('/api/admin/contacts', requireAuth, async (_req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/admin/contacts/:id/read', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }
      const contact = await storage.markContactAsRead(id);
      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json(contact);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/admin/contacts/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid contact ID' });
      }
      const success = await storage.deleteContact(id);
      if (!success) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Маршруты для работы с контентом
  app.get('/api/admin/content', requireAuth, async (_req, res) => {
    try {
      const content = await storage.getContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

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
      const content = await storage.updateContent(id, value);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Маршруты для работы со статистикой
  app.get('/api/admin/statistics', requireAuth, async (_req, res) => {
    try {
      const pageViews = await storage.getPageViews();
      res.json(pageViews);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/page-view', async (req, res) => {
    try {
      const { path } = req.body;
      if (!path || typeof path !== 'string') {
        return res.status(400).json({ message: 'Invalid path' });
      }
      const pageView = await storage.incrementPageView(path);
      res.json(pageView);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Маршруты аутентификации
  // Find this route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.safeParse(req.body);
      if (!loginData.success) {
        return res.status(400).json({ message: 'Invalid login data' });
      }

      const { username, password } = loginData.data;
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Simple password comparison (not secure but works for demo)
      if (user.password !== password) {
        console.log('Password mismatch for user:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session data
      if (req.session) {
        req.session.userId = user.id;
        req.session.isAdmin = true;
      }

      return res.json({ success: true });
    } catch (error) {
      console.error('Login error:', error);
      return res
        .status(500)
        .json({ message: 'Error during login', details: error.message });
    }
  });

  app.post('/api/auth/logout', requireAuth, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/status', requireAuth, (req, res) => {
    res.json({ authenticated: true });
  });

  // Add this to routes.ts
  app.get('/api/test-db', async (req, res) => {
    try {
      const connection = await getConnection();
      res.json({ success: true, message: 'Database connection successful' });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
  return createServer(app);
}
