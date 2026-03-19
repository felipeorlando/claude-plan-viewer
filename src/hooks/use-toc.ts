import { useState, useEffect } from 'react'

export interface TocItem {
  id: string
  text: string
  level: number
}

export function useToc(content: string | null) {
  const [items, setItems] = useState<TocItem[]>([])

  useEffect(() => {
    if (!content) {
      setItems([])
      return
    }

    const headings: TocItem[] = []
    const lines = content.split('\n')

    for (const line of lines) {
      const match = line.match(/^#{2}\s+(.+)$/)
      if (match) {
        const level = 1
        const text = match[1].replace(/[`*_~]/g, '').trim()
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        headings.push({ id, text, level })
      }
    }

    setItems(headings)
  }, [content])

  return items
}
