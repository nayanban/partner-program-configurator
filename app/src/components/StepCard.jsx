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
  'DP1_no_integration_handoff': 'No technical integration',
  'DP1_has_integration': 'Technical integration active',
  'DP1_direction': 'Integration direction',
  'DP2': 'Commercial motions',
  'DP2_motions': 'Commercial motions',
  'DP2_financial_motion': 'Commercial motion active',
  'DP2_no_financial_motion': 'No commercial motion',
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

function cleanDPReferences(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bDP1\b/gi, 'integration direction')
    .replace(/\bDP2\b/gi, 'commercial motions')
    .replace(/\bDP3\b/gi, 'certification requirement')
    .replace(/\bDP4\b/gi, 'regulated industries')
}

function cleanFieldPaths(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bpartner_profile\.\w+/g, 'the partner profile')
    .replace(/\bpartner_record\.\w+/g, 'the partner record')
    .replace(/\bintegration_plan_spec\.\w+/g, 'the integration plan')
    .replace(/\bapproval_record\.\w+/g, 'the approval record')
    .replace(/\bcertification_record\.\w+/g, 'the certification record')
    .replace(/\blaunch_readiness_package\.\w+/g, 'the launch readiness package')
    .replace(/\boperational_handoff_package\.\w+/g, 'the operational handoff package')
    .replace(/\boperations_record\.\w+/g, 'the operations record')
    .replace(/\bgrowth_plan\.\w+/g, 'the growth plan')
    .replace(/\blifecycle_decision_record\.\w+/g, 'the lifecycle decision record')
}

function cleanTerminology(text) {
  if (typeof text !== 'string') return text
  return text
    .replace(/\bfinancial motions\b/gi, 'commercial motions')
    .replace(/\bfinancial motion\b/gi, 'commercial motion')
}

const cleanText = (text) => cleanTerminology(cleanFieldPaths(cleanDPReferences(text)))

function getContent(stepContent, field, config) {
  if (config.dp1 === 'no_integration' && stepContent[field + '_when_no_integration']) {
    return stepContent[field + '_when_no_integration']
  }
  return stepContent[field]
}

function capitalizeFirst(str) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
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
    label: CONFIG_NOTE_LABELS[key] || capitalizeFirst(key.replace(/_/g, ' ')),
    text: cleanText(text),
  }))
}

