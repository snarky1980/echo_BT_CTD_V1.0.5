import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/lib/utils.js"

const ScrollArea = React.forwardRef(({
  className,
  children,
  viewportClassName,
  viewportRef,
  onViewportScroll,
  ...props
}, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      ref={viewportRef}
      className={cn("h-full w-full rounded-[inherit]", viewportClassName)}
      onScroll={onViewportScroll}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    data-slot="scroll-area-scrollbar"
    className={cn(
      "flex touch-none select-none transition-all duration-200",
      orientation === "vertical" &&
        "h-full w-1.5 border-l border-l-transparent p-px",
      orientation === "horizontal" &&
        "h-1.5 flex-col border-t border-t-transparent p-px",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      data-slot="scroll-area-thumb"
      className="relative flex-1 rounded-full bg-slate-300/60 hover:bg-slate-400/70 transition-colors" 
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
