import React from 'react'
import Breadcrumb from "../../components/Breadcrumb";
import { useQuery } from '@tanstack/react-query'
import useAxiosSecure from "../../hooks/useAxiosSecure";
import { Loader2, Bot, Phone, Hash } from 'lucide-react'

const AgentList = () => {
  const axiosSecure = useAxiosSecure()

  const { data: agentsResponse, isLoading } = useQuery({
    queryKey: ['ownerAgents'],
    queryFn: async () => {
      const res = await axiosSecure.get('/business-owner/agent')
      return res.data
    }
  })

  const agents = agentsResponse?.data || []

  return (
    <div>
      <Breadcrumb text="View and manage your AI Agents" />
      
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-[#0F42FF] w-8 h-8" />
          </div>
        ) : agents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className="bg-[#0E0E10] border border-[#272727] rounded-2xl p-6 hover:border-[#0F42FF]/50 hover:shadow-[0_0_20px_rgba(15,66,255,0.1)] transition-all group relative overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F42FF]/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <div className="flex items-start justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0F42FF]/10 border border-[#0F42FF]/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                      <Bot className="w-6 h-6 text-[#0F42FF]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{agent.name || 'Unnamed Agent'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${agent.status === 'active' ? 'bg-green-500 shadow-green-500/50' : 'bg-yellow-500 shadow-yellow-500/50'}`}></div>
                        <span className="text-xs font-medium text-gray-400 capitalize">{agent.status || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-5 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between text-sm group/item">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center mr-3 border border-white/5">
                            <Hash className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-gray-400">Agent ID</span>
                    </div>
                    <span className="text-gray-200 font-mono text-xs break-all text-right max-w-[180px] sm:max-w-none" title={agent.id}>
                        {agent.id}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm group/item">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center mr-3 border border-white/5">
                            <Phone className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-gray-400">Twilio No</span>
                    </div>
                    <span className="text-gray-200 font-medium">{agent.twilioNumber || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm group/item">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center mr-3 border border-white/5">
                            <Phone className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-gray-400">Manager No</span>
                    </div>
                    <span className="text-gray-200 font-medium">{agent.managerNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border border-dashed border-[#272727] rounded-xl bg-[#0E0E10]/50">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                <Bot className="w-8 h-8 text-gray-500 opacity-50" />
            </div>
            <p className="text-lg font-medium text-white mb-1">No agents found</p>
            <p className="text-sm">You haven't been assigned any AI agents yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentList
