import React, { useState, useRef } from 'react'
import { CloudUpload, FileText, X, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import useAxiosSecure from '../hooks/useAxiosSecure'
import toast from 'react-hot-toast'
import InputField from './Inputfield'
import Dropdown from './Dropdown'

export const FileUploadBox = ({ label, file, setFile, isRequired }) => {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
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
      processFile(e.dataTransfer.files[0])
    }
  }

  const processFile = (newFile) => {
    const isValid = 
        newFile.type === 'application/pdf' || 
        newFile.name.endsWith('.pdf') ||
        newFile.name.endsWith('.xlsx') || 
        newFile.name.endsWith('.xls') || 
        newFile.name.endsWith('.csv') ||
        newFile.type.includes('excel') || 
        newFile.type.includes('spreadsheet') || 
        newFile.type.includes('csv')

    if (!isValid) {
      toast.error('Please select valid PDF or Excel files only.')
      return
    }
    
    setFile(newFile)
  }

  const removeFile = (e) => {
    e.stopPropagation()
    setFile(null)
  }

  return (
    <div 
      className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-[#1a1a1a]/50 transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'
      } cursor-pointer min-h-[200px] relative w-full`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !file && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,.xlsx,.xls,.csv" 
        className="hidden" 
      />
      
      <div className="absolute top-3 left-3 bg-[#111] border border-white/5 text-gray-300 text-[11px] px-3 py-1 rounded-full z-10 flex items-center gap-1">
        {label} {isRequired && <span className="text-red-500">*</span>}
      </div>

      {file ? (
        <div 
          className="relative flex flex-col items-center bg-[#252525] p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group mt-4 w-full max-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <FileText className="w-10 h-10 text-blue-400 mb-3" />
          <button 
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
            title="Remove file"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <h3 className="text-[13px] text-gray-200 truncate w-full text-center" title={file.name}>
            {file.name}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-4">
          <div className="w-12 h-12 flex items-center justify-center mb-3">
            <CloudUpload className={`w-8 h-8 ${isDragging ? 'text-blue-400' : 'text-gray-400'}`} strokeWidth={1.5} />
          </div>
          <h3 className="text-[13px] text-gray-300 mb-1">
            {isDragging ? 'Drop here' : 'Click or drag file'}
          </h3>
          <p className="text-[11px] text-gray-500 text-center">PDF or Excel</p>
        </div>
      )}
    </div>
  )
}

const UploadPdf = () => {
  const [agentName, setAgentName] = useState('')
  const [selectedTenant, setSelectedTenant] = useState('')
  const [rulesFile, setRulesFile] = useState(null)
  const [menuFile, setMenuFile] = useState(null)
  
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()

  const { data: tenantsResponse } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await axiosSecure.get('/system-owner/tenants')
      return res.data
    }
  })
  const tenants = tenantsResponse?.data || []

  const createAgentMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axiosSecure.post('/system-owner/agent/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Agent created and provisioned successfully')
      setRulesFile(null)
      setMenuFile(null)
      setAgentName('')
      queryClient.invalidateQueries(['recentAgents'])
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create agent')
    }
  })

  const handleApply = () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant')
      return
    }
    if (!agentName.trim()) {
      toast.error('Please enter an agent name')
      return
    }
    if (!rulesFile || !menuFile) {
      toast.error('Please upload at least Rules File and Menu File')
      return
    }

    const formData = new FormData()
    formData.append('businessId', selectedTenant)
    formData.append('agent_name', agentName)
    formData.append('rules_file', rulesFile)
    formData.append('menu_file', menuFile)

    createAgentMutation.mutate(formData)
  }

  const isFormValid = agentName.trim() && rulesFile && menuFile && selectedTenant

  return (
    <div className="bg-[#191919] p-6 rounded-xl border border-white/5 relative">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white mb-2">Create AI Agent</h2>
        <p className="text-sm text-gray-400 mb-6">
          Upload documents (PDF or Excel) with text that will be used to train your AI text model. <br/>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-1.5 z-50">
            <Dropdown
              label="Select Tenant"
              placeholder="-- Select Tenant --"
              options={tenants.map(tenant => ({ label: tenant.email ? `${tenant.name} (${tenant.email})` : tenant.name, value: tenant.id }))}
              value={selectedTenant}
              onSelect={(val) => setSelectedTenant(val)}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass="!w-full !bg-[#111111] !border !border-[#272727] !rounded-xl !px-4 !py-3 !text-white !text-sm focus:!outline-none focus:!border-blue-500 !transition-colors placeholder:text-gray-300"
              optionClass="!bg-[#191919] !border-[#272727] !text-gray-300"
              icon="!text-gray-400"
              isSearchable={true}
            />
          </div>

          <InputField
            label="Agent Name"
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            labelClass="!text-sm !font-medium !text-gray-300"
            inputClass="!w-full !bg-[#111111] !border !border-[#272727] !rounded-xl !px-4 !py-3 !text-white !text-sm focus:!outline-none focus:!border-blue-500 !transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <FileUploadBox label="Rules" file={rulesFile} setFile={setRulesFile} isRequired={true} />
        <FileUploadBox label="Menu" file={menuFile} setFile={setMenuFile} isRequired={true} />
      </div>

      <div className="absolute bottom-6 right-6">
        <button 
          onClick={handleApply}
          className={`px-6 py-2.5 rounded-full text-sm transition-all flex items-center gap-2 ${
            isFormValid
              ? 'border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer' 
              : 'border border-blue-600/50 bg-[#0a0a2a] text-gray-400 cursor-not-allowed opacity-50'
          }`}
          disabled={!isFormValid || createAgentMutation.isPending}
        >
          {createAgentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {createAgentMutation.isPending ? 'Creating Agent...' : 'Create Agent'}
        </button>
      </div>
    </div>
  )
}

export default UploadPdf
