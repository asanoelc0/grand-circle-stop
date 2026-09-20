# grand-circle-stop

米国グランドサークルのドライブ区間ごとに、**途中の町とその補給事情（ガソリン / スーパー / ドラッグストア）** を
ルート切り替え付きで一覧するツール。

## 収録コース

| コース | データ | ルート数 |
| --- | --- | --- |
| ザイオン国立公園 → ブライスキャニオン国立公園 | [`data/zion-bryce.json`](data/zion-bryce.json) | 4（王道 / 大型車迂回 / パングイッチ補給 / カナブ補給） |

## 使い方

```sh
python3 scripts/serve.py        # → http://localhost:8000/
```

別のコースを開く場合は `http://localhost:8000/?data=data/<id>.json`。

`python3 -m http.server` は `text/html` に charset を付けないため日本語が化けます。必ず `scripts/serve.py` を使ってください。

## 2つの表示

- **リスト** — マイル順に経由地を1行ずつ。行を開くと店舗の詳細。
- **地図** — 各地点の緯度経度から起こした位置関係図。ルートの線か A/B/C/D の記号を選ぶと切り替わります。寄り道は破線の枝、地点の丸は 緑＝3つ揃う / 橙＝一部 / 灰＝補給なし。

地図の線は地点どうしを直線で結んだ模式図で、道路そのものの形ではありません。

## コースを追加する

データを1枚書くだけです。ビューアはコース非依存で、`routes` からタブを組み立てます。

```sh
node scripts/validate.mjs data/<id>.json
```

スキーマと調査手順は [`.claude/skills/route-stop-planner/SKILL.md`](.claude/skills/route-stop-planner/SKILL.md)
にまとめてあります（Claude Code のスキルとして読み込まれます）。

## 注意

営業時間や店舗の有無は変わります。処方薬・大量の燃料・特殊な食料が必要なら、出発前に電話で確認してください。
冬季の UT-14 / UT-12 は積雪・閉鎖があるため <https://udottraffic.utah.gov/> で路面状況を確認のこと。
