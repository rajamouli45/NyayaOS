const { execSync } = require('child_process');

const filter = process.env.TURBO_FILTER || process.env.TARGET_SERVER || process.env.MCP_SERVER || '';
let server = '';

if (filter.includes('identity')) {
    server = 'identity-server';
} else if (filter.includes('document')) {
    server = 'document-server';
} else if (filter.includes('registry')) {
    server = 'registry-server';
} else if (filter.includes('research')) {
    server = 'research-server';
} else {
    // Default fallback to identity-server
    console.log(`[Start Script] No specific server env found. Defaulting to identity-server.`);
    server = 'identity-server';
}

console.log(`[Start Script] Starting target workspace MCP server: ${server}`);
console.log(`[Start Script] Running command: npm run start -w ${server}`);

try {
    execSync(`npm run start -w ${server}`, { stdio: 'inherit' });
} catch (err) {
    console.error(`[Start Script] Error executing server start command:`, err.message || err);
    process.exit(1);
}
