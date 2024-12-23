import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    },
    thumbnail: {
        public_id: String,
        url: String
    },
    resources: [{
        public_id: {
            type: String
        },
        url: {
            type: String
        },
        name: {
            type: String
        },
        type: {
            type: String
        }
    }],
    videoLink: {
        type: String,
        default: ""
    },
    resourceLink: {
        type: String,
        default: ""
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrollments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enrollment'
    }]
}, { timestamps: true });

export const Course = mongoose.model("Course", courseSchema); 