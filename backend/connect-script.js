#!/usr/bin/env node

// This script launches your MCP server for Claude Desktop
const { spawn } = require('child_process');
const path = require('path');

// Path to your server script - adjust as needed
const serverPath = path.join(__dirname, 'dist', 'index.js');

// Launch the server process
const serverProcess = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Pipe standard IO to and from the server process
process.stdin.pipe(serverProcess.stdin);
serverProcess.stdout.pipe(process.stdout);
serverProcess.stderr.pipe(process.stderr);

// Handle server process exit
serverProcess.on('exit', (code) => {
  console.log(`MCP server exited with code ${code}`);
  process.exit(code);
});

// Handle parent process exit
process.on('SIGINT', () => {
  serverProcess.kill('SIGINT');
});

console.log('JobService connector started');