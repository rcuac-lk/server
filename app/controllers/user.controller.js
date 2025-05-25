const db = require('../models');
const User = db.user;
const AgeCategory = db.ageCategory;
const Session = db.session;
const EventType = db.event;
const Distance = db.distance;
const Attendance = db.attendance;
const Student = db.student;
const { Op, Sequelize } = require("sequelize");
// exports.allAccess = (req, res) => {
//   res.status(200).send("Public Content.");
// };

// exports.userBoard = (req, res) => {
//   res.status(200).send("User Content.");
// };

// exports.adminBoard = (req, res) => {
//   res.status(200).send("Admin Content.");
// };

// exports.moderatorBoard = (req, res) => {
//   res.status(200).send("Moderator Content.");
// };

exports.notApprovedUsers = (req, res) => {
  User.findAll({ where: { Approved: false, Active: true }, attributes: { exclude: ["Password"] } })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.approvedUsers = (req, res) => {
  User.findAll({ where: { Approved: true, Active: true }, attributes: { exclude: ["Password"] } })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.approveUser = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      user.Approved = true;

      user.save()
        .then(() => {
          res.status(200).send({ message: "User approved successfully!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.deactivateUser = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      user.Active = false;

      user.save()
        .then(() => {
          res.status(200).send({ message: "User deactivated successfully!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getAllUsers = (req, res) => {
  User.findAll({ where: { Active: true }, attributes: { exclude: ["Password"] } })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

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

exports.updateAdmin = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      user.Role = "Admin";

      user.save()
        .then(() => {
          res.status(200).send({ message: "User updated successfully!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { FirstName, LastName, Email, Role } = req.body;

    // Input validation
    if (!FirstName || !LastName || !Email) {
      return res.status(400).json({
        message: "Required fields are missing",
        required: ["FirstName", "LastName", "Email"]
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Check if email is already taken by another user
    if (Email !== user.Email) {
      const existingUser = await User.findOne({
        where: { Email }
      });
      if (existingUser) {
        return res.status(400).json({
          message: "Email is already in use"
        });
      }
    }

    // Update user fields
    const updates = {
      FirstName: FirstName.trim(),
      LastName: LastName.trim(),
      Email: Email.trim()
    };

    // Only update role if provided and different
    if (Role && Role !== user.Role) {
      updates.Role = Role;
      if (Role === "Admin") {
        // TODO: Implement email notification
        console.log(`Role updated to Admin for user: ${Email}`);
      }
    }

    // Update user
    await user.update(updates);

    // Fetch updated user data
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['Password'] }
    });

    // Prepare response
    const responseData = {
      id: updatedUser.UserID,
      firstName: updatedUser.FirstName,
      lastName: updatedUser.LastName,
      email: updatedUser.Email,
      roles: updatedUser.Role,
      approved: updatedUser.Approved
    };

    // Send success response
    res.status(200).json({
      message: "Profile updated successfully",
      user: responseData
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.updatePassword = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      if (user.Password !== req.body.oldPassword) {
        return res.status(400).send({ message: "Incorrect old password." });
      }

      user.Password = req.body.newPassword;

      user.save()
        .then(() => {
          res.status(200).send({ message: "Password updated successfully!" });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
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

exports.getAgeGroups = async (req, res) => {
  try {
    const categories = await AgeCategory.findAll();

    const ageGroups = [
      { name: "All Ages", value: "0" },
      ...categories.map(row => ({
        name: row.category,
        value: row.id
      }))
    ];

    console.log("Age groups:", ageGroups);
    res.json({
      data: ageGroups,
      request: {}
    });
  } catch (err) {
    console.error("Error fetching age categories:", err);
    res.status(500).json({ error: "Failed to fetch age categories" });
  }
}

exports.getSessionData = async (req, res) => {
  try {
    const data = await Session.findAll({
      attributes: ['id', 'sessionName']
    });

    const sessions = data.map((item) => ({
      SessionID: item.id,
      SessionName: item.sessionName,
    }));

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Failed to fetch session data" });
  }
}

exports.getEventTypes = async (req, res) => {
  try {
    const data = await EventType.findAll({
      attributes: ['EventID', 'EventName'],
    });

    const eventTypes = data.map((item) => ({
      EventTypeID: item.EventID,
      EventType: item.EventName,
    }));

    res.status(200).json({ eventTypes });
  } catch (error) {
    console.error("Error fetching event types:", error);
    res.status(500).json({ message: "Failed to fetch event types" });
  }
};

exports.getEventLengths = async (req, res) => {
  try {
    const data = await Distance.findAll({
      attributes: ['id', 'length'],
    });

    const eventLengths = data.map((item) => ({
      EventLengthID: item.id,
      EventLength: `${item.length}m`,
    }));

    res.status(200).json({ eventLengths });
  } catch (error) {
    console.error("Error fetching event lengths:", error);
    res.status(500).json({ message: "Failed to fetch event lengths" });
  }
}

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

exports.getAttendancedata = async (req, res) => {
  try {
    const { date, session, age } = req.query;

    // Check if date or session is invalid or empty
    const isInvalidFilter = !date || !session;

    // Get the age category if age filter is provided
    let ageCategoryFilter = null;
    if (age && age !== "0") {
      const ageCategoryData = await AgeCategory.findOne({
        where: { id: age }
      });
      if (ageCategoryData) {
        ageCategoryFilter = ageCategoryData.category;
      }
    }

    const students = await Student.findAll();
    const response = [];

    for (const student of students) {
      // Calculate age category for the student
      const ageCategory = calculateAgeCategory(student.DOB);
      
      // Skip if age filter is set and doesn't match
      if (ageCategoryFilter && ageCategory !== ageCategoryFilter) {
        continue;
      }

      let attendance = null;
      let present = "";
      if (!isInvalidFilter) {
        // Convert the date to start of day in UTC to avoid timezone issues
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        attendance = await Attendance.findOne({
          where: {
            StudentID: student.StudentID,
            AttendanceDate: {
              [Op.between]: [startOfDay, endOfDay]
            },
            SessionID: session
          },
          order: [['AttendanceID', 'DESC']]
        });
      }
      
      if(attendance){
        if(attendance.Present == 1)
          present = "Present"
        else
          present = "Absent"
      }

      let markedByFullName = "";
      if(attendance){
        const markedByUser = await User.findByPk(attendance.MarkedBy);
        const markedByFirstName = markedByUser.FirstName;
        const markedByLastName = markedByUser.LastName;
        markedByFullName = markedByFirstName + " " + markedByLastName;
      }

      response.push({
        UserID: student.StudentID,
        AdmissionNumber: student.AdmissionNumber,
        LastUpdate: attendance ? present : "",
        LastUpdateBy: attendance ? markedByFullName : "",
        LastUpdateAt: attendance
          ? new Date(attendance.MarkedAt).toLocaleString()
          : "",
        AgeCategory: ageCategory,
        FirstName: student.FirstName,
        LastName: student.LastName,
        bestTiming: student.bestTiming
      });
    }

    res.status(200).json({ attendanceData: response });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Failed to retrieve student data" });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { memberId, date, present, markedBy, session } = req.body;

    if (!memberId || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let presentBool = "";

    if(present === "Present") {
      presentBool = true;
    } else {
      presentBool = false;
    }
    
    const student = await Student.findOne({
      where: { StudentID: memberId }
    });
    if (!student) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    //session needs to check with session table get the session id
    const sessionData = await Session.findOne({
      where: {
        id: session
      }
    });

    if(!sessionData) {
      return res.status(400).json({ message: "Session not found" });
    }

    const sessionId = sessionData.id;

    // Check if attendance already marked
    // const existing = await Attendance.findOne({
    //   where: { StudentID: memberId, AttendanceDate: date, Session: session }
    // });

    // if (existing) {
    //   // Update existing record
    //   existing.Present = present;
    //   existing.MarkedBy = markedBy;
    //   await existing.save();
    // } else {
      // Create new record
      await Attendance.create({
        StudentID: memberId,
        AttendanceDate: date,
        Present: presentBool,
        MarkedBy: markedBy,
        SessionID: sessionId
      });
    // }

    res.status(200).json({ message: "Attendance saved" });
  } catch (error) {
    console.error("Error saving attendance:", error);
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};

exports.markTiming = async(req, res) => {
  try {
    const { studentId, eventId, performanceDate, distanceId, sessionId, time, recordedBy } = req.body;

    if (!studentId || !eventId || !performanceDate || !distanceId || !sessionId || !time || !recordedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate session exists
    const session = await Session.findOne({
      where: { id: sessionId }
    });
    if (!session) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    // Validate event type exists
    const eventType = await EventType.findOne({
      where: { EventID: eventId }
    });
    if (!eventType) {
      return res.status(400).json({ message: "Invalid event type ID" });
    }

    // Validate distance exists
    const distance = await Distance.findOne({
      where: { id: distanceId }
    });
    if (!distance) {
      return res.status(400).json({ message: "Invalid distance ID" });
    }

    // Validate student exists
    const student = await Student.findOne({
      where: { StudentID: studentId }
    });
    if (!student) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    // Create new timing record
    await db.performance.create({
      StudentID: studentId,
      EventID: eventId,
      PerformanceDate: performanceDate,
      DistanceID: distanceId,
      SessionID: sessionId,
      Time: time,
      RecordedBy: recordedBy
    });

    res.status(200).json({ message: "Timing recorded successfully" });
  } catch (error) {
    console.error("Error recording timing:", error);
    res.status(500).json({ message: "Failed to record timing" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({ where: { Active: true } });
    
    // Add age category to each student
    const studentsWithAgeCategory = students.map(student => {
      const ageCategory = calculateAgeCategory(student.DOB);
      return {
        ...student.toJSON(),
        AgeCategory: ageCategory
      };
    });

    res.status(200).json(studentsWithAgeCategory);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id, { where: { Active: true } });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ message: "Failed to fetch student by ID" });
  }
};

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
      AdmissionNumber: admissionNumber.trim(),
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      DOB: dateOfBirth
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