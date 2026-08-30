import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import "./UserDashboard.css";


const STATUS_LABEL = {
  open: "Open now",
  busy: "Busy",
  closed: "Closed",
  scheduled: "Open · Scheduled only",
};

const JOB_STATUS_LABEL = {
  payment_pending: "Payment pending",
  payment_failed: "Payment failed",
  printing: "Printing",
  ready: "Ready for pickup",
  collected: "Collected",
};

const INITIAL_SHOPS = [
  {
    id: "shop-1",
    name: "QuickPrint Koramangala",
    distance: "0.4 km away",
    status: "open",
    services: ["Color", "B/W", "Scan"],
  },
  {
    id: "shop-2",
    name: "CampusXerox NITK",
    distance: "1.2 km away",
    status: "busy",
    services: ["B/W", "Scan"],
  },
  {
    id: "shop-3",
    name: "Elite Digital Prints",
    distance: "2.1 km away",
    status: "scheduled",
    services: ["Color", "B/W"],
    availableFrom: "4:00 PM today",
  },
  {
    id: "shop-4",
    name: "Print & Bind Corner",
    distance: "0.9 km away",
    status: "closed",
    services: ["B/W"],
  },
];

const INITIAL_JOBS = [
  {
    id: "job-101",
    fileName: "assignment_report.pdf",
    shopName: "QuickPrint Koramangala",
    pages: 12,
    color: "B/W",
    copies: 1,
    duplex: "Single-sided",
    amount: 24,
    status: "ready",
    pickupTime: "5:30 PM today",
  },
  {
    id: "job-102",
    fileName: "lab_manual.pdf",
    shopName: "CampusXerox NITK",
    pages: 5,
    color: "Color",
    copies: 2,
    duplex: "Single-sided",
    amount: 60,
    status: "payment_pending",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "",
    text: "",
    time: "",
  },
];

function ratePerPage(color) {
  return color === "Color" ? 5 : 2;
}

