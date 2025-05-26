require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
let currentOTP = null;
let otpExpiry = null;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function generateOTP(length) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  return otp;
}

app.get("/api/otp", (req, res) => {
  const length = parseInt(process.env.OTP_LENGTH) || 6; // Default length is 6
  const otp = generateOTP(length);
  const expiry = Date.now() + 30 * 1000; // 30 seconds expiry time
  currentOTP = otp;
  otpExpiry = expiry;
  res.json({ otp: otp, expiry: expiry });
});

app.post(
  "/api/validate",
  express.urlencoded({ extended: true }),
  (req, res) => {
    const { otp } = req.body;
    if (!currentOTP || !otpExpiry) {
      return res.json({
        success: false,
        message: "OTP not generated or expired",
      });
    }
    if (Date.now() > otpExpiry) {
      currentOTP = null; // Clear the OTP after expiry
      otpExpiry = null; // Clear the expiry time
      return res.json({ success: false, message: "OTP expired" });
    }
    if (otp === currentOTP) {
      currentOTP = null; // Clear the OTP after successful validation
      otpExpiry = null; // Clear the expiry time
      return res.json({ success: true, message: "OTP validated successfully" });
    }
    return res.json({ success: false, message: "Invalid OTP" });
  }
);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
