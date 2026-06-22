# 宅建単語帳アプリ

お母さんの宅建合格をサポートするWebアプリ。

## 機能

- 単語帳（権利関係 50語）— タップで解説表示、チェックで理解済み管理
- AIテスト — Claude APIが毎回違う問題を生成、苦手単語を優先出題
- 進捗ダッシュボード — チェック率・苦手単語ランキング

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、値を設定。

```bash
cp .env.local.example .env.local
```

**Firebase設定**
1. [Firebaseコンソール](https://console.firebase.google.com/) でプロジェクト作成
2. Firestoreデータベースを作成（テストモードで開始）
3. プロジェクト設定からウェブアプリを追加して設定値を取得

**Anthropic API設定**
1. [Anthropicコンソール](https://console.anthropic.com/) でAPIキーを取得
2. `ANTHROPIC_API_KEY` に設定

### 3. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` でアクセス。

> **Firebaseなしでも動作確認できます**（チェック状態はページリロードでリセットされますが、UIは全て確認可能）

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx          # 単語帳ページ
│   ├── test/page.tsx     # テストページ
│   ├── progress/page.tsx # 進捗ページ
│   └── api/
│       └── generate-question/route.ts  # AI問題生成API
├── components/
│   └── WordCard.tsx      # 単語カードコンポーネント
├── data/
│   └── words.json        # 単語データ（権利関係50語）
├── lib/
│   ├── firebase.ts       # Firebase初期化
│   └── storage.ts        # Firestoreの読み書き
└── types/
    └── index.ts          # TypeScript型定義
```

## 今後の拡張

- [ ] 宅建業法・法令制限・税その他の単語追加（計500語）
- [ ] 学習履歴グラフ
- [ ] Vercelデプロイ
# takken-app