export default function UserDashboard() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [payingJobId, setPayingJobId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("user");
    navigate('/login', { replace: true }); // Add replace: true
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:1500/api/user/verify", {
          withCredentials: true
        });
        setUser(response.data);
      } catch (error) {
        console.error("Auth verification failed:", error);
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await axios.get("http://localhost:1500/api/printer/list");
        const mapped = response.data.map(p => {
          const isActive = p.statusDetails && p.statusDetails.status === "Active";
          return {
            id: p._id,
            name: p.shopname || p.fullname,
            distance: "0.5 km away",
            status: isActive ? "open" : "closed",
            services: (() => {
              const rawServices = Array.isArray(p.services) ? p.services : [p.services || "Black and White"];
              return rawServices.map((s) => {
                if (s === "Black and White") return "B/W";
                if (s === "Colour") return "Color";
                return s;
              });
            })(),
            pagesizes: Array.isArray(p.pagesizes) ? p.pagesizes : [p.pagesizes || "A4"],
          };
        });
        setShops(mapped);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:1500");

    socket.on("connect", () => {
      console.log("UserDashboard successfully connected to Socket.io server. Joining user room...");
      socket.emit("join_user_room", user._id);
    });

    socket.on("connect_error", (error) => {
      console.error("UserDashboard Socket.io connection error:", error);
    });

    socket.on("printer_status_changed", (data) => {
      console.log("Printer status changed socket event received:", data);
      setShops((prev) => {
        let matched = false;
        const updated = prev.map((shop) => {
          if (shop.id === data.printershopid) {
            matched = true;
            console.log(`Matching shop found: "${shop.name}". Changing status to ${data.status === "Active" ? "open" : "closed"}`);
            return {
              ...shop,
              status: data.status === "Active" ? "open" : "closed",
            };
          }
          return shop;
        });
        if (!matched) {
          console.warn(`No local shop ID matched the broadcasted ID: ${data.printershopid}`);
        }
        return updated;
      });
    });

    socket.on("job_status_changed", (data) => {
      console.log("Job status changed event received:", data);
      let targetJobName = "Your print job";

      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === data.jobId) {
            targetJobName = job.fileName;
            console.log(`Updating job ${job.fileName} status to: ${data.status}`);
            return {
              ...job,
              status: data.status === "Pending" 
                ? "payment_pending" 
                : data.status === "In Progress" 
                ? "printing" 
                : data.status === "Completed" 
                ? "ready" 
                : data.status === "Collected"
                ? "collected"
                : data.status === "Cancelled"
                ? "payment_failed"
                : data.status,
            };
          }
          return job;
        })
      );

      // Add a dynamic notification to the header notification list
      const actionText = data.status === "In Progress"
        ? "is now printing! 🖨️"
        : data.status === "Completed"
        ? "is completed and ready for pickup! 🎉"
        : `status updated to: ${data.status}`;

      setNotifications((prev) => [
        {
          id: `note-${Date.now()}`,
          text: `"${targetJobName}" ${actionText}`,
          time: "Just now",
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:1500/api/job/user", {
          withCredentials: true
        });
        
        const mapped = response.data.map(j => {
          const pagesCount = (() => {
            const rangeStr = j.printpagenos || "";
            if (rangeStr.toLowerCase() === "all") return 1;
            const match = rangeStr.match(/^(\d+)-(\d+)$/);
            if (match) return parseInt(match[2]) - parseInt(match[1]) + 1;
            if (rangeStr.match(/^(\d+)(,\d+)*$/)) return rangeStr.split(",").length;
            return 1;
          })();

          return {
            id: j._id,
            fileName: j.urlofprinddocument.split("/").pop(),
            shopName: j.printershopid ? (j.printershopid.shopname || j.printershopid.fullname) : "Unknown Shop",
            pages: pagesCount,
            color: j.printcolor === "Colour" ? "Color" : "B/W",
            copies: j.printcopies,
            duplex: j.duplex ? "Double-sided" : "Single-sided",
            amount: j.printcopies * pagesCount * (j.printcolor === "Colour" ? 5 : 2),
            status: j.printstatus === "Pending" 
              ? "payment_pending" 
              : j.printstatus === "In Progress" 
              ? "printing" 
              : j.printstatus === "Completed" 
              ? "ready" 
              : j.printstatus === "Collected"
              ? "collected"
              : j.printstatus === "Cancelled"
              ? "payment_failed"
              : j.printstatus,
          };
        });
        setJobs(mapped);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, [user]);

  const [totalPages, setTotalPages] = useState(1);
  const [pageRangeError, setPageRangeError] = useState("");

  const [newJob, setNewJob] = useState({
    shopId: "",
    file: null,
    pages: "",
    color: "B/W",
    duplex: "Single-sided",
    copies: 1,
    printpapersize: "A4",
  });

  const activeJobsCount = jobs.filter(
    (j) => j.status !== "collected" && j.status !== "payment_failed"
  ).length;
  const readyCount = jobs.filter((j) => j.status === "ready").length;
  const totalSpent = jobs
    .filter((j) => j.status !== "payment_pending" && j.status !== "payment_failed")
    .reduce((sum, j) => sum + j.amount, 0);

  const openForOrder = (shop) => shop.status === "open" || shop.status === "scheduled";

  const startNewJob = (shopId) => {
    setNewJob({
      shopId: shopId || "",
      file: null,
      pages: "",
      color: "B/W",
      duplex: "Single-sided",
      copies: 1,
      printpapersize: "A4",
    });
    setTotalPages(1);
    setPageRangeError("");
    setShowNewJobForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewJob((prev) => ({ ...prev, file }));

    const reader = new FileReader();
    reader.onload = function(evt) {
      const arr = new Uint8Array(evt.target.result);
      const len = arr.length;
      let text = "";
      
      // Read the beginning and end of the PDF where metadata is typically stored
      if (len <= 200000) {
        text = new TextDecoder("utf-8").decode(arr);
      } else {
        const firstPart = new TextDecoder("utf-8").decode(arr.slice(0, 100000));
        const lastPart = new TextDecoder("utf-8").decode(arr.slice(len - 100000));
        text = firstPart + "\n" + lastPart;
      }

      const matches = text.match(/\/Count\s*(\d+)/g);
      let pagesCount = 1;
      if (matches) {
        const counts = matches.map(m => parseInt(m.match(/\d+/)[0]));
        pagesCount = Math.max(...counts);
      }
      console.log("Parsed PDF Total Pages:", pagesCount);
      setTotalPages(pagesCount);
    };
    reader.readAsArrayBuffer(file);
  };

  const validatePageRange = (rangeStr, maxPages) => {
    if (!rangeStr.trim()) return "Page range is required";
    if (rangeStr.toLowerCase() === "all") return "";

    const rangeRegex = /^(\d+)-(\d+)$/;
    const match = rangeStr.match(rangeRegex);
    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);
      if (start < 1 || end > maxPages || start > end) {
        return `Invalid range. Must be between 1 and ${maxPages}.`;
      }
      return "";
    }

    const listRegex = /^(\d+)(,\d+)*$/;
    if (rangeStr.match(listRegex)) {
      const pages = rangeStr.split(",").map(Number);
      const invalid = pages.some(p => p < 1 || p > maxPages);
      if (invalid) {
        return `Invalid pages. Must be between 1 and ${maxPages}.`;
      }
      return "";
    }

    return "Invalid format. Use e.g. 1-6, 1,3,5 or all.";
  };

  const getPagesToPrintCount = (rangeStr, maxPages) => {
    if (rangeStr.toLowerCase() === "all") return maxPages;

    const rangeRegex = /^(\d+)-(\d+)$/;
    const match = rangeStr.match(rangeRegex);
    if (match) {
      return parseInt(match[2]) - parseInt(match[1]) + 1;
    }

    const listRegex = /^(\d+)(,\d+)*$/;
    if (rangeStr.match(listRegex)) {
      return rangeStr.split(",").length;
    }

    return 1;
  };

  const handleNewJobChange = (field) => (e) => {
    setNewJob((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePageRangeChange = (e) => {
    const value = e.target.value;
    // Block typing of invalid characters (only allow numbers, hyphens, commas, spaces, and letters)
    if (/[^\d\-,\sa-zA-Z]/.test(value)) {
      return;
    }
    setNewJob((prev) => ({ ...prev, pages: value }));
  };

  useEffect(() => {
    if (newJob.pages) {
      const error = validatePageRange(newJob.pages, totalPages);
      setPageRangeError(error);
    } else {
      setPageRangeError("");
    }
  }, [newJob.pages, totalPages]);

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    const shop = shops.find((s) => s.id === newJob.shopId);
    if (!shop) return;

    const error = validatePageRange(newJob.pages, totalPages);
    if (error) {
      setPageRangeError(error);
      return;
    }
    setPageRangeError("");

    if (!newJob.file) {
      alert("Please select a PDF file to upload.");
      return;
    }

    const pagesToPrint = getPagesToPrintCount(newJob.pages, totalPages);
    const copies = Number(newJob.copies) || 1;
    const amount = pagesToPrint * copies * ratePerPage(newJob.color);

    setIsUploading(true);
    let cloudinaryUrl = "";
    try {
      const formData = new FormData();
      formData.append("file", newJob.file);
      const uploadResponse = await axios.post("http://localhost:1500/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });
      cloudinaryUrl = uploadResponse.data.cloudinary_url;
    } catch (uploadError) {
      console.error("Error uploading file to Cloudinary:", uploadError);
      alert("Failed to upload file to Cloudinary. Please try again.");
      setIsUploading(false);
      return;
    }

    const printSpecs = {
      printershopid: newJob.shopId,
      urlofprinddocument: cloudinaryUrl,
      printcopies: copies,
      printpagenos: newJob.pages,
      printpapersize: newJob.printpapersize || "A4",
      printcolor: newJob.color === "Color" ? "Colour" : "Black and White",
      duplex: newJob.duplex === "Double-sided"
    };

    try {
      // 1. Create order on the backend with print specs
      const response = await axios.post("http://localhost:1500/api/payment/create-order", { printSpecs }, {
        withCredentials: true
      });

      if (response.data.message) {
        alert(response.data.message);
        setIsUploading(false);
        return;
      }

      const { order_id, amount: orderAmount, currency, key_id } = response.data;

      // Detect mock payment order (credentials missing or expired)
      if (order_id.startsWith("order_mock_")) {
        console.log("Mock order detected (credentials missing or expired). Bypassing Razorpay Checkout modal.");
        const mockResponse = {
          razorpay_order_id: order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_bypass",
        };
        try {
          const verifyRes = await axios.post(
            "http://localhost:1500/api/payment/verify",
            mockResponse,
            { withCredentials: true }
          );

          if (verifyRes.data.status === "ok") {
            alert("Payment Verified (Offline Test Mode) & Print Job Placed Successfully!");
            const job = verifyRes.data.job;
            const pagesCount = (() => {
              const rangeStr = job.printpagenos || "";
              if (rangeStr.toLowerCase() === "all") return 1;
              const match = rangeStr.match(/^(\d+)-(\d+)$/);
              if (match) return parseInt(match[2]) - parseInt(match[1]) + 1;
              if (rangeStr.match(/^(\d+)(,\d+)*$/)) return rangeStr.split(",").length;
              return 1;
            })();

            const addedJob = {
              id: job._id,
              fileName: job.urlofprinddocument.split("/").pop() || "untitled_document.pdf",
              shopName: shop.name,
              pages: pagesCount,
              color: job.printcolor === "Colour" ? "Color" : "B/W",
              copies: job.printcopies,
              duplex: job.duplex ? "Double-sided" : "Single-sided",
              amount: job.printcopies * pagesCount * (job.printcolor === "Colour" ? 5 : 2),
              status: "printing",
            };
            setJobs((prev) => [addedJob, ...prev]);
            setShowNewJobForm(false);
          } else {
            alert("Offline payment verification failed.");
          }
        } catch (verifyError) {
          console.error("Test verification error:", verifyError);
          alert("Error verifying test payment signature");
        } finally {
          setIsUploading(false);
        }
        return;
      }

      // 2. Open Razorpay checkout options immediately
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: "Campus Print Service",
        description: `Payment for printing: ${cloudinaryUrl.split("/").pop() || "document.pdf"}`,
        order_id: order_id,
        prefill: {
          name: user ? user.fullname : "Customer",
          email: user ? user.email : "customer@example.com",
          contact: user ? String(user.mobile) : "9999999999",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async function (razorpayResponse) {
          try {
            // 3. Verify payment signature on backend which creates the Printdetails job
            const verifyRes = await axios.post(
              "http://localhost:1500/api/payment/verify",
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              },
              { withCredentials: true }
            );

            if (verifyRes.data.status === "ok") {
              alert("Payment Verified & Print Job Placed Successfully!");
              const job = verifyRes.data.job;
              const pagesCount = (() => {
                const rangeStr = job.printpagenos || "";
                if (rangeStr.toLowerCase() === "all") return 1;
                const match = rangeStr.match(/^(\d+)-(\d+)$/);
                if (match) return parseInt(match[2]) - parseInt(match[1]) + 1;
                if (rangeStr.match(/^(\d+)(,\d+)*$/)) return rangeStr.split(",").length;
                return 1;
              })();

              const addedJob = {
                id: job._id,
                fileName: job.urlofprinddocument.split("/").pop() || "untitled_document.pdf",
                shopName: shop.name,
                pages: pagesCount,
                color: job.printcolor === "Colour" ? "Color" : "B/W",
                copies: job.printcopies,
                duplex: job.duplex ? "Double-sided" : "Single-sided",
                amount: job.printcopies * pagesCount * (job.printcolor === "Colour" ? 5 : 2),
                status: "printing",
              };
              setJobs((prev) => [addedJob, ...prev]);
              setShowNewJobForm(false);
            } else {
              alert("Payment verification failed. Print job could not be placed.");
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            alert("Error verifying payment signature");
          } finally {
            setIsUploading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsUploading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating payment order:", error);
      const errMsg = error.response && error.response.data && error.response.data.message
        ? error.response.data.message
        : "Failed to initiate payment. Please try again.";
      alert(errMsg);
      setIsUploading(false);
    }
  };

  const handlePay = async (jobId) => {
    setPayingJobId(jobId);
    const jobItem = jobs.find((j) => j.id === jobId);
    if (!jobItem) {
      alert("Job details not found");
      setPayingJobId(null);
      return;
    }

    try {
      // 1. Create order on the backend
      const response = await axios.post(
        "http://localhost:1500/api/payment/create-order",
        { jobId, amount: jobItem.amount },
        { withCredentials: true }
      );

      const { order_id, amount: orderAmount, currency, key_id } = response.data;

      // 2. Open Razorpay checkout options
      const options = {
        key: key_id,
        amount: orderAmount,
        currency: currency,
        name: "Campus Print Service",
        description: `Payment for print job: ${jobItem.fileName}`,
        order_id: order_id,
        prefill: {
          name: user ? user.fullname : "Customer",
          email: user ? user.email : "customer@example.com",
          contact: user ? String(user.mobile) : "9999999999",
        },
        theme: {
          color: "#3B82F6",
        },
        handler: async function (razorpayResponse) {
          try {
            // 3. Verify payment signature on backend
            const verifyRes = await axios.post(
              "http://localhost:1500/api/payment/verify",
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                jobId: jobId,
              },
              { withCredentials: true }
            );

            if (verifyRes.data.status === "ok") {
              alert("Payment Verified & Success!");
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === jobId ? { ...j, status: "printing" } : j
                )
              );
            } else {
              alert("Payment verification failed. Please try again.");
              setJobs((prev) =>
                prev.map((j) =>
                  j.id === jobId ? { ...j, status: "payment_failed" } : j
                )
              );
            }
          } catch (verifyError) {
            console.error("Verification error:", verifyError);
            alert("Error verifying payment signature");
            setJobs((prev) =>
              prev.map((j) =>
                j.id === jobId ? { ...j, status: "payment_failed" } : j
              )
            );
          } finally {
            setPayingJobId(null);
          }
        },
        modal: {
          ondismiss: function () {
            setPayingJobId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Failed to initiate payment. Please try again.");
      setPayingJobId(null);
    }
  };

  const handleCollect = async (jobId) => {
    try {
      await axios.post(
        "http://localhost:1500/api/job/status",
        { jobId, status: "collected" },
        { withCredentials: true }
      );
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: "collected" } : j))
      );
      alert("Job marked as collected successfully!");
    } catch (error) {
      console.error("Error marking job as collected:", error);
      alert("Failed to mark job as collected in database");
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-inner">
        <header className="dashboard-header">
          <div>
            <h1>Your Print Dashboard</h1>
            <p className="subtitle">Find a shop, send your file, track it to pickup.</p>
          </div>
          <div className="header-actions">
            <div className="user-chip">
              <span className="avatar">
                {user ? user.fullname.split(" ").map(n => n[0]).join("").toUpperCase() : "U"}
              </span>
              {user ? user.fullname : "User"}
              <div>
      
              <button onClick={handleSignOut} className="btn-signout">
                Sign Out
              </button>
            </div>
            </div>
            <button className="btn-submit" onClick={() => startNewJob("")}>
              + New Print Job
            </button>
          </div>
        </header>

        <section className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{activeJobsCount}</div>
            <div className="stat-label">Active jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{readyCount}</div>
            <div className="stat-label">Ready for pickup</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{totalSpent}</div>
            <div className="stat-label">Total spent</div>
          </div>
        </section>

        {showNewJobForm && (
          <section className="new-job-panel">
            <div className="panel-header">
              <h2>New Print Job</h2>
              <button
                className="btn-outline btn-small"
                onClick={() => setShowNewJobForm(false)}
              >
                Cancel
              </button>
            </div>
            <form onSubmit={handleNewJobSubmit}>
              <div className="form-group">
                <label htmlFor="shopId">Printer shop</label>
                <select
                  id="shopId"
                  value={newJob.shopId}
                  onChange={handleNewJobChange("shopId")}
                  required
                >
                  <option value="" disabled>
                    Choose a shop available for your print
                  </option>
                  {shops
                    .filter(openForOrder)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {STATUS_LABEL[s.status]}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="file">Upload Document (PDF)</label>
                <input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pages">Page Range</label>
                  <input
                    id="pages"
                    type="text"
                    placeholder="e.g. 1-6 or 1,2,3 or all"
                    value={newJob.pages}
                    onChange={handlePageRangeChange}
                    required
                  />
                  {pageRangeError && <span className="error-text" style={{color: "#A35C5C", fontSize: "0.75rem", display: "block", marginTop: "0.25rem"}}>{pageRangeError}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="copies">Copies</label>
                  <input
                    id="copies"
                    type="number"
                    min="1"
                    value={newJob.copies}
                    onChange={handleNewJobChange("copies")}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <select
                    id="color"
                    value={newJob.color}
                    onChange={handleNewJobChange("color")}
                  >
                    <option value="B/W">Black &amp; White</option>
                    <option value="Color">Color</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="duplex">Duplex</label>
                  <select
                    id="duplex"
                    value={newJob.duplex}
                    onChange={handleNewJobChange("duplex")}
                  >
                    <option value="Single-sided">Single-sided</option>
                    <option value="Double-sided">Double-sided</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="printpapersize">Paper Size</label>
                  <select
                    id="printpapersize"
                    value={newJob.printpapersize}
                    onChange={handleNewJobChange("printpapersize")}
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="A2">A2</option>
                    <option value="A1">A1</option>
                    <option value="A0">A0</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={isUploading}>
                  {isUploading ? "Uploading PDF..." : "Submit & Continue to Payment"}
                </button>
              </div>
              <p className="form-hint">
                Shops marked "Scheduled only" will print at their set time rather
                than immediately.
              </p>
            </form>
          </section>
        )}

        <div className="dashboard-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Nearby Printer Shops</h2>
            </div>
            <div className="shop-list">
              {shops.map((shop) => (
                <div className="shop-card" key={shop.id}>
                  <div className="shop-info">
                    <h3>{shop.name}</h3>
                    <div className="shop-meta">
                      {shop.distance}
                      {shop.status === "scheduled" && shop.availableFrom
                        ? ` · Next slot ${shop.availableFrom}`
                        : ""}
                    </div>
                    <div className="shop-services">
                      {shop.services.map((s) => (
                        <span className="service-tag" key={s}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shop-actions">
                    <span className={`status-badge status-${shop.status}`}>
                      {STATUS_LABEL[shop.status]}
                    </span>
                    {shop.status !== "closed" && (
                      <button
                        className="btn-outline btn-small bg-saph"
                        disabled={!openForOrder(shop)}
                        onClick={() => startNewJob(shop.id)}
                      >
                        Print here
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>My Print Jobs</h2>
            </div>
            <div className="order-list">
              {jobs.length === 0 && (
                <p className="empty-state">No print jobs yet.</p>
              )}
              {jobs.map((job) => (
                <div className="order-card" key={job.id}>
                  <div className="order-top">
                    <div>
                      <div className="order-file">{job.fileName}</div>
                      <div className="order-shop">{job.shopName}</div>
                    </div>
                    <span className={`status-badge status-${job.status}`}>
                      {JOB_STATUS_LABEL[job.status]}
                    </span>
                  </div>
                  <div className="order-specs">
                    {job.pages} pages · {job.color} · {job.copies}{" "}
                    {job.copies > 1 ? "copies" : "copy"} · {job.duplex}
                  </div>
                  <div className="order-bottom">
                    <div>
                      <div className="order-amount">₹{job.amount}</div>
                      {job.pickupTime && (
                        <div className="order-pickup">Pickup: {job.pickupTime}</div>
                      )}
                    </div>

                    {job.status === "payment_pending" && (
                      <button
                        className="btn-submit btn-small"
                        disabled={payingJobId === job.id}
                        onClick={() => handlePay(job.id)}
                      >
                        {payingJobId === job.id ? "Processing…" : "Pay Now"}
                      </button>
                    )}

                    {job.status === "payment_failed" && (
                      <button
                        className="btn-outline btn-small"
                        onClick={() => handlePay(job.id)}
                      >
                        Retry Payment
                      </button>
                    )}

                    {job.status === "ready" && (
                      <button
                        className="btn-submit btn-small"
                        onClick={() => handleCollect(job.id)}
                      >
                        Mark as Collected
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Notifications</h2>
          </div>
          <div className="notification-list">
            {notifications.length === 0 && (
              <p className="empty-state">You're all caught up.</p>
            )}
            {notifications.map((note) => (
              <div className="notification-item" key={note.id}>
                <span className="notification-dot" />
                <div>
                  <div className="notification-text">{note.text}</div>
                  <div className="notification-time">{note.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}