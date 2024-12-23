import { setUser } from '@/redux/authSlice';
import axios from 'axios';
import { Contact, Mail, Pen } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import UpdateProfileDialog from './UpdateProfileDialog';

const RecruiterProfile = ({ userId }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchRecruiterProfile = async () => {
            try {
                const res = await axios.get('/api/v1/user/recruiter/profile', { withCredentials: true });
                dispatch(setUser(res.data.user));
            } catch (error) {
                toast.error("Error fetching recruiter profile");
            }
        };

        if (!user) {
            fetchRecruiterProfile();
        }
    }, [dispatch, user]);

    const handleUpdate = async () => {
        try {
            const res = await axios.put('/api/v1/user/recruiter/profile', user, { withCredentials: true });
            dispatch(setUser(res.data.user));
            toast.success("Profile updated successfully");
            setOpen(false);
        } catch (error) {
            toast.error("Error updating profile");
        }
    };

    const handleDelete = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            try {
                const res = await axios.delete(`/api/v1/user/delete/${userId}`, { withCredentials: true });
                if (res.data.success) {
                    toast.success(res.data.message);
                    dispatch(setUser(null));
                    navigate('/');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error deleting user");
            }
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-28 w-28 rounded-xl overflow-hidden shadow-md ring-4 ring-blue-300">
                            <AvatarImage 
                                src={user.profile.profilePhoto} 
                                alt={user.fullname} 
                                className="object-cover w-full h-full"
                            />
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-800">{user.fullname}</h1>
                            <p className="text-gray-500 mt-1">{user.profile.bio || "No bio available"}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
                        <Pen className="mr-2" /> Edit Profile
                    </Button>
                </div>

                {/* Contact Section */}
                <div className="bg-blue-100 p-6 rounded-lg mb-6 shadow-md">
                    <h2 className="text-xl font-medium mb-4 text-gray-700">Contact Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <Mail className="text-blue-500" />
                            <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Contact className="text-blue-500" />
                            <span>{user.phoneNumber}</span>
                        </div>
                    </div>
                </div>

                {/* Skills Section */}
                <div className="bg-purple-100 p-6 rounded-lg mb-6 shadow-md">
                    <h2 className="text-xl font-medium mb-4 text-gray-700">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {user.profile.skills.length !== 0 ? (
                            user.profile.skills.map((item, index) => (
                                <Badge key={index} className="bg-purple-200 text-purple-700 px-3 py-1 rounded-full">
                                    {item}
                                </Badge>
                            ))
                        ) : (
                            <span>NA</span>
                        )}
                    </div>
                </div>

                {/* Delete Account */}
                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} isRecruiter={true} />
        </div>
    );
};

export default RecruiterProfile;
