export type TreeNode = {
  id: string
  title: string
  subtitle?: string
  description?: string
  children?: TreeNode[]
  isExpanded?: boolean
  isLoading?: boolean
  hasChildren?: boolean
}
