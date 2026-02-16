import React from 'react'
import type { FileInfo, ClipboardItem } from '../../types/files'

interface FileExplorerProps {
  files: FileInfo[]
  currentPath: string
  loading: boolean
  selectedFiles: string[]
  clipboard: ClipboardItem | null
  downloading: string | null
  uploading: boolean
  onNavigateUp: () => void
  onNavigateToFolder: (folder: string) => void
  onNavigateToPath: (path: string) => void
  onRefresh: () => void
  onSelectAll: () => void
  onClearSelection: () => void
  onToggleFileSelection: (file: FileInfo) => void
  onCopy: () => void
  onCut: () => void
  onPaste: () => void
  onDelete: (file?: FileInfo) => void
  onUploadFolder: (event: React.ChangeEvent<HTMLInputElement>) => void
  onDownloadFolder: (file?: FileInfo) => void
  onRename: (file: FileInfo) => void
  onNewFolder: () => void
  onNewFile: () => void
}

// Utility functions
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString()
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  currentPath,
  loading,
  selectedFiles,
  clipboard,
  downloading,
  uploading,
  onNavigateUp,
  onNavigateToFolder,
  onNavigateToPath,
  onRefresh,
  onSelectAll,
  onClearSelection,
  onToggleFileSelection,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onUploadFolder,
  onDownloadFolder,
  onRename,
  onNewFolder,
  onNewFile,
}) => {
  // Breadcrumb
  const renderBreadcrumb = () => {
    const parts = currentPath.split('/').filter(Boolean)
    let pathAccum = ''
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={() => onNavigateToPath('/')}
          className="text-neon-cyan hover:underline"
        >
          Root
        </button>
        {parts.map((part) => {
          pathAccum += '/' + part
          const path = pathAccum
          return (
            <React.Fragment key={path}>
              <span className="text-gray-500">/</span>
              <button 
                onClick={() => onNavigateToPath(path)}
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

  return (
    <>
      {/* Toolbar */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2">
          {/* Navigation */}
          <button 
            onClick={onNavigateUp}
            disabled={currentPath === '/'}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Go up"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button 
            onClick={onRefresh}
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
            onClick={onNewFolder}
            className="btn btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            New Folder
          </button>

          <button 
            onClick={onNewFile}
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
            onClick={onCopy}
            disabled={selectedFiles.length === 0}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Copy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button 
            onClick={onCut}
            disabled={selectedFiles.length === 0}
            className="btn btn-secondary p-2 disabled:opacity-50"
            title="Cut"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          </button>

          <button 
            onClick={onPaste}
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
            onClick={() => onDelete()}
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
              onChange={onUploadFolder}
              disabled={uploading}
            />
          </label>

          <button 
            onClick={() => onDownloadFolder()}
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
            onClick={onSelectAll}
            className="btn btn-secondary text-sm"
          >
            Select All
          </button>
          <button 
            onClick={onClearSelection}
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
                      onChange={(e) => e.target.checked ? onSelectAll() : onClearSelection()}
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
                        onToggleFileSelection(file)
                      } else if (file.is_directory) {
                        onNavigateToFolder(file.name)
                      }
                    }}
                    onDoubleClick={() => {
                      if (file.is_directory) {
                        onNavigateToFolder(file.name)
                      }
                    }}
                  >
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedFiles.includes(file.path)}
                        onChange={() => onToggleFileSelection(file)}
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
                          onClick={() => onRename(file)}
                          className="p-1 hover:bg-dark-400 rounded"
                          title="Rename"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {file.is_directory && (
                          <button 
                            onClick={() => onDownloadFolder(file)}
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
                          onClick={() => onDelete(file)}
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
    </>
  )
}

export default FileExplorer