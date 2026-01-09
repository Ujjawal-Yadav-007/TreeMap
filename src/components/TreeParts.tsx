import type { TreeNode } from './treeTypes'

type DropInfo = { parentId: string | null; index: number }

type RowProps = {
  node: TreeNode
  depth: number
  editingId: string | null
  editValue: string
  onToggle(id: string): void
  onAdd(id: string | null): void
  onDelete(id: string): void
  onEditStart(id: string, current: string): void
  onEditCommit(id: string): void
  onEditChange(v: string): void
  onDropChild(targetId: string): void
  onDragStart(id: string): void
}

type ChildrenProps = {
  nodes: TreeNode[]
  parentId: string | null
  depth: number
  editingId: string | null
  editValue: string
  showDropzones: boolean
  onToggle(id: string): void
  onAdd(id: string | null): void
  onDelete(id: string): void
  onEditStart(id: string, current: string): void
  onEditCommit(id: string): void
  onEditChange(v: string): void
  onDrop(info: DropInfo): void
  onDropChild(targetId: string): void
  onDragStart(id: string): void
}

const DropZone = ({
  parentId,
  index,
  show,
  onDrop,
}: {
  parentId: string | null
  index: number
  show: boolean
  onDrop(info: DropInfo): void
}) => (
  show ? (
    <div
      className="dropzone"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDrop({ parentId, index })
      }}
    >
      <span>Release to place here</span>
    </div>
  ) : null
)

export const TreeChildren = ({
  nodes,
  parentId,
  depth,
  showDropzones,
  ...handlers
}: ChildrenProps) => (
  <div className="tree-children">
    <DropZone
      parentId={parentId}
      index={0}
      show={showDropzones}
      onDrop={handlers.onDrop}
    />
    {nodes.map((node, idx) => (
      <div key={node.id} className="tree-node-wrapper">
        <TreeNodeRow
          node={node}
          depth={depth}
          {...handlers}
        />
        {node.isExpanded && node.children ? (
          <div className="tree-branch">
            <TreeChildren
              nodes={node.children}
              parentId={node.id}
              depth={depth + 1}
              showDropzones={showDropzones}
              {...handlers}
            />
          </div>
        ) : null}
        <DropZone
          parentId={parentId}
          index={idx + 1}
          show={showDropzones}
          onDrop={handlers.onDrop}
        />
      </div>
    ))}
    {nodes.length === 0 ? (
      <div className="tree-loading">Empty</div>
    ) : null}
  </div>
)

export const TreeNodeRow = ({
  node,
  depth,
  editingId,
  editValue,
  onToggle,
  onAdd,
  onDelete,
  onEditStart,
  onEditCommit,
  onEditChange,
  onDropChild,
  onDragStart,
}: RowProps) => {
  const isEditing = editingId === node.id
  const letter = node.title.charAt(0).toUpperCase()
  const canToggle = node.hasChildren || (node.children?.length ?? 0) > 0
  const description = node.description || node.subtitle || '—'

  return (
    <div
      className="tree-node"
      draggable
      onDragStart={() => onDragStart(node.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        onDropChild(node.id)
      }}
      data-depth={depth}
    >
      <div className="tree-node-left">
        <button
          className="icon-button"
          aria-label="Expand"
          onClick={() => onToggle(node.id)}
          disabled={!canToggle}
        >
          {canToggle ? (node.isExpanded ? '▾' : '▸') : '•'}
        </button>
        <span className={`avatar avatar-${letter}`} aria-hidden>
          {letter}
        </span>
        <div className="node-text">
          {isEditing ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onBlur={() => onEditCommit(node.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape')
                  onEditCommit(node.id)
              }}
            />
          ) : (
            <>
              <div
                className="node-title"
                onDoubleClick={() => onEditStart(node.id, node.title)}
              >
                {node.title}
              </div>
              <div className="node-subtitle">
                {description}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="tree-actions">
        <button className="icon-button" onClick={() => onAdd(node.id)}>
          ＋
        </button>
        <button
          className="icon-button"
          onClick={() => onEditStart(node.id, node.title)}
        >
          ✎
        </button>
        <button className="icon-button danger" onClick={() => onDelete(node.id)}>
          🗑
        </button>
      </div>
    </div>
  )
}
