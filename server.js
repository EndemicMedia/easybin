const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5050;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Security headers (relaxed CSP for external scripts)
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Relaxed CSP to allow external resources
    res.setHeader('Content-Security-Policy', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' https://js.puter.com https://api.puter.com https://cdn.jsdelivr.net; " +
        "connect-src 'self' https://api.puter.com https://js.puter.com https://ipapi.co https://text.pollinations.ai ws: wss:; " +
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
        "img-src 'self' data: blob:; " +
        "media-src 'self' blob:; " +
        "worker-src 'self'; " +
        "manifest-src 'self';"
    );
    
    next();
});

// Serve static files
app.use(express.static('.', {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        }
    }
}));

// SPA fallback - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 EasyBin server running at http://localhost:${PORT}`);
    console.log('✅ CORS enabled for external scripts');
    console.log('🔒 Security headers configured');
});