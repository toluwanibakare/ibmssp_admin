import React from 'react';

export function AppFooter({ className = '' }: { className?: string }) {
  return (
    <footer className={`border-t border-border bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 text-xs font-medium">
        <a 
          href="https://www.ibmssp.org.ng" 
          target="_blank" 
          rel="noreferrer" 
          className="text-primary hover:underline transition-all"
        >
          www.ibmssp.org.ng
        </a>
        <p className="text-muted-foreground/60">
          Built by <span className="text-foreground/80">TMB</span>
        </p>
      </div>
    </footer>
  );
}
