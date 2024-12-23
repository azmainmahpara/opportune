import { setUser } from '@/redux/authSlice';
import { USER_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const UpdateProfileDialog = ({ open, setOpen, isRecruiter }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        bio: user?.profile?.bio || "",
        skills: user?.profile?.skills?.join(', ') || "", // Join skills as a string
        file: null,
        profilePhoto: null, // New state for profile photo
    });

    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        
        if (file) {
            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                toast.error('Please upload only PDF, DOCX, JPEG, PNG, or GIF files');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toast.error('File size should be less than 5MB');
                e.target.value = ''; // Reset input
                return;
            }

            setInput({ ...input, file });
        }
    };

    const profilePhotoChangeHandler = (e) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validate file type
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
                toast.error('Please upload only JPEG, PNG, or GIF files');
                e.target.value = ''; // Reset input
                return;
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                toast.error('File size should be less than 5MB');
                e.target.value = ''; // Reset input
                return;
            }

            setInput({ ...input, profilePhoto: file });
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("bio", input.bio);
        formData.append("skills", input.skills);
        if (input.file) {
            formData.append("file", input.file); // Resume
        }
        if (input.profilePhoto) {
            formData.append("profilePhoto", input.profilePhoto); // Profile photo
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.response?.data?.message || "An error occurred while updating your profile.");
        } finally {
            setLoading(false);
        }

        setOpen(false);
    };

    return (
        <div>
            <Dialog open={open}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={() => setOpen(false)}>
                    <DialogHeader>
                        <DialogTitle>Update Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fullname" className="text-right">Name</Label>
                                <Input
                                    id="fullname"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phoneNumber" className="text-right">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="skills" className="text-right">Skills</Label>
                                <Input
                                    id="skills"
                                    name="skills"
                                    value={input.skills}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            {!isRecruiter && ( // Only show resume for students
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">Resume</Label>
                                    <div className="col-span-3">
                                        <Input
                                            id="file"
                                            name="file"
                                            type="file"
                                            accept=".pdf,.docx"
                                            onChange={fileChangeHandler}
                                            className="col-span-3"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Accepted formats: PDF, DOCX (Max size: 5MB)
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="profilePhoto" className="text-right">Profile Photo</Label>
                                <div className="col-span-3">
                                    <Input
                                        id="profilePhoto"
                                        name="profilePhoto"
                                        type="file"
                                        accept="image/*"
                                        onChange={profilePhotoChangeHandler}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Accepted formats: JPEG, PNG, GIF (Max size: 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            {loading ? (
                                <Button disabled className="w-full my-4">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                                </Button>
                            ) : (
                                <Button type="submit" className="w-full my-4">Update</Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UpdateProfileDialog;
