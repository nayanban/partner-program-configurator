import { useState } from 'react'
import { getActiveWorkflowModifications, computeHasFinancialMotion, TOOL_RECOMMENDATIONS } from '../engine'

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

function getToolsForStep(stepKey, config) {
  const categories = STEP_TOOL_MAP[stepKey] || []
  return TOOL_RECOMMENDATIONS.filter(t =>
    categories.includes(t.category) && t.activeWhen(config)
  )
}

const CONFIG_NOTE_LABELS = {
  'DP1_no_integration': 'No technical integration',
  'DP1_has_integration': 'Technical integration active',
  'DP1_direction': 'Integration direction',
  'DP2': 'Commercial motions',
  'DP2_motions': 'Commercial motions',
  'DP2_financial_motion': 'Financial motion active',
  'DP2_no_financial_motion': 'No financial motion',
  'DP2_co_sell_direction': 'Co-sell direction',
  'DP2_co_marketing': 'Co-marketing',
  'DP2_marketplace': 'Marketplace motion',
  'DP2_referral_direction': 'Referral direction',
  'DP3_neither': 'No certification',
  'DP3_partner_cert': 'Partner certification',
  'DP3_integration_cert': 'Certification requirement',
  'DP4_yes': 'Regulated industries',
  'DP4_no': 'No regulatory requirement',
}

function getApplicableConfigNotes(notes, config) {
  if (!notes || typeof notes !== 'object') return []
  return Object.entries(notes).filter(([key, text]) => {
    if (typeof text !== 'string') return false
    if (text.includes('structured_specification') || text.includes('workflow_modification_rules')) return false
    if (key.includes('DP1_no_integration') && config.dp1 !== 'no_integration') return false
    if (key.includes('DP1_has_integration') && config.dp1 === 'no_integration') return false
    if (key.includes('DP1_direction') && config.dp1 === 'no_integration') return false
    if (key.includes('DP2_financial_motion') && !computeHasFinancialMotion(config)) return false
    if (key.includes('DP2_no_financial_motion') && computeHasFinancialMotion(config)) return false
    if (key.includes('DP2_co_sell_direction') && !config.dp2.motions.includes('co_sell')) return false
    if (key.includes('DP2_co_marketing') && !config.dp2.motions.includes('co_marketing')) return false
    if (key.includes('DP2_marketplace') && !config.dp2.motions.some(m => m.startsWith('marketplace_'))) return false
    if (key.includes('DP2_referral_direction') && !(config.dp2.motions.includes('referral_inbound') && config.dp2.motions.includes('referral_outbound'))) return false
    if (key.includes('DP3_partner_cert') && !['partner_cert_only', 'both'].includes(config.dp3)) return false
    if (key.includes('DP3_integration_cert') && !['integration_cert_only', 'both'].includes(config.dp3)) return false
    if (key.includes('DP3_neither') && config.dp3 !== 'neither') return false
    if (key.includes('DP4_yes') && config.dp4 !== 'yes') return false
    if (key.includes('DP4_no') && config.dp4 !== 'no') return false
    return true
  }).map(([key, text]) => ({
    label: CONFIG_NOTE_LABELS[key] || key.replace(/_/g, ' '),
    text,
  }))
}

function isPlayActive(play, config) {
  const aw = (play.active_when || '').toLowerCase()
  if (!aw || aw === 'always') return true
  if (aw.includes('co_sell') && !config.dp2.motions.includes('co_sell')) return false
  if (aw.includes('co_marketing') && !config.dp2.motions.includes('co_marketing')) return false
  if (aw.includes('marketplace') && !config.dp2.motions.some(m => m.startsWith('marketplace_'))) return false
  if (aw.includes('financial') && !computeHasFinancialMotion(config)) return false
  return true
}

function isFieldActive(field, config) {
  if (!field.conditional) return true
  const notes = (field.notes || '').toLowerCase()
  if (notes.includes('dp4') || notes.includes('compliance') || notes.includes('regulated')) {
    return config.dp4 === 'yes'
  }
  if (notes.includes('dp1') || notes.includes('integration')) {
    return config.dp1 !== 'no_integration'
  }
  if (notes.includes('dp3') || notes.includes('certification') || notes.includes('cert')) {
    return config.dp3 !== 'neither'
  }
  if (notes.includes('dp2') || notes.includes('financial') || notes.includes('marketplace') || notes.includes('co_sell') || notes.includes('co-sell')) {
    return computeHasFinancialMotion(config)
  }
  return true
}

function AccordionSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  if (!children) return null

  return (
    <div className="border-t border-slate-800/50">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-2.5 py-3.5 text-left group"
      >
        <svg
          className={`w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-200 transition-colors">
          {title}
        </span>
      </button>
      {isOpen && <div className="pb-4 pl-6">{children}</div>}
    </div>
  )
}

function ObjectDetail({ obj, fields, activeCount, totalCount, config }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border border-slate-800 rounded-lg">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-3 py-2 text-left">
        <div>
          <div className="text-sm font-medium text-slate-300">{obj.object_name}</div>
          <div className="text-xs text-slate-500">{obj.created_at_step}</div>
        </div>
        <div className="text-xs text-slate-500">{activeCount}/{totalCount} fields</div>
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-800">
          <table className="w-full text-xs mt-2">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-1 font-medium">Field</th>
                <th className="text-left py-1 font-medium">Type</th>
                <th className="text-center py-1 font-medium">Active</th>
                <th className="text-left py-1 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((f, i) => {
                const active = !f.conditional || isFieldActive(f, config)
                return (
                  <tr key={i} className={active ? '' : 'opacity-40'}>
                    <td className="py-1 text-slate-300 font-mono">{f.name}</td>
                    <td className="py-1 text-slate-400">{f.type}</td>
                    <td className="py-1 text-center">
                      {active ? <span className="text-cyan-400">✓</span> : <span className="text-slate-500">✗</span>}
                    </td>
                    <td className="py-1 text-slate-500">{f.notes || ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function StepCard({ stepKey, stepData, contentData, config, spec }) {
  const stepContent = contentData?.steps?.[stepKey]
  if (!stepContent) {
    return <div className="p-6 text-slate-400">No content available for this step.</div>
  }

  return (
    <div className="px-6 pb-8">
      {/* Section 1: Purpose — always present, open by default */}
      <AccordionSection title="Purpose" defaultOpen={true}>
        <p className="text-sm text-slate-200 leading-relaxed">{stepContent.purpose}</p>
      </AccordionSection>

      {/* Section 2: Inputs */}
      {stepContent.inputs && stepContent.inputs.length > 0 && (
        <AccordionSection title="Inputs">
          <ul className="space-y-1.5">
            {(Array.isArray(stepContent.inputs) ? stepContent.inputs : [stepContent.inputs]).map((input, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-slate-500 mt-0.5">•</span>
                <span>{typeof input === 'string' ? input : JSON.stringify(input)}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Section 3: Scope of Work */}
      {stepContent.owns && (
        <AccordionSection title="Scope of Work">
          {stepKey === 'step_4' && Array.isArray(stepContent.owns) ? (
            <div className="space-y-3">
              {stepContent.owns.map((track, i) => {
                if ((track.track || '').includes('Compliance') && config.dp4 !== 'yes') return null
                if ((track.track || '').includes('Commercial') && !computeHasFinancialMotion(config) && !config.dp2.motions.includes('co_marketing')) return null
                return track.track ? (
                  <div key={i} className="border border-slate-800 rounded-lg p-3">
                    <div className="text-sm font-semibold text-slate-300 mb-2">{track.track}</div>
                    {track.items && (
                      <ul className="space-y-1">
                        {track.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-slate-500 mt-0.5">•</span><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {track.configuration_note && (
                      <p className="text-xs text-slate-500 mt-2 italic">{track.configuration_note}</p>
                    )}
                  </div>
                ) : null
              })}
            </div>
          ) : stepKey === 'step_9' && Array.isArray(stepContent.owns) ? (
            <div className="space-y-3">
              {stepContent.owns.map((play, i) => {
                if (!isPlayActive(play, config)) return null
                const filteredItems = (play.items || []).filter(item => {
                  if (config.dp1 === 'no_integration' && typeof item === 'string' && item.toLowerCase().includes('deeper integration')) return false
                  return true
                })
                return (
                  <div key={i} className="border border-slate-800 rounded-lg p-3">
                    <div className="text-sm font-semibold text-slate-300 mb-2">{play.play}</div>
                    <ul className="space-y-1">
                      {filteredItems.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                          <span className="text-slate-500 mt-0.5">•</span>
                          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          ) : (
            <ul className="space-y-1.5">
              {(Array.isArray(stepContent.owns) ? stepContent.owns : [stepContent.owns]).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-slate-500 mt-0.5">•</span>
                  <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          )}
        </AccordionSection>
      )}

      {/* Section 4: Outputs */}
      {stepContent.outputs && stepContent.outputs.length > 0 && (
        <AccordionSection title="Outputs">
          <ul className="space-y-1.5">
            {stepContent.outputs.map((output, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-cyan-400 mt-0.5">→</span>
                <span>{typeof output === 'string' ? output : JSON.stringify(output)}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Section 5: Relevant Tools */}
      {(() => {
        const tools = getToolsForStep(stepKey, config)
        if (tools.length === 0) return null
        return (
          <AccordionSection title="Relevant Tools">
            <p className="text-xs text-slate-400 mb-3">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tools.map((t, i) => (
                <div key={i} className="border border-slate-800 rounded-lg p-3">
                  <div className="text-sm font-semibold text-slate-300">{t.category}</div>
                  <div className="text-xs text-slate-400 mt-1">{t.tools}</div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )
      })()}

      {/* Section 6: Out of Scope */}
      {stepContent.explicitly_does_not_do && stepContent.explicitly_does_not_do.length > 0 && (
        <AccordionSection title="Out of Scope">
          <ul className="space-y-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
            {stepContent.explicitly_does_not_do.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span><span>{item}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      {/* Section 7: Completion Criteria */}
      {(() => {
        const cc = stepData.completion_criteria
        if (!cc) return null

        if (cc.done_label_for_step5_start) {
          return (
            <AccordionSection title="Completion Criteria">
              <div className="space-y-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <div className="text-xs text-slate-400 mb-1">To unlock implementation (Step 5)</div>
                  <p className="text-sm text-slate-200">{cc.done_label_for_step5_start}</p>
                </div>
                {cc.done_label_for_step6_start && (
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-slate-400 mb-1">To unlock launch (Step 6/7)</div>
                    <p className="text-sm text-slate-200">{cc.done_label_for_step6_start}</p>
                  </div>
                )}
              </div>
            </AccordionSection>
          )
        }

        const label = cc.done_label || cc.note || null
        if (!label) return null
        return (
          <AccordionSection title="Completion Criteria">
            <p className="text-sm text-slate-200 font-medium">{label}</p>
          </AccordionSection>
        )
      })()}

      {/* Section 8: Entry Triggers — Step 9 only */}
      {stepKey === 'step_9' && stepContent.entry_triggers && (
        <AccordionSection title="Entry Triggers">
          {stepContent.entry_triggers.description && (
            <p className="text-sm text-slate-300 mb-3">{stepContent.entry_triggers.description}</p>
          )}
          {stepContent.entry_triggers.gates && (
            <ul className="space-y-1.5">
              {stepContent.entry_triggers.gates.map((gate, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 mt-0.5">✓</span><span>{gate}</span>
                </li>
              ))}
            </ul>
          )}
          {stepContent.entry_triggers.governance_note && (
            <p className="text-xs text-slate-400 mt-3">{stepContent.entry_triggers.governance_note}</p>
          )}
        </AccordionSection>
      )}

      {/* Section 9: Minimum to Unblock — Step 4 only */}
      {stepKey === 'step_4' && stepContent.minimum_to_unblock_criteria && (
        <AccordionSection title="Minimum to Unblock">
          {stepContent.minimum_to_unblock_criteria.description && (
            <p className="text-sm text-slate-300 mb-3">{stepContent.minimum_to_unblock_criteria.description}</p>
          )}
          {stepContent.minimum_to_unblock_criteria.conditions && (
            <ul className="space-y-1.5">
              {stepContent.minimum_to_unblock_criteria.conditions.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 mt-0.5">☐</span><span>{c}</span>
                </li>
              ))}
            </ul>
          )}
          {config.dp4 === 'yes' && stepContent.minimum_to_unblock_criteria.when_DP4_yes && (
            <p className="text-sm text-amber-400/80 mt-3">{stepContent.minimum_to_unblock_criteria.when_DP4_yes}</p>
          )}
          {config.dp1 === 'no_integration' && stepContent.minimum_to_unblock_criteria.when_DP1_no_integration && (
            <p className="text-sm text-slate-400 mt-3">{stepContent.minimum_to_unblock_criteria.when_DP1_no_integration}</p>
          )}
        </AccordionSection>
      )}

      {/* Section 10: Go-live Criteria — Step 4 only */}
      {stepKey === 'step_4' && stepContent.go_live_criteria && (
        <AccordionSection title="Go-live Criteria">
          {stepContent.go_live_criteria.description && (
            <p className="text-sm text-slate-300 mb-3">{stepContent.go_live_criteria.description}</p>
          )}
          {stepContent.go_live_criteria.conditions && (
            <ul className="space-y-1.5">
              {stepContent.go_live_criteria.conditions.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-cyan-400 mt-0.5">☐</span><span>{c}</span>
                </li>
              ))}
            </ul>
          )}
          {config.dp4 === 'yes' && stepContent.go_live_criteria.when_DP4_yes && (
            <p className="text-sm text-amber-400/80 mt-3">{stepContent.go_live_criteria.when_DP4_yes}</p>
          )}
          {config.dp4 === 'no' && stepContent.go_live_criteria.when_DP4_no && (
            <p className="text-sm text-slate-400 mt-3">{stepContent.go_live_criteria.when_DP4_no}</p>
          )}
        </AccordionSection>
      )}

      {/* Section 11: Handoff */}
      {(stepContent.handoff || stepContent.handoff_note) && (
        <AccordionSection title="Handoff">
          {stepContent.handoff && <p className="text-sm text-slate-300 leading-relaxed">{stepContent.handoff}</p>}
          {stepContent.handoff_note && <p className="text-sm text-slate-400 italic mt-2">{stepContent.handoff_note}</p>}
        </AccordionSection>
      )}

      {/* Section 12: How Your Configuration Affects This Step */}
      {(() => {
        const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
        const configNotes = getApplicableConfigNotes(stepContent.configuration_notes, config)
        if (mods.length === 0 && configNotes.length === 0) return null

        return (
          <AccordionSection title="How Your Configuration Affects This Step">
            <div className="space-y-2">
              {mods.map((mod, i) => (
                <div key={`mod-${i}`} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                  <div className="text-xs font-medium text-amber-400 mb-1">{mod.label}</div>
                  <p className="text-sm text-slate-300">{mod.text}</p>
                </div>
              ))}
              {configNotes.map((note, i) => (
                <div key={`note-${i}`} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-400 mb-1">{note.label}</div>
                  <p className="text-sm text-slate-400">{note.text}</p>
                </div>
              ))}
            </div>
          </AccordionSection>
        )
      })()}

      {/* Section 13: Decision Rights & Escalation */}
      {stepContent.tie_breaker_escalation && Array.isArray(stepContent.tie_breaker_escalation) && stepContent.tie_breaker_escalation.length > 0 && (
        <AccordionSection title="Decision Rights & Escalation">
          <div className="space-y-3">
            {stepContent.tie_breaker_escalation.map((item, i) => {
              const isInactive = item.configuration_dependent &&
                item.active_when && item.active_when.includes("'yes'") && config.dp4 !== 'yes'
              return (
                <div key={i} className={`flex gap-3 ${isInactive ? 'opacity-40' : ''}`}>
                  <div className="text-sm font-medium text-slate-300 w-36 flex-shrink-0">
                    {item.authority}
                  </div>
                  <div className="text-sm text-slate-400 flex-1">
                    {item.scope}
                    {isInactive && item.when_inactive && (
                      <span className="text-slate-500 italic ml-1">({item.when_inactive})</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </AccordionSection>
      )}

      {/* Section 14: Exception Handling */}
      {stepContent.failure_exception_paths && stepContent.failure_exception_paths.length > 0 && (
        <AccordionSection title="Exception Handling">
          <div className="space-y-2">
            {stepContent.failure_exception_paths.map((path, i) => (
              <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                <div className="text-sm font-medium text-red-400/80 mb-1">{path.condition}</div>
                <p className="text-sm text-slate-400">{path.response}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Section 15: Loop-back Triggers */}
      {stepContent.loop_back_triggers && stepContent.loop_back_triggers.length > 0 && (
        <AccordionSection title="Loop-back Triggers">
          <div className="space-y-2">
            {stepContent.loop_back_triggers.map((trigger, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-sm text-amber-400/80 w-28 flex-shrink-0">
                  → {trigger.target || trigger.target_step || trigger.source || 'Unknown'}
                </div>
                <p className="text-sm text-slate-400">{trigger.trigger}</p>
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Section 16: Data Schema for This Step */}
      {(() => {
        const objKeys = stepData.objects_produced_or_updated || []
        if (objKeys.length === 0) return null

        return (
          <AccordionSection title="Data Schema for This Step">
            <p className="text-xs text-slate-400 mb-3">
              Data objects created or updated in this step. Use this as the schema when configuring your system of record for this workflow stage.
            </p>
            <div className="space-y-3">
              {objKeys.map(objKey => {
                const obj = spec.objects[objKey]
                if (!obj) return null
                const fields = obj.fields || []
                const activeCount = fields.filter(f => !f.conditional || isFieldActive(f, config)).length
                return (
                  <ObjectDetail
                    key={objKey}
                    obj={obj}
                    fields={fields}
                    activeCount={activeCount}
                    totalCount={fields.length}
                    config={config}
                  />
                )
              })}
            </div>
          </AccordionSection>
        )
      })()}
    </div>
  )
}
