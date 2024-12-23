import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux'; // Import useSelector
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input'; // Import Input component
import { Label } from '../ui/label'; // Import Label component
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'; // Import Select components

const EditJob = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState({
        title: '',
        description: '',
        requirements: '',
        salary: '',
        location: '',
        jobType: '',
        experienceLevel: '',
        position: '',
        company: ''
    });

    // Fetch companies from Redux store
    const { companies } = useSelector((store) => store.company);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await axios.get(`/api/v1/job/get/${id}`);
                setJob(response.data.job);
            } catch (error) {
                console.error('Error fetching job:', error);
                toast.error('Failed to load job details');
            }
        };

        fetchJob();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJob((prevJob) => ({
            ...prevJob,
            [name]: value
        }));
    };

    const handleCompanyChange = (value) => {
        setJob((prevJob) => ({
            ...prevJob,
            company: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/v1/job/edit/${id}`, job);
            if (response.data.success) {
                toast.success('Job updated successfully');
                navigate('/admin/jobs');
            }
        } catch (error) {
            console.error('Error updating job:', error);
            toast.error('Failed to update job');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <Navbar />
            <div className="max-w-xl mx-auto my-10"> {/* Center the form container */}
                <div className="flex items-center gap-5 p-8"> {/* Reduced margin */}
                <Button onClick={() => navigate("/admin/jobs")} variant="outline" className="flex items-center gap-2 text-gray-500 font-semibold">
                        <ArrowLeft />
                        <span>Back</span>
                    </Button>
                    <h1 className="text-xl font-bold">Edit Job</h1>
                </div>
                <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={job.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={job.description}
                                onChange={handleChange}
                                className="border rounded w-full py-2 px-3"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Requirements</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={job.requirements}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Salary</Label>
                            <Input
                                type="number"
                                name="salary"
                                value={job.salary}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={job.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Job Type</Label>
                            <Input
                                type="text"
                                name="jobType"
                                value={job.jobType}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>Experience Level</Label>
                            <Input
                                type="number"
                                name="experienceLevel"
                                value={job.experienceLevel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Label>No of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={job.position}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <Select onValueChange={handleCompanyChange} value={job.company}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a Company" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {companies.map((company) => (
                                            <SelectItem key={company._id} value={company._id}>
                                                {company.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex justify-center mt-4"> {/* Added margin-top for spacing */}
                            <button type="submit" className="bg-black text-white px-4 py-2 rounded">
                                Update Job
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditJob;