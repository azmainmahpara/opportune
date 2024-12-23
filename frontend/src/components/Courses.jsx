import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { setCourses } from '../redux/courseSlice'
import { COURSE_API_END_POINT } from '../utils/constant'
import Course from './Course'
import Navbar from './shared/Navbar'

const Courses = ({ isAdmin = false }) => {
    const { courses } = useSelector(store => store.course);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get(
                    isAdmin ? 
                    `${COURSE_API_END_POINT}/getadmincourses` : 
                    `${COURSE_API_END_POINT}/get`,
                    { withCredentials: true }
                );
                if (res.data.success) {
                    dispatch(setCourses(res.data.courses));
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Error fetching courses");
            }
        }
        fetchCourses();
    }, [dispatch, isAdmin]);

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>
                        {isAdmin ? 'Manage Courses' : 'Available Courses'}
                    </h1>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {courses?.map((course) => (
                        <Course 
                            key={course._id} 
                            course={course} 
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
                {courses?.length === 0 && (
                    <div className='text-center py-10'>
                        <p className='text-gray-500'>No courses available</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Courses 