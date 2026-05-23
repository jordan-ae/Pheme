"use client";

import Link from "next/link";
import s from "./dashboard.module.css";
import { Icons, StatusIcon } from "./icons";
import { Tag, TypeChip, Avatar } from "./dash-list";
import { type DashEntry, STATUS_META, personFor, relativeTime, shortId } from "./format";

export function Detail({
  entry,
  onClose,
  onExpand,
}: {
  entry: DashEntry;
  onClose: () => void;
  onExpand: () => void;
}) {
  return (
    <aside className={s.detail}>
      <div className={s.detailTop}>
        <span className={s.id}>{shortId(entry.id)}</span>
        <span className={s.spacer} />
        <button
          type="button"
          className={s.iconbtn}
          title="Open full view"
          aria-label="Open full view"
          onClick={onExpand}
        >
          <Icons.Expand />
        </button>
        <button type="button" className={s.iconbtn} title="Add sub-entry">
          <Icons.Plus />
        </button>
        <button type="button" className={s.iconbtn} title="Hide details" onClick={onClose}>
          <Icons.Dots />
        </button>
      </div>

      <div className={s.detailBody}>
        <div className={s.detailChips}>
          <TypeChip type={entry.type} />
          <span className={s.branch}>
            <Icons.Branch />
            {entry.branch}
          </span>
        </div>
        <h2 className={s.detailTitle}>{entry.title}</h2>

        <BodyProse text={entry.body} />
        {entry.rationale && (
          <div className={s.detailWhy}>
            <strong>Why</strong>
            {entry.rationale}
          </div>
        )}

        <EntryProps entry={entry} />
        <EntryActivity entry={entry} />
      </div>
    </aside>
  );
}

/* Full-page view of a single entry — the destination of the detail panel's
   "expand" control (route: /entries/[id]). Same content as the side panel, given a
   whole page: a centered, wide reading column with the metadata + activity beside
   the prose rather than stacked beneath it. */
export function EntryFullView({
  entry,
  onClose,
}: {
  entry: DashEntry;
  /* When provided, the view is an in-feed overlay: the leading control and the
     "Memory" crumb close it client-side (instant) instead of navigating home.
     Omitted on the standalone /entries/[id] route, which links back to "/". */
  onClose?: () => void;
}) {
  return (
    <div className={s.entryPage}>
      <div className={s.entryBar}>
        {onClose ? (
          <button
            type="button"
            className={s.iconbtn}
            title="Back to memory"
            aria-label="Back to memory"
            onClick={onClose}
          >
            <Icons.ArrowLeft />
          </button>
        ) : (
          <Link href="/" className={s.iconbtn} title="Back to memory" aria-label="Back to memory">
            <Icons.ArrowLeft />
          </Link>
        )}
        <div className={s.crumbs}>
          {onClose ? (
            <span className={`${s.crumb} ${s.dim}`}>Memory</span>
          ) : (
            <Link href="/" className={`${s.crumb} ${s.dim}`}>
              Memory
            </Link>
          )}
          <span className={s.crumbSep}>/</span>
          <span className={s.id}>{shortId(entry.id)}</span>
        </div>
      </div>

      <div className={s.entryWrap}>
        <div className={s.entryScroll}>
          <div className={s.entryInner}>
            <div className={s.detailChips}>
              <TypeChip type={entry.type} />
              <span className={s.branch}>
                <Icons.Branch />
                {entry.branch}
              </span>
            </div>
            <h1 className={s.entryTitle}>{entry.title}</h1>

            <BodyProse text={entry.body} />
            {entry.rationale && (
              <div className={s.detailWhy}>
                <strong>Why</strong>
                {entry.rationale}
              </div>
            )}
          </div>
        </div>

        <aside className={s.entryAside}>
          <EntryProps entry={entry} />
          <EntryActivity entry={entry} />
        </aside>
      </div>
    </div>
  );
}

/* ---- shared building blocks (rendered by both the side panel and the full page) ---- */

/* Entry bodies are long-form prose with their own paragraph/line structure (the
   scribe writes blank-line-separated paragraphs and "- " lists). Rendering the raw
   string in one <p> collapses all of that into a wall of text, so we split on blank
   lines into paragraphs and let CSS (white-space: pre-wrap) keep single newlines. */
function BodyProse({ text }: { text: string | null }) {
  if (!text?.trim()) return null;
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function EntryProps({ entry }: { entry: DashEntry }) {
  const author = personFor(entry.author);
  return (
    <dl className={s.props}>
      <dt>Status</dt>
      <dd>
        <StatusIcon status={entry.status} /> {STATUS_META[entry.status]?.label ?? entry.status}
      </dd>

      <dt>Project</dt>
      <dd className={s.mono}>{entry.projectName ?? entry.projectIdentifier}</dd>

      <dt>Scope</dt>
      <dd className={s.mono}>{entry.scope}</dd>

      <dt>Author</dt>
      <dd>
        <Avatar author={entry.author} size={16} /> {author.name}
      </dd>

      {entry.tags.length > 0 && (
        <>
          <dt>Tags</dt>
          <dd>
            {entry.tags.map((t) => (
              <Tag key={t} t={t} />
            ))}
          </dd>
        </>
      )}

      {entry.supersedesId && (
        <>
          <dt>Supersedes</dt>
          <dd className={s.mono}>{shortId(entry.supersedesId)}</dd>
        </>
      )}

      <dt>Created</dt>
      <dd className={s.mono}>{relativeTime(entry.createdAt)} ago</dd>
    </dl>
  );
}

/* Real schema has no multi-actor activity feed; we render the create/edit
   timeline we do have, attributed to the entry's author. */
function EntryActivity({ entry }: { entry: DashEntry }) {
  const author = personFor(entry.author);
  const edited = entry.updatedAt && entry.updatedAt !== entry.createdAt;
  return (
    <div className={s.activity}>
      <div className={s.activityH}>Activity</div>
      <div className={s.actItem}>
        <span className={s.av}>
          <Avatar author={entry.author} size={20} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={s.what}>
            <em>{author.name}</em> logged this {entry.type}.
          </div>
          <div className={s.when}>{relativeTime(entry.createdAt)} ago</div>
        </div>
      </div>
      {edited && (
        <div className={s.actItem}>
          <span className={s.av}>
            <Avatar author={entry.author} size={20} />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className={s.what}>
              <em>{author.name}</em> last updated it.
            </div>
            <div className={s.when}>{relativeTime(entry.updatedAt)} ago</div>
          </div>
        </div>
      )}
    </div>
  );
}
