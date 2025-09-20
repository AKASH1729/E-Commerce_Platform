// controllers/addressController.js
import Address from "../models/Address.js";

// Add Address : /api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user?.id || req.user?._id; // from authUser

    if (!userId || !address) {
      return res.status(400).json({
        success: false,
        message: "userId (from auth) and address are required",
      });
    }

    // Optional: ensure zipcode is correct type (Number) or accept string
    const payload = {
      ...address,
      userId,
      //zipcode: address.zipcode ? Number(address.zipcode) : undefined
    };

    const created = await Address.create(payload);

    return res.json({
      success: true,
      message: "Address added successfully",
      address: created, // return created address for client convenience
    });
  } catch (error) {
    console.error("ADD ADDRESS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Address : /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id; // from authUser

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId (from auth) is required",
      });
    }

    // fetch addresses for this user, optionally sort so newest last
    const addresses = await Address.find({ userId }).sort({ createdAt: 1 });

    return res.json({ success: true, addresses });
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
