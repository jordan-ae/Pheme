"use client";

import s from "./dashboard.module.css";
import { Icons, StatusIcon } from "./icons";
import { Tag, TypeChip, Avatar } from "./dash-list";
import { type DashEntry, STATUS_META, personFor, relativeTime, shortId } from "./format";

export function Detail({ entry, onClose }: { entry: DashEntry; onClose: () => void }) {
  const author = personFor(entry.author);
  const edited = entry.updatedAt && entry.updatedAt !== entry.createdAt;

  return (
    <aside className={s.detail}>
      <div className={s.detailTop}>
        <span className={s.id}>{shortId(entry.id)}</span>
        <span className={s.spacer} />
        <button type="button" className={s.iconbtn} title="Backlinks">
          <Icons.Backlink />
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

        {entry.body && <p>{entry.body}</p>}
        {entry.rationale && (
          <div className={s.detailWhy}>
            <strong>Why</strong>
            {entry.rationale}
          </div>
        )}

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

        {/* Real schema has no multi-actor activity feed; we render the create/edit
            timeline we do have, attributed to the entry's author. */}
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
      </div>
    </aside>
  );
}
