import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { filesApi } from '../../services/filesApi'
import { toast } from '../../store/toast/toastStore'
import type { FileInfo, ClipboardItem } from '../../types/files'
import type { Node } from '../../types/api'
import { useNodesStore } from '../../store/nodes/nodesSlice'
import { nodesApi } from '../../services/api'
import { NodeInfoCard } from './NodeInfoCard'
import { FileExplorer } from './FileExplorer'
import { FileDialogs } from './FileDialogs'

// File Explorer Component
export const NodeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { nodes, fetchNodes, updateNodeData, initializeNode } = useNodesStore()
  
  const [node, setNode] = useState<Node | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState('/')
  const [loading, setLoading] = useState(true)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showUpdateImageDialog, setShowUpdateImageDialog] = useState(false)
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [renameItem, setRenameItem] = useState<FileInfo | null>(null)
  const [uploading, setUploading] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [updatingImage, setUpdatingImage] = useState(false)
  const [savingNode, setSavingNode] = useState(false)
  const [initializing, setInitializing] = useState(false)
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editGameType, setEditGameType] = useState('')
  const [editVersion, setEditVersion] = useState('')
  const [editPort, setEditPort] = useState(0)

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

  // Node container actions
  const handleRestartNode = async () => {
    if (!id) return
    
    if (!confirm('Are you sure you want to restart this node container? This will temporarily disconnect the node.')) return
    
    try {
      await nodesApi.nodeAction(id, 'restart')
      toast.success('Node container restarted successfully')
      // Refresh node list to get updated status
      fetchNodes()
    } catch (error) {
      toast.error(`Failed to restart node: ${error}`)
    }
  }

  const handleUpdateImage = async () => {
    if (!id) return
    
    try {
      setUpdatingImage(true)
      const response = await nodesApi.nodeAction(id, 'update-image')
      
      if (response.skipped) {
        toast.info('Container is already running the latest image')
      } else {
        toast.success('Node container updated to latest image successfully')
      }
      
      setShowUpdateImageDialog(false)
      // Refresh node list to get updated info
      fetchNodes()
    } catch (error) {
      toast.error(`Failed to update node image: ${error}`)
    } finally {
      setUpdatingImage(false)
    }
  }

  const handleInitializeNode = async () => {
    if (!id || !node) return
    
    try {
      setInitializing(true)
      const result = await initializeNode(id, node.game_type)
      if (result.success) {
        toast.success('Node initialized successfully')
        fetchNodes()
      } else {
        toast.error(result.message || 'Failed to initialize node')
      }
    } catch (error) {
      toast.error(`Failed to initialize node: ${error}`)
    } finally {
      setInitializing(false)
    }
  }

  const handleSaveNode = async () => {
    if (!id) return
    
    try {
      setSavingNode(true)
      const success = await updateNodeData(id, {
        name: editName,
        game_type: editGameType,
        version: editVersion,
        port: editPort,
      })
      if (success) {
        toast.success('Node updated successfully')
        setShowEditNodeDialog(false)
        fetchNodes()
      } else {
        toast.error('Failed to update node')
      }
    } catch (error) {
      toast.error(`Failed to update node: ${error}`)
    } finally {
      setSavingNode(false)
    }
  }

  // Open rename dialog
  const openRenameDialog = (file: FileInfo) => {
    setRenameItem(file)
    setNewItemName(file.name)
    setShowRenameDialog(true)
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
        <div className="flex gap-2 items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            node.status === 'running' ? 'status-online' : 'status-offline'
          }`}>
            {node.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-500 text-neon-cyan">
            {node.game_type}
          </span>
          {node.initialized ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neon-green/20 text-neon-green">
              Initialized
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-neon-yellow/20 text-neon-yellow">
              Not Initialized
            </span>
          )}
          <div className="h-6 w-px bg-dark-400 mx-2" />
          <button 
            onClick={handleRestartNode}
            className="btn btn-secondary flex items-center gap-2"
            title="Restart node container"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
          <button 
            onClick={() => setShowUpdateImageDialog(true)}
            className="btn btn-primary flex items-center gap-2"
            title="Update node container image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Update Image
          </button>
        </div>
      </div>

      {/* Node Info Card */}
      <NodeInfoCard 
        node={node}
        initializing={initializing}
        onInitialize={handleInitializeNode}
        onEdit={() => {
          setEditName(node.name)
          setEditGameType(node.game_type)
          setEditVersion(node.version || '')
          setEditPort(node.port)
          setShowEditNodeDialog(true)
        }}
      />

      {/* File Explorer */}
      <FileExplorer 
        files={files}
        currentPath={currentPath}
        loading={loading}
        selectedFiles={selectedFiles}
        clipboard={clipboard}
        downloading={downloading}
        uploading={uploading}
        onNavigateUp={navigateUp}
        onNavigateToFolder={navigateToFolder}
        onNavigateToPath={navigateToPath}
        onRefresh={loadFiles}
        onSelectAll={selectAll}
        onClearSelection={clearSelection}
        onToggleFileSelection={toggleFileSelection}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onUploadFolder={handleUploadFolder}
        onDownloadFolder={handleDownloadFolder}
        onRename={openRenameDialog}
        onNewFolder={() => setShowNewFolderDialog(true)}
        onNewFile={() => setShowNewFileDialog(true)}
      />

      {/* Dialogs */}
      <FileDialogs 
        // New Folder Dialog
        showNewFolderDialog={showNewFolderDialog}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        onCreateFolder={handleCreateFolder}
        onCloseNewFolderDialog={() => {
          setShowNewFolderDialog(false)
          setNewItemName('')
        }}
        
        // New File Dialog
        showNewFileDialog={showNewFileDialog}
        onCreateFile={handleCreateFile}
        onCloseNewFileDialog={() => {
          setShowNewFileDialog(false)
          setNewItemName('')
        }}
        
        // Rename Dialog
        showRenameDialog={showRenameDialog}
        renameItem={renameItem}
        onRename={handleRename}
        onCloseRenameDialog={() => {
          setShowRenameDialog(false)
          setRenameItem(null)
          setNewItemName('')
        }}
        
        // Update Image Dialog
        showUpdateImageDialog={showUpdateImageDialog}
        updatingImage={updatingImage}
        onUpdateImage={handleUpdateImage}
        onCloseUpdateImageDialog={() => setShowUpdateImageDialog(false)}
        
        // Edit Node Dialog
        showEditNodeDialog={showEditNodeDialog}
        savingNode={savingNode}
        editName={editName}
        editGameType={editGameType}
        editVersion={editVersion}
        editPort={editPort}
        setEditName={setEditName}
        setEditGameType={setEditGameType}
        setEditVersion={setEditVersion}
        setEditPort={setEditPort}
        onSaveNode={handleSaveNode}
        onCloseEditNodeDialog={() => setShowEditNodeDialog(false)}
      />
    </div>
  )
}

export default NodeDetail