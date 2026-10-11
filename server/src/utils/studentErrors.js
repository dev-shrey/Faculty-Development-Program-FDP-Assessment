export function getStudentWriteError(error, mongoose) {
  if (error.code === 11000) {
    return { status: 409, message: "A student with this email already exists" };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const studentFields = ["name", "email", "course", "status"];
    const errorFields = Object.keys(error.errors);
    const fields = [
      ...studentFields.filter((field) => errorFields.includes(field)),
      ...errorFields.filter((field) => !studentFields.includes(field)).sort(),
    ];
    return { status: 400, message: `Please provide valid values for: ${fields.join(", ")}` };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { status: 400, message: "One or more student values are invalid" };
  }

  return { status: 500, message: "Unable to save student" };
}