# image-gen

OpenAIの画像生成API(`gpt-image-1`)を呼び出して画像を生成するCLIツールです。
Claude Codeへの指示から画像生成したい場合、このツールをBash経由で実行させることで連携できます。

## セットアップ

1. OpenAIのAPIキーを取得する(https://platform.openai.com/api-keys)
2. `image-gen/.env.example` を `image-gen/.env` にコピーし、`OPENAI_API_KEY` に実際のキーを設定する

```bash
cp image-gen/.env.example image-gen/.env
# .env を編集して OPENAI_API_KEY を設定
```

`.env` はGit管理対象外(`.gitignore`)なので、APIキーがリポジトリにコミットされることはありません。

## 使い方

```bash
cd image-gen
node generate-image.js "夕焼けの中を飛ぶ鳥のイラスト"
```

生成された画像は `image-gen/output/image-<timestamp>.png` に保存されます。

出力先やサイズを指定する場合:

```bash
node generate-image.js "猫のロゴ" --size 1024x1024 --out logos/cat.png
```

- `--size`: `1024x1024` / `1024x1536` / `1536x1024` など(省略時は `1024x1024`)
- `--out`: 保存先パス(`image-gen` ディレクトリからの相対パス。省略時は `output/` 配下に自動命名)

## Claude Codeからの連携イメージ

Claude Codeに「〇〇の画像を生成して」と指示すると、Claude CodeがBashツール経由で

```bash
node image-gen/generate-image.js "〇〇"
```

を実行し、生成された画像ファイルを確認・ユーザーに提示できます。
