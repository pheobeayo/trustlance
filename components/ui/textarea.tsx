import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors",
        "text-[var(--text-primary)] placeholder:text-[var(--text-faint)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--teal)]",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-strong)' }}
      {...props} />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
