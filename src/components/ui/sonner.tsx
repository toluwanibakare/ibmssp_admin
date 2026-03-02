import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { showMobileNotificationPage } from "@/lib/mobile-notify";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      mobileOffset={{ top: 16 }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast w-[calc(100vw-32px)] max-w-[420px] mx-auto break-words group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth < 768;

const mobileNotify = (message: unknown, description?: unknown, tone?: "success" | "error" | "info" | "warning" | "default") => {
  const titleText = typeof message === "string" ? message : "Notification";
  const descText = typeof description === "string" ? description : undefined;
  showMobileNotificationPage({ title: titleText, description: descText, tone });
};

type SonnerToastFn = typeof sonnerToast;
const toast = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileNotify(message, data?.description, "default");
    return "";
  }
  return sonnerToast(message as any, data as any);
}) as SonnerToastFn;

toast.success = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileNotify(message, data?.description, "success");
    return "";
  }
  return sonnerToast.success(message as any, data as any);
}) as SonnerToastFn["success"];

toast.error = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileNotify(message, data?.description, "error");
    return "";
  }
  return sonnerToast.error(message as any, data as any);
}) as SonnerToastFn["error"];

toast.info = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileNotify(message, data?.description, "info");
    return "";
  }
  return sonnerToast.info(message as any, data as any);
}) as SonnerToastFn["info"];

toast.warning = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileNotify(message, data?.description, "warning");
    return "";
  }
  return sonnerToast.warning(message as any, data as any);
}) as SonnerToastFn["warning"];

export { Toaster, toast };
