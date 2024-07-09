import { Injectable, ChangeDetectorRef } from '@angular/core';
import { Observable, Subscriber, from } from 'rxjs';
import { contractDetails } from '../service/web3';
import { ToastrService } from 'ngx-toastr';


declare let window: any;
const Ethereum = (window as any).ethereum;
const web3 = new window.Web3(window.ethereum);


export type WalletTypes = 'metamask';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  ownerAddress: any
  walletAddress: any;
  walletbalance: any;

  providerType: any = Ethereum;


  constructor(private toastr: ToastrService) {

  }

  // Add Network 

  AddNetwork() {
    return new Observable((subscriber: any) => {
      try {
        if (typeof window.ethereum !== 'undefined') {
          window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7', // Sephoria chainId
                chainName: 'Sephoria Testnet',
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                nativeCurrency: {
                  name: 'Sephoria Token',
                  decimals: 18,
                  symbol: 'SPH',
                },
                rpcUrls: ['wss://ethereum-sepolia-rpc.publicnode.com'],
              },
            ],
          })
            .then((suc: any) => {
              this.CheckChainId().subscribe((sucChain) => {
                if (sucChain) {
                  subscriber.next(true);
                  this.stopSubscribe(subscriber);
                } else {
                  subscriber.next(false);
                  this.stopSubscribe(subscriber);
                }
              });
            })
            .catch((error: any) => {
              subscriber.next(false);
              this.stopSubscribe(subscriber);
            });
        }
      } catch (error) {
        console.error('MetaMask extension not found:', error);
        subscriber.next(false);
      }
    });
  }

  // Check chainId

  public CheckChainId(): Observable<boolean> {
    return new Observable((subscriber: Subscriber<boolean>) => {
      this.providerType.request({ method: 'eth_chainId' }).then((chainId: any) => {
        if (chainId = '0xaa36a7') {
          subscriber.next(true);

        } else {
          subscriber.next(false);
        }
        this.stopSubscribe(subscriber);
      })
    });
  }


  //swith Network

  addAndSwitchNetwork(): Observable<boolean> {
    return new Observable((subscriber) => {
      try {
        if (typeof Ethereum !== 'undefined') {
          const networkData = {
            chainId: '0xaa36a7', // Sepolia chainId
            chainName: 'Sepolia Testnet',
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
            nativeCurrency: {
              name: 'Sepolia Token',
              decimals: 18,
              symbol: 'SPH',
            },
            rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
          };

          Ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkData.chainId }],
          }).then(() => {
            subscriber.next(true);
            this.stopSubscribe(subscriber)
          }).catch((switchError: any) => {
            if (switchError.code === 4902) {
              Ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [networkData],
              }).then(() => {
                subscriber.next(true);
                this.stopSubscribe(subscriber)
              }).catch((addError: any) => {
                console.error('Failed to add network:', addError);
                subscriber.next(false);
                this.stopSubscribe(subscriber)
              });
            } else {
              console.error('Failed to switch network:', switchError);
              subscriber.next(false);
              this.stopSubscribe(subscriber)
            }
          });
        } else {
          throw new Error('MetaMask extension not found');
        }
      } catch (error) {
        console.error('Error in addAndSwitchNetwork method:', error);
        subscriber.next(false);
        this.stopSubscribe(subscriber)
      }
    });
  }



  isWalletAdded(WalletType: WalletTypes) {
    return new Observable((subscriber) => {
      let isWalletAdded: any = false;

      switch (WalletType) {
        case 'metamask':
          if (Ethereum != undefined) {
            isWalletAdded = true;
          }
          break;

        default:
          if (Ethereum != undefined) {
            isWalletAdded = true;
          }
          break;
      }
      subscriber.next(isWalletAdded);
      this.stopSubscribe(subscriber);
    });
  }



  public ConnectWallet(): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      this.isWalletAdded('metamask').subscribe((isWalletAdded: any) => {
        if (!isWalletAdded) {
          let errorMsg = {
            message: 'Kindly check or install MetaMask',
            status: false,
          };
          subscriber.next(errorMsg);
          this.stopSubscribe(subscriber);
        } else {
          this.CheckChainId().subscribe((isCorrectChain: any) => {
            if (isCorrectChain) {
              this.addAndSwitchNetwork().subscribe((switchRes: any) => {
                if (switchRes) {
                  this.ConnectProviderWallet('metamask').subscribe((connectedWallet: any) => {
                    subscriber.next(connectedWallet);
                    this.stopSubscribe(subscriber);
                  });
                }
              })

            } else {
              this.AddNetwork().subscribe((sucNetwork) => {
                if (sucNetwork) {
                  this.ConnectProviderWallet('metamask').subscribe(
                    (sucPWallet) => {
                      subscriber.next(sucPWallet);
                      this.stopSubscribe(subscriber);
                    }
                  );
                }
              })
            }
          });
        }
      });
    });
  }



  ConnectProviderWallet(WalletType: WalletTypes) {
    return new Observable((subscriber: Subscriber<any>) => {

      this.providerType.enable().then((accounts: any) => {

        if (accounts.length > 0) {
          let first = accounts[0].substring(0, 3);
          let last = accounts[0].substring(38, 42);

          let shortAcc = `${first}...${last}`;
          this.walletAddress = accounts[0];

          localStorage.setItem('WalletType', 'metamask' || '');
          localStorage.setItem('WalletAddress', accounts[0]);

          let successMsg = {
            message: 'Login Success',
            status: true,
            address: accounts[0],
            shortAddress: shortAcc,
          };

          this.providerType.on('disconnect', (error: any, payload: any) => {
            console.log(error, 'error');
            console.log(payload, 'payload');
          });
          subscriber.next(successMsg);
        }
        this.stopSubscribe(subscriber)
      })
        .catch((err: any) => {
          let errorMsg = {
            message: err.message,
            status: false,
          };
          subscriber.error(errorMsg);
          this.stopSubscribe(subscriber)
        });
    })
  }

  getAccount(address: string): Observable<string> {
    return new Observable((subscriber) => {
      if (typeof window.ethereum !== 'undefined') {
        const web3 = new window.Web3(window.ethereum);

        this.providerType.request({ method: 'eth_requestAccounts' })
          .then((accounts: string[]) => {
            const account = accounts[0];

            // Fetch ETH balance
            web3.eth.getBalance(address).then((balance: string) => {
              const balanceEth = web3.utils.fromWei(balance, 'ether');
              subscriber.next(balanceEth);
              this.stopSubscribe(subscriber)
            })
              .catch((error: any) => {
                console.error('Error fetching balance:', error);
                subscriber.error(error);
              });
          })
          .catch((error: any) => {
            console.error('Error requesting accounts:', error);
            subscriber.error(error);
          });
      } else {
        subscriber.error('MetaMask extension not detected');
      }
    });
  }

  // =========================================================================================================

  //Contract Read and Write Function :-

  getOwnerAddress() {
    return new Observable((subscriber) => {
      try {
        const SepoliaContract = new web3.eth.Contract(contractDetails.testContract.abi, contractDetails.testContract.address);
        const result = SepoliaContract.methods.owner().call();
        this.ownerAddress = result

        subscriber.next(this.ownerAddress);
        this.stopSubscribe(subscriber);
      } catch (error) {
        subscriber.error(error);
      }
    });
  }




  transferOwnershipMethod(address: string) {
    return new Observable((subscriber) => {
      try {
        const web3 = new window.Web3(window.ethereum);
        const SepoliaContract = new web3.eth.Contract(contractDetails.testContract.abi, contractDetails.testContract.address);
        const ownerShipAddress = address.toString();

        web3.eth.getAccounts().then((accounts: any) => {
          SepoliaContract.methods.transferOwnership(ownerShipAddress)
            .send({ from: accounts[0] })
            .on('receipt', (receipt: any) => {
              subscriber.next({
                status: true,
                Message: 'Transfer Success',
                result: receipt
              });
              this.stopSubscribe(subscriber)
            })
            .on('error', (error: any) => {
              subscriber.error({
                status: false,
                Message: 'Transfer Failed',
                error: error
              });
              this.stopSubscribe(subscriber)
            });
        }).catch((error: any) => {
          console.error("Error getting accounts: ", error);
          subscriber.error({
            status: false,
            Message: 'Unable to get user accounts',
            error: error
          });
          this.stopSubscribe(subscriber)
        });

      } catch (err: any) {
        console.error("transferOwnershipMethod: ", err);
        subscriber.error({
          status: false,
          Message: 'Unexpected Error',
          error: err
        });
        this.stopSubscribe(subscriber)
      }
    });
  }


  showSuccess(Status: string, Message: string) {
    this.toastr.success(Message, Status);
  }

  showFailed(Status: string, Message: string) {
    this.toastr.error(Message, Status);
  }


  private stopSubscribe(subscriber: Subscriber<any>): void {
    subscriber.complete();
  }
}
