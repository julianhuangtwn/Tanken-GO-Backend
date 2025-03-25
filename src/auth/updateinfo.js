// src/auth/updateinfo.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { connectToDB } = require("../models/data");
const { secretOrKey } = require('../config/auth.js');

const router = express.Router();

router.put("/", async (req, res) => {
    console.log("Hit /auth/updateinfo route");

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  try {
    const decoded = jwt.verify(token, secretOrKey);
    const { fullName, email, phone } = req.body;

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ");

    const connection = await connectToDB();

    const updateQuery = `
      UPDATE admin.tankenusers
      SET FIRST_NAME = :firstName, LAST_NAME = :lastName, EMAIL = :email, PHONE_NUMBER = :phone
      WHERE USERID = :userid
    `;

    await connection.execute(
      updateQuery,
      { firstName, lastName, email, phone, userid: decoded.userid },
      { autoCommit: true }
    );

    res.status(200).json({ message: "Profile updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
