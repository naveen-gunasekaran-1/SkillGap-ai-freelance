const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Add workspace root to watched folders
config.watchFolders = [workspaceRoot];

// Build extra node modules map for pnpm workspace
const extraNodeModules = {};
const workspaceNodeModules = path.resolve(workspaceRoot, 'node_modules');
if (fs.existsSync(workspaceNodeModules)) {
  fs.readdirSync(workspaceNodeModules).forEach(dir => {
    extraNodeModules[dir] = path.resolve(workspaceNodeModules, dir);
  });
  
  // Also handle scoped packages in .pnpm
  const pnpmDir = path.resolve(workspaceNodeModules, '.pnpm');
  if (fs.existsSync(pnpmDir)) {
    fs.readdirSync(pnpmDir).forEach(dir => {
      if (dir.includes('@') || dir.includes('_')) {
        try {
          const pkgPath = path.resolve(pnpmDir, dir, 'node_modules');
          fs.readdirSync(pkgPath).forEach(pkg => {
            if (!extraNodeModules[pkg]) {
              extraNodeModules[pkg] = path.resolve(pkgPath, pkg);
            }
          });
        } catch (e) {
          // Ignore errors from non-package directories
        }
      }
    });
  }
}

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    workspaceNodeModules,
  ],
  extraNodeModules,
  disableHierarchicalLookup: false,
};

module.exports = config;
