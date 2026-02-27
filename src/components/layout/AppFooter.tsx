import React from 'react';

export function AppFooter({ className = '' }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5 text-xs">
        <p className="text-muted-foreground text-center sm:text-left">
          © {year} IBMSSP ADMIN. All rights reserved.
        </p>
        <a
          href="https://tmb.it.com"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
        >
          Built by TMB
        </a>
      </div>
    </footer>
  );
}

