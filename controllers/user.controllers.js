const { Users, Region, products, Carts, PriceList, Review } = require("../models");
const { signToken, hashPassword, checkUsername } = require("../services");

const getUserDetail = async (req, res, next) => {
  try {
    const data = await Users.findOne({
      where: {
        id: req.currentUser.id,
      },
      attributes: ["username", "email"],
      include: [
        {
          model: Region,
          attributes: ["name"],
        },
        {
          model: products,
          as: "productOwned",
          attributes: ["name"],
        },
        {
          model: Carts,
          attributes: ["id"],
          include: [
            {
              model: PriceList,
              attributes: ["price", "discount"],
              include: [
                {
                  model: products,
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        {
          model: Review,
          attributes: ["id", "content", "isRecommend"],
          include: {
            model: products,
            attributes: ["name"],
          },
        },
      ],
    });

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, passwordConfirm, region } = req.body;

    if (!username || !email || !password || !region || !passwordConfirm) {
      return res.status(400).json({
        messsage: "username, email, password, passwordConfirm dan region harus diisi!",
      });
    }

    if (!checkUsername(username)) {
      return res.status(400).json({ message: "username hanya boleh terdiri dari huruf dan angka" });
    }

    const existUsername = await Users.findOne({
      where: {
        username,
      },
    });

    if (existUsername) {
      return res.status(400).json({ message: "username sudah digunakan" });
    }

    const existEmail = await Users.findOne({
      where: {
        email,
      },
    });

    if (existEmail) {
      return res.status(400).json({
        message: "email sudah digunakan",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "password dan passwordConfirm tidak cocok" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "password harus lebih dari 6 karakter" });
    }

    const existRegion = await Region.findOne({
      where: {
        name: region,
      },
    });

    if (!existRegion) {
      res.status(404).json({ message: "region tidak ditemukan" });
    }

    const newUser = await Users.create({
      id: crypto.randomUUID(),
      username,
      email,
      password: await hashPassword(password),
      regionId: existRegion.id,
    });

    const data = await Users.findByPk(newUser.id, {
      attributes: ["id", "username", "email", "password"],
      include: [
        {
          model: Region,
          attributes: ["name"],
        },
      ],
    });

    const token = signToken(data.id);
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(201).json({ status: 201, message: "berhasil register!", data });
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error",
      error: error.message,
      // error,
    });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username dan password harus diisi!" });
    }

    const exist = await Users.findOne({
      where: {
        username,
      },
    });

    if (!exist || !(await exist.isCorrectPassword(password, exist.password))) {
      return res.status(400).json({ message: "invalid username or password" });
    }

    const token = signToken(exist.id);
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.status(200).json({ message: "berhasil login!" });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateUsers = async (req, res, next) => {
  try {
    const { username, email, password, passwordConfirm, region } = req.body;
    const data = await Users.findOne({
      where: {
        id: req.currentUser.id,
      },
    });

    if (!data) {
      return res.status(200).json({
        messsage: "data tidak ada!",
      });
    }

    if (region) {
      const existRegion = await Region.findOne({
        where: {
          name: region,
        },
      });

      if (!existRegion) {
        return res.status(404).json({ message: "region tidak ditemukan" });
      }

      data.regionId = existRegion.id;
    }

    if (email) {
      const exists = await Users.findOne({
        where: {
          email,
        },
      });

      if (exists && exists.id !== data.id) {
        return res.status(400).json({
          message: "Email sudah digunakan",
        });
      }

      data.email = email;
    }

    if (username) {
      const existUsername = await Users.findOne({
        where: {
          username,
        },
      });

      if (existUsername && existUsername.id !== data.id) {
        return res.status(400).json({
          message: "Username sudah digunakan",
        });
      }

      data.username = username;
    }

    if (password) {
      if (!passwordConfirm) {
        return res.status(400).json({ message: "jika ubah password, password dan passwordConfirm harus diisi!" });
      }

      if (password !== passwordConfirm) {
        return res.status(400).json({ message: "password dan passwordConfirm tidak cocok" });
      }

      data.password = await hashPassword(password);
    }

    await data.save();
    return res.status(201).json({ status: "berhasil update user!", data });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteUsers = async (req, res, next) => {
  try {
    const data = await Users.findOne({
      where: {
        id: req.currentUser.id,
      },
    });

    if (!data) {
      return res.status(404).json({
        messsage: "data tidak ada",
      });
    }

    await data.destroy();
    return res.status(200).json({
      message: "berhasil delete user!",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getUserDetail,
  updateUsers,
  deleteUsers,
  registerUser,
  loginUser,
};
