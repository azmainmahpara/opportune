import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useGetAllAdminCourses from '../../hooks/useGetAllAdminCourses';
import Course from '../Course';
import Navbar from '../shared/Navbar';

const AdminCourses = () => {
    const { adminCourses } = useSelector(store => store.course);
    const navigate = useNavigate();
    
    // Use the hook to fetch admin courses
    useGetAllAdminCourses();

    return (
        <div className='min-h-screen bg-gray-50'>
            <Navbar />
            <div className='max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center mb-6'>
                    <h1 className='text-2xl font-bold text-gray-900'>Manage Courses</h1>
                    <button 
                        onClick={() => navigate('/admin/courses/create')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Create Course
                    </button>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {adminCourses?.map((course) => (
                        <Course 
                            key={course._id} 
                            course={course} 
                            isAdmin={true}
                        />
                    ))}
                </div>
                {adminCourses?.length === 0 && (
                    <div className='text-center py-10'>
                        <p className='text-gray-500'>No courses available</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses; 