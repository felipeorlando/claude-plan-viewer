import { useState, useEffect, useMemo } from 'react'
import { fetchFiles, type FileEntry } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export interface DayGroup {
  date: string | null
  label: string
  files: FileEntry[]
}

export function usePlans() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [projectName, setProjectName] = useState('Plans')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFiles()
      .then((data) => {
        setFiles(data.files)
        setProjectName(data.projectName)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const groups = useMemo((): DayGroup[] => {
    const map = new Map<string, FileEntry[]>()

    for (const file of files) {
      const key = file.date ?? '__undated__'
      const existing = map.get(key)
      if (existing) {
        existing.push(file)
      } else {
        map.set(key, [file])
      }
    }

    return Array.from(map.entries()).map(([key, groupFiles]) => ({
      date: key === '__undated__' ? null : key,
      label: key === '__undated__' ? 'Undated' : formatDate(key),
      files: groupFiles,
    }))
  }, [files])

  return { files, groups, projectName, loading, error }
}
