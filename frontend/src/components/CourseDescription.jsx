import { setSingleCourse } from '@/redux/courseSlice';
import { COURSE_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { FileIcon, ImageIcon } from 'lucide-react'; // Import icons
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import { Button } from './ui/button';

const CourseDescription = () => {
    const { singleCourse } = useSelector(store => store.course);
    const { user } = useSelector(store => store.auth);
    const params = useParams();
    const courseId = params.id;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Check if user is enrolled
    const isEnrolled = singleCourse?.enrollments?.some(
        enrollment => enrollment.student?._id === user?._id
    );

    const handleEnroll = async () => {
        try {
            if (!user) {
                toast.error("Please login to enroll in courses");
                navigate('/login');
                return;
            }

            if (isEnrolled) {
                toast.error("You are already enrolled in this course");
                return;
            }

            const res = await axios.post(
                `${COURSE_API_END_POINT}/enroll/${courseId}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                // Refresh course data
                const courseRes = await axios.get(
                    `${COURSE_API_END_POINT}/get/${courseId}`, 
                    { withCredentials: true }
                );
                if (courseRes.data.success) {
                    dispatch(setSingleCourse(courseRes.data.course));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error enrolling in course");
        }
    };

    useEffect(() => {
        const fetchSingleCourse = async () => {
            try {
                const res = await axios.get(`${COURSE_API_END_POINT}/get/${courseId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleCourse(res.data.course));
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Error fetching course details");
            }
        }
        fetchSingleCourse();
    }, [courseId, dispatch]);

    // Function to get file icon based on mimetype
    const getFileIcon = (mimetype) => {
        if (mimetype.startsWith('image/')) {
            return <ImageIcon className="w-4 h-4" />;
        }
        return <FileIcon className="w-4 h-4" />;
    };

    return (
        <div>
            <Navbar />
            <div className='max-w-7xl mx-auto my-10'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='font-bold text-xl'>{singleCourse?.title}</h1>
                        <p className='text-gray-600'>Instructor: {singleCourse?.instructor}</p>
                    </div>
                    {isEnrolled ? (
                        <Button
                            className="bg-green-600 cursor-not-allowed"
                            disabled
                        >
                            Enrolled
                        </Button>
                    ) : (
                        <Button
                            className="bg-[#2596be] hover:bg-[#5f32ad]"
                            onClick={handleEnroll}
                        >
                            Enroll Now
                        </Button>
                    )}
                </div>

                {/* Course Thumbnail */}
                {singleCourse?.thumbnail?.url && (
                    <div className='my-4'>
                        <img 
                            src={singleCourse.thumbnail.url} 
                            alt={singleCourse.title}
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </div>
                )}

                <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Course Details</h1>
                
                {/* Course Resources */}
                {singleCourse?.resources?.length > 0 && (
                    <div className="my-4">
                        <h2 className="font-bold text-lg mb-2">Course Resources</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {singleCourse.resources.map((resource, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                                >
                                    {getFileIcon(resource.type)}
                                    <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 truncate"
                                    >
                                        {resource.name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Course Details */}
                <div className='my-4'>
                    <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.description}</span></h1>
                    <h1 className='font-bold my-1'>Duration: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.duration}</span></h1>
                    <h1 className='font-bold my-1'>Level: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.level}</span></h1>
                    <h1 className='font-bold my-1'>Price: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.price}RM</span></h1>
                    <h1 className='font-bold my-1'>Total Enrolled: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.enrollments?.length || 0}</span></h1>
                    <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleCourse?.createdAt?.split("T")[0]}</span></h1>
                </div>

                {/* External Links */}
                {(singleCourse?.videoLink || singleCourse?.resourceLink) && (
                    <div className="my-4">
                        <h2 className="font-bold text-lg mb-2">Additional Resources</h2>
                        <div className="space-y-2">
                            {singleCourse.videoLink && (
                                <Button 
                                    variant="outline"
                                    onClick={() => window.open(singleCourse.videoLink, '_blank')}
                                    className="mr-2"
                                >
                                    Watch Video
                                </Button>
                            )}
                            {singleCourse.resourceLink && (
                                <Button 
                                    variant="outline"
                                    onClick={() => window.open(singleCourse.resourceLink, '_blank')}
                                >
                                    Additional Resources
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseDescription 