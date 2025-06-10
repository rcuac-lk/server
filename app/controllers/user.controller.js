const db = require('../models');
const User = db.user;
const AgeCategory = db.ageCategory;
const Session = db.session;
const EventType = db.event;
const Distance = db.distance;
const Attendance = db.attendance;
const Student = db.student;
const { Op, Sequelize } = require("sequelize");
const bcrypt = require("bcryptjs");
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

      const passwordIsValid = bcrypt.compareSync(
        req.body.oldPassword,
        user.Password
      );

      if (!passwordIsValid) {
        return res.status(400).send({ message: "Incorrect old password." });
      }

      user.Password = bcrypt.hashSync(req.body.newPassword, 8);

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


/** define the calculation base date. Month is Zero based and the date is 1 based. */
const constTagrgetBaseMonthForAgeUpdate = 11; //December
const constTagrgetBaseDateForAgeUpdate = 31; //31st
const constTagrgetBaseYearAdjustmentForAgeUpdate = -1;

/** Get Age calculation base date 
 * This function returns the age calculation base date in local time.
 */
function getAgeCalculationBaseDate() {
  // Calculate the timestamp for December 31st of the previous year at midnight UTC
  const currentYear = new Date().getFullYear();
  const targetYear = currentYear + constTagrgetBaseYearAdjustmentForAgeUpdate;
  const targetDate = new Date(targetYear, constTagrgetBaseMonthForAgeUpdate, constTagrgetBaseDateForAgeUpdate, 0, 0, 0, 0);  
  //console.log('Calculation Base date ['+ targetDate.toDateString() + ']');
  return targetDate;
}

/** Get Age Category 
 * This function returns the age category based on the given DOB and calculation base date.
 * both dob and calculationBaseDate should be in the same timezone. (local). If the age is not
 * within the age category table, it returns undefined.
 * @param {*} dob Date of birth
 * @param {*} calculationBaseDate Calculation base date
 * @param {*} ageCategoryTable Age category table
 * @returns 
 */
function calculateAgeCategory(dob,calculationBaseDate,ageCategoryTable) {
  /** set the time to 00:00:00.000 */
  dob.setHours(0,0,0,0);
  calculationBaseDate.setHours(0,0,0,0);
  console.log("+Fn calculateAgeCategory DOB [" + dob.toDateString() + "] Calculation Base Date [" + calculationBaseDate.toDateString() + "]");
  let age = calculationBaseDate.getFullYear() - dob.getFullYear();
  /** check if his birthday has passed by the calculation base date */ 
  dob.setFullYear(calculationBaseDate.getFullYear());
  //console.log('Calculation base year birthday [' + dob.toDateString() + ']');
  if(calculationBaseDate < dob) {
    /** birth day not passed */
    console.log("Fn calculateAgeCategory birth day not passed, so less one year.");
    age --;
  }
  /** find the age category */
  for (let x in ageCategoryTable) {
    if(ageCategoryTable[x].MinAge <= age && age <= ageCategoryTable[x].MaxAge) {
      console.log("-Fn calculateAgeCategory for age [" + age + "] is [" + ageCategoryTable[x].category + "]");
      return ageCategoryTable[x].category;
    }
  }
  console.log("-Fn calculateAgeCategory => No age category found for age [" + age + "]");
  return undefined;
}

/** Get Attendance data 
 * This function returns the attendance data based on the given date, session and age filter.
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.getAttendancedata = async (req, res) => {
  try {
    const { date, session, age } = req.query;
    //console.log("+Fn getAttendancedata [ " , date, session, age, "]");
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
    //Get student list and the age categories from the database
    const students = await Student.findAll({ where: { Active: true } });
    const ageCategories = await AgeCategory.findAll();
    const response = [];

    for (const student of students) {
      console.log("+Fn getAttendancedata => student = [", student.FirstName + " " + student.LastName, "]");
      // Calculate age category for the student
      const ageCategory = calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories);
      // Skip if Age Category is undefined
      if (ageCategory === undefined) {
        continue;
      }      
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

      // Get best timing from performance table considering the filters
      const performances = await db.performance.findAll({
        where: {
          StudentID: student.StudentID,
          ...(session && { SessionID: session }), // Only include if session filter is present
          ...(date && { // Only include if date filter is present
            PerformanceDate: {
              [Op.between]: [
                new Date(date + 'T00:00:00.000Z'),
                new Date(date + 'T23:59:59.999Z')
              ]
            }
          })
        },
        attributes: ['Time'],
        order: [['Time', 'ASC']]
      });

      // Calculate best timing (lowest time)
      let bestTiming = null;
      if (performances.length > 0) {
        // Convert all times to seconds for comparison
        const timesInSeconds = performances.map(p => {
          const [minutes, seconds] = p.Time.split(':').map(Number);
          return minutes * 60 + seconds;
        });
        
        // Find the minimum time
        const minTimeInSeconds = Math.min(...timesInSeconds);
        
        // Convert back to MM:SS format
        const minutes = Math.floor(minTimeInSeconds / 60);
        const seconds = minTimeInSeconds % 60;
        bestTiming = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        bestTiming: bestTiming
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

/** getAllStudents(req, res)
 * This function returns a list of all students in the database.
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({ where: { Active: true } });
    const ageCategories = await AgeCategory.findAll();
    // Filter students based on valid age categories and add age category
    const studentsWithAgeCategory = students
      .filter(student => {
        const ageCategory = calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories);
        return ageCategory !== undefined; // Only include students with valid age categories
      })
      .map(student => {
        const ageCategory = calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories);
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

/** updateStudent(req, res)
 * This function updates a student's information in the database.
 * @param {*} req 
 * @param {*} res 
 */
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { admissionNumber, firstName, lastName, dateOfBirth } = req.body;
    console.log("+Fn updateStudent id ["+ id+ "]"+ "  admissionNumber ["+ admissionNumber+ "]"+ " firstName ["+ firstName+ "]"+ " lastName ["+ lastName+ "]"+ " dateOfBirth ["+ dateOfBirth+ "]");    // Input validation
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

    // Get age categories and validate age
    const ageCategories = await AgeCategory.findAll();
    const ageCategory = calculateAgeCategory(new Date(dateOfBirth), getAgeCalculationBaseDate(), ageCategories);

    if (ageCategory === undefined) {
      return res.status(400).json({
        message: "Student's age is not within the allowed range"
      });
    }
    // Update student fields
    const updates = {
      AdmissionNumber: String(admissionNumber).trim(),
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      DOB: dateOfBirth
    };

    // Update and fetch student
    await student.update(updates);
    const updatedStudent = await Student.findByPk(id);

    // Prepare response
    const responseData = {
      ...updatedStudent.toJSON(),
      AgeCategory: ageCategory
    };
    console.log("-Fn updateStudent ",responseData);
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

/** approveStudent(req, res)
 * This function approves a student's profile.
 * @param {*} req 
 * @param {*} res 
 */
