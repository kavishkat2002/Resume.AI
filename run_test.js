const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const result = execSync('npm run build', { encoding: 'utf-8' });
  console.log('Build output:', result);
} catch (error) {
  console.error('Build error:', error.stdout);
}
