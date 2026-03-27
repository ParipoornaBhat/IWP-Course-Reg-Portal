const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'src', 'pages');
const appFile = path.join(__dirname, '..', 'src', 'App.jsx');

console.log('\n--- Client Page Status Report ---\n');

try {
  const pages = fs.readdirSync(pagesDir).filter(file => file.endsWith('.jsx') || file.endsWith('.js'));
  const appContent = fs.readFileSync(appFile, 'utf8');

  console.log('| Page Component | Route | Role | Status |');
  console.log('|----------------|-------|------|--------|');

  pages.forEach(page => {
    const componentName = page.replace(/\.(jsx|js)$/, '');
    
    // Simple regex to find route path for this component
    const routeMatch = appContent.match(new RegExp(`<Route[^>]*path=["']([^"']+)["'][^>]*element={[^}]*<${componentName}[^>]*/>[^}]*}`, 's'));
    
    const route = routeMatch ? routeMatch[1] : (componentName === 'HomePage' ? '/' : 'Not Routed');
    
    // Check for ProtectedRoute role
    const roleMatch = appContent.match(new RegExp(`<ProtectedRoute[^>]*role=["']([^"']+)["'][^>]*>[^<]*<${componentName}`, 's'));
    const role = roleMatch ? roleMatch[1] : (route === 'Not Routed' ? '-' : 'Public');

    const status = fs.statSync(path.join(pagesDir, page)).size > 500 ? 'Implemented' : 'Seed/Small';

    console.log(`| ${componentName.padEnd(14)} | ${route.padEnd(5)} | ${role.padEnd(7)} | ${status.padEnd(12)} |`);
  });

  console.log('\n---------------------------------\n');
} catch (error) {
  console.error('Error generating status report:', error.message);
}
