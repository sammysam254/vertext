'use client';
import { useState } from 'react';
import { X, Smartphone, Building2 } from 'lucide-react';
import { PAYOUT_THRESHOLD_KES } from '@/lib/earnings';

interface WithdrawModalProps {
  available: number;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function WithdrawModal({ available, userId, onClose, onSuccess }: WithdrawModalProps) {
  const [method, setMethod] = useState<'mpesa' | 'bank'>('mpesa');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleWithdraw() {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < PAYOUT_THRESHOLD_KES) {
      setError(`Minimum withdrawal is KES ${PAYOUT_THRESHOLD_KES}`);
      return;
    }
    if (amt > available) {
      setError('Insufficient balance');
      return;
    }
    if (method === 'mpesa' && !phone.match(/^(07|01|2547|2541)\d{8}$/)) {
      setError('Enter a valid M-Pesa number (e.g. 0712345678)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amountKes: amt, method, phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Withdrawal failed');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={onClose}>
      <div
        className="w-full bg-[#111] rounded-t-2xl p-6 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Withdraw Earnings</h2>
          <button onClick={onClose}><X size={20} className="text-[#888]" /></button>
        </div>

        <p className="text-sm text-[#888] mb-4">
          Available: <span className="text-[#00C853] font-semibold font-mono-earnings">KES {available.toFixed(2)}</span>
        </p>

        {/* Method selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setMethod('mpesa')}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
              method === 'mpesa' ? 'border-[#00C853] bg-[#00C853]/10' : 'border-[#222] bg-[#1A1A1A]'
            }`}
          >
            <Smartphone size={18} className={method === 'mpesa' ? 'text-[#00C853]' : 'text-[#888]'} />
            <span className={`text-sm font-medium ${method === 'mpesa' ? 'text-[#00C853]' : 'text-[#888]'}`}>M-Pesa</span>
          </button>
          <button
            onClick={() => setMethod('bank')}
            className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
              method === 'bank' ? 'border-[#00C853] bg-[#00C853]/10' : 'border-[#222] bg-[#1A1A1A]'
            }`}
          >
            <Building2 size={18} className={method === 'bank' ? 'text-[#00C853]' : 'text-[#888]'} />
            <span className={`text-sm font-medium ${method === 'bank' ? 'text-[#00C853]' : 'text-[#888]'}`}>Bank</span>
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="number"
            placeholder={`Amount (min KES ${PAYOUT_THRESHOLD_KES})`}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            max={available}
            className="w-full bg-[#1A1A1A] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853]"
          />

          {method === 'mpesa' && (
            <input
              type="tel"
              placeholder="M-Pesa number (e.g. 0712345678)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#222] rounded-xl px-4 py-3 text-white placeholder-[#555] focus:outline-none focus:border-[#00C853]"
            />
          )}

          {method === 'bank' && (
            <p className="text-sm text-[#555] text-center py-2">Bank transfers processed within 3-5 business days. Contact support to set up.</p>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleWithdraw}
            disabled={loading || method === 'bank'}
            className="w-full bg-[#00C853] text-black font-semibold py-3 rounded-xl hover:bg-[#00E676] transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Withdraw KES ${amount || '0'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
