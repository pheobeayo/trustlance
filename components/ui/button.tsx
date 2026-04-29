import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-[#0d9e75] text-white shadow hover:bg-[#14c490]",
        destructive: "bg-red-600 text-white shadow hover:bg-red-500",
        outline:     "border border-[#294038] bg-transparent text-[#95b8a5] hover:border-[#0a7a5a] hover:text-[#14c490]",
        secondary:   "bg-[#152019] text-[#95b8a5] hover:bg-[#1b2b21]",
        ghost:       "hover:bg-[#152019] hover:text-[#e5f2ea] text-[#567a68]",
        link:        "text-[#14c490] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-md px-6 text-base",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
