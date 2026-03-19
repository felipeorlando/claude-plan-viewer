import { useEffect, useRef, useState } from 'react'
import { Command } from 'cmdk'
import { useLocation } from 'wouter'
import { FileTextIcon, SearchIcon } from 'lucide-react'
import type { FileEntry } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface CommandMenuProps {
  files: FileEntry[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ files, open, onOpenChange }: CommandMenuProps) {
  const [search, setSearch] = useState('')
  const [, navigate] = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onOpenChange])

  useEffect(() => {
    if (open) {
      setSearch('')
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        if (listRef.current) listRef.current.scrollTop = 0
      })
    }
  }, [open])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0
  }, [search])

  function selectFile(slug: string) {
    navigate(`/${slug}`)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
          loop
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onOpenChange(false)
            }
          }}
        >
          <div className="flex items-center border-b border-border px-4">
            <SearchIcon className="size-4 text-muted-foreground shrink-0 mr-3" />
            <Command.Input
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              placeholder="Search plans..."
              className="flex h-12 w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            <kbd className="ml-2 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>
          <Command.List
            ref={listRef}
            className="max-h-[320px] overflow-y-auto p-2"
          >
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              No plans found.
            </Command.Empty>
            {files.map((file) => (
              <Command.Item
                key={file.slug}
                value={`${file.title} ${file.filename}`}
                onSelect={() => selectFile(file.slug)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer data-[selected=true]:bg-accent"
              >
                <FileTextIcon className="size-3.5 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-foreground">
                    {file.title}
                  </span>
                  {file.date && (
                    <span className="block text-[12px] text-muted-foreground">
                      {formatDate(file.date)}
                    </span>
                  )}
                </div>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
