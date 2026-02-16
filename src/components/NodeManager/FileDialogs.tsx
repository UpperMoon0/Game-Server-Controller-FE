import React from 'react'
import type { FileInfo } from '../../types/files'

interface FileDialogsProps {
  // New Folder Dialog
  showNewFolderDialog: boolean
  newItemName: string
  setNewItemName: (name: string) => void
  onCreateFolder: () => void
  onCloseNewFolderDialog: () => void
  
  // New File Dialog
  showNewFileDialog: boolean
  onCreateFile: () => void
  onCloseNewFileDialog: () => void
  
  // Rename Dialog
  showRenameDialog: boolean
  renameItem: FileInfo | null
  onRename: () => void
  onCloseRenameDialog: () => void
  
  // Update Image Dialog
  showUpdateImageDialog: boolean
  updatingImage: boolean
  onUpdateImage: () => void
  onCloseUpdateImageDialog: () => void
  
  // Edit Node Dialog
  showEditNodeDialog: boolean
  savingNode: boolean
  editName: string
  editGameType: string
  editVersion: string
  editPort: number
  setEditName: (name: string) => void
  setEditGameType: (gameType: string) => void
  setEditVersion: (version: string) => void
  setEditPort: (port: number) => void
  onSaveNode: () => void
  onCloseEditNodeDialog: () => void
}

export const FileDialogs: React.FC<FileDialogsProps> = ({
  // New Folder Dialog
  showNewFolderDialog,
  newItemName,
  setNewItemName,
  onCreateFolder,
  onCloseNewFolderDialog,
  
  // New File Dialog
  showNewFileDialog,
  onCreateFile,
  onCloseNewFileDialog,
  
  // Rename Dialog
  showRenameDialog,
  renameItem,
  onRename,
  onCloseRenameDialog,
  
  // Update Image Dialog
  showUpdateImageDialog,
  updatingImage,
  onUpdateImage,
  onCloseUpdateImageDialog,
  
  // Edit Node Dialog
  showEditNodeDialog,
  savingNode,
  editName,
  editGameType,
  editVersion,
  editPort,
  setEditName,
  setEditGameType,
  setEditVersion,
  setEditPort,
  onSaveNode,
  onCloseEditNodeDialog,
}) => {
  return (
    <>
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
                onClick={onCloseNewFolderDialog}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={onCreateFolder}
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
                onClick={onCloseNewFileDialog}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={onCreateFile}
                className="btn btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      {showRenameDialog && renameItem && (
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
                onClick={onCloseRenameDialog}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={onRename}
                className="btn btn-primary"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Image Dialog */}
      {showUpdateImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Update to Latest Image</h3>
            <p className="text-gray-400 text-sm mb-4">
              This will pull the latest node agent image and update the container. 
              All data in volumes will be preserved. If the container is already running 
              the latest image, the update will be skipped.
            </p>
            <div className="flex justify-end gap-2">
              <button 
                onClick={onCloseUpdateImageDialog}
                className="btn btn-secondary"
                disabled={updatingImage}
              >
                Cancel
              </button>
              <button 
                onClick={onUpdateImage}
                className="btn btn-primary"
                disabled={updatingImage}
              >
                {updatingImage ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 spinner" />
                    Updating...
                  </span>
                ) : (
                  'Update to Latest'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Node Dialog */}
      {showEditNodeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Node</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Name</label>
                <input 
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Node name"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Game Type</label>
                <input 
                  type="text"
                  value={editGameType}
                  onChange={(e) => setEditGameType(e.target.value)}
                  placeholder="Game type"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Version</label>
                <input 
                  type="text"
                  value={editVersion}
                  onChange={(e) => setEditVersion(e.target.value)}
                  placeholder="Game server version (e.g., 1.20.4)"
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Port</label>
                <input 
                  type="number"
                  value={editPort}
                  onChange={(e) => setEditPort(parseInt(e.target.value) || 0)}
                  placeholder="Port"
                  className="input w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={onCloseEditNodeDialog}
                className="btn btn-secondary"
                disabled={savingNode}
              >
                Cancel
              </button>
              <button 
                onClick={onSaveNode}
                className="btn btn-primary"
                disabled={savingNode}
              >
                {savingNode ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 spinner" />
                    Saving...
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FileDialogs