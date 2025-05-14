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

exports.updateProfile = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      user.FirstName = req.body.FirstName;
      user.LastName = req.body.LastName;
      user.Email = req.body.Email;
      
      if (user.Role !== req.body.Role) {
        user.Role = req.body.Role;
        if (user.Role === "Admin") {
          // sendEmail(user.Email, "Role Update", "Your role has been updated to Admin.");
          console.log("Your role has been updated to Admin.");
        }
      }

      user.save()
        .then(() => {
          // Fetch the updated user details from the database
          return db.query("SELECT * FROM users WHERE id = ?", [user.UserID]);
        })
        .then(([rows]) => {
          if (rows.length === 0) {
            throw new Error("User not found after update");
          }

          // Extract the user data
          const { UserID, FirstName, LastName, Email, Role, Approved } = rows[0];

          // Construct the response object
          const responseData = {
            id: UserID,
            firstName: FirstName,
            lastName: LastName,
            email: Email,
            roles: Role,
            accessToken: token, // Assuming `token` is defined elsewhere
            refreshToken: refreshToken, // Assuming `refreshToken` is defined elsewhere
            approved: Approved
          };

          // Send the response
          res.status(200).send(responseData);
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
      })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
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
      { name: "All Ages", value: "" },
      ...categories.map(row => ({
        name: row.category,
        value: row.category
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
    const { date, session } = req.query;

    // Check if date or session is invalid or empty
    const isInvalidFilter = !date || !session;

    const students = await Student.findAll();
    const response = [];

    for (const student of students) {
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

      const ageCategory = calculateAgeCategory(student.DOB);
      
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