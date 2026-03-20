import { isStepActive } from '../engine'

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

const RADIUS_X = 320
const RADIUS_Y = 210
const CENTER_X = 380
const CENTER_Y = 250
const NODE_W = 104
const NODE_H = 72
const CONTAINER_W = 760
const CONTAINER_H = 510

function getStepPos(idx) {
  const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / ALL_STEPS.length
  return {
    cx: CENTER_X + RADIUS_X * Math.cos(angle),
    cy: CENTER_Y + RADIUS_Y * Math.sin(angle),
  }
}

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
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  // Circular layout
  const positions = ALL_STEPS.map((_, idx) => getStepPos(idx))

  return (
    <div>
      <div className="relative overflow-hidden" style={{ width: CONTAINER_W, height: CONTAINER_H }}>
        {/* SVG connector lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={CONTAINER_W}
          height={CONTAINER_H}
        >
          {ALL_STEPS.map((stepKey, idx) => {
            const nextIdx = (idx + 1) % ALL_STEPS.length
            const from = positions[idx]
            const to = positions[nextIdx]
            const fromActive = isStepActive(stepKey, config)
            const toActive = isStepActive(ALL_STEPS[nextIdx], config)
            const lineActive = fromActive && toActive
            const isLoop = idx === ALL_STEPS.length - 1
            return (
              <line
                key={stepKey}
                x1={Math.round(from.cx)}
                y1={Math.round(from.cy)}
                x2={Math.round(to.cx)}
                y2={Math.round(to.cy)}
                stroke={lineActive ? '#475569' : '#1e293b'}
                strokeWidth={1.5}
                strokeDasharray={isLoop ? '5 4' : undefined}
                strokeOpacity={lineActive ? 1 : 0.5}
              />
            )
          })}
        </svg>

        {/* Step nodes */}
        {ALL_STEPS.map((stepKey, idx) => {
          const active = isStepActive(stepKey, config)
          const isSelected = activeStepKey === stepKey
          const { cx, cy } = positions[idx]
          const stepData = spec.workflow_steps[stepKey]
          return (
            <div
              key={stepKey}
              className="absolute"
              style={{
                left: Math.round(cx - NODE_W / 2),
                top: Math.round(cy - NODE_H / 2),
                width: NODE_W,
                height: NODE_H,
              }}
            >
              <StepNode
                stepKey={stepKey}
                active={active}
                isSelected={isSelected}
                stepData={stepData}
                onStepClick={onStepClick}
              />
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 pt-3 border-t border-slate-800/50">
        <LegendItem color="border-slate-700 bg-slate-800/60" label="Active step" />
        <LegendItem color="border-slate-800 bg-slate-900/30 opacity-50" label="Skipped step" />
      </div>
    </div>
  )
}

function StepNode({ stepKey, active, isSelected, stepData, onStepClick }) {
  const stepNum = parseInt(stepKey.replace('step_', ''))

  return (
    <button
      onClick={() => active && onStepClick(stepKey)}
      disabled={!active}
      className={`relative flex flex-col items-start p-2 rounded-xl border transition-all duration-200 w-full h-full text-left ${
        !active
          ? 'border-slate-800 bg-slate-900/20 opacity-40 cursor-default'
          : isSelected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 cursor-pointer'
          : 'border-slate-700 bg-slate-800/60 hover:border-slate-500 hover:bg-slate-800 cursor-pointer'
      }`}
    >
      <div className={`text-[10px] font-bold mb-0.5 ${
        !active ? 'text-slate-500' : isSelected ? 'text-cyan-400' : 'text-slate-500'
      }`}>
        Step {stepNum}
      </div>

      <div className={`text-xs font-semibold leading-snug ${
        !active ? 'text-slate-500' : isSelected ? 'text-cyan-200' : 'text-slate-200'
      }`}>
        {STEP_NAMES[stepKey]}
      </div>

      <div className={`text-[10px] mt-0.5 leading-snug truncate w-full ${
        !active ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {active ? cleanOwnerText(stepData?.primary_owner) : ''}
      </div>

      {!active && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-500 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap">
          Skipped
        </div>
      )}
    </button>
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
