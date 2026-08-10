import React, { useState, useRef } from 'react'
import { CloudUpload, FileSpreadsheet, X } from 'lucide-react'

const UploadExcel = () => {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const processFiles = (newFiles) => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
    const validFiles = Array.from(newFiles).filter(
      (file) => validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls|csv)$/)
    )
    
    if (validFiles.length !== newFiles.length) {
      alert('Some files were rejected. Please select valid Excel or CSV files only.')
    }
    
    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files)
    }
    // Reset input value so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (e, indexToRemove) => {
    e.stopPropagation()
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="bg-[#191919] p-6 rounded-xl border border-white/5 relative">
      <div className="text-center mb-6">
        <h2 className="text-lg font-medium text-white mb-2">Upload Excel file</h2>
        <p className="text-sm text-gray-400">
          Upload spreadsheets with product data that will be used to train your AI model
        </p>
      </div>

      <div 
        className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center bg-[#1a1a1a]/50 mb-16 transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'
        } cursor-pointer min-h-[250px]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".xlsx,.xls,.csv" 
          multiple
          className="hidden" 
        />

        {files.length > 0 ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap gap-4 justify-center items-center w-full max-h-[200px] overflow-y-auto p-2">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center bg-[#252525] p-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileSpreadsheet className="w-8 h-8 text-blue-400 mb-2" />
                  <button 
                    onClick={(e) => removeFile(e, index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                    title="Remove file"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                  <h3 className="text-xs text-gray-200 truncate w-20 text-center" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors ">
              <CloudUpload className="w-4 h-4" />
              <span>Click or drag to add more files</span>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 flex items-center justify-center mb-4">
              <CloudUpload className={`w-10 h-10 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-gray-200 mb-1">
              {isDragging ? 'Drop files here' : 'Drag and drop files here'}
            </h3>
            <p className="text-sm text-gray-500 mb-6 text-center">or click to browse files from your computer</p>
            
            <button className="px-8 py-2 rounded-full border border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-sm text-white transition-all pointer-events-none">
              Upload Files
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-6 right-6">
        <button 
          className={`px-6 py-2.5 rounded-full text-sm transition-all ${
            files.length > 0 
              ? 'border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]' 
              : 'border border-blue-600/50 bg-[#0a0a2a] text-gray-400 cursor-not-allowed opacity-50'
          }`}
          disabled={files.length === 0}
        >
          Apply Train AI {files.length > 0 && `(${files.length})`}
        </button>
      </div>
    </div>
  )
}

export default UploadExcel
