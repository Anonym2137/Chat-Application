import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30",
        secondary: "bg-white/10 text-white/90 border border-white/10",
        destructive: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30",
        outline: "border border-purple-500/30 text-purple-400 bg-transparent",
        success: "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30",
        glow: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40 animate-pulse"
      },
      size: {
        default: "min-w-[1.25rem] h-5 px-2",
        sm: "min-w-[1rem] h-4 px-1.5 text-[10px]",
        lg: "min-w-[1.5rem] h-6 px-3"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
)

function Badge({ className, variant, size, ...props }) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
