import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle, AlertCircle, TriangleAlert, Info, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group !z-[99999]"
      position="center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg flex items-center gap-3 p-3 rounded-lg",
          description: "group-[.toast]:text-muted-foreground text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-green-500/30 group-[.toast]:bg-green-50 group-[.toast]:text-green-800",
          error: "group-[.toast]:border-red-500/30 group-[.toast]:bg-red-50 group-[.toast]:text-red-800",
          warning: "group-[.toast]:border-orange-500/30 group-[.toast]:bg-orange-50 group-[.toast]:text-orange-800",
          info: "group-[.toast]:border-blue-500/30 group-[.toast]:bg-blue-50 group-[.toast]:text-blue-800",
          closeButton: "group-[.toast]:absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
