export type MobileNoticeTone = "default" | "success" | "error" | "info" | "warning";

export function showMobileNotificationPage(input: {
  title: string;
  description?: string;
  tone?: MobileNoticeTone;
}) {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams({
    title: input.title,
    tone: input.tone || "default",
    from: `${window.location.pathname}${window.location.search}`,
  });

  if (input.description) params.set("description", input.description);

  const nextUrl = `/notification?${params.toString()}`;
  if (window.location.pathname === "/notification") {
    window.history.replaceState({}, "", nextUrl);
    return;
  }

  window.location.assign(nextUrl);
}
