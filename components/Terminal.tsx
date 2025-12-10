import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { MiningJob, SimulationState } from '../types';

interface TerminalProps {
  state: SimulationState;
  onComplete: () => void;
}

export interface TerminalHandle {
  startSimulation: (wallet: string, email: string, country: string) => void;
  reset: () => void;
}

const DURATION_SECONDS = 80;

// Helper functions defined outside component to avoid scope issues
const randomHex = (len: number) => {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

const generateJob = (): MiningJob => ({
  jobId: String(Math.floor(Math.random() * 900000) + 100000),
  previousHash: '0000000000000000' + randomHex(24),
  merkleRoot: randomHex(64),
  ntime: new Date().toISOString(),
  nbits: (0x1800ffff + Math.floor(Math.random() * 1000)).toString(16),
  clean_jobs: Math.random() < 0.6,
  diff: Math.floor(1000 + Math.random() * 1e6),
});

const maskEmail = (e: string) => {
  if(!e) return '';
  const parts = e.split('@');
  if(parts.length < 2) return e;
  const name = parts[0];
  return name[0] + '***' + name.slice(-1) + '@' + parts[1];
};

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(({ state, onComplete }, ref) => {
  const [logs, setLogs] = useState<string[]>(['$ terminal ready']);
  const [progress, setProgress] = useState(0);
  const [currentJob, setCurrentJob] = useState<MiningJob | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const pushLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setLogs(['$ terminal ready']);
      setProgress(0);
      setCurrentJob(null);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    },
    startSimulation: (wallet: string, email: string, country: string) => {
      setLogs([]);
      setProgress(0);
      pushLog(`cryp-gen_btc — Miner UI starting for wallet ${wallet} (country=${country}, email=${maskEmail(email)})`);
      pushLog(`Connecting to stratum+tcp://pool.btc.com:3333 ...`);
      pushLog(`TLS handshake with pool — cipher: ECDHE-RSA-AES256-GCM-SHA384`);
      pushLog(`Authenticating as ${wallet}...`);
      
      const initialJob = generateJob();
      setTimeout(() => {
        setCurrentJob(initialJob);
        pushLog(`getblocktemplate: New job (jobId=${initialJob.jobId}, diff≈${initialJob.diff})`);
        pushLog(`  • prev_hash: ${initialJob.previousHash.slice(0,24)}...`);
        pushLog(`  • merkle_root: ${initialJob.merkleRoot.slice(0,16)}...  nbits:${initialJob.nbits}  ntime:${initialJob.ntime}`);
      }, 500);

      let startTime = Date.now();
      let shares = 0;
      let accepted = 0;
      let rejected = 0;
      const devices = ['ASIC0', 'ASIC1', 'GPU0', 'GPU1', 'CPU-thread0'];

      if (intervalRef.current) window.clearInterval(intervalRef.current);

      intervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const pct = Math.min(100, (elapsed / DURATION_SECONDS) * 100);
        
        setProgress(pct);

        // Random logic to update simulation
        if (Math.random() < 0.08) {
          const newJob = generateJob();
          setCurrentJob(newJob);
          pushLog(`cryp-gen_btc — New job received (jobId=${newJob.jobId}, diff≈${newJob.diff})`);
        }

        const device = devices[Math.floor(Math.random() * devices.length)];
        let hrLabel;
        if (device.startsWith('ASIC')) {
          hrLabel = `${(Math.random() * 80 + 90).toFixed(2)} TH/s`;
        } else if (device.startsWith('GPU')) {
          hrLabel = `${(Math.random() * 20 + 20).toFixed(2)} MH/s`;
        } else {
          hrLabel = `${(Math.random() * 300 + 100).toFixed(2)} KH/s`;
        }
        
        const r = Math.random();
        const nonce = '0x' + randomHex(8);

        if (r < 0.03) {
          pushLog(`${device}: BLOCK CANDIDATE (nonce=${nonce}) — assembling coinbase, submitblock (simulated)`);
        } else if (r < 0.3) {
          shares++;
          if (Math.random() < 0.9) {
            accepted++;
            pushLog(`${device}: Share accepted (#${accepted}) — ${hrLabel} | nonce=${nonce}`);
          } else {
            rejected++;
            pushLog(`${device}: Share rejected (stale) — nonce=${nonce}`);
          }
        }

        if (elapsed >= DURATION_SECONDS) {
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setProgress(100);
          pushLog('cryp-gen_btc — Mining simulation finished. Finalizing...');
          pushLog(`Final stats — shares: ${shares}, accepted: ${accepted}, rejected: ${rejected}`);
          pushLog('Prepare encrypted report and POST to server (simulated).');
          onComplete();
        }
      }, 800 + Math.random() * 700);
    }
  }));

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="terminal" aria-live="polite">
      <div className="meta">
        <span>cryp-gen_btc</span>
        <span>v2.4.0-release</span>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
        <div ref={logsEndRef} />
      </div>

      <div className="progress-container">
        <div className="progress-header">
          <span>Processing...</span>
          <span style={{ color: 'var(--accent)', textShadow: '0 0 10px rgba(5, 150, 105, 0.4)' }}>
            {Math.floor(progress)}%
          </span>
        </div>
        <div className="progress">
          <div className="bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {currentJob && (
        <div className="job-json">
          {JSON.stringify(currentJob, null, 2)}
        </div>
      )}
    </div>
  );
});

Terminal.displayName = 'Terminal';
