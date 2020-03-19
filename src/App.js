import './App.css';
import logo from './logo.svg';
import React, {Component} from 'react';
import { Polymath, browserUtils, BigNumber } from '@polymathnetwork/sdk';
 
export default class App extends Component
{
  constructor()
  {
    super();
    this.state = {sdk: '', status: 'Starting', wallet: '', network: '', token: '', STO: ''};
  }

  async componentDidMount()
  {
    // try {
      await this.initializePoly();
      console.log(`**********SDK Initialized = `, this.state.sdk);

      await this.getToken();
      console.log(`**********Security Token = `, this.state.token);
      console.log(`**********STO Tiered = `, this.state.STO);

      await this.investSTO();
    // }catch(e) {alert(e)}
  }

  initializePoly = async()=>
  {
    try
    {
      const networkId = await browserUtils.getNetworkId()
      const walletAddress = await browserUtils.getCurrentAddress()
      this.setState({wallet: walletAddress, network: networks[networkId]})
      if (![-1, 42].includes(networkId))
      {
        alert('Please switch to Kovan network');
        return;
      }
      const config = networkConfigs[networkId]
      const sdk = new Polymath()
      await sdk.connect(config);
      this.setState({sdk});
      return;
    }catch(e) {alert(e)}
  }

  getToken = async()=>
  {
    try
    {
      let token = await this.state.sdk.getSecurityToken({symbol: 'TK-M'});
      let STOs = await token.issuance.offerings.getStos()

      STOs = STOs.filter(sto => sto.stoType === 'Tiered');
      this.setState({token, STO: STOs[0], status: 'Started'});
      return;
    }catch(e) {alert(e)}
  }

  investSTO = async()=>
  {
    // try {
      /**
       * Invest in the STO
       *
       * @param args.minTokens - sets a minimum amount of tokens to buy. If the amount sent yields less tokens at the current price, the transaction will revert
       * @param args.amount - amount to spend
       * @param args.currency - currency in which to buy the tokens
       * @param args.stableCoinAddress - address of the stable coin in which to pay (only applicable if currency is StableCoin)
       * @param args.beneficiary - address that will receive the purchased tokens (defaults to current wallet, will fail if beneficial investments are not allowed for the STO)
      **/

      let {STO} = this.state;

      let params = 
      {
        currency: 2,
        amount: new BigNumber(1000),
        minTokens: new BigNumber(1),
        stableCoinAddress: STO.stableCoinAddresses[0],
        // beneficiary?: string,
      }

      const queue = await STO.invest(params);
      const ret = await queue.run();
      
      console.log(`**********STO Invest Response = `, ret);

      return;
    // }catch(e) {alert(e)}
  }

  render()
  {
    let {token} = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {this.state.status} Polymath
          <br/> <br/>
          {token?
            <div>
              <strong>Token Details</strong><br/>
              Symbol : {token.symbol}<br/>
              Name : {token.name}<br/>
              Owner : {token.owner}<br/>
              Address : {token.address}<br/>
            </div>
          :''}
        </header>
      </div>
    );
  }
}

const networkConfigs = 
{
  1: {polymathRegistryAddress: '0xdfabf3e4793cd30affb47ab6fa4cf4eef26bbc27'},
  42: {polymathRegistryAddress: '0x5b215a7d39ee305ad28da29bf2f0425c6c2a00b3'},
  15: {polymathRegistryAddress: '0x9FBDa871d559710256a2502A2517b794B482Db40'}
}

const networks = 
{
  0: 'Disconnected',
  1: 'Mainnet',
  42: 'Kovan'
}