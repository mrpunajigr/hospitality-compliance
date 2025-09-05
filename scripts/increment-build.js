const fs = require('fs');
const path = require('path');

function incrementBuild() {
  const versionPath = path.join(__dirname, '../version.json');
  
  // Read current version
  let versionData = {
    major: 1,
    month: 8,
    day: 11,
    build: 1,
    alpha: '',
    lastBuildDate: new Date().toDateString()
  };
  
  if (fs.existsSync(versionPath)) {
    versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  }
  
  // Reset build counter if new day
  const today = new Date().toDateString();
  if (versionData.lastBuildDate !== today) {
    versionData.build = 1;
    versionData.alpha = '';
    versionData.lastBuildDate = today;
    
    // Update day if it's actually a new day
    const todayDate = new Date();
    versionData.day = todayDate.getDate();
    versionData.month = todayDate.getMonth() + 1;
  } else {
    versionData.build++;
  }
  
  // Generate version string
  const version = `v${versionData.major}.${versionData.month}.${versionData.day}.${String(versionData.build).padStart(3, '0')}${versionData.alpha}`;
  
  // Write to version.json
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write to public/version.js for runtime access
  fs.writeFileSync(
    path.join(__dirname, '../public/version.js'),
    `window.APP_VERSION = "${version}";
window.BUILD_TIME = "${new Date().toISOString()}";
window.BUILD_ENV = "${process.env.NODE_ENV || 'development'}";`
  );
  
  console.log(`🚀 Build ${version} generated at ${new Date().toLocaleString()}`);
}

incrementBuild();