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
  User.findAll({ where: { Approved: false, Active: true } })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.approvedUsers = (req, res) => {
  User.findAll({ where: { Approved: true, Active: true } })
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
  User.findAll({ where: { Active: true } })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUser = (req, res) => {
  User.findByPk(req.params.id)
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
    const users = await User.findAll({ where });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};