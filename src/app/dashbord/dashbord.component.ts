import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Observable, Subscriber } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbord',
  templateUrl: './dashbord.component.html',
  styleUrls: ['./dashbord.component.css']
})
export class DashbordComponent implements OnInit {
  userAddress: any
  ownerContractAddress: any
  address: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userAddress = localStorage.getItem('WalletAddress')
    this.getOwnerDetails()
  }


  getOwnerDetails() {
    this.authService.getOwnerAddress().subscribe({
      next: async (res: any) => {
        this.ownerContractAddress = await res;
      },
      error: (err: any) => {
        console.error("Error fetching owner address: ", err);
      }
    });
  }

  ownerShipTransfer() {
    this.authService.transferOwnershipMethod(this.address).subscribe({
      next: async (res: any) => {
        if (res) {
          this.authService.showSuccess("True", 'Owner Transfer Success')
          localStorage.setItem('transferData', res.result)
          this.router.navigate(['/history']);
        } else {
          this.authService.showFailed("False", 'Owner Transfer Failed')
        }
      },
      error: (err: any) => {
        console.error("Error ownerShipTransfer: ", err);
      }
    })
  }




}