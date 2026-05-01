import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--teal)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:     "border-transparent text-white",
        secondary:   "border-transparent",
        destructive: "border-transparent bg-red-600 text-white",
        outline:     "",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const variantStyles: React.CSSProperties =
    variant === "secondary"
      ? { backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }
      : variant === "outline"
      ? { borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }
      : variant === "destructive"
      ? {}
      : { backgroundColor: 'var(--teal)', color: '#fff' }

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyles, ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
