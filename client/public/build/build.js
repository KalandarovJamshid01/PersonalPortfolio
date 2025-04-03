const fs = require('fs');
const path = require('path');

// Ensure server/public directory exists
const publicDir = path.join(__dirname, 'server', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy from dist to server/public
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, publicDir, { recursive: true });
  console.log('Successfully copied build files to server/public');
} else {
  console.error(
    'Error: dist directory does not exist. Run npm run build first.'
  );
  process.exit(1);
}
