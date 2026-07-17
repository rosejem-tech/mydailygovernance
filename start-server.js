const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8088;

// Helper to get local network IP addresses
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
            const address = interfaces[k][k2];
            // Support both Node 18+ family name changes (numeric vs string)
            const isIPv4 = address.family === 'IPv4' || address.family === 4;
            if (isIPv4 && !address.internal) {
                addresses.push(address.address);
            }
        }
    }
    return addresses;
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Handle path resolution
    let filePath = req.url === '/' || req.url === '' ? './index.html' : '.' + req.url;
    filePath = filePath.split('?')[0].split('#')[0];
    
    // Resolve absolute path safely
    const resolvedPath = path.resolve(__dirname, filePath);
    
    // Simple directory traversal protection
    if (!resolvedPath.startsWith(path.resolve(__dirname))) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }
    
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(resolvedPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 File Not Found');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n==================================================');
    console.log('  💼 MY DAILY GOVERNANCE JOURNAL - MOBILE HOST');
    console.log('==================================================\n');
    console.log(`Server running locally at:`);
    console.log(`👉 http://localhost:${PORT}\n`);
    
    const ips = getLocalIPs();
    if (ips.length > 0) {
        console.log('To access from your MOBILE PHONE:');
        console.log('1. Make sure your phone and computer are on the same Wi-Fi network.');
        console.log('2. Open your mobile browser and enter one of these URLs:\n');
        ips.forEach(ip => {
            console.log(`   📱 http://${ip}:${PORT}`);
        });
        console.log('\n3. Once loaded in Safari or Chrome, tap "Add to Home Screen"');
        console.log('   to install it as a native-like mobile app!\n');
    } else {
        console.log('⚠️ No active local network IP address found.');
        console.log('Please make sure you are connected to Wi-Fi to access from your phone.');
    }
    console.log('==================================================');
    console.log('Press Ctrl+C to stop the server.\n');
});
