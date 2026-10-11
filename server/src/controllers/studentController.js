import mongoose from "mongoose";
import Student from "../models/Student.js";
import { buildStudentQuery, StudentQueryError } from "../utils/studentQuery.js";
import { getStudentWriteError } from "../utils/studentErrors.js";

function sendWriteError(error, res) {
  const result = getStudentWriteError(error, mongoose);
  if (result.status === 500) {
    console.error("Unable to save student:", error.message);
  }
  return res.status(result.status).json({ success: false, message: result.message });
}

export async function listStudents(req, res) {
  try {
    const { filter, page, pageSize } = buildStudentQuery(req.query);
    const query = {};

    if (filter.status) {
      query.status = filter.status;
    }

    if (filter.search) {
      const searchPattern = filter.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { name: { $regex: searchPattern, $options: "i" } },
        { email: { $regex: searchPattern, $options: "i" } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(query).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
      Student.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: students,
      pagination: { page, pageSize, total, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    if (error instanceof StudentQueryError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Unable to load students:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load students" });
  }
}

export async function createStudent(req, res) {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Student data must be a JSON object" });
    }
    const student = await Student.create(req.body);
    return res.status(201).json({ success: true, data: student });
  } catch (error) {
    return sendWriteError(error, res);
  }
}

export async function updateStudent(req, res) {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ success: false, message: "Student data must be a JSON object" });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: "query",
    });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({ success: true, data: student });
  } catch (error) {
    return sendWriteError(error, res);
  }
}