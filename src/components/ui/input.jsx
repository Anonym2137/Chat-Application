import * as React from "react"
import { cn } from "@utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-foreground ring-offset-background transition-all duration-200",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
      "placeholder:text-muted-foreground/60",
      "hover:border-white/20 hover:bg-white/[0.07]",
      "focus-visible:outline-none focus-visible:border-purple-500/50 focus-visible:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:ring-offset-0",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"

export { Input }
