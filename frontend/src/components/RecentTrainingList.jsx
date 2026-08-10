import React, { useState, useEffect, useRef } from 'react'
import { FileText, MoreVertical, ChevronRight, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useAxiosSecure from '../hooks/useAxiosSecure'
import toast from 'react-hot-toast'

const RecentTrainingList = () => {
  const [showAll, setShowAll] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState(null)
  const [agentToDelete, setAgentToDelete] = useState(null)
  const axiosSecure = useAxiosSecure()
  const queryClient = useQueryClient()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: agentsResponse, isLoading } = useQuery({
    queryKey: ['recentAgents'],
    queryFn: async () => {
      const res = await axiosSecure.get('/system-owner/agent')
      return res.data
    }
  })

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId) => {
      const res = await axiosSecure.delete(`/system-owner/agent/${agentId}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Agent deleted successfully')
      queryClient.invalidateQueries(['recentAgents'])
      setAgentToDelete(null)
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete agent')
      setAgentToDelete(null)
    }
  })

  const confirmDelete = () => {
    if (agentToDelete) {
      deleteAgentMutation.mutate(agentToDelete.id)
    }
  }

  const agents = agentsResponse?.data || []
  
  // Sort agents by creation date (newest first)
  const sortedAgents = [...agents].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const displayAgents = showAll ? sortedAgents : sortedAgents.slice(0, 5)

  if (isLoading) {
    return (
      <div className="mt-8 bg-[#191919] p-6 rounded-xl border border-white/5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="animate-spin text-[#2563EB] w-8 h-8" />
      </div>
    )
  }

  return (
    <>
      <div className="mt-8 bg-[#191919] p-6 rounded-xl border border-white/5 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Training</h2>
          {agents.length > 5 && (
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-[#0F42FF] hover:text-blue-400 text-sm font-medium flex items-center transition-colors cursor-pointer"
            >
              {showAll ? 'Show less' : 'View all'}
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-3" ref={dropdownRef}>
          {displayAgents.length > 0 ? displayAgents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-[#0E0E10] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-white/5 gap-4 sm:gap-0"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="w-12 h-12 bg-[#252525] rounded-lg flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-white font-medium text-base mb-1 truncate">{agent.name || 'Unnamed Agent'}</h3>
                  <p className="text-gray-400 text-sm">
                    Agent ID: <span className="font-mono text-xs">{agent.id.slice(0, 8)}...</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                <div className="flex items-center gap-4 sm:gap-8">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 shrink-0 ${agent.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-white text-sm font-medium capitalize">{agent.status || 'Unknown'}</span>
                  </div>
                  <div className="text-gray-400 text-sm sm:w-24 sm:text-right">
                    {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
                
                <div className="relative ml-2 sm:ml-6">
                  <button 
                    onClick={() => setOpenDropdownId(openDropdownId === agent.id ? null : agent.id)}
                    className="text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer p-1 rounded-md hover:bg-white/5"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {openDropdownId === agent.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                      <button 
                        onClick={() => {
                          setAgentToDelete(agent)
                          setOpenDropdownId(null)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-gray-400 py-6 text-sm">No agents created yet.</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {agentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#1A1A1A] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Delete Agent</h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-medium">"{agentToDelete.name || 'Unnamed Agent'}"</span>? This action cannot be undone and the agent will be permanently removed.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setAgentToDelete(null)}
                disabled={deleteAgentMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deleteAgentMutation.isPending}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
              >
                {deleteAgentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Agent'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default RecentTrainingList
