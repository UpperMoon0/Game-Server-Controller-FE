import { invoke } from '@tauri-apps/api/tauri'
import type { FileInfo, FileListResult, FileExistsResult } from '../types/files'

// Generic API methods using Tauri BFF
const apiCall = {
  get: async (endpoint: string): Promise<unknown> => {
    return await invoke('api_get', { endpoint })
  },
  
  post: async (endpoint: string, body: unknown = {}): Promise<unknown> => {
    return await invoke('api_post', { endpoint, body })
  },
  
  put: async (endpoint: string, body: unknown = {}): Promise<unknown> => {
    return await invoke('api_put', { endpoint, body })
  },
  
  delete: async (endpoint: string): Promise<unknown> => {
    return await invoke('api_delete', { endpoint })
  }
}

// Response types
interface FileListResponse {
  success: boolean
  error?: string
  files: FileInfo[]
  current_path: string
}

interface FileOperationResponse {
  success: boolean
  error?: string
  message?: string
}

interface FileExistsResponse {
  success: boolean
  error?: string
  exists: boolean
  is_directory: boolean
}

// Files API
export const filesApi = {
  // List files in a directory
  listFiles: async (nodeId: string, path: string = '/', recursive: boolean = false): Promise<FileListResult> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files?path=${encodeURIComponent(path)}&recursive=${recursive}`
    const response = await apiCall.get(endpoint) as FileListResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to list files')
    }
    
    return {
      files: response.files || [],
      current_path: response.current_path || path
    }
  },

  // Create a directory
  createDirectory: async (nodeId: string, path: string): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/directory`
    const response = await apiCall.post(endpoint, { path }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create directory')
    }
  },

  // Create a file
  createFile: async (nodeId: string, path: string): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/file`
    const response = await apiCall.post(endpoint, { path }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create file')
    }
  },

  // Delete a file or directory
  deleteFile: async (nodeId: string, path: string, recursive: boolean = false): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files?path=${encodeURIComponent(path)}&recursive=${recursive}`
    const response = await apiCall.delete(endpoint) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete file')
    }
  },

  // Rename a file or directory
  renameFile: async (nodeId: string, oldPath: string, newPath: string): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/rename`
    const response = await apiCall.put(endpoint, { old_path: oldPath, new_path: newPath }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to rename file')
    }
  },

  // Move a file or directory
  moveFile: async (nodeId: string, sourcePath: string, destPath: string): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/move`
    const response = await apiCall.put(endpoint, { source_path: sourcePath, dest_path: destPath }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to move file')
    }
  },

  // Copy a file or directory
  copyFile: async (nodeId: string, sourcePath: string, destPath: string, recursive: boolean = false): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/copy`
    const response = await apiCall.put(endpoint, { source_path: sourcePath, dest_path: destPath, recursive }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to copy file')
    }
  },

  // Read file content
  readFile: async (nodeId: string, path: string): Promise<{ content: string; totalSize: number }> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/read?path=${encodeURIComponent(path)}`
    const response = await apiCall.get(endpoint) as { success: boolean; error?: string; content: string; total_size: number }
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to read file')
    }
    
    return {
      content: response.content,
      totalSize: response.total_size
    }
  },

  // Write file content
  writeFile: async (nodeId: string, path: string, content: string, append: boolean = false): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/write`
    const response = await apiCall.post(endpoint, { path, content, append }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to write file')
    }
  },

  // Check if file exists
  fileExists: async (nodeId: string, path: string): Promise<FileExistsResult> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/exists?path=${encodeURIComponent(path)}`
    const response = await apiCall.get(endpoint) as FileExistsResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to check file existence')
    }
    
    return {
      exists: response.exists,
      is_directory: response.is_directory
    }
  },

  // Create directory with parents
  mkdir: async (nodeId: string, path: string, parents: boolean = true): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/mkdir`
    const response = await apiCall.post(endpoint, { path, parents }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to create directory')
    }
  },

  // Zip files
  zipFiles: async (nodeId: string, sourcePath: string, destPath: string, recursive: boolean = true): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/zip`
    const response = await apiCall.post(endpoint, { source_path: sourcePath, dest_path: destPath, recursive }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to zip files')
    }
  },

  // Unzip files
  unzipFiles: async (nodeId: string, sourcePath: string, destPath: string): Promise<void> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/unzip`
    const response = await apiCall.post(endpoint, { source_path: sourcePath, dest_path: destPath }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to unzip files')
    }
  },

  // Download folder as zip
  downloadFolder: async (nodeId: string, path: string): Promise<Blob> => {
    const endpoint = `/api/v1/nodes/${nodeId}/files/download?path=${encodeURIComponent(path)}`
    // For download, we need to handle the response as a blob
    const response = await invoke('api_download', { endpoint }) as { data: number[] }
    return new Blob(new Uint8Array(response.data), { type: 'application/zip' })
  },

  // Upload folder (as zip)
  uploadFolder: async (nodeId: string, destPath: string, file: File): Promise<void> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const endpoint = `/api/v1/nodes/${nodeId}/files/upload?dest_path=${encodeURIComponent(destPath)}`
    const response = await invoke('api_upload', { endpoint, formData }) as FileOperationResponse
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to upload folder')
    }
  }
}

export default filesApi
