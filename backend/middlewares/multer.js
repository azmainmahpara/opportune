import multer from "multer";

const fileFilter = (req, file, cb) => {
    // For course routes
    if (req.originalUrl.includes('/course')) {
        // For course thumbnails
        if (file.fieldname === 'thumbnail') {
            if (file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only images are allowed for thumbnails.'), false);
            }
        }
        // For course resources
        else if (file.fieldname === 'resources') {
            if (
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.mimetype === 'application/msword'
            ) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF and DOCX files are allowed for resources.'), false);
            }
        } else {
            cb(new Error('Invalid field name for course files.'), false);
        }
    }
    // For profile/resume uploads
    else if (req.originalUrl.includes('/profile')) {
        if (
            file.fieldname === 'file' || // Resume
            file.fieldname === 'profilePhoto' // Profile photo
        ) {
            if (
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.mimetype.startsWith('image/')
            ) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF, DOCX, JPEG, PNG, and GIF files are allowed for profile uploads.'), false);
            }
        } else {
            cb(new Error('Invalid field name for profile files.'), false);
        }
    }
    // For other uploads (general uploads)
    else {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'), false);
        }
    }
};

const storage = multer.memoryStorage();

export const singleUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single("file");

// Define courseUpload for course-related uploads
export const courseUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for course files
    }
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'resources', maxCount: 5 }  // Allow up to 5 resource files
]);

// Define profileUpload for profile-related uploads
export const profileUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).fields([
    { name: 'file', maxCount: 1 }, // Resume
    { name: 'profilePhoto', maxCount: 1 } // Profile photo
]);