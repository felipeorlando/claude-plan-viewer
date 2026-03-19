#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { createServer } from 'node:http'
import { readdir, stat, readFile } from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Parse CLI args
const args = process.argv.slice(2)
function getArg(name, defaultValue) {
  const idx = args.indexOf(`--${name}`)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultValue
}
const hasFlag = (name) => args.includes(`--${name}`)

const dir = resolve(getArg('dir', 'docs/plans'))
const port = parseInt(getArg('port', '3200'), 10)
const noOpen = hasFlag('no-open')

if (!existsSync(dir)) {
  console.error(`Error: Directory not found: ${dir}`)
  console.error(`Usage: claude-plans-viewer --dir <path-to-plans>`)
  process.exit(1)
}

const DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})-(.+)$/

function slugToTitle(slug) {
  const match = slug.match(DATE_PREFIX_RE)
  const withoutDate = match ? match[2] : slug
  return withoutDate
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function getMimeType(ext) {
  const types = {
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

async function scanDirectory(plansDir) {
  const entries = await readdir(plansDir)
  const files = []

  for (const filename of entries) {
    if (!filename.endsWith('.md')) continue
    const slug = filename.replace(/\.md$/, '')
    const dateMatch = slug.match(DATE_PREFIX_RE)
    const fileStat = await stat(join(plansDir, filename))
    files.push({
      slug,
      filename,
      date: dateMatch ? dateMatch[1] : null,
      title: slugToTitle(slug),
      modifiedAt: fileStat.mtime.toISOString(),
    })
  }

  files.sort((a, b) => {
    const dateA = a.date ?? '0000-00-00'
    const dateB = b.date ?? '0000-00-00'
    if (dateA !== dateB) return dateB.localeCompare(dateA)
    return b.modifiedAt.localeCompare(a.modifiedAt)
  })

  return files
}

// Resolve static assets directory
const staticDir = join(__dirname, '..', 'dist', 'client')
if (!existsSync(staticDir)) {
  console.error('Error: Built assets not found. Run `npm run build` first.')
  process.exit(1)
}

const { extname: getExt } = await import('node:path')

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${port}`)
  const pathname = url.pathname

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  try {
    if (pathname === '/api/files' && req.method === 'GET') {
      const files = await scanDirectory(dir)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ files }))
      return
    }

    const fileMatch = pathname.match(/^\/api\/files\/(.+)$/)
    if (fileMatch && req.method === 'GET') {
      const slug = decodeURIComponent(fileMatch[1])
      const filename = `${slug}.md`
      const filepath = join(dir, filename)

      if (!existsSync(filepath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'File not found' }))
        return
      }

      const content = await readFile(filepath, 'utf-8')
      const dateMatch = slug.match(DATE_PREFIX_RE)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        slug,
        filename,
        date: dateMatch ? dateMatch[1] : null,
        content,
      }))
      return
    }

    // Static SPA serving
    let filePath = join(staticDir, pathname === '/' ? 'index.html' : pathname)
    if (!existsSync(filePath)) {
      filePath = join(staticDir, 'index.html')
    }
    const content = await readFile(filePath)
    const ext = getExt(filePath)
    res.writeHead(200, { 'Content-Type': getMimeType(ext) })
    res.end(content)
  } catch (err) {
    console.error('Server error:', err)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Internal server error' }))
  }
})

server.listen(port, async () => {
  const url = `http://localhost:${port}`
  console.log(`\n  Claude Plans Viewer`)
  console.log(`  Serving plans from: ${dir}`)
  console.log(`  Running at: ${url}\n`)

  if (!noOpen) {
    try {
      const open = (await import('open')).default
      await open(url)
    } catch {
      console.log(`  Open ${url} in your browser`)
    }
  }
})
