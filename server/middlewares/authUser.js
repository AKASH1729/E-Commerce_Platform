import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Not Authorized" });
    }

    // attach user or just id
    req.user = { _id: decoded.id }; // ✅ now req.user._id works
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
};

export default authUser;
