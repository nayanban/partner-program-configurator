import { useState } from 'react'
import Sidebar from './Sidebar'
import StepMap from './StepMap'
import StepCard from './StepCard'
import DataModelView from './DataModelView'
import ToolRecommendations from './ToolRecommendations'
import { isStepActive, generateFlowAnnotation, encodeConfig } from '../engine'

export default function OutputView({ config, onConfigChange, onBack, activeArchetype, spec, content }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('workflow') // 'workflow' | 'datamodel'
  const [activeStepKey, setActiveStepKey] = useState(null)
  const [copyStatus, setCopyStatus] = useState(null)

  const flowAnnotation = generateFlowAnnotation(config, spec)
  const stepKeys = Object.keys(spec.workflow_steps)
  const activeSteps = stepKeys.filter(k => isStepActive(k, config))

  function handleCopyLink() {
    const params = encodeConfig(config)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('link')
      setTimeout(() => setCopyStatus(null), 2000)
    })
  }

  function handleCopyJSON() {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
      setCopyStatus('json')
      setTimeout(() => setCopyStatus(null), 2000)
    })
  }

  function handleStepClick(stepKey) {
    setActiveStepKey(prev => prev === stepKey ? null : stepKey)
    setActiveTab('workflow')
    // Scroll to step card
    setTimeout(() => {
      const el = document.getElementById(`step-card-${stepKey}`)
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
          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copyStatus === 'json' ? 'Copied!' : 'Copy JSON'}
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
          {/* Hero: Step Map */}
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
                activeStepKey={activeStepKey}
              />

              {/* Flow annotation */}
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <p className="text-xs text-slate-300 leading-relaxed">{flowAnnotation}</p>
              </div>
            </div>
          </div>

          {/* Tab selector */}
          <div className="px-6 pt-5 pb-0">
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
              <TabButton active={activeTab === 'workflow'} onClick={() => setActiveTab('workflow')}>
                Step Details
              </TabButton>
              <TabButton active={activeTab === 'datamodel'} onClick={() => setActiveTab('datamodel')}>
                Data Model
              </TabButton>
              <TabButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')}>
                Tools
              </TabButton>
            </div>
          </div>

          {/* Tab content */}
          <div className="px-6 pt-4 pb-8">
            {activeTab === 'workflow' && (
              <div className="space-y-3">
                {activeSteps.map(stepKey => (
                  <div key={stepKey} id={`step-card-${stepKey}`}>
                    <StepCard
                      stepKey={stepKey}
                      stepData={spec.workflow_steps[stepKey]}
                      contentData={content}
                      config={config}
                      spec={spec}
                    />
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'datamodel' && (
              <DataModelView config={config} spec={spec} />
            )}

            {activeTab === 'tools' && (
              <ToolRecommendations config={config} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
        active
          ? 'bg-slate-700 text-slate-100 shadow-sm'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
