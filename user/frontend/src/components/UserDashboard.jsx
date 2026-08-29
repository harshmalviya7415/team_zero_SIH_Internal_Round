import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserDashboard.css";


const STATUS_LABEL = {
  open: "Open · Available now",
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
    orientation: "Portrait",
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
    orientation: "Portrait",
    amount: 60,
    status: "payment_pending",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "note-1",
    text: "Your print at QuickPrint Koramangala is ready for pickup.",
    time: "10 min ago",
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
        const mapped = response.data.map(p => ({
          id: p._id,
          name: p.shopname || p.fullname,
          distance: "0.5 km away",
          status: "open",
          services: [p.services || "B/W"],
          pagesizes: p.pagesizes || "A4",
        }));
        setShops(mapped);
      } catch (error) {
        console.error("Error fetching shops:", error);
      }
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:1500/api/job/user", {
          withCredentials: true
        });
        
        const mapped = response.data.map(j => ({
          id: j._id,
          fileName: j.urlofprinddocument.split("/").pop(),
          shopName: j.printershopid ? (j.printershopid.shopname || j.printershopid.fullname) : "Unknown Shop",
          pages: parseInt(j.printpagenos.split("-")[1]) || 1,
          color: j.printcolor === "Colour" ? "Color" : "B/W",
          copies: j.printcopies,
          orientation: "Portrait",
          amount: j.printcopies * (parseInt(j.printpagenos.split("-")[1]) || 1) * (j.printcolor === "Colour" ? 5 : 2),
          status: j.printstatus === "Pending" ? "payment_pending" : j.printstatus,
        }));
        setJobs(mapped);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };
    fetchJobs();
  }, [user]);

  const [newJob, setNewJob] = useState({
    shopId: "",
    urlofprinddocument: "",
    pages: 1,
    color: "B/W",
    orientation: "Portrait",
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
      urlofprinddocument: "",
      pages: 1,
      color: "B/W",
      orientation: "Portrait",
      copies: 1,
      printpapersize: "A4",
    });
    setShowNewJobForm(true);
  };

  const handleNewJobChange = (field) => (e) => {
    setNewJob((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    const shop = shops.find((s) => s.id === newJob.shopId);
    if (!shop) return;

    const pages = Number(newJob.pages) || 1;
    const copies = Number(newJob.copies) || 1;
    const amount = pages * copies * ratePerPage(newJob.color);

    const payload = {
      printershopid: newJob.shopId,
      urlofprinddocument: newJob.urlofprinddocument,
      printcopies: copies,
      printpagenos: `1-${pages}`,
      printpapersize: newJob.printpapersize || "A4",
      printcolor: newJob.color === "Color" ? "Colour" : "Black and White"
    };

    try {
      const response = await axios.post("http://localhost:1500/api/job/create", payload, {
        withCredentials: true
      });

      if (response.data.mess) {
        alert(response.data.mess);
      } else {
        alert("Print Job Created Successfully!");
        const addedJob = {
          id: response.data._id,
          fileName: response.data.urlofprinddocument.split("/").pop() || "untitled_document.pdf",
          shopName: shop.name,
          pages,
          color: newJob.color,
          copies,
          orientation: newJob.orientation,
          amount,
          status: "payment_pending",
        };
        setJobs((prev) => [addedJob, ...prev]);
        setShowNewJobForm(false);
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      alert("Failed to submit print job. Please login again.");
    }
  };

  const handlePay = (jobId) => {
    setPayingJobId(jobId);
    window.setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (j.id !== jobId) return j;
          const success = Math.random() > 0.15;
          return success
            ? { ...j, status: "printing" }
            : { ...j, status: "payment_failed" };
        })
      );
      setPayingJobId(null);

      setJobs((prev) => {
        const job = prev.find((j) => j.id === jobId);
        if (job && job.status === "printing") {
          window.setTimeout(() => {
            setJobs((cur) =>
              cur.map((j) =>
                j.id === jobId
                  ? { ...j, status: "ready", pickupTime: "Today, in ~30 mins" }
                  : j
              )
            );
            setNotifications((prev) => [
              {
                id: `note-${Date.now()}`,
                text: `Your print "${job.fileName}" at ${job.shopName} is ready for pickup.`,
                time: "just now",
              },
              ...prev,
            ]);
          }, 1800);
        }
        return prev;
      });
    }, 1400);
  };

  const handleCollect = (jobId) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "collected" } : j))
    );
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
                <label htmlFor="urlofprinddocument">Document URL</label>
                <input
                  id="urlofprinddocument"
                  type="url"
                  placeholder="e.g. https://example.com/docs/report.pdf"
                  value={newJob.urlofprinddocument}
                  onChange={handleNewJobChange("urlofprinddocument")}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="pages">Pages</label>
                  <input
                    id="pages"
                    type="number"
                    min="1"
                    value={newJob.pages}
                    onChange={handleNewJobChange("pages")}
                  />
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
                  <label htmlFor="orientation">Orientation</label>
                  <select
                    id="orientation"
                    value={newJob.orientation}
                    onChange={handleNewJobChange("orientation")}
                  >
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
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
                <button type="submit" className="btn-submit">
                  Submit &amp; Continue to Payment
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
                    <button
                      className="btn-outline btn-small"
                      disabled={!openForOrder(shop)}
                      onClick={() => startNewJob(shop.id)}
                    >
                      Print here
                    </button>
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
                    {job.copies > 1 ? "copies" : "copy"} · {job.orientation}
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