import { COURSE_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

const CreateCourse = () => {
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
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    const removeResource = (index) => {
        setResources(prev => prev.filter((_, i) => i !== index));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const formData = new FormData();
            
            // Add text fields
            Object.keys(input).forEach(key => {
                if (input[key]) { // Only add if value exists
                    formData.append(key, input[key]);
                }
            });

            // Add thumbnail
            if (thumbnail) {
                formData.append('thumbnail', thumbnail);
            }

            // Add resources
            resources.forEach(file => {
                formData.append('resources', file);
            });

            console.log('FormData contents:');
            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            const res = await axios.post(`${COURSE_API_END_POINT}/create`, formData, {
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
            console.error('Error:', error);
            toast.error(error.response?.data?.message || "Error creating course");
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
                                placeholder="e.g., 8 weeks"
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
                                placeholder="e.g., Beginner, Intermediate, Advanced"
                            />
                        </div>
                        <div className="col-span-2 my-4">
                            <Label>Course Thumbnail</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                                    className="focus-visible:ring-offset-0 focus-visible:ring-0"
                                />
                                {thumbnail && (
                                    <img 
                                        src={URL.createObjectURL(thumbnail)} 
                                        alt="Preview" 
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                )}
                            </div>
                        </div>
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
                            <div className="mt-2">
                                {resources.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2">
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
                        </div>
                        <div className="col-span-2 my-4">
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
                        <div className="col-span-2 my-4">
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
                    </div>
                    {loading ? (
                        <Button disabled className="w-full my-4">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 
                            Uploading...
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">
                            Create Course
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}

export default CreateCourse 