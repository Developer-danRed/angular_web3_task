import { Component } from '@angular/core';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.css']
})
export class HistoryListComponent {

  TransferResData: any = []
  
  constructor() {

  }

  ngOninit() {
    this.TransferResData = localStorage.getItem('transferData')
  }
}
