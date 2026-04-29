import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-[#294038] bg-[#152019] px-3 py-2 text-sm text-[#e5f2ea] shadow-sm",
          "placeholder:text-[#344d3f]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d9e75]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
