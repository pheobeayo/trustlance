import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors",
        "text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--teal)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-strong)' }}
      {...props} />
  )
)
Input.displayName = "Input"

export { Input }
