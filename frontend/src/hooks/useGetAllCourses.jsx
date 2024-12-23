import { setAllCourses } from '@/redux/courseSlice'
import { COURSE_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const useGetAllCourses = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.course);
    
    useEffect(()=>{
        const fetchAllCourses = async () => {
            try {
                const res = await axios.get(
                    `${COURSE_API_END_POINT}/get?keyword=${searchedQuery}`,
                    {withCredentials:true}
                );
                if(res.data.success){
                    dispatch(setAllCourses(res.data.courses));
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response?.data?.message || "Error fetching courses");
            }
        }
        fetchAllCourses();
    },[searchedQuery])
}

export default useGetAllCourses 