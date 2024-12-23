import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    courses: [],
    singleCourse: null,
    adminCourses: [],
};

const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {
        setCourses: (state, action) => {
            state.courses = action.payload;
        },
        setSingleCourse: (state, action) => {
            state.singleCourse = action.payload;
        },
        setAllAdminCourses: (state, action) => {
            state.adminCourses = action.payload;
        },
        clearCourses: (state) => {
            state.courses = [];
            state.singleCourse = null;
            state.adminCourses = [];
        },
        // Add any other course-related actions here
    },
});

export const { setCourses, setSingleCourse, setAllAdminCourses, clearCourses } = courseSlice.actions;
export default courseSlice.reducer; 