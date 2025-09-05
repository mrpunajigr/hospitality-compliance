const fs = require('fs');
const path = require('path');

function markProduction() {
  const versionPath = path.join(__dirname, '../version.json');
  
  // Read current version
  let versionData = {
    major: 1,
    month: 8,
    day: 11,
    build: 1,
    alpha: 'p',
    lastBuildDate: new Date().toDateString()
  };
  
  if (fs.existsSync(versionPath)) {
    versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  }
  
  // Mark as production-ready by ensuring we have an alpha suffix
  if (!versionData.alpha) {
    versionData.alpha = 'p'; // Default production marker
  }
  
  // Generate production version string (without build number)
  const prodVersion = `v${versionData.major}.${versionData.month}.${versionData.day}${versionData.alpha}`;
  const devVersion = `v${versionData.major}.${versionData.month}.${versionData.day}.${String(versionData.build).padStart(3, '0')}${versionData.alpha}`;
  
  // Write to version.json (keep full data for development)
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
  
  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Write to public/version.js for runtime access
  fs.writeFileSync(
    path.join(__dirname, '../public/version.js'),
    `window.APP_VERSION = "${devVersion}";
window.PRODUCTION_VERSION = "${prodVersion}";
window.BUILD_TIME = "${new Date().toISOString()}";
window.BUILD_ENV = "${process.env.NODE_ENV || 'development'}";`
  );
  
  console.log(`🏭 Production version ${prodVersion} (dev: ${devVersion}) marked at ${new Date().toLocaleString()}`);
  console.log('💡 Use this version for production deployments');
}

markProduction();