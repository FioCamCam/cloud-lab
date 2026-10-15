const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ================================
// CẤU HÌNH PORT
// ================================
const PORT = process.env.PORT || 5000;

// ================================
// CẤU HÌNH CORS
// ================================
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Cho phép request không có origin
            // Ví dụ: curl, Postman
            if (!origin) {
                return callback(null, true);
            }

            // Cho phép các origin đã cấu hình
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Trong quá trình học có thể cho phép tạm thời
            callback(null, true);
        },
        credentials: true
    })
);

// ================================
// MIDDLEWARE
// ================================
app.use(express.json());

// ================================
// ROUTE KIỂM TRA SERVER
// ================================
app.get('/', (req, res) => {
    res.json({
        message: 'MERN Backend is running!'
    });
});

// ================================
// API HELLO
// ================================
app.get('/api/hello', (req, res) => {
    res.json({
        message: 'Backend is running!'
    });
});

// ================================
// MODEL STUDENT
// ================================
const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model('Student', studentSchema);

// ================================
// GET - LẤY DANH SÁCH SINH VIÊN
// ================================
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });

        res.status(200).json(students);
    } catch (error) {
        console.error('GET /api/students error:', error);

        res.status(500).json({
            message: 'Không thể lấy danh sách sinh viên',
            error: error.message
        });
    }
});

// ================================
// GET - LẤY 1 SINH VIÊN
// ================================
app.get('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findOne({
            studentId: req.params.id
        });

        if (!student) {
            return res.status(404).json({
                message: 'Không tìm thấy sinh viên'
            });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error('GET /api/students/:id error:', error);

        res.status(500).json({
            message: 'Lỗi khi lấy thông tin sinh viên',
            error: error.message
        });
    }
});

// ================================
// POST - THÊM SINH VIÊN
// ================================
app.post('/api/students', async (req, res) => {
    try {
        const { studentId, name, email } = req.body;

        // Kiểm tra dữ liệu
        if (!studentId || !name || !email) {
            return res.status(400).json({
                message: 'Vui lòng nhập đầy đủ MSSV, họ tên và email'
            });
        }

        // Kiểm tra MSSV đã tồn tại
        const existingStudent = await Student.findOne({
            studentId: studentId
        });

        if (existingStudent) {
            return res.status(409).json({
                message: 'MSSV đã tồn tại'
            });
        }

        // Tạo sinh viên mới
        const student = new Student({
            studentId,
            name,
            email
        });

        const savedStudent = await student.save();

        res.status(201).json(savedStudent);
    } catch (error) {
        console.error('POST /api/students error:', error);

        res.status(500).json({
            message: 'Không thể thêm sinh viên',
            error: error.message
        });
    }
});

// ================================
// PUT - CẬP NHẬT SINH VIÊN
// ================================
app.put('/api/students/:id', async (req, res) => {
    try {
        const { name, email } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: 'Không tìm thấy sinh viên'
            });
        }

        res.status(200).json(student);

    } catch (error) {
        console.error('PUT /api/students/:id error:', error);

        res.status(500).json({
            message: 'Không thể cập nhật sinh viên',
            error: error.message
        });
    }
});

// ================================
// DELETE - XÓA SINH VIÊN
// ================================
app.delete('/api/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: 'Không tìm thấy sinh viên'
            });
        }

        res.status(200).json({
            message: 'Xóa sinh viên thành công',
            student: student
        });

    } catch (error) {
        console.error('DELETE /api/students/:id error:', error);

        res.status(500).json({
            message: 'Không thể xóa sinh viên',
            error: error.message
        });
    }
});

// ================================
// HEALTH CHECK
// ================================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ================================
// KHỞI ĐỘNG SERVER
// ================================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT} - Buoi 6`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
// ================================
// KẾT NỐI MONGODB ATLAS
// ================================
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined!');
} else {
    mongoose
        .connect(MONGODB_URI)
        .then(() => {
            console.log('Đã kết nối thành công với MongoDB Atlas!');
        })
        .catch((error) => {
            console.error(
                'MongoDB connection error:',
                error.message
            );
        });
}

// ================================
// XỬ LÝ LỖI
// ================================
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});