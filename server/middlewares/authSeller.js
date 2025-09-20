import jwt from "jsonwebtoken";

const authSeller = (req, res, next) => {
  const token = req.cookies.sellerToken; // ✅ consistent variable name

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ make sure seller email matches the configured one
    if (decoded.email && decoded.email === process.env.SELLER_EMAIL) {
      req.seller = decoded; // attach decoded data for later use
      return next();
    }

    return res.status(403).json({ success: false, message: "Not Authorized" });
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

export default authSeller;
