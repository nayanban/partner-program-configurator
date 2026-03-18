import { useState, useEffect } from 'react'
import spec from './structured_specification.json'
import content from './supplementary_content.json'
import { decodeConfig, encodeConfig, isConfigComplete, detectArchetype } from './engine'
import LandingPage from './components/LandingPage'
import QuestionFlow from './components/QuestionFlow'
import OutputView from './components/OutputView'

const DEFAULT_CONFIG = {
  dp1: null,
  dp2: { motions: [], co_sell_direction: null, co_marketing_funding: null },
  dp3: null,
  dp4: null,
}

export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'questions' | 'output'
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [activeArchetype, setActiveArchetype] = useState(null)

  // Parse URL params on load
  useEffect(() => {
    const decoded = decodeConfig(window.location.search)
    if (decoded) {
      setConfig(decoded)
      setView('output')
      setActiveArchetype(detectArchetype(decoded))
    }
  }, [])

  // Sync URL when in output view
  useEffect(() => {
    if (view === 'output' && isConfigComplete(config)) {
      const params = encodeConfig(config)
      const newUrl = `${window.location.pathname}?${params}`
      window.history.replaceState(null, '', newUrl)
    } else if (view !== 'output') {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [config, view])

  function handleArchetypeSelect(archetype) {
    setConfig(archetype.config)
    setActiveArchetype(archetype)
    setView('output')
  }

  function handleDeepPath() {
    setConfig(DEFAULT_CONFIG)
    setActiveArchetype(null)
    setView('questions')
  }

  function handleConfigChange(newConfig) {
    setConfig(newConfig)
    setActiveArchetype(detectArchetype(newConfig))
  }

  function handleQuestionsComplete(newConfig) {
    setConfig(newConfig)
    setActiveArchetype(detectArchetype(newConfig))
    setView('output')
  }

  function handleBackToLanding() {
    setConfig(DEFAULT_CONFIG)
    setActiveArchetype(null)
    setView('landing')
    window.history.replaceState(null, '', window.location.pathname)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {view === 'landing' && (
        <LandingPage
          onArchetypeSelect={handleArchetypeSelect}
          onDeepPath={handleDeepPath}
        />
      )}
      {view === 'questions' && (
        <QuestionFlow
          initialConfig={config}
          onComplete={handleQuestionsComplete}
          onBack={() => setView('landing')}
          spec={spec}
        />
      )}
      {view === 'output' && (
        <OutputView
          config={config}
          onConfigChange={handleConfigChange}
          onBack={handleBackToLanding}
          activeArchetype={activeArchetype}
          spec={spec}
          content={content}
        />
      )}
    </div>
  )
}
