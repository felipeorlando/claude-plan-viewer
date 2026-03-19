import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { TocItem } from '@/hooks/use-toc'

interface TocProps {
  items: TocItem[]
}

export function Toc({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="w-[200px]">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        On this page
      </p>
      <nav className="flex flex-col">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              'block py-1 text-[13px] leading-snug transition-colors',
              item.level === 1 && 'pl-0',
              item.level === 2 && 'pl-3',
              activeId === item.id
                ? 'text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  )
}
