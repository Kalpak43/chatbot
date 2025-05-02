import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
<textarea
  data-slot="textarea"
  className={cn(
    "border-transparent placeholder:text-muted-foreground focus-visible:border-input focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/0 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  )}
  style={{
    boxShadow: "inset 4px 4px 8px rgba(0, 0, 0, 0.22), inset -4px -4px 8px #e3e3e310"
  }}
  {...props}
/>
  )
}

export { Textarea }
