import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import productRoutes from "./routes/productRoutes.js"
import errorHandleMiddleware from "./middleware/error.js"

dotenv.config()
const port = process.env.PORT || 5000
const app = express()

// Middleware
app.use(express.json())


// all routes

app.use("/api/products", productRoutes)
console.log("Product routes loaded...");

app.use(errorHandleMiddleware);

app.get("/", (req, res) => {
  res.send("Adirebymkz server running...");
});

main()
  .then(() => console.log("Mongodb is connected"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URI);

}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
