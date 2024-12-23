import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import axios from 'axios'
import { Contact, Mail, Pen } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { setUser } from '../redux/authSlice'
import AppliedJobTable from './AppliedJobTable'
import Navbar from './shared/Navbar'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Label } from './ui/label'
import UpdateProfileDialog from './UpdateProfileDialog'

const isResume = true;

const Profile = ({ userId }) => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

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

    return (
        <div className="bg-white min-h-screen">
            <Navbar />
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8 mt-10">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-32 w-32 rounded-xl overflow-hidden shadow-md ">
                            <AvatarImage 
                                src={user?.profile?.profilePhoto} 
                                alt="User Profile" 
                                className="object-cover w-full h-full"
                            />
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-800">{user?.fullname}</h1>
                            <p className="text-gray-500 mt-1">{user?.profile?.bio || "No bio available"}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} className="bg-blue-500 hover:bg-blue-600 text-white" variant="outline">
                        <Pen className="mr-2" /> Edit Profile
                    </Button>
                </div>

                <div className="bg-indigo-100 p-6 rounded-lg mb-6 shadow-md">
                    <h2 className="text-xl font-medium mb-4 text-gray-700">Contact Information</h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <Mail className="text-indigo-500" />
                            <span>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Contact className="text-indigo-500" />
                            <span>{user?.phoneNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-100 p-6 rounded-lg mb-6 shadow-md">
                    <h2 className="text-xl font-medium mb-4 text-gray-700">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {user?.profile?.skills.length !== 0 ? (
                            user?.profile?.skills.map((item, index) => (
                                <Badge key={index} className="bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full">
                                    {item}
                                </Badge>
                            ))
                        ) : (
                            <span>NA</span>
                        )}
                    </div>
                </div>

                <div className="bg-pink-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-medium mb-4 text-gray-700">Resume</h2>
                    {isResume ? (
                        <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href={user?.profile?.resume}
                            className="text-indigo-600 hover:underline"
                        >
                            {user?.profile?.resumeOriginalName || "Download Resume"}
                        </a>
                    ) : (
                        <span>NA</span>
                    )}
                </div>

                <div className="bg-blue-100 rounded-3xl mt-10 shadow-md p-6">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Applied Jobs</h1>
                    <AppliedJobTable />
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} isRecruiter={false} />
        </div>
    );
};

export default Profile;
