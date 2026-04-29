import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-[#294038] bg-[#152019] px-3 py-1 text-sm text-[#e5f2ea] shadow-sm transition-colors",
          "placeholder:text-[#344d3f]",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0d9e75]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
