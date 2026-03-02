const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
    if (global.__ibmsspEnvLoaded) return;

    const appRoot = path.resolve(__dirname, '..');
    const envPath = path.join(appRoot, '.env');
    const prodEnvPath = path.join(appRoot, '.env.production');

    // In production, prefer .env.production, then fill any missing values from .env
    if (process.env.NODE_ENV === 'production' && fs.existsSync(prodEnvPath)) {
        dotenv.config({ path: prodEnvPath, override: false });
    }

    if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: false });
    }

    global.__ibmsspEnvLoaded = true;
}

module.exports = { loadEnv };
