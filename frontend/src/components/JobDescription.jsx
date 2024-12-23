import { setSingleJob } from '@/redux/jobSlice';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import { Avatar, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });

            if (res.data.success) {
                setIsApplied(true);
                const updatedSingleJob = {
                    ...singleJob,
                    applications: [...singleJob.applications, { applicant: user?._id }]
                };
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    };

    useEffect(() => {
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(
                        res.data.job.applications.some(
                            application => application.applicant === user?._id
                        )
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchSingleJob();
    }, [jobId, dispatch, user?._id]);

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10 px-6'>
                <div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
                    <div className='flex items-start'>
                        <Button className="p-8" variant="outline" size="icon">
                            <Avatar>
                                <AvatarImage 
                                    src={singleJob?.company?.logo} 
                                    alt={`${singleJob?.company?.name} Logo`} 
                                />
                            </Avatar>
                        </Button>
                        <div className='ml-4'>
                            <p className='text-lg text-blue-600'>{singleJob?.company?.name || 'Unknown Company'}</p>
                            <p className='text-sm text-gray-500'>{singleJob?.company?.location || 'Location not specified'}</p>
                            <p className='text-sm text-gray-500'>{singleJob?.jobType || 'Job Type not specified'}</p>
                        </div>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-4 mt-4'>
                        <Badge className='text-blue-700 bg-blue-100 font-bold' variant="ghost">
                            {singleJob?.position} Positions
                        </Badge>
                        <Badge className='text-red-600 bg-red-100 font-bold' variant="ghost">
                            {singleJob?.jobType}
                        </Badge>
                        <Badge className='text-purple-700 bg-purple-100 font-bold' variant="ghost">
                            {singleJob?.salary} RM
                        </Badge>
                    </div>

                    <Button
                        onClick={isApplied ? null : applyJobHandler}
                        disabled={isApplied}
                        className={`mt-4 rounded-xl text-white px-6 py-3 transition-all ${
                            isApplied ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                        }`}>
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>

                    {/* Description Section */}
                    <div className='mt-10'>
                        <h2 className='text-xl font-semibold border-b pb-3 border-gray-300'>Job Details</h2>
                        <div className='mt-6 grid grid-cols-2 gap-6'>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Role</h3>
                                <p className='text-gray-600'>{singleJob?.title}</p>
                            </div>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Location</h3>
                                <p className='text-gray-600'>{singleJob?.location || 'Not specified'}</p>
                            </div>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Experience Required</h3>
                                <p className='text-gray-600'>{singleJob?.experience} yrs</p>
                            </div>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Salary</h3>
                                <p className='text-gray-600'>{singleJob?.salary} RM</p>
                            </div>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Total Applicants</h3>
                                <p className='text-gray-600'>{singleJob?.applications?.length}</p>
                            </div>
                            <div>
                                <h3 className='font-semibold text-gray-700'>Posted Date</h3>
                                <p className='text-gray-600'>
                                    {singleJob?.createdAt?.split('T')[0] || 'N/A'}
                                </p>
                            </div>
                            <div className='col-span-2'>
                                <h3 className='font-semibold text-gray-700'>Job Description</h3>
                                <p className='text-gray-600 mt-2 leading-relaxed'>{singleJob?.description}</p>
                            </div>
                        </div>
                        
                        {/* Recruiter Information */}
                        <div className='mt-6'>
                            <h2 className='text-xl font-semibold border-b pb-3 border-gray-300'>Recruiter Information</h2>
                            <p className='font-semibold text-gray-700'>Name: {singleJob?.created_by?.fullname || 'N/A'}</p>
                            <p className='font-semibold text-gray-700'>Email: {singleJob?.created_by?.email || 'N/A'}</p>
                            <p className='font-semibold text-gray-700'>Phone: {singleJob?.created_by?.phoneNumber || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDescription;
