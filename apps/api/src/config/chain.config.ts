import { registerAs } from '@nestjs/config';

export default registerAs('chain', () => ({
  rpcUrl: process.env.CHAIN_RPC_URL,
  chainId: process.env.CHAIN_ID,
}));
