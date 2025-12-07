import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import 'bootstrap/dist/css/bootstrap.min.css';

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "btn d-inline-flex align-items-center justify-center rounded text-sm fw-medium transition bg-transparent border-0 disabled-opacity-50",
  {
    variants: {
      variant: {
        default: "btn-light",
        outline: "btn-outline-primary",
      },
      size: {
        default: "btn-sm",
        sm: "btn-xs",
        lg: "btn-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
