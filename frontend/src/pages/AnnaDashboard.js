import {
  Status,
  money,
  PageHeader,
  Table,
  Notice,
  EmptyState,
} from "../components/UI";
import React, { useState, useEffect } from "react";
import { dashboardAPI, getErrorMessage } from "../services/api";
import {
  Users,
  UserX,
  CheckSquare,
  UserCheck,
  TrendingUp,
  AlertCircle,
  XCircle,
  ThumbsUp,
} from "lucide-react";

function AnnaDashboard() {
  const [activeTab, setActiveTab] = useState("frequent");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const tabs = [
    { id: "frequent", label: "Returning clients", icon: Users },
    { id: "uncommitted", label: "Unconverted requests", icon: UserX },
    { id: "accepted", label: "Accepted quotes", icon: CheckSquare },
    { id: "prospective", label: "New clients", icon: UserCheck },
    { id: "largest", label: "Largest jobs", icon: TrendingUp },
    { id: "overdue", label: "Overdue bills", icon: AlertCircle },
    { id: "bad", label: "Outstanding balances", icon: XCircle },
    { id: "good", label: "Prompt payments", icon: ThumbsUp },
  ];

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        let response;
        switch (activeTab) {
          case "frequent":
            response = await dashboardAPI.getFrequentClients();
            break;
          case "uncommitted":
            response = await dashboardAPI.getUncommittedClients();
            break;
          case "accepted":
            response = await dashboardAPI.getAcceptedQuotes(year, month);
            break;
          case "prospective":
            response = await dashboardAPI.getProspectiveClients();
            break;
          case "largest":
            response = await dashboardAPI.getLargestJobs();
            break;
          case "overdue":
            response = await dashboardAPI.getOverdueBills();
            break;
          case "bad":
            response = await dashboardAPI.getBadClients();
            break;
          case "good":
            response = await dashboardAPI.getGoodClients();
            break;
          default:
            response = { data: [] };
        }
        if (active) setData(response.data);
      } catch (error) {
        if (active) setError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [activeTab, year, month]);

  const renderTable = () => {
    if (loading)
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      );
    if (error) return <Notice message={error} error />;
    if (data.length === 0)
      return (
        <EmptyState
          title="No matching records"
          description="This report will update as you work with clients and complete services."
        />
      );

    switch (activeTab) {
      case "frequent":
      case "uncommitted":
      case "prospective":
      case "bad":
      case "good":
        return (
          <Table>
            <thead>
              <tr>
                <th>Client ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                {activeTab === "frequent" && <th>Completed Orders</th>}
                {activeTab === "uncommitted" && <th>Total Requests</th>}
                {activeTab === "prospective" && <th>Registration Date</th>}
                {activeTab === "bad" && (
                  <>
                    <th>Overdue Bills</th>
                    <th>Total Unpaid</th>
                  </>
                )}
                {activeTab === "good" && <th>Bills Paid</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.client_id}>
                  <td>#{item.client_id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.email}</td>
                  <td>{item.phone_number}</td>
                  {activeTab === "frequent" && <td>{item.completed_orders}</td>}
                  {activeTab === "uncommitted" && (
                    <td>{item.total_requests}</td>
                  )}
                  {activeTab === "prospective" && (
                    <td>
                      {new Date(item.registration_date).toLocaleDateString()}
                    </td>
                  )}
                  {activeTab === "bad" && (
                    <>
                      <td>{item.overdue_bills}</td>
                      <td>{money(item.total_unpaid)}</td>
                    </>
                  )}
                  {activeTab === "good" && <td>{item.total_bills_paid}</td>}
                </tr>
              ))}
            </tbody>
          </Table>
        );

      case "accepted":
        return (
          <Table>
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Price</th>
                <th>Scheduled</th>
                <th>Accepted Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.quote_id}>
                  <td>#{item.quote_id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.service_address}</td>
                  <td>{item.cleaning_type}</td>
                  <td>{item.num_rooms}</td>
                  <td>{money(item.quoted_price)}</td>
                  <td>
                    {new Date(item.scheduled_datetime).toLocaleDateString()}
                  </td>
                  <td>
                    {new Date(item.quote_accepted_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );

      case "largest":
        return (
          <Table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Client</th>
                <th>Address</th>
                <th>Type</th>
                <th>Rooms</th>
                <th>Price</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.request_id}>
                  <td>#{item.request_id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.service_address}</td>
                  <td>{item.cleaning_type}</td>
                  <td>
                    <strong style={{ color: "var(--accent)" }}>
                      {item.num_rooms}
                    </strong>
                  </td>
                  <td>{money(item.final_price)}</td>
                  <td>{new Date(item.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        );

      case "overdue":
        return (
          <Table>
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Client</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.bill_id}>
                  <td>#{item.bill_id}</td>
                  <td>
                    {item.first_name} {item.last_name}
                  </td>
                  <td>{item.email}</td>
                  <td>{item.phone_number}</td>
                  <td>{money(item.amount)}</td>
                  <td>
                    <Status value={item.bill_status} />
                  </td>
                  <td>
                    <strong style={{ color: "#ef4444" }}>
                      {item.days_overdue}
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow="Business overview"
        title="Your workspace"
        description="A closer look at your clients, services, and billing."
      />

      <div className="card">
        <div>
          <div className="filter-tabs" aria-label="Reports">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "accepted" && (
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Year
              </label>
              <input
                type="number"
                aria-label="Report year"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: "120px" }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Month
              </label>
              <select
                aria-label="Report month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ width: "150px" }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div style={{ marginTop: "20px" }}>{renderTable()}</div>
      </div>
    </div>
  );
}

export default AnnaDashboard;
