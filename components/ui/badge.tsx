import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0d9e75] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-[#0d9e75] text-white",
        secondary:   "border-transparent bg-[#152019] text-[#95b8a5]",
        destructive: "border-transparent bg-red-600 text-white",
        outline:     "text-[#95b8a5] border-[#294038]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
