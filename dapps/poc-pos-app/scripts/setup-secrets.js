const fs = require("fs");
const path = require("path");

const secretsPath = path.join(process.cwd(), "android/secrets.properties");
const mockPath = path.join(process.cwd(), "secrets.properties.mock");

if (!fs.existsSync(secretsPath) && fs.existsSync(mockPath)) {
  fs.copyFileSync(mockPath, secretsPath);
  console.log(
    "✔ Copied secrets.properties.mock to android/secrets.properties - Dont use this for production releases, ask the mobile team for the actual file",
  );
} else if (fs.existsSync(secretsPath)) {
  console.log("android/secrets.properties already exists, skipping copy");
}
