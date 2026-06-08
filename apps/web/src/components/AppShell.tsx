import Link from "next/link";
import type { ReactNode } from "react";
import { InstagramCanvaLogo } from "@/components/InstagramCanvaLogo";

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AppShell({ children, title, subtitle, actions }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="landing-aurora app-shell__aurora" aria-hidden />
      <div className="landing-grain" aria-hidden />
      <header className="app-shell__header">
        <div className="mic-container app-shell__header-inner">
          <Link href="/dashboard" className="landing-logo">
            <InstagramCanvaLogo size={28} className="landing-logo__mark" />
            Instagram Canva
          </Link>
          {actions}
        </div>
      </header>
      <main className="mic-container app-shell__main">
        {(title || subtitle) && (
          <div className="app-shell__hero">
            {title && <h1 className="app-shell__title">{title}</h1>}
            {subtitle && <p className="app-shell__subtitle">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
