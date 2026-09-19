'use client';

import { useUIStore } from '../stores/ui-store';

export function ZustandDemo() {
  const { activeModal, activeTab, theme, draftStep, setActiveModal, setActiveTab, toggleTheme, setDraftStep } = useUIStore();

  return (
    <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Client UI State</p>
          <h3 className="text-xl font-black text-slate-900">Zustand Store</h3>
        </div>
        <button onClick={toggleTheme} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          Theme: {theme}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Active tab</p>
          <p className="mt-2 text-lg font-bold text-slate-900">{activeTab}</p>
          <div className="mt-3 flex gap-2">
            {['overview', 'analysis', 'report'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-sm text-slate-500">Draft step</p>
          <p className="mt-2 text-lg font-bold text-slate-900">Step {draftStep}</p>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((step) => (
              <button key={step} onClick={() => setDraftStep(step)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${draftStep === step ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>
                {step}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <span className="text-sm text-slate-600">Active modal</span>
        <button onClick={() => setActiveModal(activeModal ? null : 'detail-modal')} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">
          {activeModal ? 'Close modal' : 'Open modal'}
        </button>
      </div>
    </section>
  );
}
