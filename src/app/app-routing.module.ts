import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'dashbord',
    loadChildren: () => import('./dashbord/dashbord.module').then(m => m.DashbordModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./history-list/history-list.module').then(m => m.HistoryListModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