exports.approveStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    const ageCategories = await AgeCategory.findAll();
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.Approved = true;
    student.Comment = '';
    await student.save();

    const ageCategory = calculateAgeCategory(new Date(student.DOB), getAgeCalculationBaseDate(), ageCategories);
    const responseData = {
      ...student.toJSON(),
      AgeCategory: ageCategory
    };

    res.status(200).json({
      message: "Student approved successfully!",
      student: responseData
    });
  } catch (error) {
    console.error("Error approving student:", error);
    res.status(500).json({
      message: "Failed to approve student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/** deactivateStudent(req, res)
 * This function deactivates a student's profile.
 * @param {*} req 
 * @param {*} res 
 */
exports.deactivateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    student.Active = false;
    await student.save();

    res.status(200).json({ message: "Student deactivated successfully!" });
  } catch (error) {
    console.error("Error deactivating student:", error);
    res.status(500).json({
      message: "Failed to deactivate student",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getAttendancedataForReport = async (req, res) => {
  try {
    const { startDate, endDate, userID } = req.query;

    if (!startDate || !endDate || !userID) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Get user role
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare date range
    const startOfRange = new Date(startDate + 'T00:00:00.000Z');
    const endOfRange = new Date(endDate + 'T23:59:59.999Z');

    // Base query for students
    let studentQuery = { Active: true };
    
    // If user is a parent, only get their students
    if (user.Role === "Parent") {
      studentQuery.ParentID = userID;
    }

    // First get all students based on the query
    const students = await Student.findAll({ where: studentQuery });
    const ageCategories = await AgeCategory.findAll();
    
    // Filter students based on valid age categories
    const validStudents = students.filter(student => {
      const ageCategory = calculateAgeCategory(new Date(student.DOB), getAgeCalculationBaseDate(), ageCategories);
      return ageCategory !== undefined; // Only include students with valid age categories
    });

    const studentIds = validStudents.map(student => student.StudentID);

    // Get all attendance records within the date range for these students
    const attendanceRecords = await Attendance.findAll({
      where: {
        StudentID: {
          [Op.in]: studentIds
        },
        AttendanceDate: {
          [Op.between]: [startOfRange, endOfRange]
        }
      },
      order: [
        ['StudentID', 'ASC'],
        ['AttendanceDate', 'ASC']
      ]
    });

    // Get all users who marked attendance
    const markedByUserIds = [...new Set(attendanceRecords.map(record => record.MarkedBy))];
    const markedByUsers = await User.findAll({
      where: {
        UserID: {
          [Op.in]: markedByUserIds
        }
      },
      attributes: ['UserID', 'FirstName', 'LastName']
    });

    // Get all unique session IDs from attendance records
    const sessionIds = [...new Set(attendanceRecords.map(record => record.SessionID))];
    const sessions = await Session.findAll({
      where: {
        id: {
          [Op.in]: sessionIds
        }
      },
      attributes: ['id', 'sessionName']
    });

    // Create maps for quick lookups
    const userMap = new Map(markedByUsers.map(user => [user.UserID, user]));
    const sessionMap = new Map(sessions.map(session => [session.id, session.sessionName]));

    // Group attendance records by student
    const studentAttendanceMap = new Map();

    // Initialize map with all valid students
    validStudents.forEach(student => {
      studentAttendanceMap.set(student.StudentID, {
        UserID: student.StudentID,
        AdmissionNumber: student.AdmissionNumber,
        FirstName: student.FirstName,
        LastName: student.LastName,
        AgeCategory: calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories),
        bestTiming: student.bestTiming,
        attendanceRecords: []
      });
    });

    // Add attendance records to respective students
    attendanceRecords.forEach(record => {
      const studentId = record.StudentID;
      if (studentAttendanceMap.has(studentId)) {
        const markedByUser = userMap.get(record.MarkedBy);
        const sessionName = sessionMap.get(record.SessionID) || 'Unknown Session';
        
        studentAttendanceMap.get(studentId).attendanceRecords.push({
          date: record.AttendanceDate,
          status: record.Present ? "Present" : "Absent",
          markedBy: markedByUser ? `${markedByUser.FirstName} ${markedByUser.LastName}` : "Unknown",
          markedAt: new Date(record.MarkedAt).toLocaleString(),
          sessionId: record.SessionID,
          sessionName: sessionName
        });
      }
    });

    // Convert map to array for response
    const response = Array.from(studentAttendanceMap.values());

    res.status(200).json({ attendanceData: response });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Failed to retrieve student data" });
  }
};

exports.getTimingDataForReport = async (req, res) => {
  try {
    const { startDate, endDate, userID } = req.query;

    if (!startDate || !endDate || !userID) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Get user role
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Get age categories
    const ageCategories = await AgeCategory.findAll();
    // Prepare date range
    const startOfRange = new Date(startDate + 'T00:00:00.000Z');
    const endOfRange = new Date(endDate + 'T23:59:59.999Z');

    // Base query for students
    let studentQuery = { Active: true };
    
    // If user is a parent, only get their students
    if (user.Role === "Parent") {
      studentQuery.ParentID = userID;
    }

    // First get all students based on the query
    const students = await Student.findAll({ where: studentQuery });
    
    // Filter students based on valid age categories
    const validStudents = students.filter(student => {
      const ageCategory = calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories);
      return ageCategory !== undefined; // Only include students with valid age categories
    });

    const studentIds = validStudents.map(student => student.StudentID);

    // Get all performance records within the date range for these students
    const performanceRecords = await db.performance.findAll({
      where: {
        StudentID: {
          [Op.in]: studentIds
        },
        PerformanceDate: {
          [Op.between]: [startOfRange, endOfRange]
        }
      },
      order: [
        ['StudentID', 'ASC'],
        ['PerformanceDate', 'ASC']
      ]
    });

    // Get all users who recorded performances
    const recordedByUserIds = [...new Set(performanceRecords.map(record => record.RecordedBy))];
    const recordedByUsers = await User.findAll({
      where: {
        UserID: {
          [Op.in]: recordedByUserIds
        }
      },
      attributes: ['UserID', 'FirstName', 'LastName']
    });

    // Get all unique session IDs from performance records
    const sessionIds = [...new Set(performanceRecords.map(record => record.SessionID))];
    const sessions = await Session.findAll({
      where: {
        id: {
          [Op.in]: sessionIds
        }
      },
      attributes: ['id', 'sessionName']
    });

    // Get all unique event IDs from performance records
    const eventIds = [...new Set(performanceRecords.map(record => record.EventID))];
    const events = await EventType.findAll({
      where: {
        EventID: {
          [Op.in]: eventIds
        }
      },
      attributes: ['EventID', 'EventName']
    });

    // Get all unique distance IDs from performance records
    const distanceIds = [...new Set(performanceRecords.map(record => record.DistanceID))];
    const distances = await Distance.findAll({
      where: {
        id: {
          [Op.in]: distanceIds
        }
      },
      attributes: ['id', 'length']
    });

    // Create maps for quick lookups
    const userMap = new Map(recordedByUsers.map(user => [user.UserID, user]));
    const sessionMap = new Map(sessions.map(session => [session.id, session.sessionName]));
    const eventMap = new Map(events.map(event => [event.EventID, event.EventName]));
    const distanceMap = new Map(distances.map(distance => [distance.id, `${distance.length}m`]));

    // Group performance records by student
    const studentPerformanceMap = new Map();

    // Initialize map with all valid students
    validStudents.forEach(student => {
      studentPerformanceMap.set(student.StudentID, {
        UserID: student.StudentID,
        AdmissionNumber: student.AdmissionNumber,
        FirstName: student.FirstName,
        LastName: student.LastName,
        AgeCategory: calculateAgeCategory(new Date(student.DOB),getAgeCalculationBaseDate(),ageCategories),
        bestTiming: student.bestTiming,
        performanceRecords: []
      });
    });

    // Add performance records to respective students
    performanceRecords.forEach(record => {
      const studentId = record.StudentID;
      if (studentPerformanceMap.has(studentId)) {
        const recordedByUser = userMap.get(record.RecordedBy);
        const sessionName = sessionMap.get(record.SessionID) || 'Unknown Session';
        const eventName = eventMap.get(record.EventID) || 'Unknown Event';
        const distance = distanceMap.get(record.DistanceID) || 'Unknown Distance';
        
        studentPerformanceMap.get(studentId).performanceRecords.push({
          date: record.PerformanceDate,
          time: record.Time,
          event: eventName,
          distance: distance,
          recordedBy: recordedByUser ? `${recordedByUser.FirstName} ${recordedByUser.LastName}` : "Unknown",
          recordedAt: new Date(record.createdAt).toLocaleString(),
          sessionId: record.SessionID,
          sessionName: sessionName
        });
      }
    });

    // Convert map to array for response
    const response = Array.from(studentPerformanceMap.values());

    res.status(200).json({ performanceData: response });
  } catch (error) {
    console.error("Error fetching student performance data:", error);
    res.status(500).json({ message: "Failed to retrieve student performance data" });
  }
};

exports.getLeaderboardDataForReport = async (req, res) => {
  try {
    const { startDate, endDate, userID, eventID, distanceID, ageCategory, sessionID } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!userID || !eventID || !distanceID || !ageCategory || !sessionID) {
      return res.status(400).json({ 
        message: "Missing required parameters",
        required: {
          userID: "User ID is required",
          eventID: "Event ID is required",
          distanceID: "Distance ID is required",
          ageCategory: "Age Category is required",
          sessionID: "Session ID is required"
        }
      });
    }

    // Validate at least one date is provided
    if (!startDate && !endDate) {
      return res.status(400).json({ 
        message: "At least one date (startDate or endDate) is required"
      });
    }

    // Get user role
    const user = await User.findByPk(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare date range
    const startOfRange = startDate ? new Date(startDate + 'T00:00:00.000Z') : new Date(0);
    const endOfRange = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date(startDate + 'T23:59:59.999Z');

    // Base query for students
    let studentQuery = { Active: true };
    
    // If user is a parent, only get their students
    if (user.Role === "Parent") {
      studentQuery.ParentID = userID;
    }

    // First get all students based on the query
    const students = await Student.findAll({ where: studentQuery });
    const ageCategories = await AgeCategory.findAll();
    
    let validStudents;
    // Filter students based on valid age categories
    if(students && students.length > 0){
      validStudents = students.filter(student => {
        const studentAgeCategory = calculateAgeCategory(new Date(student.DOB), getAgeCalculationBaseDate(), ageCategories);
        return studentAgeCategory !== undefined && 
               studentAgeCategory === ageCategory; // Exact match with the provided age category
      });
    }

    const studentIds = validStudents.map(student => student.StudentID);

    // Build performance query
    let performanceQuery = {
      StudentID: {
        [Op.in]: studentIds
      },
      PerformanceDate: {
        [Op.between]: [startOfRange, endOfRange]
      },
      EventID: eventID,
      DistanceID: distanceID,
      SessionID: sessionID
    };

    // Get all performance records within the date range for these students
    const performanceRecords = await db.performance.findAll({
      where: performanceQuery,
      order: [
        ['StudentID', 'ASC'],
        ['Time', 'ASC'] // Order by time ascending to get best times first
      ]
    });

    // Get all users who recorded performances
    const recordedByUserIds = [...new Set(performanceRecords.map(record => record.RecordedBy))];
    const recordedByUsers = await User.findAll({
      where: {
        UserID: {
          [Op.in]: recordedByUserIds
        }
      },
      attributes: ['UserID', 'FirstName', 'LastName']
    });

    // Get all unique session IDs from performance records
    const sessionIds = [...new Set(performanceRecords.map(record => record.SessionID))];
    const sessions = await Session.findAll({
      where: {
        id: {
          [Op.in]: sessionIds
        }
      },
      attributes: ['id', 'sessionName']
    });

    // Get all unique event IDs from performance records
    const eventIds = [...new Set(performanceRecords.map(record => record.EventID))];
    const events = await EventType.findAll({
      where: {
        EventID: {
          [Op.in]: eventIds
        }
      },
      attributes: ['EventID', 'EventName']
    });

    // Get all unique distance IDs from performance records
    const distanceIds = [...new Set(performanceRecords.map(record => record.DistanceID))];
    const distances = await Distance.findAll({
      where: {
        id: {
          [Op.in]: distanceIds
        }
      },
      attributes: ['id', 'length']
    });

    // Create maps for quick lookups
    const userMap = new Map(recordedByUsers.map(user => [user.UserID, user]));
    const sessionMap = new Map(sessions.map(session => [session.id, session.sessionName]));
    const eventMap = new Map(events.map(event => [event.EventID, event.EventName]));
    const distanceMap = new Map(distances.map(distance => [distance.id, `${distance.length}m`]));

    // Group performance records by student and find best time
    const studentPerformanceMap = new Map();

    // Initialize map with all valid students
    validStudents.forEach(student => {
      studentPerformanceMap.set(student.StudentID, {
        UserID: student.StudentID,
        AdmissionNumber: student.AdmissionNumber,
        FirstName: student.FirstName,
        LastName: student.LastName,
        AgeCategory: calculateAgeCategory(student.DOB),
        bestTime: null,
        bestTimeDate: null,
        event: null,
        distance: null,
        session: null
      });
    });

    // Process performance records to find best time for each student
    performanceRecords.forEach(record => {
      const studentId = record.StudentID;
      if (studentPerformanceMap.has(studentId)) {
        const studentData = studentPerformanceMap.get(studentId);
        const currentTime = convertTimeToSeconds(record.Time);
        const bestTime = studentData.bestTime ? convertTimeToSeconds(studentData.bestTime) : Infinity;

        // Update if this is a better time
        if (currentTime < bestTime) {
          const recordedByUser = userMap.get(record.RecordedBy);
          const sessionName = sessionMap.get(record.SessionID) || 'Unknown Session';
          const eventName = eventMap.get(record.EventID) || 'Unknown Event';
          const distance = distanceMap.get(record.DistanceID) || 'Unknown Distance';

          studentData.bestTime = record.Time;
          studentData.bestTimeDate = record.PerformanceDate;
          studentData.event = eventName;
          studentData.distance = distance;
          studentData.session = sessionName;
          studentData.recordedBy = recordedByUser ? `${recordedByUser.FirstName} ${recordedByUser.LastName}` : "Unknown";
          studentData.recordedAt = new Date(record.createdAt).toLocaleString();
        }
      }
    });

    // Convert map to array and filter out students with no performance records
    const response = Array.from(studentPerformanceMap.values())
      .filter(student => student.bestTime !== null)
      .sort((a, b) => convertTimeToSeconds(a.bestTime) - convertTimeToSeconds(b.bestTime))
      .map((student, index) => ({
        ...student,
        rank: index + 1
      }));

    res.status(200).json({ performanceData: response });
  } catch (error) {
    console.error("Error fetching student performance data:", error);
    res.status(500).json({ message: "Failed to retrieve student performance data" });
  }
};

// Helper function to convert time string to seconds
const convertTimeToSeconds = (timeStr) => {
  if (!timeStr) return Infinity;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return Infinity;
};