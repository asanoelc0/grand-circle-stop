import { Injectable, signal } from '@angular/core';
import { Lodging, Stop } from '../models/stop';
import { STOPS, TOTAL_KM, TOTAL_NIGHTS } from '../data/stops.data';

@Injectable({ providedIn: 'root' })
export class TripService {
  readonly stops: Stop[] = STOPS;
  readonly totalKm = TOTAL_KM;
  readonly totalNights = TOTAL_NIGHTS;

  /** 地図タブを開いたときにフォーカスする滞在地 */
  readonly focusStopId = signal<string | null>(null);

  byId(id: string): Stop | undefined {
    return this.stops.find((s) => s.id === id);
  }

  /** Google マップの経路 URL（緯度経度で確実に開く） */
  directionsUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  }

  /** 宿名でのGoogleマップ検索（施設ページに当たりやすい） */
  searchUrl(lodging: Lodging): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lodging.name} ${lodging.lat},${lodging.lng}`,
    )}`;
  }
}
