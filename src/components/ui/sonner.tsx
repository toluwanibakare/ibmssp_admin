import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

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

const mobileAlert = (message: unknown, description?: unknown) => {
  const titleText = typeof message === "string" ? message : "Notification";
  const descText = typeof description === "string" ? description : "";
  window.alert(descText ? `${titleText}\n${descText}` : titleText);
};

type SonnerToastFn = typeof sonnerToast;
const toast = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileAlert(message, data?.description);
    return "";
  }
  return sonnerToast(message as any, data as any);
}) as SonnerToastFn;

toast.success = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileAlert(message, data?.description);
    return "";
  }
  return sonnerToast.success(message as any, data as any);
}) as SonnerToastFn["success"];

toast.error = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileAlert(message, data?.description);
    return "";
  }
  return sonnerToast.error(message as any, data as any);
}) as SonnerToastFn["error"];

toast.info = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileAlert(message, data?.description);
    return "";
  }
  return sonnerToast.info(message as any, data as any);
}) as SonnerToastFn["info"];

toast.warning = ((message: unknown, data?: { description?: unknown }) => {
  if (isMobileViewport()) {
    mobileAlert(message, data?.description);
    return "";
  }
  return sonnerToast.warning(message as any, data as any);
}) as SonnerToastFn["warning"];

export { Toaster, toast };
