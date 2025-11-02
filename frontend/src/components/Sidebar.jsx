import React, { useEffect, useRef, useState, useContext } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx';
import { ChatContext } from '../../context/ChatContext.jsx';

/**
 * Sidebar
 * Left-side user list with search and quick actions.
 * - Shows users and online status
 * - Clicking a user selects conversation and clears unseen count for that user
 */
const Sidebar = () => {

    const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages, setRightSidebarOpen } = useContext(ChatContext);

    const { logout, onlineUsers } = useContext(AuthContext);

    const [input, setInput] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const navigate = useNavigate();

    // Filter users by search input
    const filteredUsers = input ? users.filter(user => user.fullName.toLowerCase().includes(input.toLowerCase())) : users;

    // Refresh user list when online users change (presence updates)
    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Map users to include online flag (useful in templates)
    // const userDummyData = filteredUsers.map(user => ({
    //     ...user,
    //     isOnline: onlineUsers.includes(user._id)
    // }));

    return (
        <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
            <div className='pb-5'>
                <div className='flex justify-between items-center'>
                    <img src={assets.logo} alt="logo" className='max-w-40' />
                    <div className='relative py-2' ref={menuRef}>
                        <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer' onClick={() => setMenuOpen(open => !open)} />
                        <div className={`absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 ${menuOpen ? 'block' : 'hidden'}`}>
                            <p onClick={() => { navigate('/profile'); setMenuOpen(false); }} className='cursor-pointer text-sm'>Edit Profile</p>
                            <hr className='my-2 border-t border-gray-500' />
                            <p onClick={() => { setMenuOpen(false); logout(); }} className='cursor-pointer text-sm'>Logout</p>
                        </div>
                    </div>
                </div>
                <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
                    <img src={assets.search_icon} alt="Search" className='w-3' />
                    <input onChange={(e) => setInput(e.target.value)} type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
                </div>
            </div>
            <div className='flex flex-col'>
                {filteredUsers.map((user) => (
                    <div onClick={() => { setSelectedUser(user); setUnseenMessages(prev => ({ ...prev, [user._id]: 0 })); }} key={user._id} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}>
                        <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[35px] aspect-square rounded-full' />
                        <div className='flex flex-col leading-5'>
                            <p>{user.fullName}</p>
                            {
                                onlineUsers.includes(user._id)
                                    ? <span className='text-green-400 text-xs'>Online</span>
                                    : <span className='text-neutral-400 text-xs'>Offline</span>
                            }
                        </div>
                        {unseenMessages?.[user._id] > 0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Sidebar
