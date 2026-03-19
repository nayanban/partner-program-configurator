import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import StepMap from './StepMap'
import StepCard from './StepCard'
import DataModelView from './DataModelView'
import { TOOL_RECOMMENDATIONS } from '../engine'
import { isStepActive, generateFlowAnnotation, encodeConfig } from '../engine'

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

export default function OutputView({ config, onConfigChange, onBack, activeArchetype, spec, content }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStepKey, setSelectedStepKey] = useState(null)
  const [copyStatus, setCopyStatus] = useState(null)
  const [showDataModel, setShowDataModel] = useState(false)

  const flowAnnotation = generateFlowAnnotation(config, spec)
  const stepKeys = Object.keys(spec.workflow_steps)
  const activeSteps = stepKeys.filter(k => isStepActive(k, config))

  // Reset selected step if it becomes inactive due to config change
  useEffect(() => {
    if (selectedStepKey && !isStepActive(selectedStepKey, config)) {
      setSelectedStepKey(null)
    }
  }, [config, selectedStepKey])

  function handleCopyLink() {
    const params = encodeConfig(config)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('link')
      setTimeout(() => setCopyStatus(null), 2000)
    })
  }

  function handleStepClick(stepKey) {
    setSelectedStepKey(prev => prev === stepKey ? null : stepKey)
    setShowDataModel(false)
    setTimeout(() => {
      const el = document.getElementById('step-detail-panel')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-sm font-medium text-slate-300">
            {activeArchetype ? activeArchetype.name : 'Custom Configuration'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.linkedin.com/in/banerjee-nayan/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors hidden sm:inline"
          >
            Built by Nayan Banerjee
          </a>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            {copyStatus === 'link' ? 'Copied!' : 'Share Link'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          config={config}
          onConfigChange={onConfigChange}
          activeArchetype={activeArchetype}
          spec={spec}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Workflow overview — step map */}
          <div className="px-6 pt-6 pb-0">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-semibold text-slate-200">Workflow Overview</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Click any active step to view details</p>
                </div>
                <div className="text-xs text-slate-600 font-mono bg-slate-800 px-2 py-1 rounded">
                  {activeSteps.length} / 11 steps active
                </div>
              </div>

              <StepMap
                config={config}
                spec={spec}
                onStepClick={handleStepClick}
                activeStepKey={selectedStepKey}
              />

              {/* Flow annotation */}
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-xs text-slate-300 leading-relaxed">{flowAnnotation}</p>
              </div>
            </div>
          </div>

          {/* Step detail panel */}
          <div id="step-detail-panel" className="px-6 pt-5 pb-8">
            {showDataModel ? (
              <div>
                <button
                  onClick={() => setShowDataModel(false)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to workflow
                </button>
                <DataModelView config={config} spec={spec} />
              </div>
            ) : selectedStepKey ? (
              <div>
                <StepCard
                  key={selectedStepKey}
                  stepKey={selectedStepKey}
                  stepData={spec.workflow_steps[selectedStepKey]}
                  contentData={content}
                  config={config}
                  spec={spec}
                  alwaysExpanded
                />
                <StepTools stepKey={selectedStepKey} config={config} />
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setShowDataModel(true)}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    View the underlying data schema →
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                  </svg>
                  <p className="text-slate-500 text-sm">Select a step above to view its details, configuration impact, and relevant tools.</p>
                </div>
                <div className="pt-6 border-t border-slate-800">
                  <button
                    onClick={() => setShowDataModel(true)}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    View the underlying data schema →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepTools({ stepKey, config }) {
  const mapped = STEP_TOOL_MAP[stepKey] || []
  const tools = TOOL_RECOMMENDATIONS.filter(t => mapped.includes(t.category) && t.activeWhen(config))
  if (tools.length === 0) return null

  return (
    <div className="mt-5 pt-5 border-t border-slate-800">
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Relevant Tools for This Step</h4>
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg px-4 py-2 mb-3">
        <p className="text-xs text-slate-500">Representative tools, not recommendations. Your choice depends on existing stack, budget, and scale.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {tools.map(t => (
          <div key={t.category} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-300 mb-2">{t.category}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{t.tools}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
