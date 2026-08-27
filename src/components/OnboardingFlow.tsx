import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, UserCheck, ShieldCheck, ArrowRight, Copy, Wallet, Clock, KeyRound } from 'lucide-react';
import { COUNTRIES, COUNTRY_FLAGS, LANGUAGES } from '../constants';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (user: {
    name: string;
    email: string;
    pass: string;
    country: string;
    language: string;
    referralId?: string;
    bkashNumber?: string;
    trxId?: string;
    amountPaid?: number;
    bypassCode?: string;
  }) => void;
  onSwitchToLogin: () => void;
  registrationFeeEnabled: boolean;
  feeBeforeDeadline: number;
  feeAfterDeadline: number;
  deadlineIso: string;
  paymentNumber: string;
}

function formatCountdown(msLeft: number) {
  if (msLeft <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(msLeft / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return { d, h, m, s };
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onSwitchToLogin,
  registrationFeeEnabled,
  feeBeforeDeadline,
  feeAfterDeadline,
  deadlineIso,
  paymentNumber
}) => {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('Bangladesh');
  const [language, setLanguage] = useState('Bangla');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [referralId, setReferralId] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [showBypass, setShowBypass] = useState(false);
  const [bypassCode, setBypassCode] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) setReferralId(ref);
    } catch (e) {
      /* ignore */
    }
  }, []);

  if (!isOpen) return null;

  const deadline = deadlineIso ? new Date(deadlineIso).getTime() : 0;
  const msLeft = deadline - now;
  const expired = !deadline || msLeft <= 0;
  const currentFee = expired ? feeAfterDeadline : feeBeforeDeadline;
  const { d, h, m, s } = formatCountdown(msLeft);

  const handleStep1Continue = () => setStep(2);

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass) return;

    if (!registrationFeeEnabled) {
      onComplete({ name, email, pass, country, language, referralId: referralId.trim() || undefined });
      return;
    }

    const hasBypass = bypassCode.trim() !== '';
    const hasPaymentInfo = bkashNumber.trim() !== '' && trxId.trim() !== '';
    if (!hasBypass && !hasPaymentInfo) {
      return;
    }

    onComplete({
      name,
      email,
      pass,
      country,
      language,
      referralId: referralId.trim() || undefined,
      bkashNumber: bkashNumber.trim(),
      trxId: trxId.trim(),
      amountPaid: currentFee,
      bypassCode: bypassCode.trim() || undefined
    });
  };

  const copyNumber = () => {
    navigator.clipboard?.writeText(paymentNumber).catch(() => {});
  };

  const canSubmit =
    name.trim() !== '' &&
    email.trim() !== '' &&
    pass.trim() !== '' &&
    (!registrationFeeEnabled ||
      bypassCode.trim() !== '' ||
      (bkashNumber.trim() !== '' && trxId.trim() !== ''));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 sm:p-8 my-6">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-100">Welcome to ROMEL EARNING POINT</h2>
          <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30">
            SEASON 1
          </span>
          <p className="text-xs text-slate-400 mt-2">Start micro-jobs & claim instant signup bonus</p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> Select Your Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {COUNTRY_FLAGS[c] || '🌐'} {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">🌐 Preferred Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.english} value={l.english}>
                    {l.flag} {l.name} ({l.english})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleStep1Continue}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 mt-4 shadow-lg shadow-amber-500/20"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onSwitchToLogin}
              className="w-full text-center text-[11px] text-slate-400 hover:text-amber-400 transition-colors"
            >
              Already have an account? <span className="font-bold underline">Log in</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleFinalSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Romel Islam"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Referral Code (Optional)</label>
              <input
                type="text"
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                placeholder="Enter Referrer User ID"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {registrationFeeEnabled && (
              <>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-amber-300">Registration Fee: ৳{currentFee}</h3>
                  </div>

                  {!expired && (
                    <div className="flex items-center gap-1.5 mb-3 text-[11px] text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span>Price rises to ৳{feeAfterDeadline} in:</span>
                      <span className="font-mono font-black text-fuchsia-400">
                        {d}d {String(h).padStart(2, '0')}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
                      </span>
                    </div>
                  )}
                  {expired && (
                    <div className="mb-3 text-[11px] font-black text-rose-400">⏰ TIME OVER — Regular price now applies</div>
                  )}

                  <div className="flex items-center justify-between bg-slate-950 rounded-xl px-3 py-2.5 border border-slate-800 mb-3">
                    <span className="font-mono font-black text-slate-100">{paymentNumber}</span>
                    <button type="button" onClick={copyNumber} className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] font-bold">
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                    <li>শুধুমাত্র <strong className="text-slate-200">বিকাশ</strong>-এ টাকা দিতে হবে</li>
                    <li>শুধুমাত্র <strong className="text-slate-200">Send Money</strong> করতে হবে</li>
                    <li>শুধুমাত্র <strong className="text-slate-200">Personal নাম্বারে</strong> Send Money করতে হবে</li>
                    <li>কারণ এতে লেনদেনে খরচ কম ও নিরাপদ</li>
                  </ul>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Your bKash Number (sent from)</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="e.g. 9G7H2K1XYZ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowBypass((v) => !v)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Are you a Moderator? Login here
                </button>
                {showBypass && (
                  <input
                    type="text"
                    value={bypassCode}
                    onChange={(e) => setBypassCode(e.target.value)}
                    placeholder="Enter Moderator / Sub-Moderator Secret Code"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500"
                  />
                )}
                {bypassCode.trim() !== '' && (
                  <p className="text-[10px] text-fuchsia-400">
                    ✓ Moderator code entered — payment fields above will be skipped.
                  </p>
                )}
              </>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {registrationFeeEnabled ? (
                  <><ShieldCheck className="w-4 h-4" /> Submit for Verification</>
                ) : (
                  <><UserCheck className="w-4 h-4" /> Complete Registration</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
