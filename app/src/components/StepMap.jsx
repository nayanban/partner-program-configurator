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

// Col 1: steps 0-5 (rows 1,3,5,7,9,11). Col 2: steps 6-10 (rows 11,13,15,17,19).
// Step 5 and Step 6 share row 11, connected by a horizontal bridge.
const COL1 = ['step_0', 'step_1', 'step_2', 'step_3', 'step_4', 'step_5']
const COL2 = ['step_6', 'step_7', 'step_8', 'step_9', 'step_10']
const COL2_START_ROW = (COL1.length - 1) * 2 + 1 // = 11

export default function StepMap({ config, spec, onStepClick, activeStepKey }) {
  const step5Active = isStepActive('step_5', config)
  const step6Active = isStepActive('step_6', config)

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 44px 1fr',
          justifyItems: 'center',
        }}
      >
        {/* Column 1 nodes */}
        {COL1.map((stepKey, i) => {
          const active = isStepActive(stepKey, config)
          const stepData = spec.workflow_steps[stepKey]
          const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
          return (
            <div key={stepKey} style={{ gridRow: i * 2 + 1, gridColumn: 1 }} className="w-full flex justify-center">
              <StepNode
                stepKey={stepKey}
                active={active}
                isSelected={activeStepKey === stepKey}
                hasModifications={mods.length > 0}
                stepData={stepData}
                onStepClick={onStepClick}
              />
            </div>
          )
        })}

        {/* Column 1 vertical connectors */}
        {COL1.slice(0, -1).map((stepKey, i) => {
          const thisActive = isStepActive(stepKey, config)
          const nextActive = isStepActive(COL1[i + 1], config)
          return (
            <div key={`c1-conn-${i}`} style={{ gridRow: i * 2 + 2, gridColumn: 1 }} className="flex justify-center">
              <VerticalConnector active={thisActive && nextActive} />
            </div>
          )
        })}

        {/* Horizontal bridge: connects Step 5 → Step 6 at row COL2_START_ROW */}
        <div
          style={{ gridRow: COL2_START_ROW, gridColumn: 2 }}
          className="flex items-center justify-center w-full self-center"
        >
          <div className={`flex items-center w-full transition-opacity ${step5Active && step6Active ? 'opacity-100' : 'opacity-20'}`}>
            <div className="h-px flex-1 bg-slate-600" />
            <svg className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" viewBox="0 0 6 6" fill="currentColor">
              <path d="M0 0l6 3-6 3z" />
            </svg>
          </div>
        </div>

        {/* Column 2 nodes */}
        {COL2.map((stepKey, i) => {
          const active = isStepActive(stepKey, config)
          const stepData = spec.workflow_steps[stepKey]
          const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
          return (
            <div key={stepKey} style={{ gridRow: COL2_START_ROW + i * 2, gridColumn: 3 }} className="w-full flex justify-center">
              <StepNode
                stepKey={stepKey}
                active={active}
                isSelected={activeStepKey === stepKey}
                hasModifications={mods.length > 0}
                stepData={stepData}
                onStepClick={onStepClick}
              />
            </div>
          )
        })}

        {/* Column 2 vertical connectors */}
        {COL2.slice(0, -1).map((stepKey, i) => {
          const thisActive = isStepActive(stepKey, config)
          const nextActive = isStepActive(COL2[i + 1], config)
          return (
            <div key={`c2-conn-${i}`} style={{ gridRow: COL2_START_ROW + i * 2 + 1, gridColumn: 3 }} className="flex justify-center">
              <VerticalConnector active={thisActive && nextActive} />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-800/50">
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
      className={`relative group flex flex-col items-start p-3.5 rounded-xl border transition-all duration-200 w-40 text-left ${
        !active
          ? 'border-slate-800 bg-slate-900/20 opacity-40 cursor-default'
          : isSelected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 cursor-pointer'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800 cursor-pointer'
      }`}
    >
      {/* Step number */}
      <div className={`text-xs font-bold mb-1.5 ${
        !active ? 'text-slate-700' : isSelected ? 'text-cyan-400' : 'text-slate-500'
      }`}>
        Step {stepNum}
      </div>

      {/* Step name */}
      <div className={`text-sm font-semibold leading-snug ${
        !active ? 'text-slate-700' : isSelected ? 'text-cyan-200' : 'text-slate-200'
      }`}>
        {STEP_NAMES[stepKey]}
      </div>

      {/* Owner */}
      <div className={`text-xs mt-1.5 leading-snug ${
        !active ? 'text-slate-800' : 'text-slate-500'
      }`}>
        {active ? (stepData.primary_owner?.split('/')[0]?.trim() || '') : ''}
      </div>

      {/* Skipped badge */}
      {!active && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
          Skipped
        </div>
      )}

      {/* Modification dot */}
      {active && hasModifications && (
        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-slate-900" />
      )}
    </button>
  )
}

function VerticalConnector({ active }) {
  return (
    <div className={`flex flex-col items-center ${!active ? 'opacity-20' : ''}`}>
      <div className={`w-px h-4 ${active ? 'bg-slate-600' : 'bg-slate-800'}`} />
      <svg className={`w-2 h-2 ${active ? 'text-slate-600' : 'text-slate-800'}`} viewBox="0 0 6 5" fill="currentColor">
        <path d="M0 0 L6 0 L3 5 Z" />
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
