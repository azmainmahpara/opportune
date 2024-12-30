import { setLoading } from '@/redux/authSlice'
import { USER_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { RadioGroup } from '../ui/radio-group'

const Signup = () => {

    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: null
    });
    const { loading, user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [passwordStrength, setPasswordStrength] = useState("");

    const checkPasswordStrength = (password) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const mediumPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

        if (strongPasswordRegex.test(password)) {
            setPasswordStrength("Strong");
        } else if (mediumPasswordRegex.test(password)) {
            setPasswordStrength("Medium");
        } else {
            setPasswordStrength("Weak");
        }
    }

    const changeEventHandler = (e) => {
        const { name, value } = e.target;
        setInput({ ...input, [name]: value });
        if (name === "password") {
            checkPasswordStrength(value);
        }
    }
    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }
    const submitHandler = async (e) => {
        e.preventDefault();

        // Check password strength before proceeding
        if (passwordStrength !== "Strong") {
            toast.error("Your password must be strong (at least 8 characters, including uppercase, lowercase, numbers, and special characters).");
            return; // Prevent form submission
        }

        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) {
            formData.append("profilePhoto", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });
            if (res && res.data.success) {
                toast.success(res.data.message);
                navigate("/login");
                setInput({
                    fullname: "",
                    email: "",
                    phoneNumber: "",
                    password: "",
                    role: "",
                    file: null
                });
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An error occurred during signup");
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [])

    return (
        <div style={{ 
            backgroundImage: 'url(/images/bg.jpg)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            minHeight: '100vh' 
        }}>
            <Navbar />
            
            {/* Logo at the top */}
            <div className='flex justify-center mt-10'>
                <img src="/images/logo.png" alt="Logo" className="h-16 w-auto" />
            </div>
    
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-6 my-10 shadow-lg bg-white bg-opacity-90'>
                    <h1 className='font-bold text-2xl text-center mb-8'>Sign Up</h1>
                    
                    <div className='my-4'>
                        <Label>Full Name <span className="text-red-500">*</span></Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            required
                            placeholder="John Doe"
                        />
                    </div>
    
                    <div className='my-4'>
                        <Label>Email <span className="text-red-500">*</span></Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            required
                            placeholder="john.doe@example.com"
                        />
                    </div>
    
                    <div className='my-4'>
                        <Label>Phone Number <span className="text-red-500">*</span></Label>
                        <Input
                            type="text"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            required
                            placeholder="01234567890"
                        />
                    </div>
    
                    <div className='my-4'>
                        <Label>Password <span className="text-red-500">*</span></Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            required
                            placeholder="P@ssw0rd!2023"
                        />
                        <p className={`text-sm ${passwordStrength === "Strong" ? "text-green-500" : passwordStrength === "Medium" ? "text-yellow-500" : "text-red-500"}`}>
                            Password Strength: {passwordStrength}
                        </p>
                    </div>
    
                    <div className='flex items-center justify-between'>
                        <RadioGroup className="flex items-center gap-4 my-5">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                />
                                <Label>Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                />
                                <Label>Recruiter</Label>
                            </div>
                        </RadioGroup>
                        
                        <div className='flex items-center gap-2'>
                            <Label>Profile</Label>
                            <Input
                                accept="image/*"
                                type="file"
                                onChange={changeFileHandler}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
    
                    {
                        loading ? (
                            <Button className="w-full my-4 bg-blue-500 hover:bg-blue-600">
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4 bg-blue-500 hover:bg-blue-600">Signup</Button>
                        )
                    }
    
                    <p className='text-sm text-center'>
                        Already have an account? <Link to="/login" className='text-blue-600 hover:underline'>Login</Link>
                    </p>
                </form>
            </div>
        </div>
    )
    
}

export default Signup
