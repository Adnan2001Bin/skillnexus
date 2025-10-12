"use client";

import { toast as sonner } from "sonner";

type ToastArgs = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning";
  duration?: number;
};

export function useToast() {
  return {
    toast: (args: ToastArgs) => {
      const { title, description, variant, duration } = args;
      // map variants into sonner styles (optional)
      const opts: any = { duration };
      if (variant === "destructive") opts.style = { borderLeft: "4px solid #ef4444" };
      if (variant === "success") opts.style = { borderLeft: "4px solid #10b981" };
      if (variant === "warning") opts.style = { borderLeft: "4px solid #f59e0b" };

      sonner(title || description || "", {
        description: title ? description : undefined,
        ...opts,
      });
    },
  };
}
