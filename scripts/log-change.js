const fs = require('fs');
const path = require('path');

function logChange(type, description) {
  const versionPath = path.join(__dirname, '../version.json');
  
  if (!fs.existsSync(versionPath)) {
    console.error('❌ version.json not found. Run npm run dev first to generate version.');
    process.exit(1);
  }
  
  const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  const versionString = `v${version.major}.${version.month}.${version.day}.${String(version.build).padStart(3, '0')}${version.alpha}`;
  
  const logEntry = `### ${versionString} (${new Date().toISOString().split('T')[0]}) - ${type.toUpperCase()}
- **${getEmoji(type)} ${type.toUpperCase()}**: ${description}
- **🕐 Build Time**: ${new Date().toLocaleString()}
- **🔧 Environment**: ${process.env.NODE_ENV || 'development'}

`;

  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  
  // Create CHANGELOG.md if it doesn't exist
  if (!fs.existsSync(changelogPath)) {
    fs.writeFileSync(changelogPath, `# Changelog

All notable changes to the Hospitality Compliance SaaS project will be documented in this file.

`);
  }

  // Prepend to CHANGELOG.md
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  fs.writeFileSync(changelogPath, logEntry + changelog);
  
  console.log(`📝 Logged change: ${type} - ${description}`);
  console.log(`🔖 Version: ${versionString}`);
}

function getEmoji(type) {
  const emojis = {
    'feature': '🎯',
    'fix': '🐛',
    'enhancement': '✨',
    'performance': '⚡',
    'technical': '🔧',
    'design': '🎨',
    'security': '🔒',
    'docs': '📚'
  };
  return emojis[type] || '📝';
}

// Validate arguments
if (process.argv.length < 4) {
  console.error('Usage: node scripts/log-change.js <type> <description>');
  console.error('Types: feature, fix, enhancement, performance, technical, design, security, docs');
  console.error('Example: node scripts/log-change.js "fix" "Fixed upload button styling"');
  process.exit(1);
}

logChange(process.argv[2], process.argv[3]);