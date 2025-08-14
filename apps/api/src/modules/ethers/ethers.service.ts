import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class EthersService {
  jsonProvider: ethers.JsonRpcProvider;

  constructor() {
    this.jsonProvider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  }
}
