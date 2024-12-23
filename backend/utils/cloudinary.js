import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});

// Function to upload profile photos
export const uploadProfilePhoto = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'profile_photos',
            resource_type: 'image'
        });
        
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Profile photo upload failed');
    }
};

// Add this function to handle chat file uploads
export const uploadChatFile = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'chat_files',
            resource_type: 'auto'
        });
        
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('File upload failed');
    }
};

// New function for resume uploads
export const uploadResume = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'resumes',
            resource_type: 'raw',
            allowed_formats: ['pdf', 'docx', 'doc'],
        });
        
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        console.error('Resume upload error:', error);
        throw new Error('Resume upload failed');
    }
};

// Add this function for course-related uploads
export const uploadCourseFile = async (file) => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64');
        let dataURI;
        let uploadOptions;

        // Check if the file is an image
        if (file.mimetype.startsWith('image/')) {
            dataURI = `data:${file.mimetype};base64,${b64}`;
            uploadOptions = {
                folder: 'course_files',
                resource_type: 'image'
            };
        } else {
            // For non-image files (PDF, DOCX, etc.)
            dataURI = `data:${file.mimetype};base64,${b64}`;
            uploadOptions = {
                folder: 'course_files',
                resource_type: 'raw',
                format: file.originalname.split('.').pop() // preserve file extension
            };
        }
        
        const result = await cloudinary.uploader.upload(dataURI, uploadOptions);
        
        return {
            public_id: result.public_id,
            url: result.secure_url,
            name: file.originalname,
            type: file.mimetype
        };
    } catch (error) {
        console.error('Course file upload error:', error);
        throw new Error('Course file upload failed');
    }
};

export default cloudinary;