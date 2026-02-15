// File types for the file explorer

export interface FileInfo {
  name: string
  path: string
  is_directory: boolean
  size: number
  modified_time: number
  created_time: number
  permissions: string
}

export interface FileListResult {
  files: FileInfo[]
  current_path: string
}

export interface FileReadResult {
  content: string // Base64 encoded
  total_size: number
}

export interface FileExistsResult {
  exists: boolean
  is_directory: boolean
}

export interface ClipboardItem {
  path: string
  operation: 'copy' | 'cut'
}

export interface FileOperationState {
  clipboard: ClipboardItem | null
  selectedFiles: string[]
  currentPath: string
}
