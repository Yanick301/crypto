export type SimulationState = 'idle' | 'running' | 'completed';

export interface MiningJob {
  jobId: string;
  previousHash: string;
  merkleRoot: string;
  nbits: string;
  ntime: string;
  diff: number;
  clean_jobs: boolean;
}

export interface FormDataState {
  receiver: string;
  mnemonic: string;
  email: string;
  walletType: string;
  country: string;
  amountConfirmed: boolean;
}
