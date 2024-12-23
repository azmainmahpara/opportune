import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { setAllAdminCourses } from '../redux/courseSlice';
import { COURSE_API_END_POINT } from '../utils/constant';

const useGetAllAdminCourses = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const getAllAdminCourses = async () => {
            try {
                const res = await axios.get(`${COURSE_API_END_POINT}/getadmincourses`, {
                    withCredentials: true
                });
                if (res.data.success) {
                    dispatch(setAllAdminCourses(res.data.courses));
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Error fetching admin courses");
            }
        };

        getAllAdminCourses();
    }, [dispatch]);
};

export default useGetAllAdminCourses; 