import { FileTextIcon } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center max-w-xs">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
          <FileTextIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-medium text-foreground">No document selected</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Choose a plan from the sidebar to start reading
        </p>
      </div>
    </div>
  )
}
