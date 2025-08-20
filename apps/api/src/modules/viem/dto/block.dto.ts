export class BlockDto {
  /** 블록 번호 */
  blockNumber: number;

  /** 가스당 기본 수수료 */
  baseFeePerGas: number | null;

  /** 이 블록의 모든 트랜잭션에서 사용된 총 blob 가스 */
  blobGasUsed: number | null;

  /** 이 블록의 난이도 */
  difficulty: number | null;

  /** 초과 blob 가스 */
  excessBlobGas: number | null;

  /** 이 블록의 "추가 데이터" 필드 */
  extraData: string;

  /** 이 블록에서 허용되는 최대 가스 */
  gasLimit: number | null;

  /** 이 블록의 모든 트랜잭션에서 사용된 총 가스 */
  gasUsed: number | null;

  /** 블록 해시 또는 대기 중인 경우 `null` ('latest' | 'earliest' | 'pending' | 'safe' | 'finalized') */
  hash: string | null;

  /** 로그 블룸 필터 또는 대기 중인 경우 `null` */
  logsBloom: string | null;

  /** 이 블록의 채굴 보상을 받은 주소, COINBASE 주소 */
  miner: string;

  /** 블록의 고유 식별자 */
  mixHash: string;

  /** 작업 증명 해시 또는 대기 중인 경우 `null` */
  nonce: string | null;

  /** 블록 번호 또는 대기 중인 경우 `null` */
  number: number | null;

  /** 부모 비콘 체인 블록의 루트 */
  parentBeaconBlockRoot?: string;

  /** 부모 블록 해시 */
  parentHash: string;

  /** 이 블록의 영수증 트리 루트 */
  receiptsRoot: string;

  /** 블록 추가 데이터 */
  sealFields: string[];

  /** 이 블록의 엉클 데이터의 SHA3 */
  sha3Uncles: string;

  /** 이 블록의 크기(바이트) */
  size: number | null;

  /** 이 블록의 최종 상태 트리 루트 */
  stateRoot: string;

  /** 이 블록이 수집된 Unix 타임스탬프 */
  timestamp: number | null;

  /** 이 블록까지의 체인 총 난이도 */
  totalDifficulty: number | null;

  /** 이 블록의 트랜잭션 목록 */
  transactions?: string[];

  /** 이 블록의 트랜잭션 트리 루트 */
  transactionsRoot: string;

  /** 엉클 해시 목록 */
  uncles: string[];

  /** 출금 객체 목록 */
  withdrawals?: {
    address: string;
    amount: string;
    index: string;
    validatorIndex: string;
  }[];

  /** 이 블록의 출금 트리 루트 */
  withdrawalsRoot?: string;
}
