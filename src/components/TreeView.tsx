import { lazy, Suspense, useEffect, useState } from 'react'
import type { TreeNode } from './treeTypes'
import {
  detachNode,
  ensureExpanded,
  findNode,
  insertNodeAt,
  isAncestor,
  setNodeChildren,
  setNodeProps,
} from './treeUtils'
import { Modal } from './TreeModal'

const TreeChildren = lazy(() =>
  import('./TreeParts').then((m) => ({ default: m.TreeChildren }))
)

type Props = {
  data: TreeNode[]
  loadChildren?: (id: string) => Promise<TreeNode[]>
  onChange?: (next: TreeNode[]) => void
}

export function TreeView({ data, loadChildren, onChange }: Props) {
  const [tree, setTree] = useState<TreeNode[]>(data)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; parentId: string | null }>({
    open: false,
    parentId: null,
  })
  const [modalInput, setModalInput] = useState('')
  const [modalDesc, setModalDesc] = useState('')

  useEffect(() => setTree(data), [data])

  const sync = (next: TreeNode[]) => {
    setTree(next)
    onChange?.(next)
  }

  const toggle = async (id: string) => {
    const node = findNode(tree, id)
    if (!node) return

    const needsLoad =
      node.hasChildren && !node.children && typeof loadChildren === 'function'

    if (needsLoad) {
      sync(setNodeProps(tree, id, { isLoading: true, isExpanded: true }))
      const kids = await loadChildren(id)
      const withKids = setNodeChildren(tree, id, kids)
      sync(setNodeProps(withKids, id, { isLoading: false, isExpanded: true }))
      return
    }

    sync(setNodeProps(tree, id, { isExpanded: !node.isExpanded }))
  }

  const add = (parentId: string | null) => {
    setModal({ open: true, parentId })
    setModalInput('')
  }

  const confirmAdd = () => {
    const title = modalInput.trim()
    if (!title) {
      setModal({ open: false, parentId: null })
      return
    }
    const desc = modalDesc.trim().slice(0, 100)
    const newNode: TreeNode = {
      id: crypto.randomUUID(),
      title,
      subtitle: 'Level A',
      description: desc || undefined,
      children: [],
      isExpanded: false,
    }
    const target = modal.parentId === 'root' ? null : modal.parentId
    const next = insertNodeAt(
      tree,
      target,
      (findNode(tree, target ?? '')?.children?.length ?? tree.length),
      newNode
    )
    sync(ensureExpanded(next, target))
    setModal({ open: false, parentId: null })
    setModalDesc('')
  }

  const remove = (id: string) => {
    const node = findNode(tree, id)
    if (!node) return
    if (!window.confirm(`Delete "${node.title}" and its children?`)) return
    const { next } = detachNode(tree, id)
    sync(next)
  }

  const startEdit = (id: string, title: string) => {
    setEditingId(id)
    setEditValue(title)
  }

  const commitEdit = (id: string) => {
    if (!editingId) return
    sync(setNodeProps(tree, id, { title: editValue || 'Untitled' }))
    setEditingId(null)
    setEditValue('')
  }

  const handleDrop = (parentId: string | null, index: number) => {
    if (!draggingId) return
    if (parentId === draggingId) return
    if (parentId && isAncestor(tree, draggingId, parentId)) return
    const { next, removed } = detachNode(tree, draggingId)
    if (!removed) return
    const target = parentId === 'root' ? null : parentId
    const placed = insertNodeAt(next, target, index, removed)
    sync(ensureExpanded(placed, target))
    setDraggingId(null)
  }

  const dropAsChild = (id: string) => {
    const node = findNode(tree, id)
    const count = node?.children?.length ?? 0
    handleDrop(id, count)
  }

  return (
    <>
      <div className="tree-view">
        <Suspense fallback={<div className="tree-loading">Loading…</div>}>
          <TreeChildren
            nodes={tree}
            parentId={null}
            depth={0}
            editingId={editingId}
            editValue={editValue}
            onToggle={toggle}
            onAdd={add}
            onDelete={remove}
            onEditStart={startEdit}
            onEditCommit={commitEdit}
            onEditChange={setEditValue}
            onDrop={({ parentId, index }) => handleDrop(parentId, index)}
            onDropChild={dropAsChild}
            onDragStart={setDraggingId}
            showDropzones={Boolean(draggingId)}
          />
        </Suspense>
        <div className="tree-footer">
          <button className="ghost" onClick={() => add(null)}>
            + Add root node
          </button>
        </div>
      </div>
      <Modal
        open={modal.open}
        title="Add node"
        placeholder="Enter node title"
        description={modalDesc}
        descriptionPlaceholder="Add a short description (max 100 chars)"
        onDescriptionChange={setModalDesc}
        value={modalInput}
        onChange={setModalInput}
        onClose={() => setModal({ open: false, parentId: null })}
        onSubmit={confirmAdd}
      />
    </>
  )
}
