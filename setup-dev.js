// setup-dev.js - Untuk development lokal
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 Setup Development untuk Solo Youth Insights");
console.log("============================================\n");

rl.question("Masukkan API Key Gemini Anda: ", (apiKey) => {
  if (!apiKey || apiKey.length < 30) {
    console.error("❌ API Key tidak valid!");
    rl.close();
    return;
  }

  // Baca template
  let template = fs.readFileSync("assets/js/gemini-config.template.js", "utf8");

  // Replace placeholder
  template = template.replace(/{{GEMINI_API_KEY}}/g, apiKey);

  // Tulis file config
  fs.writeFileSync("assets/js/gemini-config.js", template);

  console.log("\n✅ Berhasil membuat gemini-config.js");
  console.log(`✅ API Key: ${apiKey.substring(0, 10)}...`);
  console.log("\n📁 File yang dibuat: assets/js/gemini-config.js");
  console.log("⚠️  Jangan commit file ini ke GitHub!");
  console.log("   (file ini sudah ada di .gitignore)");

  rl.close();
});
