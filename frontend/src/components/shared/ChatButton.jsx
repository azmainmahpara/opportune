import { Modal } from '@mui/material';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { fetchChatHistory, removeConversation } from '../../redux/chatSlice';

const ChatButton = ({ userType }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState('history');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletedConversations, setDeletedConversations] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [updateFlag, setUpdateFlag] = useState(false);

  const conversations = useSelector((state) => state.chat.conversations);
  console.log("Current conversations:", conversations);
  console.log("Current conversations after fetch:", conversations);

  const userRole = useSelector((state) => state.auth.user?.role);
  console.log("User Role:", userRole);

  const modalTitle = userRole === 'student' ? 'Chat with Recruiters' : 'Chat with Students';

  useEffect(() => {
    if (!currentUser?._id) return;

    const newSocket = io('http://localhost:8000', {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      newSocket.emit('user_connected', currentUser._id);
    });

    newSocket.on('new_message', (message) => {
      if (selectedUser?._id === message.senderId) {
        setMessages(prev => [...prev, message]);
      }
    });

    newSocket.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, deleted: true } : msg
      ));
    });

    newSocket.on('typing', ({ senderId }) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(true);
      }
    });

    newSocket.on('stop_typing', ({ senderId }) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(false);
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [currentUser?._id]);

  const searchRole = userType === 'student' ? 'recruiter' : 'student';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Searching for role:', searchRole);
        console.log('Search query:', searchQuery);

        const { data } = await axios.get(
          `/api/v1/user/chat-users`, {
            params: {
              searchRole,
              search: searchQuery
            },
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        console.log('API Response:', data);

        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error('API Error:', error);
        toast.error(error.response?.data?.message || "Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && searchQuery.length >= 2) {
      const timeoutId = setTimeout(fetchUsers, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchRole, isOpen]);

  useEffect(() => {
    if (selectedUser?._id) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        `/api/v1/user/messages/${selectedUser._id}`,
        { withCredentials: true }
      );

      if (data.success) {
        const filteredMessages = data.messages.filter(msg => !msg.deleted);
        setMessages(filteredMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const { data } = await axios.post(
        '/api/v1/user/messages',
        {
          receiverId: selectedUser._id,
          content: newMessage
        },
        {
          withCredentials: true
        }
      );

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChatClick = (user) => {
    setSelectedUser(user);
    setView('chat');
  };

  const handleBack = () => {
    setView('search');
    setSelectedUser(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.emit('typing', {
        senderId: currentUser._id,
        receiverId: selectedUser._id
      });

      if (typingTimeout) clearTimeout(typingTimeout);
      
      const timeout = setTimeout(() => {
        socket.emit('stop_typing', {
          senderId: currentUser._id,
          receiverId: selectedUser._id
        });
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size should be less than 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/v1/user/messages/${messageId}`, {
        withCredentials: true
      });

      if (data.success) {
        socket.emit('message_deleted', {
          messageId,
          receiverId: selectedUser._id
        });
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, deleted: true } : msg
        ));
      }
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const renderMessageContent = (message) => {
    if (message.deleted) {
      return <span className="font-bold text-white p-1 rounded-md italic">YOU DELETED THIS MESSAGE</span>;
    }

    if (message.fileUrl) {
      if (message.fileType === 'image') {
        return (
          <div className="relative">
            <img 
              src={message.fileUrl} 
              alt="Shared image" 
              className="max-w-[200px] rounded-lg"
            />
            {message.content && (
              <p className="mt-1">{message.content}</p>
            )}
          </div>
        );
      } else {
        return (
          <div>
            <a 
              href={message.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-500 hover:underline"
            >
              📎 {message.content || 'Shared file'}
            </a>
          </div>
        );
      }
    }

    return message.content;
  };

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        await dispatch(fetchChatHistory());
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast.error('Failed to load chat history');
      }
    };

    loadChatHistory();
  }, [dispatch]);

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
  };

  const handleUpdateMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const { data } = await axios.put(
        `/api/v1/user/messages/${editingMessage._id}`,
        { content: newMessage },
        { withCredentials: true }
      );

      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === editingMessage._id ? { ...msg, content: newMessage } : msg
        ));
        setNewMessage('');
        setEditingMessage(null);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error(error.response?.data?.message || 'Failed to update message');
    } finally {
      setSendingMessage(false);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage('');
  };

  const handleDeleteConversation = async () => {
    if (!selectedUser) return;

    console.log("Attempting to delete conversation for user:", selectedUser);

    try {
        const { data } = await axios.delete(`/api/v1/user/messages/conversation/${selectedUser._id}`, {
            withCredentials: true
        });

        console.log("Delete response:", data);
        if (data.success) {
            dispatch(removeConversation(selectedUser._id));
            await dispatch(fetchChatHistory());
            toast.success("Conversation and messages deleted successfully");
            handleCloseModal();
            window.location.reload();
        }
    } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error("Failed to delete conversation");
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setOpenModal(true);
    console.log("Opening modal for user:", user);
  };
  const handleCloseModal = () => {
    console.log("Closing modal...");
    setOpenModal(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[550px] bg-white rounded-lg shadow-lg border overflow-hidden">
          <div className="bg-[#2596be] text-white p-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {userRole === 'student' ? 'Chat with Recruiters' : 'Chat with Students'}
              </h3>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setView('history')}
              className={`flex-1 py-2 text-sm font-medium ${
                view === 'history'
                  ? 'text-[#2596be] border-b-2 border-[#2596be]'
                  : 'text-gray-500'
              }`}
            >
              Recent Chats
            </button>
            <button
              onClick={() => setView('search')}
              className={`flex-1 py-2 text-sm font-medium ${
                view === 'search'
                  ? 'text-[#2596be] border-b-2 border-[#2596be]'
                  : 'text-gray-500'
              }`}
            >
              Search Users
            </button>
          </div>

          {view === 'search' && (
            <div className="p-4">
              <input
                type="text"
                placeholder={`Search ${userType === 'recruiter' ? 'students' : 'recruiters'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
              />
              <div className="mt-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-[#2596be] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setView('chat');
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b"
                    >
                      <img
                        src={user.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname)}`}
                        alt={user.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium">{user.fullname}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}

          {view === 'history' && (
            <div className="overflow-y-auto max-h-96">
              {conversations.length > 0 ? (
                conversations.map(conv => (
                  <div 
                    key={conv._id}
                    onClick={() => {
                      setSelectedUser(conv.user);
                      setView('chat');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b"
                  >
                    <div className="flex-shrink-0">
                      <img 
                        src={conv.user.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.fullname)}`}
                        alt={conv.user.fullname}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{conv.user.fullname}</h4>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.deleted ? 'Message deleted' : conv.lastMessage.content}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-500">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="bg-[#2596be] text-white text-xs rounded-full px-2 py-1 mt-1">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <button
                    onClick={() => setView('search')}
                    className="mt-2 text-[#2596be] hover:underline"
                  >
                    Search for users to chat with
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chat View */}
          {view === 'chat' && selectedUser && (
            <>
              {/* Chat Header */}
              <div className="p-3 bg-gray-50 border-b flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setView('search');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ←
                </button>
                <img
                  src={selectedUser.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullname)}`}
                  alt={selectedUser.fullname}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium">{selectedUser.fullname}</h4>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
                <button
                  onClick={handleOpenModal}
                  className="ml-auto text-red-500 hover:text-red-700"
                  title="Delete Conversation"
                >
                  🗑️
                </button>
              </div>

              {/* Messages Container */}
              <div className="h-[600px] overflow-y-auto p-5">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`mb-4 flex ${
                      message.senderId === currentUser?._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className="group relative">
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.senderId === currentUser?._id
                            ? 'bg-[#2596be] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {renderMessageContent(message)}
                        
                        {/* Message timestamp */}
                        <div className="text-xs mt-1 opacity-75">
                          {new Date(message.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                          {message.edited && (
                          <span>
                         {' ('}
                         <span style={{ color: '#FFFFFF', fontWeight: '900', textTransform: 'uppercase' }}>EDITED</span>
                         {')'}
                         </span>
                          )}
                        </div>
                      </div>

                      {/* Message actions for sender's messages */}
                      {message.senderId === currentUser?._id && !message.deleted && (
                        <div className="absolute top-0 right-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-lg rounded-lg p-1 flex gap-1">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-5 border-t">
                <form onSubmit={editingMessage ? handleUpdateMessage : handleSendMessage} className="flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-lg text-gray-600 hover:bg-gray-100"
                      title="Attach file"
                    >
                      📎
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={editingMessage ? "Edit message..." : "Type a message..."}
                      className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2596be]"
                    />
                    {editingMessage ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-5 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-5 py-3 rounded-lg text-white bg-[#2596be] hover:bg-[#6d3bd4] disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Update
                        </button>
                      </>
                    ) : (
                      <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      title={!newMessage.trim() ? "Enter a text to send" : ""}
                      className={`px-8 py-3 rounded-lg text-white whitespace-nowrap ${
                        !newMessage.trim() || sendingMessage
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#2596be] hover:bg-[#6d3bd4]"
                      }`}
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </button>
                    
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                      <span>📎 {file.name}</span>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-[#2596be] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#6d3bd4] transition-colors"
      >
        💬
      </button>

      <Modal open={openModal} onClose={handleCloseModal}>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">{modalTitle}</h2>
            <p className="mb-4">Are you sure you want to delete this conversation?</p>
            <div className="flex justify-end">
              <button 
                onClick={handleDeleteConversation} 
                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button 
                onClick={handleCloseModal} 
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

ChatButton.propTypes = {
  userType: PropTypes.oneOf(['recruiter', 'student']).isRequired
};

export default ChatButton; 
