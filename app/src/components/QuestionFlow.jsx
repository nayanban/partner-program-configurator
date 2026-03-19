import { useState } from 'react'

const DP1_OPTIONS = [
  { value: 'no_integration', label: 'No technical integration', description: 'Purely commercial relationship — no APIs, no build required' },
  { value: 'entity_to_partner', label: 'Entity → Partner', description: 'Entity integrates into partner\'s system' },
  { value: 'partner_to_entity', label: 'Partner → Entity', description: 'Partner integrates into entity\'s system' },
  { value: 'bidirectional', label: 'Bidirectional', description: 'Both directions — dual integration build' },
]

const DP1_IMPACT = {
  no_integration: 'This removes Steps 3 and 5 (no technical build required). 9-step workflow.',
  entity_to_partner: 'Entity engineering team leads the build. Steps 3 and 5 active with entity-led scoping.',
  partner_to_entity: 'Partner leads the build. Steps 3 and 5 active with partner-led scoping.',
  bidirectional: 'All integration steps active with dual-direction scoping. Most complex build path.',
}

const DP2_OPTIONS = [
  { value: 'referral_inbound', label: 'Referral — inbound', description: 'Partner refers customers to entity' },
  { value: 'referral_outbound', label: 'Referral — outbound', description: 'Entity refers customers to partner' },
  { value: 'reseller_partner', label: 'Reseller (partner)', description: 'Partner resells entity\'s product' },
  { value: 'reseller_entity', label: 'Reseller (entity)', description: 'Entity resells partner\'s product' },
  { value: 'marketplace_entity', label: 'Marketplace — entity', description: 'Listed on entity\'s own marketplace' },
  { value: 'marketplace_partner', label: 'Marketplace — partner', description: 'Listed on partner\'s marketplace' },
  { value: 'marketplace_third_party', label: 'Marketplace — 3rd party', description: 'Listed on AWS, Azure, GCP, etc.' },
  { value: 'co_sell', label: 'Co-sell', description: 'Joint selling motion — requires sub-choice', hasSubChoice: true },
  { value: 'co_marketing', label: 'Co-marketing', description: 'Joint marketing activities — requires sub-choice', hasSubChoice: true },
]

const CO_SELL_OPTIONS = [
  { value: 'entity_led', label: 'Entity-led', description: 'Entity sales leads, partner supports' },
  { value: 'partner_led', label: 'Partner-led', description: 'Partner sales leads, entity supports' },
  { value: 'jointly_led', label: 'Jointly led', description: 'Both teams co-own the motion' },
]

const CO_MARKETING_OPTIONS = [
  { value: 'entity_mdf', label: 'Entity funds (MDF)', description: 'Market development funds from entity' },
  { value: 'partner_coop', label: 'Partner funds (co-op)', description: 'Co-op budget from partner' },
  { value: 'joint', label: 'Joint funding', description: 'Shared budget from both parties' },
]

const DP3_OPTIONS = [
  { value: 'neither', label: 'No certification', description: 'No certification gates required' },
  { value: 'integration_cert_only', label: 'Integration cert only', description: 'Technical/security certification gates the build' },
  { value: 'partner_cert_only', label: 'Partner competency cert', description: 'Training/assessment to sell or implement' },
  { value: 'both', label: 'Both types', description: 'Integration and competency certification required' },
]

const DP4_OPTIONS = [
  { value: 'no', label: 'No', description: 'Standard approval tracks apply' },
  { value: 'yes', label: 'Yes — regulated', description: 'Compliance/Risk review track required' },
]

