#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Path to Claude Desktop configuration directory
// This path varies by OS - this is for macOS
const claudeConfigDir = path.join(
    process.env.APPDATA,
    'Claude'
);

// For Windows, use:
// const claudeConfigDir = path.join(process.env.APPDATA, 'Claude Desktop', 'Config');
// For Linux, use:
// const claudeConfigDir = path.join(process.env.HOME, '.config', 'Claude Desktop');

// Make sure the directory exists
if (!fs.existsSync(claudeConfigDir)) {
  console.error(`Claude Desktop config directory not found: ${claudeConfigDir}`);
  console.error('Make sure Claude Desktop is installed and has been run at least once.');
  process.exit(1);
}

// Read our package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const serverConfig = packageJson.claude?.mcpServers?.[0];

if (!serverConfig) {
  console.error('No MCP server configuration found in package.json');
  process.exit(1);
}

// Create registration JSON
const registration = {
  name: serverConfig.name,
  version: packageJson.version,
  description: packageJson.description || 'Job Service MCP Server',
  entrypoint: path.resolve(serverConfig.entrypoint),
  enabled: true
};

// Write to Claude's servers directory
const serversDir = path.join(claudeConfigDir, 'mcpServers');
if (!fs.existsSync(serversDir)) {
  fs.mkdirSync(serversDir, { recursive: true });
}

const registrationPath = path.join(serversDir, `${serverConfig.name}.json`);
fs.writeFileSync(registrationPath, JSON.stringify(registration, null, 2));

console.log(`Registered MCP server "${serverConfig.name}" with Claude Desktop`);
console.log(`Registration file: ${registrationPath}`);