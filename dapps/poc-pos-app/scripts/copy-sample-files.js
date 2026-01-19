const fs = require("fs");
const path = require("path");

function copyIfMissing(src, dest) {
  const srcPath = path.join(process.cwd(), src);
  const destPath = path.join(process.cwd(), dest);

  if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✔ Copied: ${dest}`);
  } else if (fs.existsSync(destPath)) {
    console.log(`⏭ Skipped (exists): ${dest}`);
  }
}

copyIfMissing(".env.example", ".env");
copyIfMissing("secrets.properties.mock", "android/secrets.properties");
