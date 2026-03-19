import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import StepMap from './StepMap'
import StepPanel from './StepPanel'
import DataModelView from './DataModelView'
import { isStepActive, generateFlowAnnotation, encodeConfig } from '../engine'

export default function OutputView({ config, onConfigChange, onBack, activeArchetype, spec, content }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedStepKey, setSelectedStepKey] = useState(null)
  const [copyStatus, setCopyStatus] = useState(null)
  const [showDataModel, setShowDataModel] = useState(false)

  const flowAnnotation = generateFlowAnnotation(config, spec)
  const stepKeys = Object.keys(spec.workflow_steps)
  const activeSteps = stepKeys.filter(k => isStepActive(k, config))

  // Close panel if selected step becomes inactive due to config change
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
  }

  function navigateStep(direction) {
    const currentIndex = activeSteps.indexOf(selectedStepKey)
    const nextIndex = currentIndex + direction
    if (nextIndex >= 0 && nextIndex < activeSteps.length) {
      setSelectedStepKey(activeSteps[nextIndex])
    }
  }

  const selectedIndex = selectedStepKey ? activeSteps.indexOf(selectedStepKey) : -1
  const prevStepKey = selectedIndex > 0 ? activeSteps[selectedIndex - 1] : null
  const nextStepKey = selectedIndex < activeSteps.length - 1 ? activeSteps[selectedIndex + 1] : null

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
        <div className="flex-1 overflow-y-auto scrollbar-thin relative">
          {showDataModel ? (
            <div className="px-6 pt-6 pb-8">
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
          ) : (
            <div className="px-6 pt-6 pb-8">
              {/* Flow annotation */}
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{flowAnnotation}</p>

              {/* Step map — large vertical layout */}
              <StepMap
                config={config}
                spec={spec}
                onStepClick={handleStepClick}
                activeStepKey={selectedStepKey}
              />

              {/* Prompt when no step selected */}
              {!selectedStepKey && (
                <div className="flex flex-col items-center justify-center py-12 text-center mt-4">
                  <svg className="w-8 h-8 text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                  </svg>
                  <p className="text-slate-500 text-sm">Select a step to view its details, configuration impact, and relevant tools.</p>
                </div>
              )}

              {/* Data schema link */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <button
                  onClick={() => setShowDataModel(true)}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  View the underlying data schema →
                </button>
              </div>
            </div>
          )}

          {/* Slide-out panel */}
          <StepPanel
            isOpen={!!selectedStepKey && !showDataModel}
            onClose={() => setSelectedStepKey(null)}
            stepKey={selectedStepKey}
            stepData={selectedStepKey ? spec.workflow_steps[selectedStepKey] : null}
            contentData={content}
            config={config}
            spec={spec}
            prevStepKey={prevStepKey}
            nextStepKey={nextStepKey}
            onNavigate={navigateStep}
            onShowDataModel={() => { setShowDataModel(true); setSelectedStepKey(null) }}
          />
        </div>
      </div>
    </div>
  )
}
