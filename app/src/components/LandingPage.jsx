import { ARCHETYPES } from '../engine'

const ARCHETYPE_ICONS = {
  api_tech: '⬡',
  reseller: '↗',
  strategic: '⇄',
  marketplace: '◈',
  referral: '↔',
}

export default function LandingPage({ onArchetypeSelect, onDeepPath }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500 rounded-sm flex items-center justify-center text-slate-950 text-xs font-bold">P</div>
            <span className="text-sm font-medium text-slate-400">Partner Program Configurator</span>
          </div>
          <span className="text-xs text-slate-600 font-mono">v1.0</span>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span>
            Partner Lifecycle Framework
          </div>

          <h1 className="text-5xl font-bold text-slate-50 leading-tight tracking-tight mb-4">
            Partner Program
            <span className="text-cyan-400"> Configurator</span>
          </h1>

          <p className="text-xl text-slate-400 leading-relaxed mb-3">
            Answer a few questions about your partner program.
            Get a tailored workflow specification.
          </p>

          <p className="text-sm text-slate-600 mb-16">
            Built on an 11-step partner lifecycle framework covering intake through renewal.
          </p>

          {/* Archetype Fast Path */}
          <div className="text-left mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-slate-800"></div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Choose a program archetype</span>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ARCHETYPES.map((archetype) => (
                <button
                  key={archetype.id}
                  onClick={() => onArchetypeSelect(archetype)}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 rounded-xl p-5 text-left transition-all duration-200 cursor-pointer"
                >
                  <div className="text-2xl mb-3 text-cyan-400/70 group-hover:text-cyan-400 transition-colors">
                    {ARCHETYPE_ICONS[archetype.id]}
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1.5 leading-snug">
                    {archetype.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {archetype.description}
                  </p>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Deep Path */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <button
            onClick={onDeepPath}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 text-sm font-medium transition-colors group"
          >
            Configure from scratch
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <span>11 steps · 11 objects · 4 approval tracks</span>
          <span>Static site — no data leaves your browser</span>
        </div>
      </div>
    </div>
  )
}
