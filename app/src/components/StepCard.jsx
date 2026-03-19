import { useState } from 'react'
import { getActiveWorkflowModifications, computeHasFinancialMotion } from '../engine'

export default function StepCard({ stepKey, stepData, contentData, config, spec }) {
  const [expanded, setExpanded] = useState(false)
  const [showFullDetail, setShowFullDetail] = useState(false)

  const stepNum = parseInt(stepKey.replace('step_', ''))
  const stepContent = contentData?.steps?.[stepKey]
  const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
  const hasFinancial = computeHasFinancialMotion(config)

  return (
    <div className={`border rounded-xl transition-all duration-200 ${
      expanded ? 'border-slate-700 bg-slate-900/80' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
    }`}>
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
            {stepNum}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">{stepData.step_name}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stepData.primary_owner}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {mods.length > 0 && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {mods.length} {mods.length === 1 ? 'modification' : 'modifications'}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-800">
          {/* Purpose */}
          {stepContent?.purpose && (
            <Section title="Purpose">
              <p className="text-sm text-slate-300 leading-relaxed">{stepContent.purpose}</p>
            </Section>
          )}

          {/* Inputs */}
          {stepContent?.inputs && stepContent.inputs.length > 0 && (
            <Section title="Inputs">
              <ul className="space-y-1">
                {(Array.isArray(stepContent.inputs) ? stepContent.inputs : [stepContent.inputs]).map((input, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-slate-600 mt-0.5">•</span>
                    <span>{input}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Owns / Scope of Work */}
          {stepContent?.owns && (
            <Section title="Scope of Work">
              {renderOwns(stepKey, stepContent.owns, config)}
            </Section>
          )}

          {/* Step 9 entry triggers */}
          {stepKey === 'step_9' && stepData.progression_gate && (
            <Section title="Entry Triggers">
              <Step9EntryTriggers contentData={contentData} />
            </Section>
          )}

          {/* Outputs */}
          {stepContent?.outputs && stepContent.outputs.length > 0 && (
            <Section title="Outputs">
              <ul className="space-y-1">
                {(Array.isArray(stepContent.outputs) ? stepContent.outputs : [stepContent.outputs]).map((output, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-cyan-600 mt-0.5">→</span>
                    <span>{output}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Explicitly Does Not Do */}
          {stepContent?.explicitly_does_not_do && stepContent.explicitly_does_not_do.length > 0 && (
            <Section title="Explicitly Does Not Do">
              <ul className="space-y-1 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                {stepContent.explicitly_does_not_do.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                    <span className="text-red-700 mt-0.5 flex-shrink-0">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Completion Criteria */}
          <CompletionCriteriaSection stepKey={stepKey} stepData={stepData} />

          {/* Handoff */}
          {stepContent?.handoff && (
            <Section title="Handoff">
              <p className="text-sm text-slate-400">{stepContent.handoff}</p>
            </Section>
          )}

          {/* Layer 2 — Configuration Impact */}
          {(mods.length > 0 || stepContent?.configuration_notes) && (
            <Section title="How your configuration affects this step">
              <div className="space-y-2">
                {mods.map((mod, i) => (
                  <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <div className="text-xs font-medium text-amber-400 mb-1">{mod.label}</div>
                    <p className="text-xs text-slate-300">{mod.text}</p>
                  </div>
                ))}
                {stepContent?.configuration_notes && typeof stepContent.configuration_notes === 'object' && (
                  <div className="space-y-2">
                    {Object.entries(stepContent.configuration_notes).map(([key, text]) => {
                      if (key.includes('DP1_no_integration') && config.dp1 !== 'no_integration') return null
                      if (key.includes('DP1_has_integration') && config.dp1 === 'no_integration') return null
                      if (key.includes('DP1_direction') && config.dp1 === 'no_integration') return null
                      if (key.includes('DP2_financial_motion') && !computeHasFinancialMotion(config)) return null
                      if (key.includes('DP2_no_financial_motion') && computeHasFinancialMotion(config)) return null
                      if (key.includes('DP2_co_sell_direction') && !config.dp2.motions.includes('co_sell')) return null
                      if (key.includes('DP2_co_marketing') && !config.dp2.motions.includes('co_marketing')) return null
                      if (key.includes('DP2_marketplace') && !config.dp2.motions.some(m => m.startsWith('marketplace_'))) return null
                      if (key.includes('DP2_referral_direction') && !(config.dp2.motions.includes('referral_inbound') && config.dp2.motions.includes('referral_outbound'))) return null
                      if (key.includes('DP3_partner_cert') && !['partner_cert_only', 'both'].includes(config.dp3)) return null
                      if (key.includes('DP3_integration_cert') && !['integration_cert_only', 'both'].includes(config.dp3)) return null
                      if (key.includes('DP3_neither') && config.dp3 !== 'neither') return null
                      if (key.includes('DP4_yes') && config.dp4 !== 'yes') return null
                      if (key.includes('DP4_no') && config.dp4 !== 'no') return null
                      return (
                        <div key={key} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                          <div className="text-xs font-medium text-slate-400 mb-1">{key.replace(/_/g, ' ')}</div>
                          <p className="text-xs text-slate-400">{text}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
                {stepContent?.configuration_notes && typeof stepContent.configuration_notes === 'string' && (
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                    <div className="text-xs font-medium text-slate-400 mb-1">Configuration note</div>
                    <p className="text-xs text-slate-400">{stepContent.configuration_notes}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Layer 3 toggle */}
          <button
            onClick={() => setShowFullDetail(d => !d)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${showFullDetail ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {showFullDetail ? 'Hide full detail' : 'Show full detail'}
          </button>

          {/* Layer 3 — Full detail */}
          {showFullDetail && stepContent && (
            <FullDetailLayer stepContent={stepContent} stepData={stepData} config={config} />
          )}
        </div>
      )}
    </div>
  )
}

function renderOwns(stepKey, owns, config) {
  const hasFinancial = computeHasFinancialMotion(config)

  // Step 4 special: owns is array of track objects
  if (stepKey === 'step_4' && Array.isArray(owns)) {
    return (
      <div className="space-y-3">
        {owns.map((track, i) => {
          if (track.track === 'Compliance / Risk Review' && config.dp4 !== 'yes') return null
          if (track.track === 'Commercial / Finance' && !hasFinancial && !config.dp2.motions.includes('co_marketing')) return null
          return (
            <div key={i} className="border border-slate-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">{track.track}</span>
                {track.always_active && (
                  <span className="text-xs text-slate-600">Always active</span>
                )}
              </div>
              {track.items && (
                <ul className="space-y-1">
                  {track.items.map((item, j) => (
                    <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {track.configuration_note && (
                <p className="text-xs text-slate-500 mt-2 italic">{track.configuration_note}</p>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Step 9 special: owns is array of play objects
  if (stepKey === 'step_9' && Array.isArray(owns)) {
    return (
      <div className="space-y-3">
        {owns.map((play, i) => {
          // Evaluate active_when
          if (!evaluatePlayActive(play, config)) return null
          return (
            <div key={i} className="border border-slate-800 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-300 mb-2">{play.play}</div>
              {play.items && (
                <ul className="space-y-1">
                  {play.items.filter(item => {
                    // Remove "Deeper integration depth" when dp1=no_integration
                    if (config.dp1 === 'no_integration' && item.toLowerCase().includes('deeper integration')) return false
                    return true
                  }).map((item, j) => (
                    <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // Default: string or array of strings
  if (typeof owns === 'string') {
    return <p className="text-sm text-slate-400">{owns}</p>
  }

  if (Array.isArray(owns)) {
    return (
      <ul className="space-y-1">
        {owns.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
            <span className="text-slate-600 mt-0.5">•</span>
            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    )
  }

  return null
}

function evaluatePlayActive(play, config) {
  const condition = play.active_when
  if (!condition || condition === 'always') return true
  const hasFinancial = computeHasFinancialMotion(config)

  // Simple heuristic evaluation
  if (condition.includes('co_sell') && config.dp2.motions.includes('co_sell')) return true
  if (condition.includes('co_marketing') && config.dp2.motions.includes('co_marketing')) return true
  if (condition.includes('marketplace') && config.dp2.motions.some(m => m.startsWith('marketplace_'))) return true
  if (condition.includes('always')) return true
  // Expansion play is always shown
  return true
}

function Step9EntryTriggers({ contentData }) {
  const triggers = contentData?.steps?.step_9?.entry_triggers
  if (!triggers) return null

  return (
    <div className="space-y-3">
      {triggers.description && (
        <p className="text-sm text-slate-400 italic">{triggers.description}</p>
      )}
      {triggers.gates && (
        <ul className="space-y-1.5">
          {triggers.gates.map((gate, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-cyan-600 mt-0.5 text-xs">✓</span>
              <span>{gate}</span>
            </li>
          ))}
        </ul>
      )}
      {triggers.governance_note && (
        <p className="text-xs text-slate-500 mt-2">{triggers.governance_note}</p>
      )}
    </div>
  )
}

function CompletionCriteriaSection({ stepKey, stepData }) {
  const cc = stepData.completion_criteria
  if (!cc) return null

  if (stepKey === 'step_4') {
    return (
      <Section title="Completion Criteria">
        <div className="space-y-3">
          {cc.done_label_for_step5_start && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-400 mb-1">To unlock Step 5 (implementation)</div>
              <p className="text-xs text-slate-300">{cc.done_label_for_step5_start}</p>
            </div>
          )}
          {cc.done_label_for_step6_start && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs font-medium text-slate-400 mb-1">To unlock Step 6 (launch readiness)</div>
              <p className="text-xs text-slate-300">{cc.done_label_for_step6_start}</p>
            </div>
          )}
        </div>
      </Section>
    )
  }

  const doneLabel = cc.done_label
  if (doneLabel) {
    return (
      <Section title="Completion Criteria">
        <p className="text-sm text-slate-300 font-medium">{doneLabel}</p>
      </Section>
    )
  }

  return null
}

function FullDetailLayer({ stepContent, stepData, config }) {
  const hasFinancial = computeHasFinancialMotion(config)

  return (
    <div className="space-y-4 pt-2 border-t border-slate-800">
      {/* Tie-breakers / Escalation */}
      {stepContent.tie_breaker_escalation && stepContent.tie_breaker_escalation.length > 0 && (
        <Section title="Decision Rights & Escalation">
          <div className="space-y-2">
            {stepContent.tie_breaker_escalation.map((item, i) => {
              const isInactive = item.configuration_dependent && (
                (item.active_when && item.active_when.includes("'yes'") && config.dp4 !== 'yes') ||
                (item.active_when && item.active_when.includes("'no'") && config.dp4 !== 'no')
              )
              return (
                <div key={i} className={`flex gap-3 ${isInactive ? 'opacity-40' : ''}`}>
                  <div className="text-xs font-medium text-slate-400 w-32 flex-shrink-0">
                    {item.authority || item.who}
                  </div>
                  <div className="text-xs text-slate-500 flex-1">
                    {item.scope || item.what}
                    {isInactive && item.when_inactive && (
                      <span className="text-slate-700 ml-1">({item.when_inactive})</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

      {/* Failure / Exception paths */}
      {stepContent.failure_exception_paths && stepContent.failure_exception_paths.length > 0 && (
        <Section title="Exception Handling">
          <div className="space-y-2">
            {stepContent.failure_exception_paths.map((path, i) => (
              <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                <div className="text-xs font-medium text-red-400/70 mb-1">
                  {path.condition || path.scenario || `Exception ${i + 1}`}
                </div>
                <p className="text-xs text-slate-500">
                  {path.response || path.action || path.resolution || JSON.stringify(path)}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Loop-back triggers */}
      {stepContent.loop_back_triggers && stepContent.loop_back_triggers.length > 0 && (
        <Section title="Loop-back Triggers">
          <div className="space-y-2">
            {stepContent.loop_back_triggers.map((trigger, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-xs text-amber-500/70 w-20 flex-shrink-0">
                  → Step {trigger.target || trigger.target_step || '?'}
                </div>
                <p className="text-xs text-slate-500">{trigger.trigger || trigger.condition}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="pt-4">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  )
}
