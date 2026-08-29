const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

const { auth } = require("./config/auth");
const { usercreat } = require("./controller/usercreate");
const { userlogin } = require("./controller/userlogin");
const { printercreat } = require("./controller/printercreate");
const { printerlogin } = require("./controller/printerlogin");
const { jobcreat } = require("./controller/jobcreate");
const { statusupdate } = require("./controller/statusupdate");

const PORT = process.env.PORT || 1500;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/api/user/create", usercreat);
app.post("/api/user/login", userlogin);
app.post("/api/printer/create", printercreat);
app.post("/api/printer/login", printerlogin);
app.post("/api/job/create", auth, jobcreat);
app.post("/api/printer/status", auth, statusupdate);

app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server Started::: ${PORT}`);
});
