const db = require('../models');
const User = db.user;
const { Op, Sequelize } = require("sequelize");

exports.notApprovedUsers = (req, res) => {
  User.findAll({
    where: {
      Approved: false,
      Active: true,
      Role: { [Op.notIn]: ['Admin', 'Manager']}
    },
    attributes: { exclude: ["Password"] }
  })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.approvedUsers = (req, res) => {
  User.findAll({
    where: {
      Approved: true,
      Active: true,
      Role: { [Op.notIn]: ['Admin', 'Manager']}
    },
    attributes: { exclude: ["Password"] }
  })
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
  User.findAll({
    where: {
      Active: true,
      Role: { [Op.ne]: ['Admin', 'Manager'] }
    },
    attributes: { exclude: ["Password"] }
  })
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

exports.searchUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    // Base conditions: Approved users, Active users, and exclude Admin role
    let where = { 
      Approved: true, 
      Active: true,
      Role: { [Op.notIn]: ['Admin', 'Manager']}
    };

    // Apply search filter
    if (search) {
      where[Op.or] = [
        { FirstName: { [Op.like]: `%${search}%` } },
        { LastName: { [Op.like]: `%${search}%` } },
      ];
    }

    // Apply role filter if provided
    if (role) {
      // Ensure the requested role is not 'Admin' and combine with the exclusion of Admin
      where.Role = { 
        [Op.and]: [
          { [Op.eq]: role }
        ] 
      };
    }

    // Fetch filtered users
    const users = await User.findAll({ 
      where, 
      attributes: { exclude: ["Password"] } 
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};