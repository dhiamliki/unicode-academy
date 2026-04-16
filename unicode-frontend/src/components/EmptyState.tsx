type Props = {
  emoji?: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  eyebrow = "Information",
  title,
  subtitle,
  actionLabel,
  onAction,
}: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state-marker" aria-hidden="true">
        <span />
        <span />
      </span>
      <span className="empty-state-eyebrow">{eyebrow}</span>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-subtitle">{subtitle}</div>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
