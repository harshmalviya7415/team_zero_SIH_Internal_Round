import { useState } from "react";
import "./PrinterDashboard.css";

const INITIAL_ORDERS = [
  {
    id: "ORD-101",
    customer: { name: "Alice Smith", phone: "+1 555-0192" },
    documentName: "Project_Proposal.pdf",
    documentUrl: "#",
    specs: {
      color: "Color",
      orientation: "Portrait",
      pages: 12,
      copies: 2,
      paperSize: "A4",
      paperType: "80 GSM Standard",
      sides: "Double-sided (Duplex)",
    },
    status: "Queued",
    placedAt: "10:15 AM",
    completedAt: null,
  },
  {
    id: "ORD-102",
    customer: { name: "Bob Johnson", phone: "+1 555-0143" },
    documentName: "Flyer_Final.pdf",
    documentUrl: "#",
    specs: {
      color: "Color",
      orientation: "Landscape",
      pages: 1,
      copies: 50,
      paperSize: "A3",
      paperType: "200 GSM Glossy",
      sides: "Single-sided (Simplex)",
    },
    status: "Ready for Collection",
    placedAt: "09:30 AM",
    completedAt: "10:00 AM",
  },
  {
    id: "ORD-103",
    customer: { name: "Carol White", phone: "+1 555-0188" },
    documentName: "Thesis_Draft.pdf",
    documentUrl: "#",
    specs: {
      color: "Black & White",
      orientation: "Portrait",
      pages: 145,
      copies: 1,
      paperSize: "A4",
      paperType: "75 GSM Standard",
      sides: "Double-sided (Duplex)",
    },
    status: "Printing",
    placedAt: "10:20 AM",
    completedAt: null,
  },
];

export default function PrinterDashboard() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [filter, setFilter] = useState("All");

  // Status transition handlers
  const updateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              completedAt:
                newStatus === "Ready for Collection"
                  ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : order.completedAt,
            }
          : order
      )
    );
  };

  // Derived Summary Counts
  const pendingCount = orders.filter((o) => o.status === "Queued" || o.status === "Printing").length;
  const readyCount = orders.filter((o) => o.status === "Ready for Collection").length;
  const totalCount = orders.length;

  // Filter Logic
  const filteredOrders = orders.filter((order) => {
    if (filter === "All") return true;
    return order.status === filter;
  });

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Printer Dashboard</h1>
        <p>Manage pending print jobs, inspect specs, and track collections.</p>
      </header>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card yellow">
          <h3>Pending to Print</h3>
          <span className="kpi-value">{pendingCount}</span>
        </div>
        <div className="kpi-card green">
          <h3>Eligible for Collection</h3>
          <span className="kpi-value">{readyCount}</span>
        </div>
        <div className="kpi-card blue">
          <h3>Total Orders</h3>
          <span className="kpi-value">{totalCount}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Filter Controls */}
        <div className="table-controls">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Queued">Queued</option>
            <option value="Printing">Printing</option>
            <option value="Ready for Collection">Ready for Collection</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders Table */}
        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order & Customer</th>
                <th>Document</th>
                <th>Print Specs</th>
                <th>Status</th>
                <th>Timestamps</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No orders found matching status "{filter}".
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    {/* Customer */}
                    <td>
                      <strong>{order.id}</strong>
                      <div className="sub-text">{order.customer.name}</div>
                      <div className="sub-text">{order.customer.phone}</div>
                    </td>

                    {/* Document */}
                    <td>
                      <a href={order.documentUrl} target="_blank" rel="noreferrer" className="doc-link">
                        📄 {order.documentName}
                      </a>
                    </td>

                    {/* Specs */}
                    <td>
                      <ul className="specs-list">
                        <li><strong>Color:</strong> {order.specs.color}</li>
                        <li><strong>Orientation:</strong> {order.specs.orientation}</li>
                        <li><strong>Volume:</strong> {order.specs.pages} pgs × {order.specs.copies} copies</li>
                        <li><strong>Paper:</strong> {order.specs.paperSize} ({order.specs.paperType})</li>
                        <li><strong>Sides:</strong> {order.specs.sides}</li>
                      </ul>
                    </td>

                    {/* Status Badge */}
                    <td>
                      <span className={`badge badge-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Timestamps */}
                    <td>
                      <div className="sub-text"><strong>Placed:</strong> {order.placedAt}</div>
                      {order.completedAt && (
                        <div className="sub-text"><strong>Ready:</strong> {order.completedAt}</div>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-buttons">
                        {order.status === "Queued" && (
                          <button
                            className="btn-action btn-print"
                            onClick={() => updateStatus(order.id, "Printing")}
                          >
                            Print Now
                          </button>
                        )}
                        {order.status === "Printing" && (
                          <button
                            className="btn-action btn-ready"
                            onClick={() => updateStatus(order.id, "Ready for Collection")}
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === "Ready for Collection" && (
                          <button
                            className="btn-action btn-complete"
                            onClick={() => updateStatus(order.id, "Completed")}
                          >
                            Mark Collected
                          </button>
                        )}
                        {order.status !== "Completed" && order.status !== "Cancelled" && (
                          <button
                            className="btn-action btn-cancel"
                            onClick={() => updateStatus(order.id, "Cancelled")}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}