# grand-circle-stop

グランドサークル（ラスベガス発着）ロードトリップの **滞在地と宿の候補** をスマホで見るための Ionic + Angular アプリ。

## ルート

| # | 滞在地 | 泊 | 前地点から |
|---|--------|----|-----------|
| 1 | ラスベガス（出発） | 1泊 | – |
| 2 | ザイオン国立公園 | 経由 | 約260km / 2.7h |
| 3 | ブライスキャニオン | 1泊 | 約140km / 1.8h |
| 4 | アーチーズ国立公園（モアブ泊） | 2泊 | 約420km / 4.5h |
| 5 | モニュメントバレー | 1泊 | 約250km / 2.8h |
| 6 | ページ | 1泊 | 約200km / 2.2h |
| 7 | セドナ | 2泊 | 約260km / 3.0h |
| 8 | ラスベガス（帰着） | 1泊 | 約450km / 4.5h |

合計 約1,980km / 9泊。各滞在地に宿候補を3件ずつ（価格帯・立地メモ・公式サイト付き）。

## 画面

- **リストタブ** — 滞在地カードを順番に表示。宿をタップすると Google マップ／経路／公式サイトを開くシートが出る。
- **地図タブ** — Leaflet + OpenStreetMap にルートと滞在地ピンを表示。セグメントで「宿」ピンを重ねられる。ピンをタップすると下部にカードが出て、経路や詳細に飛べる。
- **詳細ページ** — 滞在地ごとの見どころと宿候補の一覧。

## 開発

```bash
npm install
npm start        # http://localhost:4200
npm run build    # dist/gcs へ出力
```

スマホ実機で見るときは `npx ng serve --host 0.0.0.0` で同一 LAN から開くか、`dist/gcs/browser` を静的ホスティングに置く。
Capacitor でネイティブ化する場合は `npm i @capacitor/core @capacitor/cli && npx cap init` から。

## データ

滞在地・宿のデータは [`src/app/data/stops.data.ts`](src/app/data/stops.data.ts) にまとまっている。宿を足す・入れ替えるときはここを編集する。
料金帯（$ / $$ / $$$）はおおよその目安、座標は施設のおおよその位置。営業期間・入園予約の要否はシーズンで変わるので、予約前に各公式サイトで確認すること。

## 公開（無料ホスティング）

バックエンドを持たない静的サイトなので、無料枠のホスティングでそのまま動く。

### GitHub Pages（設定済み）

`main` へのプッシュで `.github/workflows/deploy.yml` がビルドして公開する。
初回だけリポジトリの **Settings → Pages → Source** を **GitHub Actions** に切り替える必要がある。

公開URL: `https://asanoelc0.github.io/grand-circle-stop/`

サブパス配信になるので、ビルドは `npm run build:pages`（`--base-href /grand-circle-stop/` 付き）を使う。
ワークフローでは `index.html` を `404.html` にコピーして、`/stop/bryce` のような直リンクでも SPA に戻るようにしている。

### 他の無料枠を使う場合

Cloudflare Pages / Netlify / Vercel なら独自ドメイン直下に置けるので `--base-href` は不要。

- ビルドコマンド: `npm run build`
- 公開ディレクトリ: `dist/gcs/browser`
- SPA フォールバック: `/*` → `/index.html`（Netlify なら `_redirects` に `/* /index.html 200`）
