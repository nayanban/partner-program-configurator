import { TOOL_RECOMMENDATIONS } from '../engine'

export default function ToolRecommendations({ config }) {
  const active = TOOL_RECOMMENDATIONS.filter(t => t.activeWhen(config))

  return (
    <div>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-3 mb-5">
        <p className="text-xs text-slate-500">
          These are representative tools in each category, not recommendations. Your choice depends on existing stack, budget, and scale.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {active.map((t) => (
          <div key={t.category} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">{t.category}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{t.tools}</div>
          </div>
        ))}
      </div>

      {TOOL_RECOMMENDATIONS.filter(t => !t.activeWhen(config)).length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-slate-600 mb-2">Not active in this configuration</div>
          <div className="flex flex-wrap gap-2">
            {TOOL_RECOMMENDATIONS.filter(t => !t.activeWhen(config)).map(t => (
              <span key={t.category} className="text-xs text-slate-700 bg-slate-900/40 border border-slate-800/40 rounded-lg px-3 py-1.5 line-through">
                {t.category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
