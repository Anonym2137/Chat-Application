import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@utils"

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 backdrop-blur-sm animate-fade-in [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-white/10 text-foreground [&>svg]:text-foreground",
        destructive:
          "bg-red-500/10 border-red-500/30 text-red-200 [&>svg]:text-red-400",
        success:
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-200 [&>svg]:text-emerald-400",
        warning:
          "bg-amber-500/10 border-amber-500/30 text-amber-200 [&>svg]:text-amber-400",
        info:
          "bg-blue-500/10 border-blue-500/30 text-blue-200 [&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
