import { isStepActive, getActiveWorkflowModifications } from '../engine'

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

const STEP_NUMBERS = {
  step_0: 0, step_1: 1, step_2: 2, step_3: 3, step_4: 4,
  step_5: 5, step_6: 6, step_7: 7, step_8: 8, step_9: 9, step_10: 10,
}

export default function StepMap({ config, spec, onStepClick, activeStepKey }) {
  const stepKeys = Object.keys(spec.workflow_steps)

  return (
    <div className="relative">
      {/* Step nodes */}
      <div className="flex flex-wrap gap-x-0 gap-y-3">
        {stepKeys.map((stepKey, idx) => {
          const active = isStepActive(stepKey, config)
          const stepData = spec.workflow_steps[stepKey]
          const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
          const hasModifications = mods.length > 0
          const isSelected = activeStepKey === stepKey

          return (
            <div key={stepKey} className="flex items-center">
              <button
                onClick={() => active && onStepClick(stepKey)}
                disabled={!active}
                className={`relative group flex flex-col items-center p-3 rounded-xl border transition-all duration-200 w-[88px] ${
                  !active
                    ? 'border-slate-800 bg-slate-900/30 opacity-40 cursor-default'
                    : isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 cursor-pointer'
                    : 'border-slate-700 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                {/* Step number */}
                <div className={`text-xs font-bold mb-1 ${
                  !active ? 'text-slate-700' : isSelected ? 'text-cyan-400' : 'text-slate-500'
                }`}>
                  {STEP_NUMBERS[stepKey]}
                </div>

                {/* Step name */}
                <div className={`text-center text-[10px] leading-tight font-medium ${
                  !active ? 'text-slate-700' : isSelected ? 'text-cyan-200' : 'text-slate-300'
                }`}>
                  {STEP_NAMES[stepKey]}
                </div>

                {/* Owner */}
                <div className={`text-[9px] mt-1 text-center leading-tight ${
                  !active ? 'text-slate-800' : 'text-slate-600'
                }`}>
                  {active ? (stepData.primary_owner?.split('/')[0]?.trim() || '') : ''}
                </div>

                {/* Status badges */}
                {!active && (
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full">
                    Skipped
                  </div>
                )}
                {active && hasModifications && (
                  <div className="absolute -top-1.5 right-1 w-3 h-3 bg-amber-500 rounded-full border border-slate-900 flex items-center justify-center">
                    <span className="text-[7px] text-slate-900 font-bold">{mods.length}</span>
                  </div>
                )}
              </button>

              {/* Connector arrow — skip between removed steps */}
              {idx < stepKeys.length - 1 && (
                <ConnectorArrow
                  fromKey={stepKey}
                  toKey={stepKeys[idx + 1]}
                  config={config}
                  spec={spec}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800/50">
        <LegendItem color="border-slate-700 bg-slate-800/60" label="Active step" />
        <LegendItem color="border-slate-800 bg-slate-900/30 opacity-50" label="Skipped step" />
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
          <span className="text-xs text-slate-500">Has modifications</span>
        </div>
      </div>
    </div>
  )
}

function ConnectorArrow({ fromKey, toKey, config, spec }) {
  const fromActive = isStepActive(fromKey, config)
  const toActive = isStepActive(toKey, config)
  const bothActive = fromActive && toActive

  return (
    <div className={`flex items-center px-0.5 ${!bothActive ? 'opacity-20' : ''}`}>
      <div className={`h-px w-3 ${bothActive ? 'bg-slate-600' : 'bg-slate-800'}`}></div>
      <svg className={`w-2 h-2 ${bothActive ? 'text-slate-600' : 'text-slate-800'}`} viewBox="0 0 6 6" fill="currentColor">
        <path d="M0 0l6 3-6 3z"/>
      </svg>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-4 rounded border ${color}`}></div>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}