function SelectCard({ option, selected, onClick, accent = false }) {
  return (
    <button
      onClick={() => onClick(option.value)}
      className={`relative w-full text-left p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
        selected
          ? 'border-cyan-500 bg-cyan-500/10 text-slate-100'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          selected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
        }`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950"></div>}
        </div>
        <div>
          <div className="font-medium text-sm">{option.label}</div>
          {option.description && (
            <div className="text-xs text-slate-500 mt-0.5">{option.description}</div>
          )}
        </div>
      </div>
    </button>
  )
}

function CheckCard({ option, checked, onClick }) {
  return (
    <button
      onClick={() => onClick(option.value)}
      className={`relative w-full text-left p-4 rounded-lg border transition-all duration-150 cursor-pointer ${
        checked
          ? 'border-cyan-500 bg-cyan-500/10 text-slate-100'
          : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800 text-slate-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          checked ? 'border-cyan-500 bg-cyan-500' : 'border-slate-600'
        }`}>
          {checked && (
            <svg className="w-2.5 h-2.5 text-slate-950" viewBox="0 0 10 10" fill="currentColor">
              <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div>
          <div className="font-medium text-sm">{option.label}</div>
          {option.description && (
            <div className="text-xs text-slate-500 mt-0.5">{option.description}</div>
          )}
        </div>
      </div>
    </button>
  )
}

export default function QuestionFlow({ initialConfig, onComplete, onBack }) {
  const [step, setStep] = useState(0)
  const [config, setConfig] = useState(initialConfig || {
    dp1: null,
    dp2: { motions: [], co_sell_direction: null, co_marketing_funding: null },
    dp3: null,
    dp4: null,
  })

  const questions = [
    { key: 'dp1', title: 'Integration Direction', subtitle: 'Is there a technical integration, and if so, in which direction?' },
    { key: 'dp2', title: 'Commercial Motions', subtitle: 'Which commercial motions does your program support? Select all that apply.' },
    { key: 'dp3', title: 'Certification', subtitle: 'Is certification required, and of what type?' },
    { key: 'dp4', title: 'Regulated Industries', subtitle: 'Does your program operate in or serve regulated industries?' },
  ]

  function handleDP1(value) {
    setConfig(c => ({ ...c, dp1: value }))
  }

  function handleDP2Motion(motion) {
    setConfig(c => {
      const motions = c.dp2.motions.includes(motion)
        ? c.dp2.motions.filter(m => m !== motion)
        : [...c.dp2.motions, motion]
      const dp2 = { ...c.dp2, motions }
      if (!motions.includes('co_sell')) dp2.co_sell_direction = null
      if (!motions.includes('co_marketing')) dp2.co_marketing_funding = null
      return { ...c, dp2 }
    })
  }

  function handleCoSellDirection(value) {
    setConfig(c => ({ ...c, dp2: { ...c.dp2, co_sell_direction: value } }))
  }

  function handleCoMarketingFunding(value) {
    setConfig(c => ({ ...c, dp2: { ...c.dp2, co_marketing_funding: value } }))
  }

  function handleDP3(value) {
    setConfig(c => ({ ...c, dp3: value }))
  }

  function handleDP4(value) {
    setConfig(c => ({ ...c, dp4: value }))
  }

  function canProceed() {
    if (step === 0) return config.dp1 !== null
    if (step === 1) return config.dp2.motions.length > 0
    if (step === 2) return config.dp3 !== null
    if (step === 3) return config.dp4 !== null
    return false
  }

  function handleNext() {
    if (step < 3) setStep(s => s + 1)
    else onComplete(config)
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
    else onBack()
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {step === 0 ? 'Back to home' : 'Previous'}
          </button>

          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-cyan-500' : i < step ? 'w-4 bg-cyan-700' : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono">{step + 1} / 4</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="text-xs font-medium text-cyan-500 uppercase tracking-wider mb-2">
              Question {step + 1} of 4
            </div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">{questions[step].subtitle}</h2>
          </div>

          {/* Question 1 — DP1 */}
          {step === 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {DP1_OPTIONS.map(opt => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={config.dp1 === opt.value}
                    onClick={handleDP1}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 mb-4">
                This determines whether your workflow includes technical scoping, implementation, and certification steps.
              </p>
              {config.dp1 && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
                  <div className="text-xs font-medium text-cyan-400 mb-1">Impact</div>
                  <p className="text-sm text-slate-300">{DP1_IMPACT[config.dp1]}</p>
                </div>
              )}
            </div>
          )}

          {/* Question 2 — DP2 */}
          {step === 1 && (
            <div>
              <p className="text-xs text-slate-500 mb-4">
                Selected motions determine which commercial terms, attribution mechanics, and growth plays appear in your workflow.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DP2_OPTIONS.map(opt => (
                  <div key={opt.value}>
                    <CheckCard
                      option={opt}
                      checked={config.dp2.motions.includes(opt.value)}
                      onClick={handleDP2Motion}
                    />
                    {/* Sub-choice: co_sell */}
                    {opt.value === 'co_sell' && config.dp2.motions.includes('co_sell') && (
                      <div className="mt-2 ml-4 p-3 bg-slate-800 border border-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400 mb-2 font-medium">Who leads the co-sell motion?</div>
                        <div className="flex flex-col gap-1.5">
                          {CO_SELL_OPTIONS.map(sub => (
                            <button
                              key={sub.value}
                              onClick={() => handleCoSellDirection(sub.value)}
                              className={`text-left px-3 py-2 rounded text-xs font-medium transition-all ${
                                config.dp2.co_sell_direction === sub.value
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              {sub.label} — <span className="font-normal text-slate-500">{sub.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Sub-choice: co_marketing */}
                    {opt.value === 'co_marketing' && config.dp2.motions.includes('co_marketing') && (
                      <div className="mt-2 ml-4 p-3 bg-slate-800 border border-slate-700 rounded-lg">
                        <div className="text-xs text-slate-400 mb-2 font-medium">Who funds co-marketing activities?</div>
                        <div className="flex flex-col gap-1.5">
                          {CO_MARKETING_OPTIONS.map(sub => (
                            <button
                              key={sub.value}
                              onClick={() => handleCoMarketingFunding(sub.value)}
                              className={`text-left px-3 py-2 rounded text-xs font-medium transition-all ${
                                config.dp2.co_marketing_funding === sub.value
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700 border border-transparent'
                              }`}
                            >
                              {sub.label} — <span className="font-normal text-slate-500">{sub.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question 3 — DP3 */}
          {step === 2 && (
            <div>
              <p className="text-xs text-slate-500 mb-4">
                Integration certification gates the technical build. Partner competency certification gates who can sell or implement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DP3_OPTIONS.map(opt => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={config.dp3 === opt.value}
                    onClick={handleDP3}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Question 4 — DP4 */}
          {step === 3 && (
            <div>
              <p className="text-xs text-slate-500 mb-4">
                Selecting Yes activates a dedicated Compliance/Risk approval track and adds regulatory gating to go-live prerequisites.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {DP4_OPTIONS.map(opt => (
                  <SelectCard
                    key={opt.value}
                    option={opt}
                    selected={config.dp4 === opt.value}
                    onClick={handleDP4}
                  />
                ))}
              </div>

              {/* Review summary */}
              {config.dp4 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Configuration Summary</h3>
                  <div className="space-y-3">
                    <SummaryRow label="Integration" value={config.dp1?.replace(/_/g, ' ')} onEdit={() => setStep(0)} />
                    <SummaryRow
                      label="Motions"
                      value={config.dp2.motions.join(', ').replace(/_/g, ' ') || 'none'}
                      onEdit={() => setStep(1)}
                    />
                    <SummaryRow label="Certification" value={config.dp3?.replace(/_/g, ' ')} onEdit={() => setStep(2)} />
                    <SummaryRow label="Regulated" value={config.dp4} onEdit={() => setStep(3)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer nav */}
      <div className="border-t border-slate-800/60 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              canProceed()
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'Generate your workflow' : 'Continue'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryRow({ label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-xs text-slate-300 flex-1 font-mono">{value}</span>
      <button onClick={onEdit} className="text-xs text-cyan-500 hover:text-cyan-400 flex-shrink-0">Edit</button>
    </div>
  )
}
