// MySQL Database Setup Script
const { createConnection } = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('Starting MySQL database setup...');
  
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set it to format mysql://username:password@hostname:port/database');
    process.exit(1);
  }
  
  // Extract database name from connection string
  const url = new URL(process.env.DATABASE_URL);
  const databaseName = url.pathname.substring(1); // Remove leading slash
  
  // Create a connection without database specification for initial setup
  const connectionUrl = process.env.DATABASE_URL.replace(databaseName, '');
  
  let connection;
  
  try {
    console.log('Connecting to MySQL server...');
    connection = await createConnection(connectionUrl);
    
    // Create database if it doesn't exist
    console.log(`Creating database "${databaseName}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`Database "${databaseName}" is ready.`);
    
    // Use the created database
    await connection.query(`USE \`${databaseName}\``);
    
    // Create tables
    console.log('Creating tables...');
    
    // Contacts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`contacts\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`is_read\` BOOLEAN DEFAULT false,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      )
    `);
    
    // Content table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`content\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`section\` VARCHAR(100) NOT NULL,
        \`key\` VARCHAR(100) NOT NULL,
        \`value\` TEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      )
    `);
    
    // Page views table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`page_views\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`path\` VARCHAR(255) NOT NULL,
        \`count\` INT DEFAULT 0,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      )
    `);
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      )
    `);
    
    // Check if admin user exists
    const [users] = await connection.query('SELECT * FROM `users` WHERE `username` = ?', ['admin']);
    
    // Add initial admin user if it doesn't exist
    if (users.length === 0) {
      console.log('Creating admin user...');
      await connection.query(
        'INSERT INTO `users` (`username`, `password`) VALUES (?, ?)',
        ['admin', 'admin123']
      );
    }
    
    // Add initial content if it doesn't exist
    const [content] = await connection.query('SELECT * FROM `content` LIMIT 1');
    
    if (content.length === 0) {
      console.log('Adding initial content...');
      
      const initialContent = [
        ['hero', 'title', 'Softy Software'],
        ['hero', 'subtitle', 'Цифровая трансформация бизнеса'],
        ['hero', 'description', 'Мы помогаем компаниям внедрять инновационные технологии и оптимизировать бизнес-процессы'],
        ['about', 'title', 'О нас'],
        ['about', 'description', 'Softy Software - команда экспертов в области разработки программного обеспечения с более чем 10-летним опытом работы в IT-индустрии'],
        ['services', 'title', 'Наши услуги'],
        ['services', 'subtitle', 'Что мы предлагаем'],
      ];
      
      for (const [section, key, value] of initialContent) {
        await connection.query(
          'INSERT INTO `content` (`section`, `key`, `value`) VALUES (?, ?, ?)',
          [section, key, value]
        );
      }
    }
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();