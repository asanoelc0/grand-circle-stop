import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ActionSheetButton,
  ActionSheetController,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowDownOutline,
  carOutline,
  chevronForwardOutline,
  locationOutline,
  mapOutline,
  moonOutline,
} from 'ionicons/icons';
import { Lodging, Stop } from '../../models/stop';
import { TripService } from '../../services/trip.service';

@Component({
  selector: 'app-list',
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
    IonChip,
  ],
  templateUrl: './list.page.html',
  styleUrl: './list.page.scss',
})
export class ListPage {
  readonly trip = inject(TripService);
  private readonly router = inject(Router);
  private readonly actionSheetCtrl = inject(ActionSheetController);

  constructor() {
    addIcons({
      mapOutline,
      carOutline,
      moonOutline,
      locationOutline,
      arrowDownOutline,
      chevronForwardOutline,
    });
  }

  showOnMap(stop: Stop): void {
    this.trip.focusStopId.set(stop.id);
    this.router.navigate(['/tabs/map']);
  }

  async openLodging(lodging: Lodging): Promise<void> {
    const buttons: ActionSheetButton[] = [
      {
        text: 'Google マップで開く',
        handler: () => {
          window.open(this.trip.searchUrl(lodging), '_blank');
        },
      },
      {
        text: 'ここまでの経路',
        handler: () => {
          window.open(this.trip.directionsUrl(lodging.lat, lodging.lng), '_blank');
        },
      },
    ];

    if (lodging.url) {
      buttons.push({
        text: '公式サイト',
        handler: () => {
          window.open(lodging.url!, '_blank');
        },
      });
    }

    const sheet = await this.actionSheetCtrl.create({
      header: lodging.name,
      subHeader: `${lodging.type} ・ ${lodging.price}`,
      buttons: [...buttons, { text: 'キャンセル', role: 'cancel' }],
    });
    await sheet.present();
  }
}
