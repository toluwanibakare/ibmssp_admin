import { Category } from '@/lib/mock-data';

export function getCategoryBadgeStyle(category: Category): string {
  const styles: Record<Category, string> = {
    Student: 'bg-[hsl(var(--badge-std-bg))] text-[hsl(var(--badge-std))]',
    Organization: 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]',
    Graduate: 'bg-[hsl(var(--badge-grd-bg))] text-[hsl(var(--badge-grd))]',
    'Trained Auditor': 'bg-[hsl(var(--badge-ind-bg))] text-[hsl(var(--badge-ind))]',
    Consultant: 'bg-[hsl(var(--badge-con-bg))] text-[hsl(var(--badge-con))]',
  };
  return styles[category];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
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

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getCategoryBadgeStyle(category)}`}>
      {category}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${status === 'active' ? 'bg-[hsl(var(--badge-org-bg))] text-[hsl(var(--badge-org))]' : 'bg-muted text-muted-foreground'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-[hsl(var(--badge-org))]' : 'bg-muted-foreground'}`} />
      {status}
    </span>
  );
}
