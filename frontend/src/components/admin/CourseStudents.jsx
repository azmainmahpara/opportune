import { COURSE_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

const CourseStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get(`${COURSE_API_END_POINT}/students/${id}`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    setStudents(res.data.enrollments);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Error fetching students");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [id]);

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="max-w-6xl mx-auto my-10 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className='max-w-6xl mx-auto my-10'>
                <h2 className="text-2xl font-bold mb-6">Enrolled Students</h2>
                <Table>
                    <TableCaption>A list of enrolled students</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Student Name</TableHead>
                            <TableHead className="w-[250px]">Email</TableHead>
                            <TableHead>Enrollment Date</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    No students enrolled yet
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((enrollment) => (
                                <TableRow key={enrollment._id}>
                                    <TableCell className="font-medium">
                                        {enrollment.student?.fullname || 'N/A'}
                                    </TableCell>
                                    <TableCell>{enrollment.student?.email || 'N/A'}</TableCell>
                                    <TableCell>
                                        {enrollment.enrollmentDate 
                                            ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>{enrollment.progress || 0}%</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={
                                                enrollment.status === 'completed' ? 'success' :
                                                enrollment.status === 'dropped' ? 'destructive' :
                                                'default'
                                            }
                                        >
                                            {enrollment.status || 'active'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default CourseStudents 