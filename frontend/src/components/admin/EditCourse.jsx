import { COURSE_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

const EditCourse = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        instructor: "",
        price: "",
        duration: "",
        level: "",
        videoLink: "",
        resourceLink: ""
    });
    const [thumbnail, setThumbnail] = useState(null);
    const [currentThumbnail, setCurrentThumbnail] = useState(null);
    const [resources, setResources] = useState([]);
    const [currentResources, setCurrentResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`${COURSE_API_END_POINT}/get/${id}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    const course = res.data.course;
                    setInput({
                        title: course.title,
                        description: course.description,
                        instructor: course.instructor,
                        price: course.price,
                        duration: course.duration,
                        level: course.level,
                        videoLink: course.videoLink || "",
                        resourceLink: course.resourceLink || ""
                    });
                    if (course.thumbnail) {
                        setCurrentThumbnail(course.thumbnail);
                    }
                    if (course.resources) {
                        setCurrentResources(course.resources);
                    }
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error fetching course");
            }
        };
        fetchCourse();
    }, [id]);

    const handleFileChange = (e, type) => {
        if (type === 'thumbnail') {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                setThumbnail(file);
            } else {
                toast.error('Please select an image file');
            }
        } else if (type === 'resources') {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => 
                file.type === 'application/pdf' || 
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
            if (validFiles.length !== files.length) {
                toast.error('Some files were not added. Only PDF and DOC files are allowed');
            }
            setResources(prev => [...prev, ...validFiles]);
        }
    };

    const removeResource = (index, isCurrentResource = false) => {
        if (isCurrentResource) {
            setCurrentResources(prev => prev.filter((_, i) => i !== index));
        } else {
            setResources(prev => prev.filter((_, i) => i !== index));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const formData = new FormData();
            
            // Add text fields
            Object.keys(input).forEach(key => {
                if (input[key]) {
                    formData.append(key, input[key]);
                }
            });

            // Add thumbnail if changed
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            // Add new resources
            resources.forEach(file => {
                formData.append('resources', file);
            });

            // Add current resources that weren't removed
            formData.append('currentResources', JSON.stringify(currentResources));

            const res = await axios.put(`${COURSE_API_END_POINT}/update/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/courses");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Error updating course");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-2'>
                        <div>
                            <Label>Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={(e) => setInput({ ...input, title: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <Textarea
                                name="description"
                                value={input.description}
                                onChange={(e) => setInput({ ...input, description: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Instructor</Label>
                            <Input
                                type="text"
                                name="instructor"
                                value={input.instructor}
                                onChange={(e) => setInput({ ...input, instructor: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Price (RM)</Label>
                            <Input
                                type="number"
                                name="price"
                                value={input.price}
                                onChange={(e) => setInput({ ...input, price: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Duration</Label>
                            <Input
                                type="text"
                                name="duration"
                                value={input.duration}
                                onChange={(e) => setInput({ ...input, duration: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>
                        <div>
                            <Label>Level</Label>
                            <Input
                                type="text"
                                name="level"
                                value={input.level}
                                onChange={(e) => setInput({ ...input, level: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                            />
                        </div>

                        {/* Video Link */}
                        <div className="col-span-2">
                            <Label>Video Link (Optional)</Label>
                            <Input
                                type="url"
                                name="videoLink"
                                value={input.videoLink}
                                onChange={(e) => setInput({ ...input, videoLink: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                placeholder="e.g., YouTube or Vimeo link"
                            />
                        </div>

                        {/* Resource Link */}
                        <div className="col-span-2">
                            <Label>Additional Resource Link (Optional)</Label>
                            <Input
                                type="url"
                                name="resourceLink"
                                value={input.resourceLink}
                                onChange={(e) => setInput({ ...input, resourceLink: e.target.value })}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                placeholder="e.g., Google Drive or other resource link"
                            />
                        </div>

                        {/* Thumbnail */}
                        <div className="col-span-2 my-4">
                            <Label>Course Thumbnail</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                                    className="focus-visible:ring-offset-0 focus-visible:ring-0"
                                />
                                {thumbnail ? (
                                    <img 
                                        src={URL.createObjectURL(thumbnail)} 
                                        alt="New thumbnail" 
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                ) : currentThumbnail?.url && (
                                    <img 
                                        src={currentThumbnail.url} 
                                        alt="Current thumbnail" 
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="col-span-2 my-4">
                            <Label>Course Resources (PDF, DOC)</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'resources')}
                                    className="focus-visible:ring-offset-0 focus-visible:ring-0"
                                />
                            </div>
                            
                            {/* Current Resources */}
                            {currentResources.length > 0 && (
                                <div className="mt-4">
                                    <Label>Current Resources</Label>
                                    {currentResources.map((resource, index) => (
                                        <div key={index} className="flex items-center gap-2 mt-2">
                                            <span>{resource.name}</span>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => removeResource(index, true)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Resources */}
                            {resources.length > 0 && (
                                <div className="mt-4">
                                    <Label>New Resources</Label>
                                    {resources.map((file, index) => (
                                        <div key={index} className="flex items-center gap-2 mt-2">
                                            <span>{file.name}</span>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => removeResource(index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <Button disabled className="w-full my-4">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 
                            Updating Course...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">
                            Update Course
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default EditCourse 