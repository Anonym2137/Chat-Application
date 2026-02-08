import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white hover:from-purple-500 hover:via-purple-400 hover:to-indigo-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:shadow-xl",
        destructive:
          "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
        outline:
          "border-2 border-purple-500/30 bg-transparent text-foreground hover:bg-purple-500/10 hover:border-purple-500/50 hover:text-purple-300",
        secondary:
          "bg-white/5 text-foreground border border-white/10 hover:bg-white/10 hover:border-white/20",
        ghost: "text-foreground hover:bg-white/5 hover:text-purple-300",
        link: "text-purple-400 underline-offset-4 hover:underline hover:text-purple-300",
        glow: "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:shadow-xl animate-pulse-glow",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
