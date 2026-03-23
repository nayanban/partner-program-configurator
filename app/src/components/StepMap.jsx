import { isStepActive } from '../engine'

const SHORT_STEP_NAMES = {
  step_0: 'Definition & Maintenance',
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

function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('—')[0].split('/')[0].trim()
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}

export default function StepMap({ config, spec, onStepClick, activeStepKey, variant = 'timeline', hasUserClickedStep = false }) {
  const stepKeys = Object.keys(spec.workflow_steps)
  const anySkipped = stepKeys.some(k => !isStepActive(k, config))
  const firstActiveIdx = stepKeys.findIndex(k => isStepActive(k, config))

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-1">
        {stepKeys.map(stepKey => {
          const active = isStepActive(stepKey, config)
          const isSelected = activeStepKey === stepKey
          const stepNum = stepKey.replace('step_', '')

          return (
            <button
              key={stepKey}
              onClick={() => active && onStepClick(stepKey)}
              disabled={!active}
              className={`text-left px-3 py-2.5 rounded-lg transition-all ${
                !active ? 'opacity-30 cursor-default' :
                isSelected ? 'bg-cyan-500/10 border border-cyan-500/50' :
                'hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-5 flex-shrink-0">{stepNum}</span>
                <span className={`text-sm ${isSelected ? 'text-cyan-200 font-semibold' : active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {SHORT_STEP_NAMES[stepKey]}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Timeline variant (default)
  return (
    <div className="py-4">
      <div className="flex flex-col items-center">
        {stepKeys.map((stepKey, idx) => {
          const active = isStepActive(stepKey, config)
          const isSelected = activeStepKey === stepKey
          const stepData = spec.workflow_steps[stepKey]
          const stepNum = parseInt(stepKey.replace('step_', ''))
          const isLast = idx === stepKeys.length - 1

          return (
            <div key={stepKey} className="flex flex-col items-center w-full">
              <button
                onClick={() => active && onStepClick(stepKey)}
                disabled={!active}
                className={`relative max-w-[280px] sm:max-w-xs w-full mx-auto text-left rounded-xl p-3 sm:p-4 border transition-all duration-200 ${
                  !active
                    ? 'border-slate-800/50 bg-slate-900/20 opacity-30 cursor-default'
                    : isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 cursor-pointer'
                    : 'border-slate-700 bg-slate-800/60 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] cursor-pointer'
                }`}
              >
                {idx === firstActiveIdx && !hasUserClickedStep && (
                  <div className="absolute -inset-1 rounded-xl border-2 border-cyan-400/30 animate-pulse pointer-events-none" />
                )}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-500 mb-0.5">Step {stepNum}</div>
                    <div className={`text-xs sm:text-sm font-semibold leading-snug ${
                      !active ? 'text-slate-500' : isSelected ? 'text-cyan-200' : 'text-slate-200'
                    }`}>
                      {stepData.step_name}
                    </div>
                    <div className={`text-xs mt-1 ${
                      !active ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {cleanOwnerText(stepData.primary_owner)}
                    </div>
                  </div>
                  {!active && (
                    <span className="text-xs bg-slate-800 border border-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      Skipped
                    </span>
                  )}
                </div>
              </button>

              {!isLast && (
                <div className={`w-px h-6 my-1 ${active && isStepActive(stepKeys[idx + 1], config) ? 'bg-slate-700' : 'bg-slate-800/50'}`} />
              )}
            </div>
          )
        })}
      </div>

      {anySkipped && (
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-4 rounded border border-slate-700 bg-slate-800/60" />
            <span className="text-xs text-slate-500">Active step</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-4 rounded border border-slate-800 bg-slate-900/30 opacity-50" />
            <span className="text-xs text-slate-500">Skipped step</span>
          </div>
        </div>
      )}
    </div>
  )
}
