const db = require('../models');
const User = db.user;
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
  // try {
  //   const ageGroups = await User.findAll({
  //     attributes: [
  //       [Sequelize.fn('COUNT', Sequelize.col('UserID')), 'count'],
  //       [Sequelize.fn('FLOOR', Sequelize.fn('DATEDIFF', Sequelize.fn('NOW'), Sequelize.col('DateOfBirth')) / 365), 'age']
  //     ],
  //     group: [Sequelize.fn('FLOOR', Sequelize.fn('DATEDIFF', Sequelize.fn('NOW'), Sequelize.col('DateOfBirth')) / 365)],
  //     where: { Active: true },
  //   });

  //   res.status(200).json(ageGroups);
  // } catch (error) {
  //   console.error("Error fetching age groups:", error);
  //   res.status(500).json({ message: "Internal server error" });
  // }
  const ageGroups = [
      { name: "All Ages", value: "" },
      { name: "Under 11", value: "Under 11" },
      { name: "Under 13", value: "Under 13" },
      { name: "Under 15", value: "Under 15" },
      { name: "Under 17", value: "Under 17" },
      { name: "Under 19", value: "Under 19" },
    ];
  res.status(200).json(ageGroups);
}

exports.getSessionData = async (req, res) => {
  // try {
  //   const userId = req.userId; // Assuming you have the user ID from the token
  //   const user = await User.findByPk(userId, { attributes: { exclude: ["Password"] } });

  //   if (!user) {
  //     return res.status(404).send({ message: "User not found." });
  //   }

  //   res.status(200).send(user);
  // } catch (error) {
  //   console.error("Error fetching session data:", error);
  //   res.status(500).send({ message: "Internal server error" });
  // }
  const dateObject = new Date();
  const today = dateObject.toISOString().split('T')[0];

  const sessions = [
    {
      SessionID: 1000,
      SessionName: "Morning Practice Session",
      SessionDate: today,
      SessionTime: "7:00 AM",
      SessionLocation: "Collage Pool",
      SessionDescription: "Standard Practice Session",
    },
    {
      SessionID: 1001,
      SessionName: "Evening Practice Session",
      SessionDate: today,
      SessionTime: "05:00 PM",
      SessionLocation: "Collage Pool",
      SessionDescription: "Standard Practice Session",
    },
    {
      SessionID: 1002,
      SessionName: "Natianal Championship",
      SessionDate: "2025-01-12",
      SessionTime: "12:00 PM",
      SessionLocation: "Sugathadasa Stadium",
      SessionDescription: "Main National Championship",
    },
  ];

  res.status(200).json({ sessions });
}

exports.getEventTypes = async (req, res) => {
  // try {
  //   const eventTypes = await EventType.findAll({
  //     attributes: ['EventTypeID', 'EventTypeName'],
  //   });
  //   res.status(200).json(eventTypes);
  // } catch (error) {
  //   console.error("Error fetching event types:", error);
  //   res.status(500).json({ message: "Internal server error" });
  // }
  const eventTypes = [
    {
      EventTypeID: 1000,
      EventType: "Free Style",
      EventTypeDescription: "Free Style Swimming",
    },
    {
      EventTypeID: 1001,
      EventType: "Back Stroke",
      EventTypeDescription: "Back Stroke Swimming",
    },
    {
      EventTypeID: 1002,
      EventType: "Breast Stroke",
      EventTypeDescription: "Breast Stroke Swimming",
    },
    {
      EventTypeID: 1003,
      EventType: "Butterfly",
      EventTypeDescription: "Butterfly Swimming",
    }
  ];

  res.status(200).json({ eventTypes });
};

exports.getEventLengths = async (req, res) => {
  // try {
  //   const eventLengths = await EventLength.findAll({
  //     attributes: ['EventLengthID', 'EventLengthName'],
  //   });
  //   res.status(200).json(eventLengths);
  // } catch (error) {
  //   console.error("Error fetching event lengths:", error);
  //   res.status(500).json({ message: "Internal server error" });
  // }

  const eventLengths = [
    {
      EventLengthID: 1000,
      EventLength: "50m",
      EventLengthDescription: "50 meter event",
    },
    {
      EventLengthID: 1001,
      EventLength: "100m",
      EventLengthDescription: "100 meter event",
    },
    {
      EventLengthID: 1002,
      EventLength: "200m",
      EventLengthDescription: "200 meter event",
    },
    {
      EventLengthID: 1003,
      EventLength: "400m",
      EventLengthDescription: "400 meter event",
    }
  ];

  res.status(200).json({ eventLengths });
};
