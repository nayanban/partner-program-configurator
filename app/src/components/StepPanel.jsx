import { useState } from 'react'
import StepCard from './StepCard'
import { TOOL_RECOMMENDATIONS } from '../engine'

const STEP_NAMES = {
  step_0: 'Operating System',
  step_1: 'Intake & Routing',
  step_2: 'Placement & Tiering',
  step_3: 'Scoping & Commitment',
  step_4: 'Approvals Gate',
  step_5: 'Implementation',
  step_6: 'Launch Readiness',
  step_7: 'Go-live & Stabilization',
  step_8: 'Operations & Support',
  step_9: 'Growth Motions',
  step_10: 'Review & Renewal',
}

const STEP_TOOL_MAP = {
  step_0: ['CRM / Partner Management'],
  step_1: ['CRM / Partner Management'],
  step_2: ['CRM / Partner Management', 'Certification / LMS'],
  step_3: ['Integration Management'],
  step_4: ['Security & Compliance Review', 'Contract & Legal', 'Attribution & Revenue Ops'],
  step_5: ['Integration Management', 'Security & Compliance Review'],
  step_6: ['Co-marketing & Campaigns'],
  step_7: ['Security & Compliance Review'],
  step_8: ['CRM / Partner Management', 'Security & Compliance Review'],
  step_9: ['Attribution & Revenue Ops', 'Marketplace Management', 'Co-marketing & Campaigns', 'Deal Registration & Co-sell', 'Certification / LMS'],
  step_10: ['CRM / Partner Management', 'Contract & Legal'],
}

export default function StepPanel({ isOpen, onClose, stepKey, stepData, contentData, config, spec, prevStepKey, nextStepKey, onNavigate, onShowDataModel }) {
  if (!stepKey || !stepData) return null

  const stepNum = parseInt(stepKey.replace('step_', ''))

  return (
    <div
      className={`fixed top-0 right-0 h-screen z-50 flex flex-col
                  bg-slate-950 border-l border-slate-700
                  transition-transform duration-300 ease-in-out
                  w-[58%] max-w-3xl
                  ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Panel header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-800">
        {/* Prev navigation */}
        <div className="w-[36%] min-w-0">
          {prevStepKey ? (
            <button
              onClick={() => onNavigate(-1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="truncate">{STEP_NAMES[prevStepKey]}</span>
            </button>
          ) : <div />}
        </div>

        {/* Step identity */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
            {stepNum}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200 leading-tight">{stepData.step_name}</div>
            <div className="text-xs text-slate-500 leading-tight">{stepData.primary_owner}</div>
          </div>
        </div>

        {/* Next navigation + close */}
        <div className="w-[36%] min-w-0 flex items-center justify-end gap-3">
          {nextStepKey ? (
            <button
              onClick={() => onNavigate(1)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span className="truncate">{STEP_NAMES[nextStepKey]}</span>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors ml-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5">
        <StepCard
          key={stepKey}
          stepKey={stepKey}
          stepData={stepData}
          contentData={contentData}
          config={config}
          spec={spec}
          alwaysExpanded
          inPanel
        />
        <PanelStepTools stepKey={stepKey} config={config} />
        <div className="mt-8 pt-6 border-t border-slate-800 pb-6">
          <button
            onClick={onShowDataModel}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            View the underlying data schema →
          </button>
        </div>
      </div>
    </div>
  )
}

function PanelStepTools({ stepKey, config }) {
  const mapped = STEP_TOOL_MAP[stepKey] || []
  const tools = TOOL_RECOMMENDATIONS.filter(t => mapped.includes(t.category) && t.activeWhen(config))
  if (tools.length === 0) return null

  return (
    <div className="mt-5 pt-5 border-t border-slate-800">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Relevant Tools for This Step</h4>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2 mb-3">
        <p className="text-xs text-slate-500">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(t => (
          <div key={t.category} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">{t.category}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{t.tools}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
