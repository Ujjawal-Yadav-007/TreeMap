import './App.css'
import { Suspense, useEffect, useState, lazy } from 'react'
import type { TreeNode } from './components/treeTypes'

const TreeView = lazy(() =>
  import('./components/TreeView').then((m) => ({ default: m.TreeView }))
)

const initialData: TreeNode[] = [
  {
    id: 'node-a',
    title: 'A',
    subtitle: 'Level A',
    description: 'Top-level node',
    hasChildren: true,
    isExpanded: false,
  },
]

const lazyChildren: Record<string, TreeNode[]> = {
  'node-a': [
    {
      id: 'node-b1',
      title: 'B',
      subtitle: 'Level A',
      description: 'Branch for experiments',
      hasChildren: true,
    },
    { id: 'node-c3', title: 'C', subtitle: 'Level A', description: 'Single leaf' },
    { id: 'node-b2', title: 'B', subtitle: 'Level A', description: 'Another branch' },
  ],
  'node-b1': [
    {
      id: 'node-c1',
      title: 'C',
      subtitle: 'Level A',
      description: 'Contains tasks',
      hasChildren: true,
    },
    { id: 'node-c2', title: 'C', subtitle: 'Level A', description: 'Notes bucket', hasChildren: true },
  ],
  'node-c1': [{ id: 'node-d', title: 'D', subtitle: 'Level A', description: 'Deep leaf' }],
}

const simulateLazyLoad = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const next = lazyChildren[id] ?? []
  return next.map((n) => ({ ...n }))
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <h1>Tree Map</h1>
          <p>
            Craft hierarchies, drag to rearrange, and annotate nodes with quick notes.
            Double-click any name to rename on the fly.
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </section>
      <section className="panel">
        <Suspense fallback={<div className="tree-loading">Loading…</div>}>
          <TreeView data={initialData} loadChildren={simulateLazyLoad} />
        </Suspense>
      </section>
    </main>
  )
}

export default App
