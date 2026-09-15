// Runs after `expo prebuild` (postprebuild). Prebuild regenerates android/ from
// scratch, wiping any android/secrets.properties, so seed a mock one from the
// repo-root secrets.properties.mock for local/dev builds. CI overwrites
// android/secrets.properties with the real credentials before building a
// release. See plugins/withAndroidVariants.js.
const fs = require('fs');
const path = require('path');

const target = path.join(process.cwd(), 'android', 'secrets.properties');
const mock = path.join(process.cwd(), 'secrets.properties.mock');

if (fs.existsSync(target)) {
  console.log('android/secrets.properties already exists, skipping copy');
} else if (fs.existsSync(mock)) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(mock, target);
  console.log(
    '✔ Copied secrets.properties.mock -> android/secrets.properties (mock keys; ' +
      'CI / the mobile team provide the real file for distribution builds)',
  );
} else {
  console.warn('⚠ secrets.properties.mock not found; android/secrets.properties not seeded');
}
