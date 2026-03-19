import { useState, useEffect, type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import { LinkIcon } from 'lucide-react'
import { fetchFileContent, type FileContent } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

function HeadingWithAnchor({
  Tag,
  id,
  children,
  ...props
}: ComponentPropsWithoutRef<'h1'> & { Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }) {
  return (
    <Tag id={id} {...props}>
      {id && (
        <a href={`#${id}`} className="heading-anchor" aria-hidden="true">
          <LinkIcon className="size-3.5" />
        </a>
      )}
      {children}
    </Tag>
  )
}

const headingComponents = Object.fromEntries(
  (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const).map((tag) => [
    tag,
    (props: ComponentPropsWithoutRef<'h1'>) => <HeadingWithAnchor Tag={tag} {...props} />,
  ])
)

interface PlanContentProps {
  slug: string
  onContentLoaded?: (content: string) => void
}

export function PlanContent({ slug, onContentLoaded }: PlanContentProps) {
  const [file, setFile] = useState<FileContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchFileContent(slug)
      .then((data) => {
        setFile(data)
        onContentLoaded?.(data.content)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, onContentLoaded])

  if (loading) {
    return (
      <div className="space-y-4 py-2">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-8 h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">{error ?? 'File not found'}</p>
      </div>
    )
  }

  return (
    <div>
      {file.date && (
        <p className="mb-1 text-sm text-muted-foreground">
          {formatDate(file.date)}
        </p>
      )}
      <article className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
          components={headingComponents}
        >
          {file.content}
        </ReactMarkdown>
      </article>
    </div>
  )
}
