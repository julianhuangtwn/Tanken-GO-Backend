const express = require("express");
const dns = require("dns"); 
const router = express.Router();
const { connectToDB } = require("../models/data");
const bcrypt = require("bcryptjs"); 

async function checkMXRecord(email) {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Invalid email format");
  }

  const domain = email.split("@")[1];
  if (!domain) {
    throw new Error("Invalid email domain");
  }

  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.error("MX Record Error:", err);
        return reject(new Error("Invalid email domain. No MX records found."));

      }
      resolve("Valid email domain");
    });
  });
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const domain = email.split("@")[1];
    console.log("Domain extracted:", domain); 
    await checkMXRecord(email);

    const connection = await connectToDB();
    const checkQuery = `SELECT COUNT(*) AS count FROM admin.tankenusers WHERE EMAIL = :email`;
    const checkResult = await connection.execute(checkQuery, [email]);

    if (checkResult.rows[0]?.COUNT > 0) {
      return res.status(409).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO admin.tankenusers (FIRST_NAME, LAST_NAME, PHONE_NUMBER, EMAIL, PASSWORD)
      VALUES (:firstName, :lastName, :phone, :email, :password)
    `;
    const binds = { firstName, lastName, phone, email, password: hashedPassword };

    await connection.execute(insertQuery, binds, { autoCommit: true });

    res.status(200).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error in /register:", error);

    if (error.message === "Invalid email domain. No MX records found.") {
      return res.status(400).json({ error: "Invalid email domain. Please use a reachable email."  });
    } 

    res.status(500).json({ error: "This email is already registered." });
    
  }
});

module.exports = router;
