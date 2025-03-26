const express = require("express");
const jwt = require("jsonwebtoken");
const { connectToDB } = require("../models/data");
const nodemailer = require("nodemailer");
const { secretOrKey } = require("../config/auth");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const connection = await connectToDB();
    const result = await connection.execute(
      `SELECT USERID FROM admin.tankenusers WHERE EMAIL = :email`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const userId = result.rows[0].USERID;

    const resetToken = jwt.sign({ userid: userId, email }, secretOrKey, { expiresIn: "15m" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Reset your password",
      html: `<p>Dear user, please click <a href="${resetLink}">here</a> to reset your password for TankenGo. This link expires in 15 minutes.</p>`,
    });

    res.status(200).json({ message: "Reset link sent" });
  } catch (err) {
    console.error("Reset link error:", err); 
    res.status(500).json({ message: "Failed to send reset link" });
  }
});

module.exports = router;
