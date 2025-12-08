const fs = require('fs');

const lockfile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

// Update root dependencies
lockfile.packages[''].dependencies.next = '16.0.7';
lockfile.packages[''].devDependencies['eslint-config-next'] = '16.0.7';

fs.writeFileSync('package-lock.json', JSON.stringify(lockfile, null, 2) + '\n');
console.log('Updated package-lock.json');
