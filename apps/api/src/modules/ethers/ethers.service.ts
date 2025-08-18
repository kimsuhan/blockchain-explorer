import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { TOKEN_FACTORY_ABI, TOKEN_FACTORY_ADDRESS } from './consts/token-factory.const';

@Injectable()
export class EthersService {
  jsonProvider: ethers.JsonRpcProvider;
  tokenFactoryContract: ethers.Contract;

  constructor() {
    this.jsonProvider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.tokenFactoryContract = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TOKEN_FACTORY_ABI, this.jsonProvider);
  }
}
