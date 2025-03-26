// src/auth/resetPassword.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { connectToDB } = require("../models/data");
const { secretOrKey } = require("../config/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: "Missing token or password" });
  }

  try {
    const decoded = jwt.verify(token, secretOrKey);

    const hashed = await bcrypt.hash(password, 10);
    const connection = await connectToDB();

    await connection.execute(
      `UPDATE admin.tankenusers SET PASSWORD = :password WHERE EMAIL = :email`,
      { password: hashed, email: decoded.email },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
