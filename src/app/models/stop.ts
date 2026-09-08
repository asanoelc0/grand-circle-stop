export type StopKind = 'stay' | 'via';

export interface Lodging {
  /** 宿名 */
  name: string;
  /** 種別（ホテル / ロッジ / グランピング など） */
  type: string;
  /** 価格帯の目安（$ = 〜$150, $$ = $150-300, $$$ = $300〜） */
  price: '$' | '$$' | '$$$';
  /** 位置 */
  lat: number;
  lng: number;
  /** ひとことメモ */
  note: string;
  /** 公式サイト */
  url?: string;
}

export interface Stop {
  id: string;
  /** 日程上の順番（1 始まり） */
  order: number;
  /** 地名（日本語） */
  name: string;
  /** 地名（英語・現地表記） */
  nameEn: string;
  /** 宿泊地か通過（休憩）地か */
  kind: StopKind;
  /** 想定泊数（via は 0） */
  nights: number;
  /** 中心座標 */
  lat: number;
  lng: number;
  /** 前の滞在地からの移動目安 */
  legFromPrev?: { km: number; hours: number };
  /** 見どころ・過ごし方 */
  highlights: string[];
  /** 宿候補 */
  lodgings: Lodging[];
}
