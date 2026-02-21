import React from 'react';

export type Category = 'student' | 'graduate' | 'individual' | 'organization';

export function getCategoryBadgeStyle(category: string): string {
  const styles: Record<string, string> = {
    student: 'bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]',
    organization: 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]',
    graduate: 'bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]',
    individual: 'bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]',
  };
  return styles[category?.toLowerCase()] || 'bg-muted text-muted-foreground';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    student: 'Student',
    graduate: 'Graduate',
    individual: 'Individual',
    organization: 'Organization',
  };
  return labels[category?.toLowerCase()] || category;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryBadgeStyle(category)}`}>
      {getCategoryLabel(category)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'approved';
  const isPending = status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${isApproved ? 'bg-success/10 text-success' :
        isPending ? 'bg-yellow-500/10 text-yellow-600' :
          'bg-destructive/10 text-destructive'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-success' : isPending ? 'bg-yellow-500' : 'bg-destructive'}`} />
      {status}
    </span>
  );
}
