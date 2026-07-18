import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Deprecated terms configuration
// Key is search pattern, value is warning message
const DEPRECATED_PATTERNS = [
    {
        pattern: /node-intensity/i,
        message: 'Found deprecated frontend flowchart node ID "node-intensity". Use "node-identity" instead.'
    },
    {
        pattern: /Explainability\s+Auditor/i,
        message: 'Found deprecated term "Explainability Auditor". Use "Explainability Engine" (or Explainability Service / Explainability Summary) instead.'
    },
    {
        pattern: /\bLegal\s+MCP\b/i,
        message: 'Found deprecated term "Legal MCP". Use "Legal Research MCP" instead.'
    }
];

// Include files/folders list and exclude files/folders list
const EXCLUDE_DIRS = [
    'node_modules',
    '.git',
    '.gemini',
    'dist',
    'brain'
];

const EXCLUDE_FILES = [
    'validate_terminology.js',
    'Naming.md',
    'db.json',
    'timeline.log',
    'status.txt',
    'status_utf8.txt',
    'diff.txt',
    'diff_utf8.txt',
    'api.log'
];

let violationsCount = 0;

function checkFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(rootDir, filePath);

        DEPRECATED_PATTERNS.forEach(({ pattern, message }) => {
            const matches = content.match(pattern);
            if (matches) {
                // Find line number and text for better reporting
                const lines = content.split('\n');
                lines.forEach((lineText, idx) => {
                    if (pattern.test(lineText)) {
                        console.error(`❌ [Terminology Error] ${relativePath}:${idx + 1}`);
                        console.error(`   > Line: "${lineText.trim()}"`);
                        console.error(`   > Reason: ${message}\n`);
                        violationsCount++;
                    }
                });
            }
        });
    } catch (e) {
        // Skip binary or unreadable files quietly
    }
}

function scanDir(dirPath) {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(file)) {
                scanDir(fullPath);
            }
        } else if (stat.isFile()) {
            if (!EXCLUDE_FILES.includes(file)) {
                checkFile(fullPath);
            }
        }
    });
}

console.log('🔍 Starting terminology compliance validation check...');
scanDir(rootDir);

if (violationsCount > 0) {
    console.error(`🚨 Compliance Failure: Found ${violationsCount} violation(s) of deprecated terms.`);
    process.exit(1);
} else {
    console.log('✅ Success: Terminology compliance check passed perfectly!');
    process.exit(0);
}
