import { useState } from 'react'
import {
  computeHasFinancialMotion,
  countActiveSteps,
  countActiveApprovalTracks,
} from '../engine'

const DP1_OPTIONS = [
  { value: 'no_integration', label: 'No integration' },
  { value: 'entity_to_partner', label: 'Entity → Partner' },
  { value: 'partner_to_entity', label: 'Partner → Entity' },
  { value: 'bidirectional', label: 'Bidirectional' },
]
const DP3_OPTIONS = [
  { value: 'neither', label: 'No certification' },
  { value: 'integration_cert_only', label: 'Integration cert' },
  { value: 'partner_cert_only', label: 'Partner cert' },
  { value: 'both', label: 'Both' },
]
const DP4_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes — regulated' },
]
const MOTION_OPTIONS = [
  { value: 'referral_inbound', label: 'Referral in' },
  { value: 'referral_outbound', label: 'Referral out' },
  { value: 'reseller_partner', label: 'Reseller (partner)' },
  { value: 'reseller_entity', label: 'Reseller (entity)' },
  { value: 'marketplace_entity', label: 'Marketplace (entity)' },
  { value: 'marketplace_partner', label: 'Marketplace (partner)' },
  { value: 'marketplace_third_party', label: 'Marketplace (3rd party)' },
  { value: 'co_sell', label: 'Co-sell' },
  { value: 'co_marketing', label: 'Co-marketing' },
]
const CO_SELL_OPTIONS = [
  { value: 'entity_led', label: 'Entity-led' },
  { value: 'partner_led', label: 'Partner-led' },
  { value: 'jointly_led', label: 'Jointly led' },
]
const CO_MARKETING_OPTIONS = [
  { value: 'entity_mdf', label: 'Entity (MDF)' },
  { value: 'partner_coop', label: 'Partner (co-op)' },
  { value: 'joint', label: 'Joint' },
]

export default function Sidebar({ config, onConfigChange, activeArchetype, spec, collapsed, onToggleCollapse }) {
  const hasFinancial = computeHasFinancialMotion(config)
  const activeSteps = countActiveSteps(spec, config)
  const activeTracks = countActiveApprovalTracks(config)

  function updateDP1(val) {
    onConfigChange({ ...config, dp1: val })
  }
  function updateDP3(val) {
    onConfigChange({ ...config, dp3: val })
  }
  function updateDP4(val) {
    onConfigChange({ ...config, dp4: val })
  }
  function toggleMotion(motion) {
    const motions = config.dp2.motions.includes(motion)
      ? config.dp2.motions.filter(m => m !== motion)
      : [...config.dp2.motions, motion]
    const dp2 = { ...config.dp2, motions }
    if (!motions.includes('co_sell')) dp2.co_sell_direction = null
    if (!motions.includes('co_marketing')) dp2.co_marketing_funding = null
    onConfigChange({ ...config, dp2 })
  }
  function setCoSell(val) {
    onConfigChange({ ...config, dp2: { ...config.dp2, co_sell_direction: val } })
  }
  function setCoMarketing(val) {
    onConfigChange({ ...config, dp2: { ...config.dp2, co_marketing_funding: val } })
  }

  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r border-slate-800 flex flex-col items-center pt-4 bg-slate-900/50">
        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-200 transition-colors p-2"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-600 writing-mode-vertical">{activeSteps}/11</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-72 flex-shrink-0 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div>
          <div className="text-xs font-medium text-slate-400">Configuration</div>
          <div className="text-xs text-cyan-400 font-medium mt-0.5">
            {activeArchetype ? activeArchetype.name : 'Custom'}
          </div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          title="Collapse sidebar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Impact counter */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/30">
        <div className="grid grid-cols-2 gap-2">
          <ImpactStat label="Steps" value={activeSteps} total={11} />
          <ImpactStat label="Tracks" value={activeTracks} total={4} />
        </div>
      </div>

      {/* Config fields */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">
        {/* DP1 */}
        <ConfigField label="Integration Direction" hint="DP1">
          <select
            value={config.dp1 || ''}
            onChange={e => updateDP1(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {DP1_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </ConfigField>

        {/* DP2 — motions */}
        <ConfigField label="Commercial Motions" hint="DP2">
          <div className="space-y-1">
            {MOTION_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={config.dp2.motions.includes(opt.value)}
                  onChange={() => toggleMotion(opt.value)}
                  className="accent-cyan-500 w-3 h-3"
                />
                <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{opt.label}</span>
              </label>
            ))}
          </div>
          {config.dp2.motions.includes('co_sell') && (
            <div className="mt-2 pl-2 border-l border-slate-700">
              <div className="text-xs text-slate-500 mb-1">Co-sell direction</div>
              <select
                value={config.dp2.co_sell_direction || ''}
                onChange={e => setCoSell(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="">— select —</option>
                {CO_SELL_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
          {config.dp2.motions.includes('co_marketing') && (
            <div className="mt-2 pl-2 border-l border-slate-700">
              <div className="text-xs text-slate-500 mb-1">Co-marketing funding</div>
              <select
                value={config.dp2.co_marketing_funding || ''}
                onChange={e => setCoMarketing(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
              >
                <option value="">— select —</option>
                {CO_MARKETING_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </ConfigField>

        {/* DP3 */}
        <ConfigField label="Certification" hint="DP3">
          <select
            value={config.dp3 || ''}
            onChange={e => updateDP3(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {DP3_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </ConfigField>

        {/* DP4 */}
        <ConfigField label="Regulated Industries" hint="DP4">
          <select
            value={config.dp4 || ''}
            onChange={e => updateDP4(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 px-2 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {DP4_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </ConfigField>
      </div>

      {/* Track summary */}
      <div className="px-4 py-3 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-2 font-medium">Approval Tracks</div>
        <TrackLine label="Security & Privacy" active={true} />
        <TrackLine label="Compliance / Risk" active={config.dp4 === 'yes'} />
        <TrackLine label="Legal" active={true} />
        <TrackLine label="Commercial / Finance" active={hasFinancial || config.dp2.motions.includes('co_marketing')} />
      </div>
    </div>
  )
}

function ImpactStat({ label, value, total }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-cyan-400">{value}</div>
      <div className="text-xs text-slate-600">of {total}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function ConfigField({ label, hint, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className="text-xs text-slate-600 font-mono">{hint}</span>
      </div>
      {children}
    </div>
  )
}

function TrackLine({ label, active }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
      <span className={`text-xs ${active ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
    </div>
  )
}
