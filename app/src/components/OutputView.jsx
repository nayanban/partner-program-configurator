import { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import StepMap from './StepMap'
import StepCard from './StepCard'
import DataModelView from './DataModelView'
import {
  isStepActive,
  generateFlowAnnotation,
  encodeConfig,
} from '../engine'

const SHORT_STEP_NAMES = {
  step_0: 'Definition & Maintenance',
  step_1: 'Intake & Routing',
  step_2: 'Placement & Tiering',
  step_3: 'Scoping & Commitment',
  step_4: 'Approvals Gate',
  step_5: 'Implementation',
  step_6: 'Launch Readiness',
  step_7: 'Go-live & Stabilization',
  step_8: 'Operations & Support',
  step_9: 'Growth Motions',
  step_10: 'Review & Renewal',
}

function getShortStepName(key) { return SHORT_STEP_NAMES[key] || key }

function cleanOwnerText(owner) {
  if (!owner) return ''
  let text = owner.split('—')[0].split('/')[0].trim()
  if (text.includes('(') && !text.includes(')')) {
    text = text.substring(0, text.indexOf('(')).trim()
  }
  return text
}

export default function OutputView({ config, onConfigChange, onBack, activeArchetype, spec, content }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [selectedStepKey, setSelectedStepKey] = useState(null)
  const [showFullDataModel, setShowFullDataModel] = useState(false)
  const [copyStatus, setCopyStatus] = useState(null)
  const [viewReady, setViewReady] = useState(false)
  const [showOrientation, setShowOrientation] = useState(true)
  const [hasUserClickedStep, setHasUserClickedStep] = useState(false)

  // Fix 3: ref for scroll-to-top when data model opens
  const mainContentRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setViewReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (selectedStepKey && !isStepActive(selectedStepKey, config)) {
      setSelectedStepKey(null)
    }
  }, [config, selectedStepKey])

  // Fix 3: scroll to top when data model is opened
  useEffect(() => {
    if (showFullDataModel && mainContentRef.current) {
      mainContentRef.current.scrollTop = 0
    }
  }, [showFullDataModel])

  function getAdjacentSteps(stepKey) {
    const activeSteps = Object.keys(spec.workflow_steps).filter(k => isStepActive(k, config))
    const idx = activeSteps.indexOf(stepKey)
    return {
      prev: idx > 0 ? activeSteps[idx - 1] : null,
      next: idx < activeSteps.length - 1 ? activeSteps[idx + 1] : null,
    }
  }

  function handleShareLink() {
    const params = encodeConfig(config)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('copied')
      setTimeout(() => setCopyStatus(null), 2000)
    })
  }

  function handleStepClick(stepKey) {
    setSelectedStepKey(prev => prev === stepKey ? null : stepKey)
    setShowFullDataModel(false)
    setMobileSidebarOpen(false)
    setShowOrientation(false)
    setHasUserClickedStep(true)
  }

  function handleStepSelect(stepKey) {
    setSelectedStepKey(stepKey)
    setShowOrientation(false)
    setHasUserClickedStep(true)
    setShowFullDataModel(false)
    setMobileSidebarOpen(false)
  }

  const flowAnnotation = generateFlowAnnotation(config, spec)

  return (
    <div className={`h-screen flex overflow-hidden transition-opacity duration-500 ${viewReady ? 'opacity-100' : 'opacity-0'}`}>
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — mobile: slide-out drawer; desktop: normal */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-200
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        sm:relative sm:translate-x-0 sm:transform-none sm:z-auto
        flex-shrink-0
      `}>
        <Sidebar
          config={config}
          onConfigChange={onConfigChange}
          activeArchetype={activeArchetype}
          spec={spec}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar — stacks vertically on mobile */}
        <div className="flex-shrink-0 border-b border-slate-800 bg-slate-950 px-4 sm:px-5 py-3 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center justify-between sm:contents">
              {/* Left: Home + mobile sidebar toggle */}
              <div className="flex items-center gap-2">
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setMobileSidebarOpen(o => !o)}
                  className="sm:hidden p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Configuration"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Home
                </button>
              </div>

              {/* Right: Share + attribution (visible at all sizes) */}
              <div className="flex items-center gap-3 flex-shrink-0 sm:order-last">
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <span>Built by Nayan Banerjee</span>
                  <a
                    href="https://www.linkedin.com/in/banerjee-nayan/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-200 transition-colors"
                    title="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a
                    href="https://github.com/nayanban"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-200 transition-colors"
                    title="GitHub"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                </div>

                <button
                  onClick={handleShareLink}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copyStatus === 'copied' ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Flow annotation — full width row on mobile */}
            <p className="text-sm text-slate-300 flex-1 sm:text-center sm:mx-4 hidden sm:block">
              {flowAnnotation}
            </p>
          </div>
        </div>

        {/* Below top bar: three possible views */}
        {showFullDataModel ? (
          /* VIEW 1: Full Data Model */
          <div ref={mainContentRef} className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-8">
            <button
              onClick={() => setShowFullDataModel(false)}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to workflow
            </button>
            <DataModelView config={config} spec={spec} />
          </div>

        ) : selectedStepKey === null ? (
          /* VIEW 2: Workflow Map */
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-6 pb-8">
            {showOrientation && (
              <div className="mx-4 mt-4 mb-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-200">
                    Your configured workflow is ready.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 hidden md:block">
                    Click any step below to explore its details. Use the sidebar to adjust your configuration.
                  </p>
                  <p className="text-xs text-slate-400 mt-1 md:hidden">
                    Tap any step below to explore its details. Tap the ⚙ icon to adjust your configuration.
                  </p>
                </div>
                <button
                  onClick={() => setShowOrientation(false)}
                  className="text-slate-400 hover:text-slate-200 ml-4 flex-shrink-0 text-lg"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="text-center mb-6">
              <p className="text-sm text-slate-300 flex items-center justify-center gap-2">
                <span className="text-cyan-400">↓</span>
                Click a step to see its full details
                <span className="text-cyan-400">↓</span>
              </p>
            </div>
            <StepMap
              variant="timeline"
              config={config}
              spec={spec}
              onStepClick={handleStepClick}
              activeStepKey={null}
              hasUserClickedStep={hasUserClickedStep}
            />
            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowFullDataModel(true)}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                View the complete data schema →
              </button>
            </div>
          </div>

        ) : (
          /* VIEW 3: Step Detail */
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Mobile step selector — visible below md, stacks above content */}
            <div className="md:hidden border-b border-slate-800 px-4 py-2 bg-slate-950 flex-shrink-0">
              <label className="text-xs text-slate-500 mb-1 block">Navigate to step</label>
              <select
                value={selectedStepKey}
                onChange={(e) => handleStepSelect(e.target.value)}
                className="w-full bg-slate-700 text-slate-200 text-sm font-medium rounded-lg pl-3 pr-8 py-2.5 border border-slate-600 focus:border-cyan-500 focus:outline-none"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1rem',
                }}
              >
                {Object.keys(spec.workflow_steps).map(key => {
                  const stepNum = key.replace('step_', '')
                  const active = isStepActive(key, config)
                  return (
                    <option key={key} value={key} disabled={!active}>
                      {stepNum} — {SHORT_STEP_NAMES[key] || spec.workflow_steps[key].step_name}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Inner row: nav + detail panel side by side */}
            <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* Desktop vertical nav — hidden below md */}
            <div className="hidden md:block w-48 flex-shrink-0 border-r border-slate-800 overflow-y-auto max-h-[calc(100vh-120px)] px-2 py-3">
              <StepMap
                variant="vertical"
                config={config}
                spec={spec}
                onStepClick={handleStepClick}
                activeStepKey={selectedStepKey}
              />
            </div>

            {/* Detail panel — full width below md */}
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-120px)]">
              {/* Sticky header — Fix 1: md breakpoint */}
              {(() => {
                const stepData = spec.workflow_steps[selectedStepKey]
                const adj = getAdjacentSteps(selectedStepKey)
                return (
                  <div className="flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10 gap-2">
                    <div className="text-center md:text-left flex-1">
                      <div className="text-sm font-semibold text-slate-200">{stepData.step_name}</div>
                      <div className="text-xs text-slate-400">{cleanOwnerText(stepData.primary_owner)}</div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      {adj.prev ? (
                        <button
                          onClick={() => handleStepSelect(adj.prev)}
                          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          ← {adj.prev.replace('step_', '')}. {getShortStepName(adj.prev)}
                        </button>
                      ) : <span />}
                      {adj.next ? (
                        <button
                          onClick={() => handleStepSelect(adj.next)}
                          className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {adj.next.replace('step_', '')}. {getShortStepName(adj.next)} →
                        </button>
                      ) : <span />}
                      <button
                        onClick={() => setSelectedStepKey(null)}
                        className="text-slate-500 hover:text-slate-200"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2">
                      {Object.keys(spec.workflow_steps).map(key => {
                        const active = isStepActive(key, config)
                        if (!active) return null
                        const isCurrent = key === selectedStepKey
                        return (
                          <button
                            key={key}
                            onClick={() => handleStepSelect(key)}
                            className={`rounded-full transition-all duration-200 ${
                              isCurrent
                                ? 'bg-cyan-400 w-3 h-3'
                                : 'bg-slate-600 hover:bg-slate-400 w-2 h-2'
                            }`}
                            title={`Step ${key.replace('step_', '')}: ${getShortStepName(key)}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              <StepCard
                key={selectedStepKey}
                stepKey={selectedStepKey}
                stepData={spec.workflow_steps[selectedStepKey]}
                contentData={content}
                config={config}
                spec={spec}
              />
            </div>
            </div>{/* end inner row: nav + detail */}
          </div>
        )}
      </div>
    </div>
  )
}
