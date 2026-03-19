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
  step_0: 0, step_1: 1, step_2: 2, step_3: 3, step_4: 4, step_5: 5,
  step_6: 6, step_7: 7, step_8: 8, step_9: 9, step_10: 10,
}

const ALL_STEPS = ['step_0','step_1','step_2','step_3','step_4','step_5','step_6','step_7','step_8','step_9','step_10']
const ROW1 = ['step_0', 'step_1', 'step_2', 'step_3', 'step_4', 'step_5']
const ROW2 = ['step_6', 'step_7', 'step_8', 'step_9', 'step_10']

function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('/')[0].trim()
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}

export default function StepMap({ config, spec, onStepClick, activeStepKey, variant = 'horizontal' }) {
  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-1">
        {ALL_STEPS.map(stepKey => {
          const active = isStepActive(stepKey, config)
          const isSelected = activeStepKey === stepKey
          const mods = getActiveWorkflowModifications(stepKey, spec.workflow_steps[stepKey], spec, config)
          const hasModifications = mods.length > 0
          return (
            <button
              key={stepKey}
              onClick={() => active && onStepClick(stepKey)}
              disabled={!active}
              className={`text-left px-3 py-2 rounded-lg transition-all ${
                !active
                  ? 'opacity-30 cursor-default text-slate-500'
                  : isSelected
                  ? 'bg-cyan-500/10 border border-cyan-500/50 text-cyan-200'
                  : 'hover:bg-slate-800 text-slate-300 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-4 flex-shrink-0">{STEP_NUMBERS[stepKey]}</span>
                <span className="text-sm font-medium leading-snug flex-1 min-w-0">{STEP_NAMES[stepKey]}</span>
                {active && hasModifications && (
                  <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Horizontal variant (default)
  function renderRow(steps) {
    return steps.map((stepKey, idx) => {
      const active = isStepActive(stepKey, config)
      const stepData = spec.workflow_steps[stepKey]
      const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
      return (
        <div key={stepKey} className="flex items-center">
          <StepNode
            stepKey={stepKey}
            active={active}
            isSelected={activeStepKey === stepKey}
            hasModifications={mods.length > 0}
            stepData={stepData}
            onStepClick={onStepClick}
          />
          {idx < steps.length - 1 && (
            <HorizontalConnector
              fromActive={active}
              toActive={isStepActive(steps[idx + 1], config)}
            />
          )}
        </div>
      )
    })
  }

  return (
    <div>
      {/* Row 1: Steps 0–5 */}
      <div className="flex items-stretch flex-wrap gap-y-2">
        {renderRow(ROW1)}
      </div>

      {/* Row wrap connector */}
      <div className="ml-1 my-1">
        <svg
          className="text-slate-700"
          width="18" height="18"
          viewBox="0 0 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2 L14 12 L4 12" />
          <path d="M7 9 L4 12 L7 15" />
        </svg>
      </div>

      {/* Row 2: Steps 6–10 */}
      <div className="flex items-stretch flex-wrap gap-y-2">
        {renderRow(ROW2)}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-800/50">
        <LegendItem color="border-slate-700 bg-slate-800/60" label="Active step" />
        <LegendItem color="border-slate-800 bg-slate-900/30 opacity-50" label="Skipped step" />
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
          <span className="text-xs text-slate-500">Affected by your configuration</span>
        </div>
      </div>
    </div>
  )
}

function StepNode({ stepKey, active, isSelected, hasModifications, stepData, onStepClick }) {
  const stepNum = parseInt(stepKey.replace('step_', ''))

  return (
    <button
      onClick={() => active && onStepClick(stepKey)}
      disabled={!active}
      className={`relative group flex flex-col items-start p-3 rounded-xl border transition-all duration-200 w-32 text-left ${
        !active
          ? 'border-slate-800 bg-slate-900/20 opacity-40 cursor-default'
          : isSelected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 cursor-pointer'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800 cursor-pointer'
      }`}
    >
      <div className={`text-xs font-bold mb-1 ${
        !active ? 'text-slate-500' : isSelected ? 'text-cyan-400' : 'text-slate-500'
      }`}>
        Step {stepNum}
      </div>

      <div className={`text-sm font-semibold leading-snug ${
        !active ? 'text-slate-500' : isSelected ? 'text-cyan-200' : 'text-slate-200'
      }`}>
        {STEP_NAMES[stepKey]}
      </div>

      <div className={`text-xs mt-1 leading-snug ${
        !active ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {active ? cleanOwnerText(stepData.primary_owner) : ''}
      </div>

      {!active && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
          Skipped
        </div>
      )}

      {active && hasModifications && (
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-900" />
      )}
    </button>
  )
}

function HorizontalConnector({ fromActive, toActive }) {
  const active = fromActive && toActive
  return (
    <div className={`flex items-center flex-shrink-0 ${!active ? 'opacity-20' : ''}`}>
      <div className={`h-px w-3 ${active ? 'bg-slate-600' : 'bg-slate-800'}`} />
      <svg className={`w-2 h-2 flex-shrink-0 ${active ? 'text-slate-500' : 'text-slate-600'}`} viewBox="0 0 6 6" fill="currentColor">
        <path d="M0 0l6 3-6 3z" />
      </svg>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-4 rounded border ${color}`} />
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}
