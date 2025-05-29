const db = require('../models');
const User = db.user;
const Student = db.student;
const { Op, Sequelize } = require("sequelize");

exports.getUser = (req, res) => {
  User.findByPk(req.params.id, { attributes: { exclude: ["Password"] } })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.searchUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let where = { Approved: true, Active: true }; // Ensure only approved users are returned

    // Apply search filter
    if (search) {
      where[Op.or] = [
        { FirstName: { [Op.like]: `%${search}%` } },
        { LastName: { [Op.like]: `%${search}%` } },
      ];
    }

    // Apply role filter if provided
    if (role) {
      where.Role = role;
    }

    // Fetch filtered users
    const users = await User.findAll({ where, attributes: { exclude: ["Password"] } });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addStudent = async (req, res) => {
  const { admissionNumber, firstName, lastName, dateOfBirth, parentId } = req.body;

  //check for existing student
  const existingStudent = await Student.findOne({ where: { AdmissionNumber: admissionNumber } });
  if (existingStudent) {
    return res.status(400).json({ message: "Student already exists" });
  }

  Student.create({
    AdmissionNumber: admissionNumber,
    FirstName: firstName,
    LastName: lastName,
    DOB: dateOfBirth,
    ParentID: parentId,
    Active: true,
    Approved: false
  })
    .then(student => {
      res.status(200).json(student);
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });
};

exports.getStudents = (req, res) => {
  Student.findAll({ where: { ParentID: req.params.id, Active: true } })
    .then(students => {
      res.status(200).json(students);
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });
};

function calculateAgeCategory(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age <= 10) return "Under 11";
  if (age <= 12) return "Under 13";
  if (age <= 14) return "Under 15";
  if (age <= 16) return "Under 17";
  if (age <= 18) return "Under 19";
}

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const { admissionNumber, firstName, lastName, dateOfBirth } = req.body;

    // Input validation
    if (!id || !admissionNumber || !firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        message: "Required fields are missing",
        required: ["id", "admissionNumber", "firstName", "lastName", "dateOfBirth"]
      });
    }

    // Find student
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Check if admission number is already taken by another student
    if (admissionNumber !== student.AdmissionNumber) {
      const existingStudent = await Student.findOne({
        where: { 
          AdmissionNumber: admissionNumber,
          StudentID: { [Op.ne]: id } // Exclude current student
        }
      });
      if (existingStudent) {
        return res.status(400).json({
          message: "Admission number is already in use"
        });
      }
    }

    // Validate age (must be below 19)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age >= 19) {
      return res.status(400).json({
        message: "Student must be below 19 years old"
      });
    }

    // Update student fields
    const updates = {
      AdmissionNumber: String(admissionNumber).trim(),
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      DOB: dateOfBirth,
      Approved: false
    };

    // Update student
    await student.update(updates);

    // Fetch updated student data
    const updatedStudent = await Student.findByPk(id);
    const ageCategory = calculateAgeCategory(updatedStudent.DOB);

    // Prepare response
    const responseData = {
      ...updatedStudent.toJSON(),
      AgeCategory: ageCategory
    };

    // Send success response
    res.status(200).json({
      message: "Student profile updated successfully",
      student: responseData
    });

  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({
      message: "Failed to update student profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};