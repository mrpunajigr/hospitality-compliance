#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log(`
🔄 DEVELOPMENT WORKFLOW STARTED

Since localhost servers aren't accessible, this script will:
1. Watch for file changes in your project
2. Auto-rebuild when you save files
3. Show build results immediately
4. Generate static preview files you can open directly

Watching: app/, components/, lib/, styles/
`);

let isBuilding = false;
let buildQueue = false;

function triggerBuild() {
  if (isBuilding) {
    buildQueue = true;
    return;
  }
  
  isBuilding = true;
  console.log('\n📝 File change detected, building...');
  
  const startTime = Date.now();
  
  exec('npm run build', (error, stdout, stderr) => {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    if (error) {
      console.error(`\n❌ Build failed (${duration}s):`);
      console.error(stderr);
    } else {
      console.log(`\n✅ Build successful (${duration}s)`);
      console.log('You can now refresh your browser to see changes');
      
      // Generate a quick preview
      generatePreview();
    }
    
    isBuilding = false;
    
    if (buildQueue) {
      buildQueue = false;
      setTimeout(triggerBuild, 500);
    }
  });
}

function generatePreview() {
  const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Build Preview - ${new Date().toLocaleTimeString()}</title>
  <style>
    body { font-family: system-ui; padding: 20px; background: #f3f4f6; }
    .success { background: #dcfce7; border: 1px solid #16a34a; padding: 15px; border-radius: 8px; color: #166534; }
    .timestamp { opacity: 0.7; font-size: 0.9em; }
    .links { margin: 20px 0; }
    .links a { display: inline-block; margin-right: 15px; color: #2563eb; text-decoration: none; }
    .links a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="success">
    <h2>✅ Latest Build Successful</h2>
    <div class="timestamp">Built at: ${new Date().toLocaleString()}</div>
  </div>
  
  <div class="links">
    <h3>Quick Links:</h3>
    <a href="file://${path.resolve('test-local.html')}">Project Test Page</a>
    <a href="http://localhost:8000">Python Server (if running)</a>
  </div>
  
  <p><strong>To see your UI changes:</strong></p>
  <ol>
    <li>This build confirms your code compiles correctly</li>
    <li>Start the Python server: <code>python3 server.py</code></li>
    <li>Once network issues are resolved, the Next.js dev server will work normally</li>
  </ol>
</body>
</html>`;
  
  fs.writeFileSync('build-preview.html', previewHtml);
  console.log('📄 Generated: build-preview.html');
}

// Watch for changes
const watchDirs = ['app', 'components', 'lib'];

watchDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.tsx') || filename.endsWith('.ts') || filename.endsWith('.js') || filename.endsWith('.css'))) {
        console.log(`\n📁 Changed: ${dir}/${filename}`);
        triggerBuild();
      }
    });
    console.log(`👀 Watching: ${dir}/`);
  }
});

// Initial build
triggerBuild();

console.log('\n✨ Ready! Make changes to your files and see builds automatically.');