import { ARCHETYPES } from '../engine'

const APP_VERSION = 'v1.1.0'

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
          <span className="text-xs text-slate-500 font-mono">{APP_VERSION}</span>
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

          <p className="text-sm text-slate-400 mb-10">
            Built on an 11-step partner lifecycle framework covering intake through renewal.
          </p>

          {/* Primary CTA — Configure from scratch */}
          <div className="mb-10">
            <button
              onClick={onDeepPath}
              className="inline-flex items-center gap-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-cyan-500/20 group"
            >
              Configure from scratch
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Or start with an archetype</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          {/* Archetype Fast Path */}
          <div className="text-left">
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
                  <p className="text-xs text-slate-400 leading-relaxed">
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
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/60 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>11 steps · 11 objects · 4 approval tracks</span>
          <div className="flex items-center gap-4">
            <span>Built by <a href="https://www.linkedin.com/in/banerjee-nayan/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              Nayan Banerjee
            </a></span>
            <a href="https://github.com/nayanban" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors inline-flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
              GitHub
            </a>
            <span>Static site — no data leaves your browser</span>
          </div>
        </div>
      </div>
    </div>
  )
}
