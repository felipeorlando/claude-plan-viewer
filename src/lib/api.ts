export interface FileEntry {
  slug: string
  filename: string
  date: string | null
  title: string
  modifiedAt: string
}

export interface FileContent {
  slug: string
  filename: string
  date: string | null
  content: string
}

export interface FilesResponse {
  files: FileEntry[]
  projectName: string
}

export async function fetchFiles(): Promise<FilesResponse> {
  const res = await fetch('/api/files')
  if (!res.ok) throw new Error('Failed to fetch files')
  const data = await res.json()
  return { files: data.files, projectName: data.projectName ?? 'Plans' }
}

export async function fetchFileContent(slug: string): Promise<FileContent> {
  const res = await fetch(`/api/files/${encodeURIComponent(slug)}`)
  if (!res.ok) throw new Error('Failed to fetch file content')
  return res.json()
}
