// Rendering engine — evaluates configuration against structured_specification.json

export const FINANCIAL_MOTIONS = [
  'referral_inbound', 'referral_outbound', 'reseller_partner', 'reseller_entity',
  'marketplace_entity', 'marketplace_partner', 'marketplace_third_party', 'co_sell'
]

export const MARKETPLACE_MOTIONS = [
  'marketplace_entity', 'marketplace_partner', 'marketplace_third_party'
]

export const RESELLER_MOTIONS = ['reseller_partner', 'reseller_entity']

export function computeHasFinancialMotion(config) {
  return config.dp2.motions.some(m => FINANCIAL_MOTIONS.includes(m))
}

export function computeHasMarketplaceMotion(config) {
  return config.dp2.motions.some(m => MARKETPLACE_MOTIONS.includes(m))
}

export function computeHasResellerOrCoSell(config) {
  return config.dp2.motions.includes('co_sell') ||
    config.dp2.motions.some(m => RESELLER_MOTIONS.includes(m))
}

export function isStepActive(stepKey, config) {
  if (stepKey === 'step_3' || stepKey === 'step_5') {
    return config.dp1 !== 'no_integration'
  }
  // step_9 is shown as always active for display (as per spec)
  return true
}

export function isObjectActive(obj, config) {
  const condition = obj.activation_condition
  if (!condition || condition === 'always') return true
  if (condition === "DP1 != 'no_integration'") return config.dp1 !== 'no_integration'
  if (condition === "DP3 != 'neither'") return config.dp3 !== 'neither'
  if (condition === "operations_record.step9_readiness == 'ready'") return true // show for display
  if (condition === "partner_record.intake_decision == 'engage'") return true
  // fallback: try to eval simple conditions
  return true
}

export function countActiveSteps(spec, config) {
  return Object.keys(spec.workflow_steps).filter(k => isStepActive(k, config)).length
}

export function countActiveObjects(spec, config) {
  return Object.values(spec.objects).filter(obj => isObjectActive(obj, config)).length
}

export function countActiveApprovalTracks(config) {
  let count = 2 // Security & Privacy + Legal always active
  if (config.dp4 === 'yes') count++
  if (computeHasFinancialMotion(config) || config.dp2.motions.includes('co_marketing')) count++
  return count
}

export function getActiveWorkflowModifications(stepKey, stepData, spec, config) {
  const mods = stepData.workflow_modifications || {}
  const rules = spec.conditional_logic.workflow_modification_rules
  const result = []

  for (const [ruleKey, _] of Object.entries(mods)) {
    const ruleSet = rules[ruleKey]
    if (!ruleSet) continue

    // Find matching variant
    let matched = null
    if (config.dp1 === 'entity_to_partner' && ruleSet.when_DP1_is_entity_to_partner)
      matched = { label: 'Integration direction (entity → partner)', text: ruleSet.when_DP1_is_entity_to_partner }
    else if (config.dp1 === 'partner_to_entity' && ruleSet.when_DP1_is_partner_to_entity)
      matched = { label: 'Integration direction (partner → entity)', text: ruleSet.when_DP1_is_partner_to_entity }
    else if (config.dp1 === 'bidirectional' && ruleSet.when_DP1_is_bidirectional)
      matched = { label: 'Integration direction (bidirectional)', text: ruleSet.when_DP1_is_bidirectional }
    else if (config.dp1 === 'no_integration' && ruleSet.when_DP1_is_no_integration)
      matched = { label: 'No technical integration', text: ruleSet.when_DP1_is_no_integration }
    else if (config.dp4 === 'yes' && ruleSet.when_DP4_is_yes)
      matched = { label: 'Regulated industries active', text: ruleSet.when_DP4_is_yes }
    else if (config.dp4 === 'no' && ruleSet.when_DP4_is_no)
      matched = { label: 'No regulated industries', text: ruleSet.when_DP4_is_no }
    else if (config.dp2.motions.includes('reseller_partner') && ruleSet.when_reseller_partner_selected)
      matched = { label: 'Reseller (partner) motion', text: ruleSet.when_reseller_partner_selected }
    else if (config.dp2.motions.includes('reseller_entity') && ruleSet.when_reseller_entity_selected)
      matched = { label: 'Reseller (entity) motion', text: ruleSet.when_reseller_entity_selected }
    else if (config.dp2.motions.includes('marketplace_third_party') && ruleSet.when_marketplace_third_party_selected)
      matched = { label: 'Third-party marketplace', text: ruleSet.when_marketplace_third_party_selected }
    else if (computeHasFinancialMotion(config) || config.dp2.motions.includes('co_sell')) {
      if (ruleSet.when_co_sell_is_entity_led && config.dp2.co_sell_direction === 'entity_led')
        matched = { label: 'Co-sell: entity-led', text: ruleSet.when_co_sell_is_entity_led }
      else if (ruleSet.when_co_sell_is_partner_led && config.dp2.co_sell_direction === 'partner_led')
        matched = { label: 'Co-sell: partner-led', text: ruleSet.when_co_sell_is_partner_led }
      else if (ruleSet.when_co_sell_is_jointly_led && config.dp2.co_sell_direction === 'jointly_led')
        matched = { label: 'Co-sell: jointly-led', text: ruleSet.when_co_sell_is_jointly_led }
    }

    if (!matched && ruleSet.when_no_referral_or_reseller_motion && !computeHasFinancialMotion(config))
      matched = { label: 'No commercial motion', text: ruleSet.when_no_referral_or_reseller_motion }

    if (matched) result.push(matched)
  }

  return result
}

