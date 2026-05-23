/* Console pages (Projects launchpad, Connect, API keys, per-project memory) render
   into the shared app shell from the parent (app) layout — they get the same dense
   rail as the home dashboard. This layout only provides the scrollable, centered
   content column. The session is already guarded by the parent. */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="console-main">
      <div className="console-inner">{children}</div>
    </div>
  );
}
