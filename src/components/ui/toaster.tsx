import { useToast } from "./use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  let reletiveTime = Date.now();

  let timeDiff = (date: number) => {
    const diff = Date.now() - date; // difference in milliseconds
    var minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
    if (minutes < 43200) return `${Math.floor(minutes / 1440)} day ago`;
    
    return Math.floor(diff / 60000); // convert to minutes
  };



  return (
    <ToastProvider >
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast  key={id} {...props}>
            <div className="toast-header">
              <strong className="me-auto">{title && <ToastTitle>{title}</ToastTitle>}</strong>
              <small>{timeDiff(reletiveTime)}</small>
              <ToastClose />
              {/* <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> */}
            </div>
            <div className="toast-body">
              {description && <ToastDescription>{description}</ToastDescription>}
              {action && (
                <div className="mt-2 pt-2 border-top">
                  {action}
                </div>
              )}
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
