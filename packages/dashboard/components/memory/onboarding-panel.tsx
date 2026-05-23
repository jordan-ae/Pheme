"use client";

import { useState } from "react";
import Link from "next/link";
import s from "./dashboard.module.css";

/* First-run onboarding, rendered inline by the dashboard when the workspace has
   no memory yet (in place of the "No memory yet" empty state). It walks a new
   user through connecting the system — install the GitHub App, enroll a repo,
   mint a key, then wire up their agents. Steps 1–3 reflect live per-user status
   computed server-side in app/(app)/page.tsx; step 4 (agent config) can't be
   detected from the server, so it's always shown as the closing action. */

export interface OnboardingStatus {
  hasInstall: boolean;
  hasProject: boolean;
  hasKey: boolean;
  serverUrl: string;
}

type StepState = "done" | "current" | "todo";

function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function OnboardingPanel({ status }: { status: OnboardingStatus }) {
  const { hasInstall, hasProject, hasKey, serverUrl } = status;
  const [copied, setCopied] = useState(false);

  const flags = [hasInstall, hasProject, hasKey];
  const doneCount = flags.filter(Boolean).length;
  const allConnected = doneCount === 3;
  // The first incomplete step is the "current" one, so exactly one node is ringed.
  const firstTodo = flags.findIndex((f) => !f);

  const cmd = `export MEMORY_SERVER_URL="${serverUrl}"
export MEMORY_API_KEY="<paste your key from step 3>"
npx @pheme/memory-cli onboard`;

  async function copyCmd() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const stateFor = (idx: number): StepState =>
    flags[idx] ? "done" : idx === firstTodo ? "current" : "todo";

  return (
    <div className={s.onboard}>
      <div className={s.onboardInner}>
        <header className={s.onboardHead}>
          <div className={s.onboardKicker}>Get started</div>
          <h2 className={s.onboardTitle}>
            {allConnected ? "You're connected — one last step" : "Connect Pheme to your codebase"}
          </h2>
          <p className={s.onboardLede}>
            {allConnected
              ? "Your workspace is wired up. Run the agent setup on each machine and the decisions, constraints, and trade-offs your agents log will stream into this feed."
              : "Pheme captures the decisions your agents make and feeds them back as project memory. Three quick steps to start collecting — then point your agents at it."}
          </p>
          <div className={s.onboardProgress}>{doneCount} of 3 connected</div>
        </header>

        <ol className={s.onboardSteps}>
          <Step
            n={1}
            state={stateFor(0)}
            title="Connect GitHub"
            desc="Install the Pheme GitHub App and choose which repositories it can read. You control that access from GitHub at any time."
          >
            {hasInstall ? (
              <>
                <span className={s.doneTag}>
                  <Check /> Installed
                </span>
                <Link href="/connect" className={`${s.obtn} ${s.obtnGhost}`}>
                  Manage access
                </Link>
              </>
            ) : (
              <Link href="/connect" className={`${s.obtn} ${s.obtnPrimary}`}>
                Install the GitHub App
              </Link>
            )}
          </Step>

          <Step
            n={2}
            state={stateFor(1)}
            title="Enroll a project"
            desc="Pick a connected repository to start collecting its memory. Each enrolled repo gets its own scoped, branch-aware history."
          >
            {hasProject ? (
              <>
                <span className={s.doneTag}>
                  <Check /> Project enrolled
                </span>
                <Link href="/projects" className={`${s.obtn} ${s.obtnGhost}`}>
                  Manage projects
                </Link>
              </>
            ) : (
              <Link
                href="/projects"
                className={`${s.obtn} ${hasInstall ? s.obtnPrimary : s.obtnGhost}`}
              >
                Choose a repository
              </Link>
            )}
          </Step>

          <Step
            n={3}
            state={stateFor(2)}
            title="Create your API key"
            desc="Mint a personal key so your agents can read and write memory. Every entry written with it is attributed to you."
          >
            {hasKey ? (
              <>
                <span className={s.doneTag}>
                  <Check /> Key created
                </span>
                <Link href="/keys" className={`${s.obtn} ${s.obtnGhost}`}>
                  Manage keys
                </Link>
              </>
            ) : (
              <Link
                href="/keys"
                className={`${s.obtn} ${hasProject ? s.obtnPrimary : s.obtnGhost}`}
              >
                Generate a key
              </Link>
            )}
          </Step>

          <Step
            n={4}
            state={allConnected ? "current" : "todo"}
            title="Connect your agents"
            desc="On each machine, point your agents at the memory server and wire up the MCP server. Run once, then restart your agents."
          >
            <div className={s.cmd}>
              <div className={s.cmdHead}>
                terminal
                <button type="button" className={s.cmdCopy} onClick={copyCmd}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
              </div>
              <pre className={s.cmdBody}>{cmd}</pre>
            </div>
            <p className={s.stepDesc} style={{ marginTop: 10 }}>
              This configures Claude Code, Cursor, Codex, OpenCode, and Antigravity. In each repo you
              work in, run <span className={s.codeInline}>npx @pheme/memory-cli init</span> (or enroll
              it above) so agents there receive scoped project memory.
            </p>
          </Step>
        </ol>
      </div>
    </div>
  );
}

function Step({
  n,
  state,
  title,
  desc,
  children,
}: {
  n: number;
  state: StepState;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  const cls = `${s.step} ${state === "done" ? s.done : state === "current" ? s.current : ""}`;
  return (
    <li className={cls}>
      <div className={s.node}>{state === "done" ? <Check /> : n}</div>
      <div className={s.stepBody}>
        <div className={s.stepTitle}>{title}</div>
        <p className={s.stepDesc}>{desc}</p>
        <div className={s.stepActions}>{children}</div>
      </div>
    </li>
  );
}
