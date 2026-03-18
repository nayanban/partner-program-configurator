import { useState } from 'react'
import { isObjectActive } from '../engine'

export default function DataModelView({ config, spec }) {
  const [expandedObj, setExpandedObj] = useState(null)

  const objects = Object.entries(spec.objects)
  const activeObjects = objects.filter(([_, obj]) => isObjectActive(obj, config))
  const inactiveObjects = objects.filter(([_, obj]) => !isObjectActive(obj, config))

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 mb-1 leading-relaxed">
        The data model behind the workflow — every entity, field, and state a partner operating system needs to track. Fields marked as conditional activate or deactivate based on your configuration. This structured schema is what makes the workflow machine-executable, not just a process document.
      </p>
      <p className="text-xs text-slate-500 mb-4">
        Active objects in this configuration. Click to expand and view field-level detail.
      </p>

      {/* Active objects */}
      {activeObjects.map(([key, obj]) => (
        <ObjectCard
          key={key}
          objKey={key}
          obj={obj}
          config={config}
          active={true}
          expanded={expandedObj === key}
          onToggle={() => setExpandedObj(expandedObj === key ? null : key)}
        />
      ))}

      {/* Inactive objects */}
      {inactiveObjects.length > 0 && (
        <div className="mt-6">
          <div className="text-xs font-medium text-slate-600 mb-3 uppercase tracking-wider">
            Not active in this configuration
          </div>
          {inactiveObjects.map(([key, obj]) => (
            <ObjectCard
              key={key}
              objKey={key}
              obj={obj}
              config={config}
              active={false}
              expanded={expandedObj === key}
              onToggle={() => setExpandedObj(expandedObj === key ? null : key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ObjectCard({ objKey, obj, config, active, expanded, onToggle }) {
  const fields = obj.fields || []
  const activeFields = fields.filter(f => isFieldActive(f, config))
  const totalFields = fields.length

  return (
    <div className={`border rounded-xl transition-all ${
      active
        ? expanded ? 'border-slate-700 bg-slate-900/80' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
        : 'border-slate-800/40 bg-slate-900/20 opacity-50'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-cyan-400' : 'bg-slate-700'}`}></div>
          <div>
            <div className="text-sm font-medium text-slate-200">{obj.object_name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Created at {obj.created_at_step}
              {!active && obj.activation_condition && (
                <span className="ml-2 text-slate-600">— inactive: requires {formatCondition(obj.activation_condition)}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            {activeFields.length}/{totalFields} fields
          </span>
          <svg
            className={`w-3.5 h-3.5 text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 mt-3 mb-2">
            Fields your system of record needs for this object. Conditional fields (Cond. = Y) are active only when specific decision points are set.
          </p>
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="text-xs text-slate-600 font-medium pb-2 w-2/5">Field</th>
                <th className="text-xs text-slate-600 font-medium pb-2 w-1/5">Type</th>
                <th className="text-xs text-slate-600 font-medium pb-2 w-1/12 text-center">Active</th>
                <th className="text-xs text-slate-600 font-medium pb-2 w-1/12 text-center">Cond.</th>
                <th className="text-xs text-slate-600 font-medium pb-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {fields.map((field, i) => {
                const fieldActive = isFieldActive(field, config)
                return (
                  <tr key={i} className={!fieldActive ? 'opacity-35' : ''}>
                    <td className="py-1.5 pr-2 text-xs font-mono text-slate-400">{field.name}</td>
                    <td className="py-1.5 pr-2 text-xs text-slate-600">{field.type}</td>
                    <td className="py-1.5 text-center">
                      <span className={`text-xs ${fieldActive ? 'text-cyan-500' : 'text-slate-700'}`}>
                        {fieldActive ? '✓' : '—'}
                      </span>
                    </td>
                    <td className="py-1.5 text-center">
                      <span className="text-xs text-slate-600">{field.conditional ? 'Y' : 'N'}</span>
                    </td>
                    <td className="py-1.5 text-xs text-slate-600 leading-relaxed">
                      {field.notes?.substring(0, 80)}{field.notes?.length > 80 ? '…' : ''}
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
  // Default to active for unknown conditions
  return true
}

function formatCondition(condition) {
  if (condition === "DP1 != 'no_integration'") return 'technical integration'
  if (condition === "DP3 != 'neither'") return 'certification'
  if (condition.includes('step9_readiness')) return 'step 9 activation'
  if (condition.includes("intake_decision == 'engage'")) return 'partner engagement'
  return condition
}
