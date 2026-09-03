const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const Student = require("./models/Student");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const URI = "mongodb+srv://NguyenVanTien:Tien123456789@cluster0.odfms6y.mongodb.net/cloud_lab?retryWrites=true&w=majority";

mongoose.connect(URI)
    .then(() => console.log('Đã kết nối thành công với MongoDB Atlas!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));
app.get("/api/hello", (req, res) => {
    res.json({ message: "Backend is running!" });
});

const PORT = process.env.PORT || 5000;
// GET - Lấy danh sách sinh viên
app.get("/api/students", async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({
            message: "Lỗi khi lấy danh sách sinh viên",
            error: error.message
        });
    }
});
// POST - Thêm sinh viên
app.post("/api/students", async (req, res) => {
    try {
        const student = await Student.create(req.body);
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({
            message: "Lỗi khi thêm sinh viên",
            error: error.message
        });
    }
});
app.put("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json(student);
    } catch (error) {
        res.status(400).json({
            message: "Lỗi khi cập nhật sinh viên",
            error: error.message
        });
    }
});
app.delete("/api/students/:id", async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Không tìm thấy sinh viên"
            });
        }

        res.json({
            message: "Xóa sinh viên thành công",
            student: student
        });
    } catch (error) {
        res.status(400).json({
            message: "Lỗi khi xóa sinh viên",
            error: error.message
        });
    }
});
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Atlas connected successfully");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });