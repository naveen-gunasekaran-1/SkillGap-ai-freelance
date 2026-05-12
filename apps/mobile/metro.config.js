const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');
const fs = require('fs');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

// Custom resolver to prevent pnpm store access
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ],
  disableHierarchicalLookup: true,
  // Intercept resolve to block .pnpm paths
  resolveRequest: (context, moduleName, platform) => {
    // Never allow direct .pnpm store paths
    if (moduleName.includes('.pnpm')) {
      throw new Error(`[Metro] Blocked attempt to load from pnpm store: ${moduleName}`);
    }
    
    // Use original resolver
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    
    // Fallback to default behavior
    return config.resolver.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
