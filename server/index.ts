import { createServer } from 'node:http'
import { readdir, stat, readFile } from 'node:fs/promises'
import { join, extname, resolve, basename, dirname } from 'node:path'
import { existsSync } from 'node:fs'

interface FileEntry {
  slug: string
  filename: string
  date: string | null
  title: string
  modifiedAt: string
}

const DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})-(.+)$/

function slugToTitle(slug: string): string {
  const match = slug.match(DATE_PREFIX_RE)
  const withoutDate = match ? match[2] : slug
  return withoutDate
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

async function scanDirectory(dir: string): Promise<FileEntry[]> {
  if (!existsSync(dir)) return []

  const entries = await readdir(dir)
  const files: FileEntry[] = []

  for (const filename of entries) {
    if (extname(filename) !== '.md') continue

    const slug = filename.replace(/\.md$/, '')
    const dateMatch = slug.match(DATE_PREFIX_RE)
    const date = dateMatch ? dateMatch[1] : null
    const fileStat = await stat(join(dir, filename))

    files.push({
      slug,
      filename,
      date,
      title: slugToTitle(slug),
      modifiedAt: fileStat.mtime.toISOString(),
    })
  }

  // Sort: date descending, then modifiedAt descending within same day
  files.sort((a, b) => {
    const dateA = a.date ?? '0000-00-00'
    const dateB = b.date ?? '0000-00-00'
    if (dateA !== dateB) return dateB.localeCompare(dateA)
    return b.modifiedAt.localeCompare(a.modifiedAt)
  })

  return files
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
  }
  return types[ext] || 'application/octet-stream'
}

export function startServer(options: {
  dir: string
  port: number
  staticDir?: string
}) {
  const { dir, port, staticDir } = options
  const plansDir = resolve(dir)
  // Derive project name: go up from plans dir to find the root project name
  // e.g. /Users/foo/ag/Agentify/docs/plans -> "Agentify"
  const projectName = basename(resolve(plansDir, '../..'))

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`)
    const pathname = url.pathname

    // CORS for dev
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET')

    try {
      // API: list files
      if (pathname === '/api/files' && req.method === 'GET') {
        const files = await scanDirectory(plansDir)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ files, projectName }))
        return
      }

      // API: get file content
      const fileMatch = pathname.match(/^\/api\/files\/(.+)$/)
      if (fileMatch && req.method === 'GET') {
        const slug = decodeURIComponent(fileMatch[1])
        const filename = `${slug}.md`
        const filepath = join(plansDir, filename)

        if (!existsSync(filepath)) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'File not found' }))
          return
        }

        const content = await readFile(filepath, 'utf-8')
        const dateMatch = slug.match(DATE_PREFIX_RE)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({
            slug,
            filename,
            date: dateMatch ? dateMatch[1] : null,
            content,
          })
        )
        return
      }

      // Static file serving (production)
      if (staticDir) {
        let filePath = join(staticDir, pathname === '/' ? 'index.html' : pathname)
        if (!existsSync(filePath)) {
          // SPA fallback
          filePath = join(staticDir, 'index.html')
        }
        const content = await readFile(filePath)
        const ext = extname(filePath)
        res.writeHead(200, { 'Content-Type': getMimeType(ext) })
        res.end(content)
        return
      }

      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    } catch (err) {
      console.error('Server error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal server error' }))
    }
  })

  server.listen(port, () => {
    console.log(`Plans viewer server running at http://localhost:${port}`)
    console.log(`Serving plans from: ${plansDir}`)
  })

  return server
}

// Direct execution (dev mode via tsx)
const args = process.argv.slice(2)
function getArg(name: string, defaultValue: string): string {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue
}

if (import.meta.url === `file://${process.argv[1]}` || args.length > 0) {
  const dir = getArg('dir', 'docs/plans')
  const port = parseInt(getArg('port', '3200'), 10)
  startServer({ dir, port })
}
