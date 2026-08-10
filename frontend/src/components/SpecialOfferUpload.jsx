import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import useAxiosSecure from '../hooks/useAxiosSecure'
import toast from 'react-hot-toast'
import Dropdown from './Dropdown'
import { FileUploadBox } from './UploadPdf'

const SpecialOfferUpload = () => {
  const [selectedTenant, setSelectedTenant] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('')
  const [specialOffersFile, setSpecialOffersFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const axiosSecure = useAxiosSecure()

  const { data: tenantsResponse } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await axiosSecure.get('/system-owner/tenants')
      return res.data
    }
  })
  const tenants = tenantsResponse?.data || []

  const { data: agentsResponse } = useQuery({
    queryKey: ['agents', selectedTenant],
    queryFn: async () => {
      if (!selectedTenant) return { data: [] }
      const res = await axiosSecure.get('/system-owner/agent')
      return res.data
    },
    enabled: !!selectedTenant
  })
  
  // Filter agents for the selected tenant if backend doesn't filter it.
  const allAgents = agentsResponse?.data || []
  const agents = allAgents.filter(agent => agent.businessId === selectedTenant)

  const handleApply = async () => {
    if (!selectedTenant) {
      toast.error('Please select a tenant')
      return
    }
    if (!selectedAgent) {
      toast.error('Please select an agent')
      return
    }
    if (!specialOffersFile) {
      toast.error('Please upload a Special Offers file')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('assistant_id', selectedAgent)
      formData.append('special_offers_file', specialOffersFile)
      
      await axiosSecure.post('/system-owner/agent/upload-special-offers', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Special offer file uploaded successfully')
      setSpecialOffersFile(null)
      setSelectedAgent('')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload special offer')
    } finally {
      setIsUploading(false)
    }
  }

  const isFormValid = selectedTenant && selectedAgent && specialOffersFile

  return (
    <div className="bg-[#191919] p-6 rounded-xl border border-white/5 relative">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white mb-2">Upload Special Offer</h2>
        <p className="text-sm text-gray-400 mb-6">
          Upload special offer documents (PDF or Docs) for your AI agent. <br/>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-1.5 z-50">
            <Dropdown
              label="Select Tenant"
              placeholder="-- Select Tenant --"
              options={tenants.map(tenant => ({ label: tenant.email ? `${tenant.name} (${tenant.email})` : tenant.name, value: tenant.id }))}
              value={selectedTenant}
              onSelect={(val) => {
                setSelectedTenant(val)
                setSelectedAgent('')
              }}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass="!w-full !bg-[#111111] !border !border-[#272727] !rounded-xl !px-4 !py-3 !text-white !text-sm focus:!outline-none focus:!border-blue-500 !transition-colors placeholder:text-gray-300"
              optionClass="!bg-[#191919] !border-[#272727] !text-gray-300"
              icon="!text-gray-400"
              isSearchable={true}
            />
          </div>

          <div className="flex flex-col gap-1.5 z-40">
            <Dropdown
              label="Select Agent"
              placeholder="-- Select Agent --"
              options={agents.map(agent => ({ label: agent.name || 'Unnamed Agent', value: agent.id }))}
              value={selectedAgent}
              onSelect={(val) => setSelectedAgent(val)}
              labelClass="!text-sm !font-medium !text-gray-300"
              inputClass="!w-full !bg-[#111111] !border !border-[#272727] !rounded-xl !px-4 !py-3 !text-white !text-sm focus:!outline-none focus:!border-blue-500 !transition-colors placeholder:text-gray-300 disabled:opacity-50"
              optionClass="!bg-[#191919] !border-[#272727] !text-gray-300"
              icon="!text-gray-400"
              isSearchable={true}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <FileUploadBox label="Special Offers" file={specialOffersFile} setFile={setSpecialOffersFile} isRequired={true} />
      </div>

      <div className="absolute bottom-6 right-6">
        <button 
          onClick={handleApply}
          className={`px-6 py-2.5 rounded-full text-sm transition-all flex items-center gap-2 ${
            isFormValid
              ? 'border-[#0F42FF] bg-linear-to-t from-[#00135B] via-[#02060F] to-[#00104E] text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer' 
              : 'border border-blue-600/50 bg-[#0a0a2a] text-gray-400 cursor-not-allowed opacity-50'
          }`}
          disabled={!isFormValid || isUploading}
        >
          {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isUploading ? 'Uploading...' : 'Upload Special Offer'}
        </button>
      </div>
    </div>
  )
}

export default SpecialOfferUpload
