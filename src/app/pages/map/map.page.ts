import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  ViewDidEnter,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { navigateOutline, scanOutline } from 'ionicons/icons';
import * as L from 'leaflet';
import { TripService } from '../../services/trip.service';

type LayerMode = 'stops' | 'lodgings';

interface Selection {
  title: string;
  subtitle: string;
  note: string;
  lat: number;
  lng: number;
  stopId?: string;
}

@Component({
  selector: 'app-map',
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
  ],
  templateUrl: './map.page.html',
  styleUrl: './map.page.scss',
})
export class MapPage implements AfterViewInit, OnDestroy, ViewDidEnter {
  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');
  readonly trip = inject(TripService);

  readonly layer = signal<LayerMode>('stops');
  readonly selected = signal<Selection | null>(null);

  private map?: L.Map;
  private stopLayer?: L.LayerGroup;
  private lodgingLayer?: L.LayerGroup;
  private routeLine?: L.Polyline;
  private resizeObserver?: ResizeObserver;

  constructor() {
    addIcons({ scanOutline, navigateOutline });
  }

  ngAfterViewInit(): void {
    this.initMap();
    // タブ切り替えや画面回転でコンテナサイズが変わったら再計算する
    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapEl().nativeElement);
  }

  /** タブ復帰時はコンテナがまだ 0px のことがあるので、描画後に測り直す */
  ionViewDidEnter(): void {
    setTimeout(() => this.refresh(), 50);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  private refresh(): void {
    this.map?.invalidateSize();
    if (this.applyPendingFocus()) {
      return;
    }
    if (!this.selected()) {
      this.fitRoute();
    }
  }

  onLayerChange(event: Event): void {
    const value = (event as CustomEvent<{ value: LayerMode }>).detail.value;
    this.layer.set(value);
    this.syncLayers();
  }

  fitRoute(): void {
    if (!this.map || !this.routeLine) {
      return;
    }
    this.selected.set(null);
    this.map.fitBounds(this.routeLine.getBounds(), { padding: [32, 32] });
  }

  openDirections(sel: Selection): void {
    window.open(this.trip.directionsUrl(sel.lat, sel.lng), '_blank');
  }

  private initMap(): void {
    const map = L.map(this.mapEl().nativeElement, {
      zoomControl: false,
      attributionControl: true,
    });
    this.map = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const points = this.trip.stops.map((s) => [s.lat, s.lng] as L.LatLngTuple);
    this.routeLine = L.polyline(points, {
      color: '#c1440e',
      weight: 3,
      opacity: 0.8,
      dashArray: '6 6',
    }).addTo(map);

    // 発着地のように同じ座標が重なる場合はピンを横にずらして両方タップできるようにする
    const seen = new Map<string, number>();

    this.stopLayer = L.layerGroup(
      this.trip.stops.map((stop) => {
        const key = `${stop.lat},${stop.lng}`;
        const dup = seen.get(key) ?? 0;
        seen.set(key, dup + 1);

        return L.marker([stop.lat, stop.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div class="gcs-pin ${stop.kind === 'via' ? 'via' : ''}">${stop.order}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13 + dup * 26, 13],
          }),
          // 宿ピンと重なっても滞在地ピンを必ずタップできるように前面に置く
          zIndexOffset: 1000,
        }).on('click', () => {
          this.selected.set({
            title: stop.name,
            subtitle: `${stop.nameEn}・${stop.kind === 'stay' ? `${stop.nights}泊` : '経由'}`,
            note: stop.highlights[0] ?? '',
            lat: stop.lat,
            lng: stop.lng,
            stopId: stop.id,
          });
        });
      }),
    );

    this.lodgingLayer = L.layerGroup(
      this.trip.stops.flatMap((stop) =>
        stop.lodgings.map((lodging) =>
          L.marker([lodging.lat, lodging.lng], {
            icon: L.divIcon({
              className: '',
              html: '<div class="gcs-pin lodging"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            }),
          }).on('click', () => {
            this.selected.set({
              title: lodging.name,
              subtitle: `${stop.name}・${lodging.type}・${lodging.price}`,
              note: lodging.note,
              lat: lodging.lat,
              lng: lodging.lng,
              stopId: stop.id,
            });
          }),
        ),
      ),
    );

    this.syncLayers();
    this.refresh();
  }

  private syncLayers(): void {
    if (!this.map || !this.stopLayer || !this.lodgingLayer) {
      return;
    }
    // 滞在地ピンは常時表示、宿ピンはセグメント選択時のみ重ねる
    this.stopLayer.addTo(this.map);
    if (this.layer() === 'lodgings') {
      this.lodgingLayer.addTo(this.map);
    } else {
      this.map.removeLayer(this.lodgingLayer);
    }
  }

  /** リストから「地図で見る」で来たときに該当地点へ寄る。寄せたら true。 */
  private applyPendingFocus(): boolean {
    const id = this.trip.focusStopId();
    if (!id || !this.map) {
      return false;
    }
    const stop = this.trip.byId(id);
    this.trip.focusStopId.set(null);
    if (!stop) {
      return false;
    }
    this.map.setView([stop.lat, stop.lng], 11, { animate: true });
    this.selected.set({
      title: stop.name,
      subtitle: `${stop.nameEn}・${stop.kind === 'stay' ? `${stop.nights}泊` : '経由'}`,
      note: stop.highlights[0] ?? '',
      lat: stop.lat,
      lng: stop.lng,
      stopId: stop.id,
    });
    return true;
  }
}
