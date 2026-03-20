import { useState } from 'react'
import { getActiveWorkflowModifications, computeHasFinancialMotion, TOOL_RECOMMENDATIONS, isObjectActive } from '../engine'

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

function getConfigNoteLabel(key) {
  return CONFIG_NOTE_LABELS[key] || key.replace(/_/g, ' ')
}

function isDevReference(text) {
  if (typeof text !== 'string') return false
  return (
    text.includes('structured_specification') ||
    text.includes('structured_spec') ||
    text.includes('workflow_modification_rules')
  )
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

// Ordered list of sections to render
const SECTION_ORDER = [
  'purpose',
  'inputs',
  'owns',
  '_entry_triggers',
  'outputs',
  '_tools',
  'explicitly_does_not_do',
  '_completion_criteria',
  '_config_impact',
  '_step_schema',
  '_additional_detail',
]

const SECTION_LABELS = {
  purpose: 'Purpose',
  inputs: 'Inputs',
  owns: 'Scope of Work',
  outputs: 'Outputs',
  explicitly_does_not_do: 'Out of Scope',
  _entry_triggers: 'Entry Triggers',
  _tools: 'Relevant Tools',
  _completion_criteria: 'Completion Criteria',
  _config_impact: 'How your configuration affects this step',
  _step_schema: 'Data Objects at This Step',
  _additional_detail: 'Additional Detail: Handoff, Decision Rights, Exceptions, Loop-backs',
}

const SECTION_DEFAULT_OPEN = new Set(['purpose'])

// Keys consumed by computed sections — excluded from auto-render pass
const HANDLED_CONTENT_KEYS = new Set([
  'purpose', 'inputs', 'owns', 'outputs', 'explicitly_does_not_do',
  'configuration_notes', 'handoff', 'tie_breaker_escalation',
  'failure_exception_paths', 'loop_back_triggers', 'entry_triggers',
])

export default function StepCard({ stepKey, stepData, contentData, config, spec, alwaysExpanded, inPanel }) {
  const [expanded, setExpanded] = useState(false)

  const isExpanded = alwaysExpanded || expanded
  const stepNum = parseInt(stepKey.replace('step_', ''))
  const stepContent = contentData?.steps?.[stepKey]
  const mods = getActiveWorkflowModifications(stepKey, stepData, spec, config)
  const relevantTools = inPanel
    ? TOOL_RECOMMENDATIONS.filter(t => (STEP_TOOL_MAP[stepKey] || []).includes(t.category) && t.activeWhen(config))
    : []

  const ctx = { stepKey, stepData, stepContent, contentData, config, spec, mods, relevantTools, inPanel }

  function renderSection(sectionKey) {
    const content = getSectionContent(sectionKey, ctx)
    if (content === null) return null
    return (
      <AccordionSection
        key={sectionKey}
        title={SECTION_LABELS[sectionKey] || sectionKey.replace(/_/g, ' ')}
        defaultOpen={SECTION_DEFAULT_OPEN.has(sectionKey)}
      >
        {content}
      </AccordionSection>
    )
  }

  function renderUnknownSections() {
    if (!stepContent) return null
    return Object.entries(stepContent)
      .filter(([key]) => !HANDLED_CONTENT_KEYS.has(key))
      .map(([key, value]) => (
        <AccordionSection key={`_unknown_${key}`} title={key.replace(/_/g, ' ')}>
          {typeof value === 'string'
            ? <p className="text-sm text-slate-400">{value}</p>
            : Array.isArray(value)
            ? <ul className="space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                  </li>
                ))}
              </ul>
            : <pre className="text-xs text-slate-500 whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
          }
        </AccordionSection>
      ))
  }

  const innerContent = (
    <div className={inPanel ? '' : 'px-5 pb-5 border-t border-slate-800'}>
      {SECTION_ORDER.map(sectionKey => renderSection(sectionKey))}
      {renderUnknownSections()}
    </div>
  )

  // In panel: render content directly without card wrapper or header
  if (inPanel) {
    return innerContent
  }

  return (
    <div className={`border rounded-xl transition-all duration-200 ${
      isExpanded ? 'border-slate-700 bg-slate-900/80' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
    }`}>
      {/* Header — clickable only when not alwaysExpanded */}
      <div
        onClick={alwaysExpanded ? undefined : () => setExpanded(e => !e)}
        className={`w-full flex items-center justify-between px-5 py-4 text-left ${alwaysExpanded ? '' : 'cursor-pointer'}`}
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
          {!alwaysExpanded && (
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && innerContent}
    </div>
  )
}

