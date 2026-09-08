import { Component, computed, inject, input } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { ellipseOutline, locationOutline, openOutline } from 'ionicons/icons';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-detail',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonIcon,
    IonButton,
    IonChip,
  ],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage {
  /** ルートパラメータ :id（withComponentInputBinding） */
  readonly id = input.required<string>();

  readonly trip = inject(TripService);
  readonly stop = computed(() => this.trip.byId(this.id()));

  constructor() {
    addIcons({ ellipseOutline, locationOutline, openOutline });
  }

  open(url: string): void {
    window.open(url, '_blank');
  }
}
