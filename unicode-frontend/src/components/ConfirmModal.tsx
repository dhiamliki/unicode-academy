type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  dangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  dangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="modal-viewport">
        <div className="modal-card">
          <div className="page-stack">
            <h2 id="confirm-modal-title" className="modal-title">
              {title}
            </h2>
            <p className="modal-message">{message}</p>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost btn-full" onClick={onCancel}>
              Annuler
            </button>
            <button
              type="button"
              className={`btn ${dangerous ? "btn-danger" : "btn-primary"} btn-full`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