function getSectionContent(sectionKey, { stepKey, stepData, stepContent, contentData, config, spec, mods, relevantTools, inPanel }) {
  switch (sectionKey) {
    case 'purpose':
      if (!stepContent?.purpose) return null
      return <p className="text-sm text-slate-300 leading-relaxed">{stepContent.purpose}</p>

    case 'inputs':
      if (!stepContent?.inputs || stepContent.inputs.length === 0) return null
      return (
        <ul className="space-y-1">
          {(Array.isArray(stepContent.inputs) ? stepContent.inputs : [stepContent.inputs]).map((input, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-slate-500 mt-0.5">•</span>
              <span>{input}</span>
            </li>
          ))}
        </ul>
      )

    case 'owns':
      if (!stepContent?.owns) return null
      return renderOwns(stepKey, stepContent.owns, config)

    case '_entry_triggers':
      if (stepKey !== 'step_9' || !stepData.progression_gate) return null
      return <Step9EntryTriggers contentData={contentData} />

    case 'outputs':
      if (!stepContent?.outputs || stepContent.outputs.length === 0) return null
      return (
        <ul className="space-y-1">
          {(Array.isArray(stepContent.outputs) ? stepContent.outputs : [stepContent.outputs]).map((output, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-cyan-400 mt-0.5">→</span>
              <span>{output}</span>
            </li>
          ))}
        </ul>
      )

    case '_tools':
      if (!inPanel || relevantTools.length === 0) return null
      return <InlinePanelToolsContent tools={relevantTools} />

    case 'explicitly_does_not_do':
      if (!stepContent?.explicitly_does_not_do || stepContent.explicitly_does_not_do.length === 0) return null
      return (
        <ul className="space-y-1 bg-slate-950/50 border border-slate-800 rounded-lg p-3">
          {stepContent.explicitly_does_not_do.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case '_completion_criteria': {
      const cc = stepData.completion_criteria
      if (!cc) return null
      if (stepKey === 'step_4') {
        return (
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
        )
      }
      if (!cc.done_label) return null
      return <p className="text-sm text-slate-300 font-medium">{cc.done_label}</p>
    }

    case '_config_impact': {
      if (mods.length === 0 && !stepContent?.configuration_notes) return null
      return (
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
                if (isDevReference(text)) return null
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
                    <div className="text-xs font-medium text-slate-400 mb-1">{getConfigNoteLabel(key)}</div>
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
      )
    }

    case '_step_schema': {
      const objKeys = stepData.objects_produced_or_updated
      if (!objKeys || objKeys.length === 0) return null
      const objects = objKeys.map(k => ({ key: k, obj: spec?.objects?.[k] })).filter(({ obj }) => !!obj)
      if (objects.length === 0) return null
      return <StepSchemaContent objects={objects} config={config} />
    }

    case '_additional_detail': {
      if (!stepContent) return null
      const hasContent =
        stepContent.handoff ||
        stepContent.tie_breaker_escalation?.length > 0 ||
        stepContent.failure_exception_paths?.length > 0 ||
        stepContent.loop_back_triggers?.length > 0
      if (!hasContent) return null
      return (
        <div className="space-y-4">
          {stepContent.handoff && (
            <Section title="Handoff">
              <p className="text-sm text-slate-400">{stepContent.handoff}</p>
            </Section>
          )}
          <FullDetailLayer stepContent={stepContent} stepData={stepData} config={config} />
        </div>
      )
    }

    default:
      return null
  }
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
                  <span className="text-xs text-slate-500">Always active</span>
                )}
              </div>
              {track.items && (
                <ul className="space-y-1">
                  {track.items.map((item, j) => (
                    <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">•</span>
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
          if (!evaluatePlayActive(play, config)) return null
          return (
            <div key={i} className="border border-slate-800 rounded-lg p-3">
              <div className="text-xs font-semibold text-slate-300 mb-2">{play.play}</div>
              {play.items && (
                <ul className="space-y-1">
                  {play.items.filter(item => {
                    if (config.dp1 === 'no_integration' && item.toLowerCase().includes('deeper integration')) return false
                    return true
                  }).map((item, j) => (
                    <li key={j} className="text-xs text-slate-400 flex items-start gap-1.5">
                      <span className="text-slate-500 mt-0.5">•</span>
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
            <span className="text-slate-500 mt-0.5">•</span>
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

  if (condition.includes('co_sell') && config.dp2.motions.includes('co_sell')) return true
  if (condition.includes('co_marketing') && config.dp2.motions.includes('co_marketing')) return true
  if (condition.includes('marketplace') && config.dp2.motions.some(m => m.startsWith('marketplace_'))) return true
  if (condition.includes('always')) return true
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
              <span className="text-cyan-400 mt-0.5 text-xs">✓</span>
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

function FullDetailLayer({ stepContent, stepData, config }) {
  return (
    <div className="space-y-4 pt-2 border-t border-slate-800">
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
                      <span className="text-slate-500 ml-1">({item.when_inactive})</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      )}

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

      {stepContent.loop_back_triggers && stepContent.loop_back_triggers.length > 0 && (
        <Section title="Loop-back Triggers">
          <div className="space-y-2">
            {stepContent.loop_back_triggers.map((trigger, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-xs text-amber-500/70 w-24 flex-shrink-0">
                  → {trigger.target || trigger.source || trigger.target_step || 'Unknown'}
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

function InlinePanelToolsContent({ tools }) {
  return (
    <div>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2 mb-3">
        <p className="text-xs text-slate-400">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map(t => (
          <div key={t.category} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">{t.category}</div>
            <div className="text-xs text-slate-400 leading-relaxed">{t.tools}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function isFieldActive(field, config) {
  if (!field.conditional) return true
  const rule = field.activation_rule
  if (!rule) return true
  const condition = rule.condition || ''
  if (condition.includes("DP1 != 'no_integration'")) return config.dp1 !== 'no_integration'
  if (condition.includes("DP3 != 'neither'")) return config.dp3 !== 'neither'
  if (condition.includes("DP4 == 'yes'")) return config.dp4 === 'yes'
  if (condition.includes("DP2_motions.includes('co_marketing')")) return config.dp2.motions.includes('co_marketing')
  if (condition.includes("DP2_motions.includes('co_sell')")) return config.dp2.motions.includes('co_sell')
  if (condition.includes('financial') || condition.includes('referral_inbound') || condition.includes('reseller')) {
    return config.dp2.motions.some(m =>
      ['referral_inbound', 'referral_outbound', 'reseller_partner', 'reseller_entity',
       'marketplace_entity', 'marketplace_partner', 'marketplace_third_party', 'co_sell'].includes(m)
    )
  }
  return true
}

function StepSchemaContent({ objects, config }) {
  const [expandedKey, setExpandedKey] = useState(null)
  return (
    <div className="space-y-2">
      {objects.map(({ key, obj }) => {
        const active = isObjectActive(obj, config)
        const fields = obj.fields || []
        const activeFields = fields.filter(f => isFieldActive(f, config))
        const expanded = expandedKey === key
        return (
          <div
            key={key}
            className={`border rounded-xl transition-all ${
              active
                ? expanded ? 'border-slate-700 bg-slate-900/80' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                : 'border-slate-800/40 bg-slate-900/20 opacity-50'
            }`}
          >
            <button
              onClick={() => setExpandedKey(expanded ? null : key)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-cyan-400' : 'bg-slate-700'}`} />
                <span className="text-xs font-medium text-slate-200">{obj.object_name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-500 font-mono">{activeFields.length}/{fields.length} fields</span>
                <svg
                  className={`w-3 h-3 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {expanded && (
              <div className="px-3 pb-3 border-t border-slate-800">
                <table className="w-full mt-2">
                  <thead>
                    <tr className="text-left">
                      <th className="text-xs text-slate-400 font-medium pb-1.5 w-2/5">Field</th>
                      <th className="text-xs text-slate-400 font-medium pb-1.5 w-1/5">Type</th>
                      <th className="text-xs text-slate-400 font-medium pb-1.5 w-1/12 text-center">Active</th>
                      <th className="text-xs text-slate-400 font-medium pb-1.5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {fields.map((field, i) => {
                      const fieldActive = isFieldActive(field, config)
                      return (
                        <tr key={i} className={!fieldActive ? 'opacity-35' : ''}>
                          <td className="py-1 pr-2 text-xs font-mono text-slate-400">{field.name}</td>
                          <td className="py-1 pr-2 text-xs text-slate-400">{field.type}</td>
                          <td className="py-1 text-center">
                            <span className={`text-xs ${fieldActive ? 'text-cyan-500' : 'text-slate-500'}`}>
                              {fieldActive ? '✓' : '—'}
                            </span>
                          </td>
                          <td className="py-1 text-xs text-slate-400 leading-relaxed">
                            {field.notes?.substring(0, 60)}{field.notes?.length > 60 ? '…' : ''}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AccordionSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-slate-800/50">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center gap-2 py-3 text-left group"
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
      {isOpen && (
        <div className="pb-4 pl-5">
          {children}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="pt-4">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h4>
      {children}
    </div>
  )
}
