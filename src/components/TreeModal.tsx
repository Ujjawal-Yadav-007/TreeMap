type Props = {
  open: boolean
  title: string
  placeholder?: string
  value: string
  description: string
  descriptionPlaceholder?: string
  onChange(v: string): void
  onDescriptionChange(v: string): void
  onClose(): void
  onSubmit(): void
}

export function Modal({
  open,
  title,
  placeholder,
  value,
  description,
  descriptionPlaceholder,
  onChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        <div className="modal-body">
          <input
            autoFocus
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit()
              if (e.key === 'Escape') onClose()
            }}
          />
          <textarea
            value={description}
            maxLength={100}
            placeholder={descriptionPlaceholder}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
            }}
          />
          <div className="muted">
            {description.length}/100 characters
          </div>
        </div>
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>
            Cancel
          </button>
          <button onClick={onSubmit}>Save</button>
        </div>
      </div>
    </div>
  )
}
