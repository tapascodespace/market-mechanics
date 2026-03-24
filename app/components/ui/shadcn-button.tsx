import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent-glow-strong)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--text)] text-[var(--bg)] hover:opacity-90 border-2 border-transparent",
        destructive: "bg-[var(--red)] text-white hover:brightness-110 border-2 border-transparent",
        outline: "border-2 border-[var(--text)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface2)]",
        secondary: "bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface3)] border-2 border-transparent",
        ghost: "hover:bg-[var(--surface2)] text-[var(--text)] border-2 border-transparent",
        link: "text-[var(--accent)] underline-offset-4 hover:underline border-2 border-transparent",
        green: "bg-[var(--green)] text-white hover:brightness-110 border-2 border-transparent",
        red: "bg-[var(--red)] text-white hover:brightness-110 border-2 border-transparent",
        accent: "bg-[var(--accent)] text-white hover:brightness-110 border-2 border-transparent",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-3 py-1.5",
        lg: "h-12 px-6 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ShadcnButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const ShadcnButton = React.forwardRef<HTMLButtonElement, ShadcnButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
ShadcnButton.displayName = "ShadcnButton"

export { ShadcnButton, buttonVariants }
