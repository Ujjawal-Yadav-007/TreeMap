import type { TreeNode } from './treeTypes'

export const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = n.children && findNode(n.children, id)
    if (found) return found
  }
  return null
}

export const setNodeProps = (
  nodes: TreeNode[],
  id: string,
  patch: Partial<TreeNode>
): TreeNode[] =>
  nodes.map((n) =>
    n.id === id
      ? { ...n, ...patch }
      : n.children
        ? { ...n, children: setNodeProps(n.children, id, patch) }
        : n
  )

export const setNodeChildren = (
  nodes: TreeNode[],
  id: string,
  children: TreeNode[]
): TreeNode[] =>
  nodes.map((n) =>
    n.id === id
      ? { ...n, children }
      : n.children
        ? { ...n, children: setNodeChildren(n.children, id, children) }
        : n
  )

export const insertNodeAt = (
  nodes: TreeNode[],
  parentId: string | null,
  index: number,
  newNode: TreeNode
): TreeNode[] => {
  if (parentId === null || parentId === 'root') {
    const next = [...nodes]
    next.splice(index, 0, newNode)
    return next
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      const kids = [...(n.children ?? [])]
      kids.splice(index, 0, newNode)
      return { ...n, children: kids, isExpanded: true }
    }
    return n.children
      ? { ...n, children: insertNodeAt(n.children, parentId, index, newNode) }
      : n
  })
}

export const detachNode = (
  nodes: TreeNode[],
  id: string
): { next: TreeNode[]; removed: TreeNode | null } => {
  const next: TreeNode[] = []
  let removed: TreeNode | null = null

  for (const n of nodes) {
    if (n.id === id) {
      removed = { ...n }
      continue
    }
    if (n.children) {
      const res = detachNode(n.children, id)
      if (res.removed) {
        removed = res.removed
        next.push({ ...n, children: res.next })
        continue
      }
    }
    next.push(n)
  }

  return { next, removed }
}

export const ensureExpanded = (
  nodes: TreeNode[],
  id: string | null
): TreeNode[] =>
  id ? setNodeProps(nodes, id, { isExpanded: true }) : nodes

export const isAncestor = (
  nodes: TreeNode[],
  ancestorId: string,
  childId: string
): boolean => {
  const ancestor = findNode(nodes, ancestorId)
  if (!ancestor || !ancestor.children) return false
  const search = (kids: TreeNode[]): boolean =>
    kids.some(
      (k) =>
        k.id === childId ||
        (k.children ? search(k.children) : false)
    )
  return search(ancestor.children)
}
