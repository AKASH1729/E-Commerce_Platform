import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("✅ Database Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;



// import mongoose from "mongoose";

// const connectDB = async () => {
//     try {
//         // Event listener for successful connection
//         mongoose.connection.on("connected", () => {
//             console.log("✅ Database Connected");
//         });

//         // Connect to MongoDB using connection string from .env
//         await mongoose.connect(process.env.MONGODB_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//     } catch (error) {
//         console.error("❌ Database connection error:", error.message);
//         process.exit(1); // stop server if DB connection fails
//     }
// };

// export default connectDB;
