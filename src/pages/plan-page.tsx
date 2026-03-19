import { useCallback, useState } from 'react'
import { PlanContent } from '@/components/plan-content'
import { Toc } from '@/components/toc'
import { useToc } from '@/hooks/use-toc'

interface PlanPageProps {
  slug: string
}

export function PlanPage({ slug }: PlanPageProps) {
  const [content, setContent] = useState<string | null>(null)
  const tocItems = useToc(content)

  const handleContentLoaded = useCallback((md: string) => {
    setContent(md)
  }, [])

  return (
    <div className="flex">
      <div className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-6 py-10 lg:px-10">
          <PlanContent slug={slug} onContentLoaded={handleContentLoaded} />
        </div>
      </div>
      <div className="hidden xl:block shrink-0">
        <div className="sticky top-16 pt-10 pb-10 pr-6 pl-6">
          <Toc items={tocItems} />
        </div>
      </div>
    </div>
  )
}
