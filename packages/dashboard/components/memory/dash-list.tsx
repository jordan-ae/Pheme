"use client";

import { useMemo, useState } from "react";
import s from "./dashboard.module.css";
import { Icons, StatusIcon } from "./icons";
import {
  type DashEntry,
  STATUS_META,
  TYPE_META,
  TYPE_CHIP_KEY,
  isInactive,
  relativeTime,
  shortId,
  tagColor,
  personFor,
} from "./format";
import type { EntryType } from "@/lib/memory";

export function Tag({ t }: { t: string }) {
  return (
    <span className={s.tag}>
      <span className={s.swatch} style={{ background: tagColor(t) }} />
      {t}
    </span>
  );
}

export function TypeChip({ type }: { type: EntryType }) {
  return <span className={`${s.typeChip} ${s[TYPE_CHIP_KEY[type]]}`}>{TYPE_META[type].label}</span>;
}

export function Avatar({ author, size = 18 }: { author: string | null; size?: number }) {
  const p = personFor(author);
  return (
    <span
      className={`${s.avatar} ${p.bot ? s.bot : ""}`}
      style={{
        width: size,
        height: size,
        background: p.bot ? undefined : p.color,
        color: p.bot ? "#fff" : "var(--avatar-ink)",
        fontSize: size * 0.5,
      }}
      title={p.name}
    >
      {p.initials}
    </span>
  );
}

function Row({
  e,
  selected,
  onSelect,
}: {
  e: DashEntry;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const inactive = isInactive(e.status);
  return (
    <button
      type="button"
      className={`${s.row} ${selected ? s.selected : ""} ${inactive ? s.isInactive : ""}`}
      onClick={() => onSelect(e.id)}
    >
      <span className={s.cb} />
      <StatusIcon status={e.status} />
      <span className={s.id}>{shortId(e.id)}</span>
      <span className={s.title}>{e.title}</span>
      <span className={s.meta}>
        {e.tags.slice(0, 2).map((t) => (
          <Tag key={t} t={t} />
        ))}
        <TypeChip type={e.type} />
        {e.branch !== "global" && (
          <span className={s.branch}>
            <Icons.Branch />
            {e.branch}
          </span>
        )}
        <Avatar author={e.author} />
        <span className={s.date}>{relativeTime(e.createdAt)}</span>
      </span>
    </button>
  );
}

interface Group {
  key: string;
  label: string;
  items: DashEntry[];
}

export function List({
  entries,
  group,
  selectedId,
  onSelect,
}: {
  entries: DashEntry[];
  group: "status" | "type";
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grouped = useMemo<Group[]>(() => {
    const buckets: Record<string, DashEntry[]> = {};
    for (const e of entries) {
      const key = group === "status" ? e.status : e.type;
      (buckets[key] ||= []).push(e);
    }
    const order = (k: string) =>
      group === "status" ? (STATUS_META[k]?.order ?? 99) : (TYPE_META[k as EntryType]?.order ?? 99);
    const label = (k: string) =>
      group === "status" ? (STATUS_META[k]?.label ?? k) : (TYPE_META[k as EntryType]?.plural ?? k);
    return Object.keys(buckets)
      .sort((a, b) => order(a) - order(b))
      .map((k) => ({
        key: k,
        label: label(k),
        items: buckets[k].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        ),
      }));
  }, [entries, group]);

  return (
    <div className={s.list}>
      {grouped.map((g) => (
        <div key={g.key}>
          <button
            type="button"
            className={`${s.groupHeader} ${collapsed[g.key] ? s.collapsed : ""}`}
            onClick={() => setCollapsed((c) => ({ ...c, [g.key]: !c[g.key] }))}
          >
            <Icons.Caret className={s.caret} />
            {group === "status" ? (
              <StatusIcon status={g.key} />
            ) : (
              <TypeChip type={g.key as EntryType} />
            )}
            <span className={s.gTitle}>{g.label}</span>
            <span className={s.gCount}>{g.items.length}</span>
            <span className={s.gActions}>
              <span className={s.iconbtn} title="Add">
                <Icons.Plus />
              </span>
              <span className={s.iconbtn} title="More">
                <Icons.Dots />
              </span>
            </span>
          </button>
          {!collapsed[g.key] &&
            g.items.map((e) => (
              <Row key={e.id} e={e} selected={selectedId === e.id} onSelect={onSelect} />
            ))}
        </div>
      ))}

      {entries.length > 0 && (
        <div className={s.listFoot}>
          {entries.length} {entries.length === 1 ? "entry" : "entries"} · grouped by {group}
        </div>
      )}
    </div>
  );
}