// Change 4: deduplicate config impact cards by first 50 chars of text
function deduplicateCards(mods, configNotes, trackNotes) {
  const allCards = [
    ...mods.map(m => ({ ...m, source: 'mod' })),
    ...configNotes.map(n => ({ ...n, source: 'note' })),
    ...trackNotes.map(t => ({ ...t, source: 'track' })),
  ]
  const seen = new Set()
  return allCards.filter(card => {
    const key = (card.text || '').toLowerCase().substring(0, 50).trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
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

// Bullet item — two-line block (colon items) or plain bullet; no individual mb-* (parent space-y handles spacing)
function BulletItem({ item }) {
  if (typeof item !== 'string') {
    return (
      <li className="flex items-start gap-2 text-sm text-slate-300">
        <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
        <span>{JSON.stringify(item)}</span>
      </li>
    )
  }
  if (item.includes(':')) {
    const colonIdx = item.indexOf(':')
    const label = item.slice(0, colonIdx).trim()
    const detail = item.slice(colonIdx + 1).trim()
    return (
      <li className="flex items-start gap-2">
        <span className="text-slate-500 mt-1 flex-shrink-0">•</span>
        <div>
          <div className="text-sm font-semibold text-slate-200">{label}</div>
          {detail && (
            <div className="text-sm text-slate-400 mt-0.5">
              {detail.replace(/^./, c => c.toUpperCase())}
            </div>
          )}
        </div>
      </li>
    )
  }
  return (
    <li className="flex items-start gap-2 text-sm text-slate-300">
      <span className="text-slate-500 mt-0.5 flex-shrink-0">•</span>
      <span>{item}</span>
    </li>
  )
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
          <div className="relative overflow-x-auto -mx-1">
            <div className="md:hidden absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none z-10" />
            <table className="w-full text-xs mt-2 min-w-[380px]">
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
        <p className="text-sm text-slate-200 leading-relaxed">{getContent(stepContent, 'purpose', config)}</p>
      </AccordionSection>

      {/* Section 2: Inputs */}
      {(() => {
        const inputs = getContent(stepContent, 'inputs', config)
        if (!inputs || !inputs.length) return null
        return (
          <AccordionSection title="Inputs">
            <ul className="space-y-1.5">
              {(Array.isArray(inputs) ? inputs : [inputs]).map((input, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-slate-500 mt-0.5">•</span>
                  <span>{typeof input === 'string' ? input : JSON.stringify(input)}</span>
                </li>
              ))}
            </ul>
          </AccordionSection>
        )
      })()}

      {/* Section 3: Entry Triggers — any step with entry_triggers data (Steps 5, 6, 9) */}
      {stepContent.entry_triggers && (
        <AccordionSection title="Entry Triggers">
          {stepContent.entry_triggers.description && (
            <p className="text-sm text-slate-300 mb-3">{stepContent.entry_triggers.description}</p>
          )}
          {stepContent.entry_triggers.gates && (
            <ul className="space-y-1.5">
              {stepContent.entry_triggers.gates
                .filter(gate => {
                  if (gate.includes('RevOps/Finance') && gate.includes('attribution and payout') && !computeHasFinancialMotion(config)) {
                    return false
                  }
                  return true
                })
                .map((gate, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-cyan-400 mt-0.5">✓</span><span>{gate}</span>
                  </li>
                ))}
            </ul>
          )}
          {config.dp4 === 'yes' && stepContent.entry_triggers.when_DP4_yes && (
            <p className="text-sm text-amber-400/80 mt-3">{stepContent.entry_triggers.when_DP4_yes}</p>
          )}
          {config.dp4 === 'no' && stepContent.entry_triggers.when_DP4_no && (
            <p className="text-sm text-slate-400 mt-3">{stepContent.entry_triggers.when_DP4_no}</p>
          )}
          {config.dp1 === 'no_integration' && stepContent.entry_triggers.when_DP1_no_integration && (
            <p className="text-sm text-slate-400 mt-3">{stepContent.entry_triggers.when_DP1_no_integration}</p>
          )}
          {stepContent.entry_triggers.governance_note && (
            <p className="text-xs text-slate-400 mt-3">{stepContent.entry_triggers.governance_note}</p>
          )}
        </AccordionSection>
      )}

      {/* Section 5: Roles & Responsibilities */}
      {stepContent.roles_and_responsibilities && (
        <AccordionSection title="Roles & Responsibilities">
          <div className="mb-4">
            <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3">
              <div className="text-xs font-medium text-cyan-400 mb-1">Primary Owner</div>
              <div className="text-sm font-semibold text-slate-200">
                {stepContent.roles_and_responsibilities.primary_owner.role}
              </div>
              <div className="text-sm text-slate-400 mt-1">
                {stepContent.roles_and_responsibilities.primary_owner.responsibility}
              </div>
            </div>
          </div>
          {stepContent.roles_and_responsibilities.contributors && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">Key Contributors & Approvers</div>
              <div className="space-y-1.5">
                {stepContent.roles_and_responsibilities.contributors.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="text-sm font-medium text-slate-300 w-40 flex-shrink-0">{c.role}</div>
                    <div className="text-sm text-slate-400">{c.responsibility}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AccordionSection>
      )}

      {/* Section 6: Scope of Work */}
      {stepContent.owns && (
        <AccordionSection title="Scope of Work">
          {stepKey === 'step_4' && Array.isArray(stepContent.owns) ? (
            <>
              <div className="space-y-3">
                {stepContent.owns.map((track, i) => {
                  if ((track.track || '').includes('Compliance') && config.dp4 !== 'yes') return null
                  if ((track.track || '').includes('Commercial') && !computeHasFinancialMotion(config) && !config.dp2.motions.includes('co_marketing')) return null
                  return track.track ? (
                    <div key={i} className="border border-slate-800 rounded-lg p-3">
                      <div className="text-sm font-semibold text-slate-300 mb-2">{track.track}</div>
                      {track.items && (
                        <ul className="space-y-3">
                          {track.items.map((item, j) => (
                            <BulletItem key={j} item={item} />
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : null
                })}
              </div>
              {/* Change 3b: reference line if any track has configuration_note */}
              {stepContent.owns.some(t => typeof t === 'object' && t.configuration_note) && (
                <p className="text-xs text-slate-500 mt-4 italic">
                  Some elements of this scope may vary based on your configuration. See "How your configuration affects this step" below.
                </p>
              )}
            </>
          ) : stepKey === 'step_9' && Array.isArray(stepContent.owns) ? (
            <>
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
                      <ul className="space-y-3">
                        {filteredItems.map((item, j) => (
                          <BulletItem key={j} item={item} />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
              {/* Change 3b: reference line if any play has configuration_note */}
              {stepContent.owns.some(p => typeof p === 'object' && p.configuration_note) && (
                <p className="text-xs text-slate-500 mt-4 italic">
                  Some elements of this scope may vary based on your configuration. See "How your configuration affects this step" below.
                </p>
              )}
            </>
          ) : (
            <ul className="space-y-4">
              {(Array.isArray(stepContent.owns) ? stepContent.owns : [stepContent.owns]).map((item, i) => (
                <BulletItem key={i} item={item} />
              ))}
            </ul>
          )}
        </AccordionSection>
      )}

      {/* Section 7: Decision Rights & Escalation */}
      {stepContent.tie_breaker_escalation && Array.isArray(stepContent.tie_breaker_escalation) && stepContent.tie_breaker_escalation.length > 0 && (
        <AccordionSection title="Decision Rights & Escalation">
          <div className="space-y-3">
            {stepContent.tie_breaker_escalation.map((item, i) => {
              const isInactive = item.configuration_dependent &&
                item.active_when && item.active_when.includes("'yes'") && config.dp4 !== 'yes'
              return (
                <div key={i} className={`flex flex-col sm:flex-row gap-1 sm:gap-3 ${isInactive ? 'opacity-40' : ''}`}>
                  <div className="text-sm font-medium text-slate-300 sm:w-36 flex-shrink-0">
                    {item.authority}
                  </div>
                  <div className="text-sm text-slate-400 flex-1">
                    {cleanText(item.scope)}
                    {isInactive && item.when_inactive && (
                      <span className="text-slate-400 italic ml-1">({cleanText(item.when_inactive)})</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </AccordionSection>
      )}

      {/* Section 8: Outputs — Change 5: bold text before colons */}
      {stepContent.outputs && stepContent.outputs.length > 0 && (
        <AccordionSection title="Outputs">
          <ul className="space-y-1.5">
            {stepContent.outputs.map((output, i) => {
              const text = typeof output === 'string' ? output : JSON.stringify(output)
              return text.includes(':') ? (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1.5">
                  <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
                  <span>
                    <span className="font-semibold text-slate-200">{text.split(':')[0]}:</span>
                    {text.split(':').slice(1).join(':')}
                  </span>
                </li>
              ) : (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300 mb-1.5">
                  <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
                  <span>{text}</span>
                </li>
              )
            })}
          </ul>
        </AccordionSection>
      )}

      {/* Section 9: Relevant Tools */}
      {(() => {
        const tools = getToolsForStep(stepKey, config)
        if (tools.length === 0) return null
        return (
          <AccordionSection title="Relevant Tools">
            <p className="text-xs text-slate-400 mb-3">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tools.map((t, i) => (
                <div key={i} className="border border-slate-800 rounded-lg p-3">
                  <div className="text-sm font-semibold text-slate-200">{t.category}</div>
                  {t.description && (
                    <div className="text-sm text-slate-400 mt-1">{t.description}</div>
                  )}
                  <div className="text-sm text-slate-300 mt-2">{t.tools}</div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )
      })()}

      {/* Section 10: Out of Scope */}
      {(() => {
        const outOfScope = getContent(stepContent, 'explicitly_does_not_do', config)
        if (!outOfScope || !outOfScope.length) return null
        return (
          <AccordionSection title="Out of Scope">
            <ul className="space-y-1.5 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
              {outOfScope.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span><span>{item}</span>
                </li>
              ))}
            </ul>
          </AccordionSection>
        )
      })()}

      {/* Section 11: Completion Criteria */}
      {(() => {
        const cc = stepData.completion_criteria
        if (!cc) return null

        // No-integration variant for Step 4
        if (stepKey === 'step_4' && config.dp1 === 'no_integration' && cc.done_label_when_no_integration) {
          return (
            <AccordionSection title="Completion Criteria">
              <p className="text-sm text-slate-200 font-medium">{cc.done_label_when_no_integration}</p>
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

      {/* Section 12: Handoff */}
      {(getContent(stepContent, 'handoff', config) || stepContent.handoff_note) && (
        <AccordionSection title="Handoff">
          {getContent(stepContent, 'handoff', config) && (() => {
            const handoffText = getContent(stepContent, 'handoff', config)
            // Change 3: rewrite step refs when target step is skipped
            function rewriteSkippedStepRefs(clause) {
              if (config.dp1 === 'no_integration') {
                clause = clause.replace(/\bStep 3\b/g, 'Step 4 (Approvals Gate)')
                clause = clause.replace(/\bStep 5\b/g, 'Step 6 (Launch Readiness)')
              }
              return clause
            }
            // Change 4: expanded blocking keywords including "delayed"
            const blockingKeywords = [
              'blocked by', 'paused if', 'progression can be blocked',
              'cannot proceed', 'progression is paused', 'blocking',
              'may be delayed', 'delayed if',
            ]
            const clauses = handoffText
              .split(';')
              .map(c => capitalizeFirst(c.trim()))
              .filter(Boolean)
              .map(rewriteSkippedStepRefs)
            const transitions = clauses.filter(c => !blockingKeywords.some(kw => c.toLowerCase().includes(kw)))
            const blockers = clauses.filter(c => blockingKeywords.some(kw => c.toLowerCase().includes(kw)))

            return (
              <>
                {transitions.length > 0 && (
                  <ul className="space-y-1.5">
                    {transitions.map((clause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-cyan-400 mt-0.5">→</span>
                        <span>{clause}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {blockers.length > 0 && (
                  <div className="mt-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <div className="text-xs font-medium text-amber-400 mb-1">Blocking conditions</div>
                    {blockers.map((clause, i) => (
                      <p key={i} className="text-sm text-slate-400">{clause}</p>
                    ))}
                  </div>
                )}
              </>
            )
          })()}
          {stepContent.handoff_note && <p className="text-sm text-slate-400 italic mt-2">{stepContent.handoff_note}</p>}
        </AccordionSection>
      )}

      {/* Section 13: Exception Handling */}
      {stepContent.failure_exception_paths && stepContent.failure_exception_paths.length > 0 && (
        <AccordionSection title="Exception Handling">
          <div className="space-y-2">
            {stepContent.failure_exception_paths.map((path, i) => (
              <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
                <div className="text-sm font-medium text-red-400/80 mb-1">{path.condition}</div>
                <p className="text-sm text-slate-400">{path.response}</p>
                {path.likely_owner && (
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <span className="text-slate-400">↳</span>
                    <span className="font-medium text-slate-300">Likely owner:</span>
                    <span>{path.likely_owner}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionSection>
      )}

      {/* Section 14: Loop-back Triggers */}
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

      {/* Section 16: How Your Configuration Affects This Step
          Changes 3b + 4: include track/play notes, then deduplicate all cards */}
      {(() => {
        const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
        const configNotes = getApplicableConfigNotes(stepContent.configuration_notes, config)

        // Collect track/play configuration_notes (Change 3b)
        const trackNotes = []
        if (Array.isArray(stepContent.owns)) {
          stepContent.owns.forEach(item => {
            if (typeof item === 'object' && item.configuration_note) {
              const trackName = item.track || item.play || 'Scope'
              trackNotes.push({
                label: trackName,
                text: cleanText(item.configuration_note),
              })
            }
          })
        }

        // Deduplicate (Change 4)
        const allCards = deduplicateCards(mods, configNotes, trackNotes)
        if (allCards.length === 0) return null

        return (
          <AccordionSection title="How Your Configuration Affects This Step">
            <div className="space-y-2">
              {allCards.map((card, i) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                  <div className="text-xs font-medium text-amber-400 mb-1">{cleanText(card.label)}</div>
                  <p className="text-sm text-slate-300">{cleanText(card.text)}</p>
                </div>
              ))}
            </div>
          </AccordionSection>
        )
      })()}

      {/* Section 17: Data Schema for This Step */}
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
