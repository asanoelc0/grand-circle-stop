import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { listOutline, mapOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="list">
          <ion-icon name="list-outline"></ion-icon>
          <ion-label>リスト</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="map">
          <ion-icon name="map-outline"></ion-icon>
          <ion-label>地図</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class TabsPage {
  constructor() {
    addIcons({ listOutline, mapOutline });
  }
}
