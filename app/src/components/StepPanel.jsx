import StepCard from './StepCard'

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

export default function StepPanel({ onClose, stepKey, stepData, contentData, config, spec, prevStepKey, nextStepKey, onNavigate, onShowDataModel }) {
  if (!stepKey || !stepData) return null

  const stepNum = parseInt(stepKey.replace('step_', ''))

  return (
    <div className="pb-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-4 py-3 mb-4">
        {/* Prev navigation */}
        <div className="w-[38%] min-w-0">
          {prevStepKey ? (
            <button
              onClick={() => onNavigate(-1)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="truncate">{STEP_NAMES[prevStepKey]}</span>
            </button>
          ) : <div />}
        </div>

        {/* Step identity */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
            {stepNum}
          </div>
          <span className="text-sm font-semibold text-slate-200">{stepData.step_name}</span>
        </div>

        {/* Next navigation + close */}
        <div className="w-[38%] min-w-0 flex items-center justify-end gap-3">
          {nextStepKey ? (
            <button
              onClick={() => onNavigate(1)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <span className="truncate">{STEP_NAMES[nextStepKey]}</span>
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
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
        <div className="mt-8 pt-4 border-t border-slate-800">
          <button
            onClick={onShowDataModel}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            View the underlying data schema →
          </button>
        </div>
      </div>
    </div>
  )
}
