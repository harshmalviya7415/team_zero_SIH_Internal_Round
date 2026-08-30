const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const connectDb = require("./config/db");

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ],
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
const { printerlist } = require("./controller/printerlist");
const { userverify } = require("./controller/userverify");
const { printerverify } = require("./controller/printerverify");
const { joblist } = require("./controller/joblist");
const { printerjoblist } = require("./controller/printerjoblist");
const { initSocket } = require("./config/socket");
const { uploadMedia } = require("./controller/media");
const { paymentCreateOrder, paymentVerify } = require("./controller/payment");
const { jobStatusUpdate } = require("./controller/jobstatus");

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
app.get("/api/printer/list", printerlist);
app.get("/api/user/verify", auth, userverify);
app.get("/api/printer/verify", auth, printerverify);
app.get("/api/job/user", auth, joblist);
app.get("/api/job/printer", auth, printerjoblist);

// Payment & Job Status persistence endpoints
app.post("/api/payment/create-order", auth, paymentCreateOrder);
app.post("/api/payment/verify", auth, paymentVerify);
app.post("/api/job/status", auth, jobStatusUpdate);

app.post(
  "/api/upload",
  auth,
  require("./middleware/upload").single("file"),
  uploadMedia,
);

const server = app.listen(PORT, async () => {
  await connectDb();
  console.log(`Server Started::: ${PORT}`);
});

initSocket(server);

