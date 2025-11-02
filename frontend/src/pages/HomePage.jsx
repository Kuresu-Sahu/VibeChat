import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { useState } from 'react'
import { ChatContext } from '../../context/ChatContext.jsx'

const HomePage = () => {
  const { selectedUser, rightSidebarOpen } = useContext(ChatContext);
  // Always show two columns when a user is selected: left sidebar + chat (chat takes right area)
  const gridClass = selectedUser ? 'md:grid-cols-[1fr_3fr]' : 'md:grid-cols-2';

  return (
    <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
      <div className={`backdrop-blur-xl border-2 border-gray-600 rounded-2xl overflow-hidden h-full min-h-0 grid-cols-1 relative ${gridClass} grid`}>
        <Sidebar />
        <ChatContainer />
      </div>
    </div>
  )
}

export default HomePage