export function getCompletionCriteria(stepData, config) {
  const cc = stepData.completion_criteria
  if (!cc) return null

  // For step_4
  if (cc.done_label_for_step5_start && cc.done_label_for_step6_start) {
    return {
      type: 'step4',
      forStep5: cc.done_label_for_step5_start,
      forStep6: cc.done_label_for_step6_start,
      minimumToUnblock: cc.done_condition_minimum_to_unblock,
      goLive: cc.done_condition_go_live,
      conditionalVariations: cc.conditional_variations,
    }
  }

  // Conditional completion criteria
  if (cc.done_condition && typeof cc.done_condition === 'object') {
    const dc = cc.done_condition
    let variant = null
    if (config.dp4 === 'yes' && dc.when_DP4_is_yes) variant = dc.when_DP4_is_yes
    else if (config.dp4 === 'no' && dc.when_DP4_is_no) variant = dc.when_DP4_is_no
    else if (config.dp1 !== 'no_integration' && dc.when_DP1_has_integration) variant = dc.when_DP1_has_integration
    else if (config.dp1 === 'no_integration' && dc.when_DP1_is_no_integration) variant = dc.when_DP1_is_no_integration
    return { type: 'conditional', variant, raw: cc }
  }

  return { type: 'simple', raw: cc }
}

export function generateFlowAnnotation(config, spec) {
  const activeStepCount = countActiveSteps(spec, config)
  const hasIntegration = config.dp1 !== 'no_integration'
  const motions = config.dp2.motions
  const hasCert = config.dp3 !== 'neither'
  const hasCompliance = config.dp4 === 'yes'

  const motionLabels = {
    referral_inbound: 'referral (inbound)',
    referral_outbound: 'referral (outbound)',
    reseller_partner: 'reseller',
    reseller_entity: 'reverse reseller',
    marketplace_entity: 'marketplace',
    marketplace_partner: 'marketplace (partner)',
    marketplace_third_party: 'third-party marketplace',
    co_sell: 'co-sell',
    co_marketing: 'co-marketing',
  }

  const certLabels = {
    integration_cert_only: 'integration certification',
    partner_cert_only: 'partner competency certification',
    both: 'both integration and partner certification',
  }

  const motionText = motions.length > 0
    ? motions.map(m => motionLabels[m] || m).join(', ')
    : 'no commercial motions'

  const parts = [
    `This is a ${activeStepCount}-step workflow`,
    hasIntegration ? `(${config.dp1.replace(/_/g, ' ')})` : '(no technical integration)',
    `with ${motionText}`,
    hasCert ? `${certLabels[config.dp3] || config.dp3}` : 'no certification',
    hasCompliance ? 'and a regulatory compliance track' : 'and no regulatory compliance track',
  ]

  return parts.join(' ') + '.'
}

export function encodeConfig(config) {
  const params = new URLSearchParams()
  if (config.dp1) params.set('dp1', config.dp1)
  if (config.dp2.motions.length) params.set('dp2_motions', config.dp2.motions.join(','))
  if (config.dp2.co_sell_direction) params.set('dp2_cs', config.dp2.co_sell_direction)
  if (config.dp2.co_marketing_funding) params.set('dp2_cm', config.dp2.co_marketing_funding)
  if (config.dp3) params.set('dp3', config.dp3)
  if (config.dp4) params.set('dp4', config.dp4)
  return params.toString()
}

export function decodeConfig(search) {
  const params = new URLSearchParams(search)
  const dp1 = params.get('dp1')
  const motions = params.get('dp2_motions') ? params.get('dp2_motions').split(',') : []
  const co_sell_direction = params.get('dp2_cs')
  const co_marketing_funding = params.get('dp2_cm')
  const dp3 = params.get('dp3')
  const dp4 = params.get('dp4')

  if (!dp1 && !motions.length && !dp3 && !dp4) return null

  return {
    dp1: dp1 || null,
    dp2: { motions, co_sell_direction: co_sell_direction || null, co_marketing_funding: co_marketing_funding || null },
    dp3: dp3 || null,
    dp4: dp4 || null,
  }
}

export function isConfigComplete(config) {
  return config.dp1 !== null &&
    config.dp2.motions.length > 0 &&
    config.dp3 !== null &&
    config.dp4 !== null
}

export const ARCHETYPES = [
  {
    id: 'api_tech',
    name: 'API / Technology Partner',
    description: 'Partner builds on your platform via API integration',
    config: {
      dp1: 'partner_to_entity',
      dp2: { motions: ['referral_inbound', 'co_sell'], co_sell_direction: 'jointly_led', co_marketing_funding: null },
      dp3: 'integration_cert_only',
      dp4: 'no',
    },
  },
  {
    id: 'reseller',
    name: 'Reseller / Channel',
    description: 'Partner resells your product through their sales channel',
    config: {
      dp1: 'no_integration',
      dp2: { motions: ['reseller_partner', 'co_marketing'], co_sell_direction: null, co_marketing_funding: 'joint' },
      dp3: 'partner_cert_only',
      dp4: 'no',
    },
  },
  {
    id: 'strategic',
    name: 'Strategic Alliance',
    description: 'Deep bidirectional integration with joint go-to-market',
    config: {
      dp1: 'bidirectional',
      dp2: { motions: ['co_sell', 'co_marketing'], co_sell_direction: 'jointly_led', co_marketing_funding: 'joint' },
      dp3: 'both',
      dp4: 'yes',
    },
  },
  {
    id: 'marketplace',
    name: 'Marketplace Partner',
    description: 'Partner listed on your marketplace with referral pipeline',
    config: {
      dp1: 'partner_to_entity',
      dp2: { motions: ['marketplace_entity', 'referral_inbound'], co_sell_direction: null, co_marketing_funding: null },
      dp3: 'integration_cert_only',
      dp4: 'no',
    },
  },
  {
    id: 'referral',
    name: 'Referral Program',
    description: 'Mutual lead sharing with no technical integration',
    config: {
      dp1: 'no_integration',
      dp2: { motions: ['referral_inbound', 'referral_outbound'], co_sell_direction: null, co_marketing_funding: null },
      dp3: 'neither',
      dp4: 'no',
    },
  },
]

export function detectArchetype(config) {
  return ARCHETYPES.find(a =>
    a.config.dp1 === config.dp1 &&
    a.config.dp3 === config.dp3 &&
    a.config.dp4 === config.dp4 &&
    JSON.stringify([...a.config.dp2.motions].sort()) === JSON.stringify([...config.dp2.motions].sort()) &&
    a.config.dp2.co_sell_direction === config.dp2.co_sell_direction &&
    a.config.dp2.co_marketing_funding === config.dp2.co_marketing_funding
  ) || null
}

export const TOOL_RECOMMENDATIONS = [
  {
    category: 'CRM / Partner Management',
    tools: 'Salesforce, HubSpot, PartnerStack, Impartner',
    activeWhen: () => true,
  },
  {
    category: 'Integration Management',
    tools: 'Pandium, Prismatic, Apigee, Kong',
    activeWhen: (config) => config.dp1 !== 'no_integration',
  },
  {
    category: 'Security & Compliance Review',
    tools: 'Vanta, Drata, SafeBase, OneTrust',
    activeWhen: () => true,
  },
  {
    category: 'Contract & Legal',
    tools: 'Ironclad, DocuSign CLM, Juro',
    activeWhen: () => true,
  },
  {
    category: 'Attribution & Revenue Ops',
    tools: 'Crossbeam, Reveal, Partnerize, Impact.com',
    activeWhen: (config) => computeHasFinancialMotion(config),
  },
  {
    category: 'Marketplace Management',
    tools: 'Tackle.io, Clazar, Labra',
    activeWhen: (config) => computeHasMarketplaceMotion(config),
  },
  {
    category: 'Certification / LMS',
    tools: 'WorkRamp, Skilljar, Docebo',
    activeWhen: (config) => config.dp3 !== 'neither',
  },
  {
    category: 'Co-marketing & Campaigns',
    tools: 'Marketo, HubSpot, ZINFI',
    activeWhen: (config) => config.dp2.motions.includes('co_marketing'),
  },
  {
    category: 'Deal Registration & Co-sell',
    tools: 'Crossbeam, Reveal, PartnerTap',
    activeWhen: (config) => config.dp2.motions.includes('co_sell') ||
      config.dp2.motions.some(m => RESELLER_MOTIONS.includes(m)),
  },
]
