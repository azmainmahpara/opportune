import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Chat = () => {
  const { userId } = useParams();
  const [chatUser, setChatUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await axios.get(`/api/v1/user/${userId}`, {
          withCredentials: true
        });
        
        if (data.success) {
          setChatUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (loading) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {chatUser && (
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4 border-b pb-4">
            <img
              src={chatUser.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatUser.fullname)}&background=2596be&color=fff`}
              alt={chatUser.fullname}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h2 className="text-xl font-semibold">{chatUser.fullname}</h2>
              <p className="text-gray-500">{chatUser.email}</p>
            </div>
          </div>
          
          {/* Add your chat interface here */}
          <div className="mt-4">
            <p className="text-center text-gray-500">
              Chat functionality coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat; 