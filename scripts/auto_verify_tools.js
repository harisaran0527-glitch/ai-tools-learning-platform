const fs = require('fs');
const path = require('path');
const https = require('https');
const glob = require('glob');

// Directory containing category TypeScript files
const categoriesDir = path.join(__dirname, '..', 'src', 'data', 'catalog', 'categories');

// Path to verification cache
const cachePath = path.join(__dirname, '..', 'src', 'data', 'catalog', 'url_verification_cache.json');
let urlCache = {};
if (fs.existsSync(cachePath)) {
  try {
    urlCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {
    console.error('Failed to parse verification cache:', e);
  }
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        resolve('verified');
      } else if (res.statusCode === 403) {
        resolve('bot_blocked');
      } else {
        resolve('needs_review');
      }
    });
    req.on('error', () => resolve('needs_review'));
    req.on('timeout', () => { req.destroy(); resolve('needs_review'); });
    req.end();
  });
}

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = /("officialUrl"\s*:\s*"([^"]+)")\s*,\s*\n\s*"officialStatus"\s*:\s*"([^"]+)"/g;
  let modified = false;
  const promises = [];
  content = content.replace(regex, (match, urlKey, url, currentStatus) => {
    const cached = urlCache[url];
    if (cached && (cached === 'verified' || cached === 'bot_blocked')) {
      if (cached !== currentStatus) {
        modified = true;
        return `${urlKey},\n    "officialStatus": "${cached}"`;
      }
      return match;
    }
    // If not cached, perform verification
    const p = checkUrl(url).then((newStatus) => {
      if (newStatus === 'verified' || newStatus === 'bot_blocked') {
        urlCache[url] = newStatus;
        modified = true;
        return `${urlKey},\n    "officialStatus": "${newStatus}"`;
      } else {
        // keep original status (e.g., "unavailable" or "blocked")
        return match;
      }
    });
    promises.push(p);
    return match; // placeholder, will be replaced after async resolution
  });

  return Promise.all(promises).then((replacements) => {
    // Apply async replacements sequentially
    let finalContent = content;
    let idx = 0;
    finalContent = finalContent.replace(regex, (match) => {
      const repl = replacements[idx++] || match;
      return repl;
    });
    if (modified) {
      fs.writeFileSync(filePath, finalContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
    return modified;
  });
}

(async () => {
  const files = await new Promise((res, rej) => {
    glob('*.ts', { cwd: categoriesDir }, (err, files) => {
      if (err) rej(err);
      else res(files);
    });
  });

  for (const file of files) {
    const filePath = path.join(categoriesDir, file);
    // eslint-disable-next-line no-await-in-loop
    await updateFile(filePath);
  }

  // Write back cache
  fs.writeFileSync(cachePath, JSON.stringify(urlCache, null, 2), 'utf8');
})();
// Legacy code removed. The script now updates verification statuses based on cache and live checks.
