import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  userAddress: any;
  shortAddress: any
  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {

  }

  ngOnInit(): void {
    this.userAddress = localStorage.getItem('WalletAddress')
    this.shortAddress = localStorage.getItem('shortAddress')
    this.cdr.detectChanges();
  }


  connectToWallet(): void {
    this.authService.ConnectWallet().subscribe((accounts: any) => {
      this.authService.showSuccess(accounts.status, accounts.message)
      localStorage.setItem('shortAddress', accounts.shortAddress)

      setTimeout(() => {
        this.reloaded()
      }, 2000)
      this.router.navigate(['/dashbord']);

    }, (error: any) => {
      console.error('Error connecting wallet:', error);
      this.authService.showFailed("false", 'Wallet Connected Failed')
    }
    );
  }

  connectDisconncted() {
    localStorage.removeItem('WalletAddress')
    this.authService.showFailed("false", 'Wallet DisConnected')

    setTimeout(() => {
      this.reloaded()
    }, 2000)
    this.router.navigate(['/']);

  }

  reloaded() {
    window.location.reload();

  }




}
