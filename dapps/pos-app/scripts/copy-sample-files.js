const fs = require("fs");
const path = require("path");

function copyIfMissing(src, dest) {
  const srcPath = path.join(process.cwd(), src);
  const destPath = path.join(process.cwd(), dest);

  if (!fs.existsSync(srcPath)) {
    console.log(`⏭ Skipped (source not found): ${src}`);
    return;
  }

  if (fs.existsSync(destPath)) {
    console.log(`⏭ Skipped (exists): ${dest}`);
    return;
  }

  fs.copyFileSync(srcPath, destPath);
  console.log(`✔ Copied: ${dest}`);
}

copyIfMissing(".env.example", ".env");
copyIfMissing("secrets.properties.mock", "android/secrets.properties");
