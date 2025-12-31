import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toast-container position-fixed top-0 end-0 p-3"
      toastOptions={{
        classNames: {
          toast: "toast bg-body text-body border shadow",
          description: "text-muted",
          actionButton: "btn btn-primary btn-sm",
          cancelButton: "btn btn-secondary btn-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
