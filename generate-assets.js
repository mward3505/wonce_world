const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

function generateImage(filename, width, height, bgColor = '#667EEA', text = 'W') {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${Math.floor(width * 0.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, filename), buffer);
  console.log(`Created ${filename}`);
}

generateImage('icon.png', 1024, 1024);
generateImage('adaptive-icon.png', 1024, 1024);
generateImage('splash.png', 1242, 2436, '#667EEA', '');
generateImage('favicon.png', 32, 32, '#667EEA', 'W');

console.log('All assets created!');
