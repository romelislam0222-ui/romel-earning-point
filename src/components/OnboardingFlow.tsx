import React, { useState } from 'react';
import { Sparkles, Globe, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { COUNTRIES, COUNTRY_FLAGS, LANGUAGES } from '../constants';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (user: { name: string; email: string; pass: string; country: string; language: string; referralId?: string }) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('Bangladesh');
  const [language, setLanguage] = useState('Bangla');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [referralId, setReferralId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !pass) return;
    onComplete({ name, email, pass, country, language, referralId: referralId.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-100">Welcome to ROMEL EARNING POINT</h2>
          <p className="text-xs text-slate-400 mt-1">Start micro-jobs & claim instant signup bonus</p>
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
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                🌐 Preferred Language
              </label>
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
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 mt-4 shadow-lg shadow-amber-500/20"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <UserCheck className="w-4 h-4" /> Complete Registration
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};