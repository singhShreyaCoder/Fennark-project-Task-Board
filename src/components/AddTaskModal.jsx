import { useEffect, useRef, useState } from 'react'

const MAX_TITLE_LENGTH = 80
const MAX_DESCRIPTION_LENGTH = 300

export default function AddTaskModal({ task, onClose, onSave }) {
  const isEditing = Boolean(task)
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [error, setError] = useState('')
  const titleInputRef = useRef(null)

  // Focus the title when the modal opens (and select it while editing).
  useEffect(() => {
    const input = titleInputRef.current
    if (!input) return

    input.focus()
    if (isEditing) input.select()
  }, [isEditing])

  // Close with the Escape key.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setError('Please enter a task title.')
      titleInputRef.current?.focus()
      return
    }

    onSave({ title: trimmedTitle, description })
  }

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="modal__header">
          <div>
            <h2 className="modal__title" id="task-modal-title">
              {isEditing ? 'Edit task' : 'Add a new task'}
            </h2>
            <p className="modal__subtitle">
              {isEditing
                ? 'Update the details and save your changes.'
                : 'New tasks start in the To Do column.'}
            </p>
          </div>

          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="task-title">
              Task title
            </label>
            <input
              id="task-title"
              ref={titleInputRef}
              className="form-input"
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              placeholder="e.g. Write the project README"
              onChange={(event) => {
                setTitle(event.target.value)
                if (error) setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'task-title-error' : undefined}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="task-description">
              Description <span className="form-label__optional">optional</span>
            </label>
            <textarea
              id="task-description"
              className="form-textarea"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={4}
              placeholder="Add a few details, links or notes…"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          {error && (
            <p className="form-error" id="task-title-error" role="alert">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 7.5v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="16.5" r="1" fill="currentColor" />
              </svg>
              {error}
            </p>
          )}

          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary">
              {isEditing ? 'Save changes' : 'Add task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
