import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { filesApi } from '../../services/filesApi'
import { toast } from '../../store/toast/toastStore'
import type { FileInfo, ClipboardItem } from '../../types/files'
import type { Node } from '../../types/api'
import { useNodesStore } from '../../store/nodes/nodesSlice'

// File Explorer Component
export const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { nodes, fetchNodes } = useNodesStore()
  
  const [node, setNode] = useState<Node | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [renameItem, setRenameItem] = useState<FileInfo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Load node info
  useEffect(() => {
    if (nodes.length === 0) {
      fetchNodes()
    }
  }, [fetchNodes, nodes.length])

  useEffect(() => {
    if (id && nodes.length > 0) {
      const foundNode = nodes.find(n => n.id === id)
      if (foundNode) {
        setNode(foundNode)
      } else {
        toast.error('Node not found')
        navigate('/nodes')
      }
    }
  }, [id, nodes, navigate])

  // Load files
  const loadFiles = useCallback(async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const result = await filesApi.listFiles(id, currentPath)
      setFiles(result.files)
    } catch (error) {
      toast.error(`Failed to load files: ${error}`)
    } finally {
      setLoading(false)
    }
  }, [id, currentPath])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  // Navigation
  const navigateToFolder = (folder: string) => {
    const newPath = currentPath === '/' ? `/${folder}` : `${currentPath}/${folder}`
    setCurrentPath(newPath)
    setSelectedFiles([])
  }

  const navigateUp = () => {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'))
    setSelectedFiles([])
  }

  const navigateToPath = (path: string) => {
    setCurrentPath(path)
    setSelectedFiles([])
  }

  // Selection
  const toggleFileSelection = (file: FileInfo) => {
    setSelectedFiles(prev => 
      prev.includes(file.path)
        ? prev.filter(p => p !== file.path)
        : [...prev, file.path]
    )
  }

  const selectAll = () => {
    setSelectedFiles(files.map(f => f.path))
  }

  const clearSelection = () => {
    setSelectedFiles([])
  }

  // File operations
  const handleCreateFolder = async () => {
    if (!id || !newItemName.trim()) return
    
    const path = currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`
    
    try {
      await filesApi.createDirectory(id, path)
      toast.success('Folder created successfully')
      setShowNewFolderDialog(false)
      setNewItemName('')
      loadFiles()
    } catch (error) {
      toast.error(`Failed to create folder: ${error}`)
    }
  }

  const handleCreateFile = async () => {
    if (!id || !newItemName.trim()) return
    
    const path = currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`
    
    try {
      await filesApi.createFile(id, path)
      toast.success('File created successfully')
      setShowNewFileDialog(false)
      setNewItemName('')
      loadFiles()
    } catch (error) {
      toast.error(`Failed to create file: ${error}`)
    }
  }

  const handleDelete = async (file?: FileInfo) => {
    if (!id) return
    
    const filesToDelete = file ? [file.path] : selectedFiles
    if (filesToDelete.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${filesToDelete.length} item(s)?`)) return
    
    try {
      await Promise.all(filesToDelete.map(path => 
        filesApi.deleteFile(id, path, true)
      ))
      toast.success('Deleted successfully')
      setSelectedFiles([])
      loadFiles()
    } catch (error) {
      toast.error(`Failed to delete: ${error}`)
    }
  }

  const handleRename = async () => {
    if (!id || !renameItem || !newItemName.trim()) return
    
    const oldPath = renameItem.path
    const parentPath = oldPath.substring(0, oldPath.lastIndexOf('/'))
    const newPath = parentPath ? `${parentPath}/${newItemName}` : `/${newItemName}`
    
    try {
      await filesApi.renameFile(id, oldPath, newPath)
      toast.success('Renamed successfully')
      setShowRenameDialog(false)
      setRenameItem(null)
      setNewItemName('')
      loadFiles()
    } catch (error) {
      toast.error(`Failed to rename: ${error}`)
    }
  }

  // Clipboard operations
  const handleCopy = () => {
    if (selectedFiles.length === 0) return
    setClipboard({ path: selectedFiles[0], operation: 'copy' })
    toast.info('Copied to clipboard')
  }

  const handleCut = () => {
    if (selectedFiles.length === 0) return
    setClipboard({ path: selectedFiles[0], operation: 'cut' })
    toast.info('Cut to clipboard')
  }

  const handlePaste = async () => {
    if (!id || !clipboard) return
    
    const sourcePath = clipboard.path
    const fileName = sourcePath.split('/').pop() || ''
    const destPath = currentPath === '/' ? `/${fileName}` : `${currentPath}/${fileName}`
    
    try {
      if (clipboard.operation === 'copy') {
        await filesApi.copyFile(id, sourcePath, destPath, true)
        toast.success('Copied successfully')
      } else {
        await filesApi.moveFile(id, sourcePath, destPath)
        toast.success('Moved successfully')
        setClipboard(null)
      }
      loadFiles()
    } catch (error) {
      toast.error(`Failed to paste: ${error}`)
    }
  }

  // Upload/Download
  const handleUploadFolder = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !id) return
    
    try {
      setUploading(true)
      await filesApi.uploadFolder(id, currentPath, file)
      toast.success('Folder uploaded successfully')
      loadFiles()
    } catch (error) {
      toast.error(`Failed to upload folder: ${error}`)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleDownloadFolder = async (file?: FileInfo) => {
    const downloadPath = file?.path || currentPath
    if (!id) return
    
    try {
      setDownloading(downloadPath)
      const blob = await filesApi.downloadFolder(id, downloadPath)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file?.name || 'folder'}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Download started')
    } catch (error) {
      toast.error(`Failed to download: ${error}`)
    } finally {
      setDownloading(null)
    }
  }

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Breadcrumb
  const renderBreadcrumb = () => {
    const parts = currentPath.split('/').filter(Boolean)
    let pathAccum = ''
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={() => navigateToPath('/')}
          className="text-neon-cyan hover:underline"
        >
          Root
        </button>
        {parts.map((part, index) => {
          pathAccum += '/' + part
          const path = pathAccum
          return (
            <React.Fragment key={path}>
              <span className="text-gray-500">/</span>
              <button 
                onClick={() => navigateToPath(path)}
                className="text-neon-cyan hover:underline"
              >
                {part}
              </button>
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  if (!node) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/nodes')}
            className="btn btn-secondary p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{node.name}</h1>
            <p className="text-gray-400 mt-1">File Explorer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            node.status === 'running' ? 'status-online' : 'status-offline'
          }`}>
            {node.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-500 text-neon-cyan">
            {node.game_type}
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation */}
          <button 
            onClick={navigateUp}
            disabled={currentPath === '/'}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Go up"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button 
            onClick={loadFiles}
            className="btn btn-secondary p-2"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="h-6 w-px bg-dark-400 mx-2" />

          {/* Create */}
          <button 
            onClick={() => setShowNewFolderDialog(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            New Folder
          </button>

          <button 
            onClick={() => setShowNewFileDialog(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            New File
          </button>

          <div className="h-6 w-px bg-dark-400 mx-2" />

          {/* Clipboard */}
          <button 
            onClick={handleCopy}
            disabled={selectedFiles.length === 0}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Copy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button 
            onClick={handleCut}
            disabled={selectedFiles.length === 0}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Cut"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </button>

          <button 
            onClick={handlePaste}
            disabled={!clipboard}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Paste"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>

          <div className="h-6 w-px bg-dark-400 mx-2" />

          {/* Delete */}
          <button 
            onClick={() => handleDelete()}
            disabled={selectedFiles.length === 0}
            className="btn btn-danger p-2 disabled:opacity-50"
            title="Delete selected"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <div className="h-6 w-px bg-dark-400 mx-2" />

          {/* Upload/Download */}
          <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Folder
            <input 
              type="file" 
              className="hidden" 
              accept=".zip"
              onChange={handleUploadFolder}
              disabled={uploading}
            />
          </label>

          <button 
            onClick={() => handleDownloadFolder()}
            disabled={currentPath === '/'}
            className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Folder
          </button>

          <div className="flex-1" />

          {/* Selection */}
          <button 
            onClick={selectAll}
            className="btn btn-secondary text-sm"
          >
            Select All
          </button>
          <button 
            onClick={clearSelection}
            disabled={selectedFiles.length === 0}
            className="btn btn-secondary text-sm disabled:opacity-50"
          >
            Clear Selection
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="mt-4 pt-4 border-t border-dark-400">
          {renderBreadcrumb()}
        </div>
      </div>

      {/* File List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="spinner" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-400">This folder is empty</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-400">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-8">
                    <input 
                      type="checkbox"
                      checked={selectedFiles.length === files.length}
                      onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                      className="rounded border-dark-400"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-24">Size</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-40">Modified</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr 
                    key={file.path}
                    className={`border-b border-dark-400/50 hover:bg-dark-500/50 cursor-pointer ${
                      selectedFiles.includes(file.path) ? 'bg-neon-cyan/10' : ''
                    }`}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        toggleFileSelection(file)
                      } else if (file.is_directory) {
                        navigateToFolder(file.name)
                      }
                    }}
                    onDoubleClick={() => {
                      if (file.is_directory) {
                        navigateToFolder(file.name)
                      }
                    }}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedFiles.includes(file.path)}
                        onChange={() => toggleFileSelection(file)}
                        className="rounded border-dark-400"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {file.is_directory ? (
                          <svg className="w-5 h-5 text-neon-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        <span className="text-white">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {file.is_directory ? '-' : formatSize(file.size)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {formatDate(file.modified_time)}
                    </td>
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => {
                            setRenameItem(file)
                            setNewItemName(file.name)
                            setShowRenameDialog(true)
                          }}
                          className="p-1 hover:bg-dark-400 rounded"
                          title="Rename"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {file.is_directory && (
                          <button 
                            onClick={() => handleDownloadFolder(file)}
                            disabled={downloading === file.path}
                            className="p-1 hover:bg-dark-400 rounded"
                            title="Download as ZIP"
                          >
                            {downloading === file.path ? (
                              <div className="w-4 h-4 spinner" />
                            ) : (
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            )}
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(file)}
                          className="p-1 hover:bg-dark-400 rounded"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-neon-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">New Folder</h3>
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Folder name"
              className="input w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowNewFolderDialog(false)
                  setNewItemName('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFolder}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">New File</h3>
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="File name"
              className="input w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowNewFileDialog(false)
                  setNewItemName('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateFile}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRenameDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Rename</h3>
            <input 
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="New name"
              className="input w-full mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setShowRenameDialog(false)
                  setRenameItem(null)
                  setNewItemName('')
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleRename}
                className="btn btn-primary"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NodeDetail
