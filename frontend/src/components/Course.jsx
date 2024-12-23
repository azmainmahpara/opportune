import axios from 'axios';
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { COURSE_API_END_POINT } from '../utils/constant';

const Course = ({ course, isAdmin = false }) => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);

    // Check if user is enrolled
    const isEnrolled = course?.enrollments?.some(
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
                `${COURSE_API_END_POINT}/enroll/${course._id}`,
                {},
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                // Optionally refresh the course data here
                navigate(`/course/${course._id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error enrolling in course");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Thumbnail image */}
            {course?.thumbnail?.url && (
                <div className="w-full h-48">
                    <img 
                        src={course.thumbnail.url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            
            {/* Header */}
            <div className="p-4">
                <h2 className="text-xl font-bold truncate">{course?.title}</h2>
                <p className="text-gray-600 line-clamp-2 mt-1">{course?.description}</p>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <div className='space-y-2'>
                    <h1 className='font-medium'>Instructor: <span className='font-normal'>{course?.instructor}</span></h1>
                    <h1 className='font-medium'>Duration: <span className='font-normal'>{course?.duration}</span></h1>
                    <h1 className='font-medium'>Level: <span className='font-normal'>{course?.level}</span></h1>
                    <h1 className='font-medium'>Price: <span className='font-normal'>{course?.price}RM</span></h1>
                    <h1 className='font-medium'>Total Enrolled: <span className='font-normal'>{course?.enrollments?.length || 0}</span></h1>
                </div>
            </div>

            {/* Footer */}
            <div className='p-4 border-t flex gap-2'>
                {isAdmin ? (
                    <>
                        <button 
                            onClick={() => navigate(`/admin/courses/${course?._id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-1"
                        >
                            Edit
                        </button>
                        <button 
                            onClick={() => navigate(`/admin/courses/${course?._id}/students`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-1"
                        >
                            Students
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            onClick={() => navigate(`/course/${course?._id}`)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex-1"
                        >
                            Details
                        </button>
                        {isEnrolled ? (
                            <button 
                                className="bg-green-600 text-white px-4 py-2 rounded-md flex-1 cursor-not-allowed"
                                disabled
                            >
                                Enrolled
                            </button>
                        ) : (
                            <button 
                                onClick={handleEnroll}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex-1"
                            >
                                Enroll Now
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Course 