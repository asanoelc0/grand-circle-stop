import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'list',
        loadComponent: () => import('./pages/list/list.page').then((m) => m.ListPage),
      },
      {
        path: 'map',
        loadComponent: () => import('./pages/map/map.page').then((m) => m.MapPage),
      },
      { path: '', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
  {
    path: 'stop/:id',
    loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage),
  },
  { path: '', redirectTo: 'tabs/list', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/list' },
];
