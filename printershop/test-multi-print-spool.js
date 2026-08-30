const { io } = require("socket.io-client");
const axios = require("axios");
const mongoose = require("mongoose");
const connectDb = require("../backend/config/db");
const gentoken = require("../backend/config/gen");
const Paymentdetails = require("../backend/models/paymentdetails");
const Printdetails = require("../backend/models/printdetails");

console.log("Starting automatic multi-print sequential queue test...");

const testPrinterId = "6a93518152688b0d09c3c0ed"; // gurushri ID
const testUserId = "60c72b2f9b1d8b2bad18a33f"; // dummy user ID

const runTest = async () => {
  await connectDb();

  const userSocket = io("http://localhost:1500");
  const printerSocket = io("http://localhost:1500");
  
  const orderIds = [`order_mock_multi_1_${Date.now()}`, `order_mock_multi_2_${Date.now()}`, `order_mock_multi_3_${Date.now()}`];
  const createdJobIds = [];
  const completedJobs = new Set();
  let authToken;

  // Mock print spooler queue variables
  const jobQueue = [];
  let isPrinting = false;

  userSocket.on("connect", () => {
    console.log("✅ User socket connected. Joining user room...");
    userSocket.emit("join_user_room", testUserId);
  });

  printerSocket.on("connect", () => {
    console.log("✅ Printer socket connected. Joining printer room...");
    printerSocket.emit("join_printer_room", testPrinterId);
  });

  // Mock printer receives concurrent job triggers and processes them sequentially (one-by-one)
  printerSocket.on("new_print_job", (job) => {
    console.log(`📬 [MOCK PRINTER] Intercepted new print job event for Job ID: ${job._id}`);
    jobQueue.push(job);
    processNextSpool();
  });

  const processNextSpool = async () => {
    if (isPrinting || jobQueue.length === 0) return;
    isPrinting = true;

    const currentJob = jobQueue.shift();
    console.log(`\n🖨️  [MOCK SPOOLER] Active print started for Job ID: ${currentJob._id} (Queue size remaining: ${jobQueue.length})`);

    // Step 1: Change to In Progress (Printing)
    try {
      await axios.post("http://localhost:1500/api/job/status", {
        jobId: currentJob._id,
        status: "In Progress"
      }, {
        headers: { Cookie: `token=${authToken}` }
      });
    } catch (e) {
      console.error("Failed to update status to In Progress:", e.message);
    }

    // Step 2: Wait 2 seconds (simulating print output) then mark Completed
    setTimeout(async () => {
      console.log(`✅ [MOCK SPOOLER] Page printing finished for Job ID: ${currentJob._id}. Updating status to Completed...`);
      try {
        await axios.post("http://localhost:1500/api/job/status", {
          jobId: currentJob._id,
          status: "Completed"
        }, {
          headers: { Cookie: `token=${authToken}` }
        });
      } catch (e) {
        console.error("Failed to update status to Completed:", e.message);
      }

      isPrinting = false;
      processNextSpool(); // Trigger next job in the queue
    }, 2000);
  };

  userSocket.on("job_status_changed", (data) => {
    console.log(`📬 [USER SOCKET EVENT] Job ${data.jobId} changed status to: ${data.status}`);
    if (data.status === "Completed") {
      completedJobs.add(data.jobId);
      console.log(`🎉 Job ${data.jobId} completed printing! (${completedJobs.size}/3 complete)`);
      
      if (completedJobs.size === 3) {
        console.log("\n🏁 SUCCESS! All 3 sequential print queue jobs finished printing successfully!");
        cleanupAndExit();
      }
    }
  });

  const triggerPayment = async (orderId, index) => {
    console.log(`\n--- Queueing Job #${index + 1} (Order ID: ${orderId}) ---`);
    await Paymentdetails.create({
      userid: testUserId,
      amount: 10 * (index + 1),
      currency: "INR",
      receipt: `receipt#${orderId}`,
      status: "Created",
      razorpay_order_id: orderId,
      printSpecs: {
        printershopid: testPrinterId,
        urlofprinddocument: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        printcopies: 1,
        printpagenos: "1",
        printpapersize: "A4",
        printcolor: "Black and White",
        duplex: false
      }
    });

    try {
      const response = await axios.post("http://localhost:1500/api/payment/verify", {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_mock_${orderId}`,
        razorpay_signature: "mock_signature_bypass"
      }, {
        headers: { Cookie: `token=${authToken}` }
      });

      createdJobIds.push(response.data.job._id);
      console.log(`✅ Job #${index + 1} added to print queue with DB ID: ${response.data.job._id}`);
    } catch (err) {
      if (err.response) {
        console.error(`❌ Verification failed: ${err.response.status} -`, err.response.data);
      } else {
        console.error(`❌ Verification error:`, err.message);
      }
      throw err;
    }
  };

  // Trigger all 3 jobs in rapid succession to test queue handling
  setTimeout(async () => {
    try {
      authToken = await gentoken(testUserId);
      await triggerPayment(orderIds[0], 0);
      await triggerPayment(orderIds[1], 1);
      await triggerPayment(orderIds[2], 2);
    } catch (err) {
      console.error("❌ Test setup failed.");
      cleanupAndExit();
    }
  }, 2000);

  const cleanupAndExit = async () => {
    console.log("\nCleaning up database test records...");
    try {
      for (const orderId of orderIds) {
        await Paymentdetails.deleteOne({ razorpay_order_id: orderId });
      }
      for (const jobId of createdJobIds) {
        await Printdetails.findByIdAndDelete(jobId);
      }
      console.log("✅ Database test records cleaned up.");
    } catch (cleanupErr) {
      console.error("Error during database cleanup:", cleanupErr.message);
    }
    
    userSocket.disconnect();
    printerSocket.disconnect();
    await mongoose.connection.close();
    console.log("Test finished.");
    process.exit(0);
  };

  // Timeout guard
  setTimeout(() => {
    console.log("\n❌ Test timeout reached.");
    cleanupAndExit();
  }, 35000);
};

runTest();
