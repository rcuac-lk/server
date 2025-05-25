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

exports.addStudent = (req, res) => {
  const { admissionNumber, firstName, lastName, dateOfBirth, parentId } = req.body;

  //check for existing student
  
  const student = async() => await Student.findOne({ where: { AdmissionNumber: admissionNumber } });
  if (student) {
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