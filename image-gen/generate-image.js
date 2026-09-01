#!/usr/bin/env node
// OpenAI Images API (gpt-image-1) を使って画像を生成するCLIツール
// Usage: node generate-image.js "生成したい画像の説明" [--size 1024x1024] [--out output/foo.png]

const fs = require("fs");
const path = require("path");

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const args = { size: "1024x1024", out: null, prompt: null };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--size") {
      args.size = argv[++i];
    } else if (a === "--out") {
      args.out = argv[++i];
    } else {
      rest.push(a);
    }
  }
  args.prompt = rest.join(" ");
  return args;
}

async function main() {
  loadEnvFile(path.join(__dirname, ".env"));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error(
      "エラー: OPENAI_API_KEY が設定されていません。image-gen/.env に OPENAI_API_KEY=sk-... を設定してください。"
    );
    process.exit(1);
  }

  const { prompt, size, out } = parseArgs(process.argv.slice(2));
  if (!prompt) {
    console.error('使い方: node generate-image.js "生成したい画像の説明" [--size 1024x1024] [--out output/foo.png]');
    process.exit(1);
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size,
      n: 1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`OpenAI APIエラー (${response.status}): ${errText}`);
    process.exit(1);
  }

  const data = await response.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    console.error("画像データが返されませんでした。レスポンス:", JSON.stringify(data));
    process.exit(1);
  }

  const outputDir = path.join(__dirname, "output");
  fs.mkdirSync(outputDir, { recursive: true });

  const outPath = out
    ? path.resolve(__dirname, out)
    : path.join(outputDir, `image-${Date.now()}.png`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(b64, "base64"));

  console.log(`画像を生成しました: ${outPath}`);
}

main().catch((err) => {
  console.error("予期しないエラー:", err);
  process.exit(1);
});
