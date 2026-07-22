import { FaLeaf } from "react-icons/fa";
import { Link } from "react-router-dom";

/**
 * Branded empty state component for the Dr. Kent Homoeopathy app.
 *
 * Props:
 *  - icon: icon component (default: FaLeaf)
 *  - title: string (default: "Nothing here yet")
 *  - description: string (default: "")
 *  - actionLabel: string (optional) — button text
 *  - actionLink: string (optional) — route for action button
 *  - action: function (optional) — alternative onClick handler
 *  - compact: boolean (default: false) — smaller variant for tables
 */
const EmptyState = ({
  icon: Icon = FaLeaf,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  actionLink,
  action,
  compact = false,
}) => {
  if (compact) {
    return (
      <tr>
        <td colSpan={100} className="py-10 text-center">
          <div className="flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)] flex items-center justify-center mb-3">
              <Icon className="text-sm" />
            </div>
            <div className="text-sm font-extrabold text-neutral-900">{title}</div>
            {description ? (
              <div className="text-xs text-neutral-500 mt-1 max-w-xs">{description}</div>
            ) : null}
            {actionLabel && actionLink ? (
              <Link
                to={actionLink}
                className="mt-4 btn-primary py-2 px-4 text-xs"
                onClick={action}
              >
                {actionLabel}
              </Link>
            ) : actionLabel && action ? (
              <button
                onClick={action}
                className="mt-4 btn-primary py-2 px-4 text-xs"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[var(--brand-50)] border border-[var(--brand-100)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--brand-600)]" />
      </div>
      <h3 className="text-xl font-extrabold text-neutral-900 mb-1">{title}</h3>
      {description ? (
        <p className="text-sm text-neutral-500 max-w-md mb-6">{description}</p>
      ) : null}
      {actionLabel && actionLink ? (
        <Link
          to={actionLink}
          className="btn-primary py-2.5 px-5"
          onClick={action}
        >
          {actionLabel}
        </Link>
      ) : actionLabel && action ? (
        <button onClick={action} className="btn-primary py-2.5 px-5">
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};

/** Table row variant — use inside <tbody> */
export function TableEmptyState(props) {
  return (
    <tr>
      <td colSpan={100} className="py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[var(--brand-50)] text-[var(--brand-600)] flex items-center justify-center mb-3">
            {props.icon ? <props.icon className="text-lg" /> : <FaLeaf className="text-lg" />}
          </div>
          <div className="text-sm font-extrabold text-neutral-900">
            {props.title || "Nothing here yet"}
          </div>
          {props.description ? (
            <div className="text-xs text-neutral-500 mt-1 max-w-xs">{props.description}</div>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default EmptyState;

