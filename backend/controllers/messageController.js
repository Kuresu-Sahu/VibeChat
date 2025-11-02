import User from '../models/User.js';
import Message from '../models/Message.js';
import cloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js';

/**
 * Get users for sidebar
 * Returns all registered users except the requesting user and a map of unseen message counts.
 * This intentionally excludes sensitive fields such as password.
 */
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        const users = await User.find({ _id: { $ne: userId } }).select('-password');

        // Count unseen messages per user (who sent messages to the current user)
        const unseenMessages = {};
        await Promise.all(
            users.map(async (u) => {
                const count = await Message.countDocuments({ senderId: u._id, receiverId: userId, seen: false });
                if (count > 0) unseenMessages[u._id] = count;
            })
        );

        res.json({ success: true, users, unseenMessages });
    } catch (error) {
        console.error('getUsersForSidebar error:', error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Get chat messages between the authenticated user and a selected user.
 * Also marks messages sent by the other user as seen.
 */
export const getMessages = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: selectedUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId }
            ]
        });

        // Mark incoming messages as seen
        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true });
        res.json({ success: true, messages });
    } catch (error) {
        console.error('getMessages error:', error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Mark a single message as seen by ID.
 */
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true, message: 'Message marked as seen' });
    } catch (error) {
        console.error('markMessageAsSeen error:', error);
        res.json({ success: false, message: error.message });
    }
};

/**
 * Send a message (text and optional image) to another user.
 * Uploaded image (if any) is uploaded to Cloudinary and the secure URL stored on the message.
 * If the receiver is online, the message is emitted over Socket.IO.
 */
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { text, image } = req.body;
        const receiverId = req.params.id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({ senderId, receiverId, text, image: imageUrl });

        // Emit the message to the receiver if online
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

        res.json({ success: true, message: newMessage });
    } catch (error) {
        console.error('sendMessage error:', error);
        res.json({ success: false, message: error.message });
    }
};