import * as React from "react"

import { cn } from "@/lib/utils.js"

const Textarea = React.forwardRef(({ className, autoComplete = "off", autoCorrect = "off", autoCapitalize = "off", spellCheck = false, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[14px] border border-input bg-transparent px-4 py-4 text-[16px] leading-[1.7] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f8a99] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none font-[Inter] tracking-[0.01em]",
        className
      )}
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      data-gramm="false"
      data-enable-grammarly="false"
      data-ms-editor="false"
      autoComplete={autoComplete}
      autoCorrect={autoCorrect}
      autoCapitalize={autoCapitalize}
      spellCheck={spellCheck}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
