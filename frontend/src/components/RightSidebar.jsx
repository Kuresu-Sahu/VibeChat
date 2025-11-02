import React, { useEffect, useState, useContext } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext.jsx'
import { AuthContext } from '../../context/AuthContext'
import Lightbox from './Lightbox'

/**
 * RightSidebar
 * Shows selected user's profile and media gallery.
 * - On desktop it appears as a right column, on mobile it's a full-screen drawer.
 * - Media thumbnails open the Lightbox component for preview.
 */
const RightSidebar = () => {

  const { selectedUser, messages, rightSidebarOpen, setRightSidebarOpen } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  // msgImages is derived from messages; stored in state to avoid recomputing on each render
  const [msgImages, setMsgImages] = useState([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Extract all image URLs from messages whenever messages change.
  // We keep this in state so child components (Lightbox) can rely on a stable array reference.
  useEffect(() => {
    setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image));
  }, [messages]);

  return selectedUser && (
    <div className={`absolute inset-0 z-50 backdrop-blur-lg ${rightSidebarOpen ? 'block' : 'hidden'}`}>
      {/* Full-screen mobile drawer with solid background so it hides the chat underneath */}
      <div className='hidden md:flex bg-linear-to-r from-purple-900 to-violet-800 text-white w-full md:relative md:max-w-none h-full flex-col min-h-0'>
        {/* Header section: profile pic, name, bio */}
        <div className='p-6 flex flex-col items-center gap-3 text-sm font-light'>
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-28 h-28 rounded-full object-cover' />
          <h1 className='text-xl font-semibold flex items-center gap-2'>
            {/* Small online indicator when the user is currently online */}
            {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500' />}
            {selectedUser.fullName}
          </h1>
          <p className='text-sm text-center max-w-[90%]'>{selectedUser.bio}</p>
        </div>

        {/* Media section: scrollable, smaller thumbnails */}
        <div className='px-5 text-sm flex-1 overflow-y-auto min-h-0'>
          <p className='font-medium mb-2'>Media</p>
          <div className='grid grid-cols-5 gap-3'>
            {msgImages.length ? msgImages.map((url, index) => (
              <button key={index} onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }} className='cursor-pointer rounded overflow-hidden aspect-square'>
                <img src={url} alt={`media-${index}`} loading='lazy' className='w-full h-full object-cover rounded-md' />
              </button>
            )) : <p className='text-sm text-center text-[#e6e6e6]/60'>No media</p>}
          </div>
        </div>

        {/* Footer section: close and logout (sticky to bottom) */}
        <div className='mt-auto sticky bottom-0 p-4 border-t border-white/10 flex items-center justify-center gap-3 bg-linear-to-r from-violate-800 to-violet-900'>
          <button onClick={() => setRightSidebarOpen(false)} className='bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-6 rounded-full cursor-pointer'>
            Close
          </button>
          <button onClick={() => logout()} className='bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-6 rounded-full cursor-pointer'>
            Logout
          </button>
        </div>
      </div>

      <div className='flex md:hidden fixed inset-0 bg-[#0f172a]/90 text-white overflow-y-auto flex-col min-h-0'>
        {/* Mobile header */}
        <div className='pt-16 p-4 flex flex-col items-center gap-2 text-sm font-light'>
          <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 h-20 rounded-full object-cover' />
          <h1 className='text-lg font-medium flex items-center gap-2'>
            {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500' />}
            {selectedUser.fullName}
          </h1>
          <p className='text-center text-sm px-6'>{selectedUser.bio}</p>
        </div>

        <div className='px-5 text-sm flex-1 overflow-y-auto min-h-0'>
          <p className='font-medium mb-2'>Media</p>
          <div className='grid grid-cols-3 gap-3'>
            {msgImages.length ? msgImages.map((url, index) => (
              <button key={index} onClick={() => { setLightboxIndex(index); setLightboxOpen(true); }} className='cursor-pointer rounded overflow-hidden aspect-square'>
                <img src={url} alt={`media-${index}`} loading='lazy' className='w-full h-full object-cover rounded-md' />
              </button>
            )) : <p className='text-sm text-center text-[#e6e6e6]/60'>No media</p>}
          </div>
        </div>
        <div className='mt-auto sticky bottom-0 p-4 border-t border-white/10 flex items-center justify-center gap-3 bg-[#0f172a]/95'>
          <button onClick={() => setRightSidebarOpen(false)} className='bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-6 rounded-full cursor-pointer'>
            Close
          </button>
          <button onClick={() => logout()} className='bg-linear-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-6 rounded-full cursor-pointer'>
            Logout
          </button>
        </div>
      </div>
      {/* Lightbox modal */}
      {/* Lightbox modal shown when a thumbnail is clicked. Parent manages the index so thumbnails can control it. */}
      {lightboxOpen && (
        <Lightbox
          images={msgImages}
          startIndex={lightboxIndex}
          onClose={() => { setLightboxOpen(false); setLightboxIndex(0); }}
          onNext={() => setLightboxIndex((i) => (i + 1) % msgImages.length)}
          onPrev={() => setLightboxIndex((i) => (i - 1 + msgImages.length) % msgImages.length)}
        />
      )}
    </div>
  )
}

export default RightSidebar
