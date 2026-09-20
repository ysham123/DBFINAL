import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  requestAPI,
  orderAPI,
  billAPI,
  getErrorMessage,
} from "../services/api";
import {
  Plus,
  FileText,
  CalendarDays,
  Receipt,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Clock,
} from "lucide-react";
import {
  PageHeader,
  EmptyState,
  Notice,
  Table,
  Status,
  ViewLink,
  money,
  date,
} from "../components/UI";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ requests: [], orders: [], bills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([
      requestAPI.getMyRequests(),
      orderAPI.getMyOrders(),
      billAPI.getMyBills(),
    ])
      .then(([requests, orders, bills]) => {
        if (active)
          setData({
            requests: requests.data,
            orders: orders.data,
            bills: bills.data,
          });
      })
      .catch((error) => {
        if (active) setError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading)
    return (
      <div className="loading" role="status">
        Loading your overview…
      </div>
    );
  const activeOrders = data.orders.filter((o) =>
    ["scheduled", "in_progress"].includes(o.completion_status),
  );
  const nextOrder = activeOrders
    .filter(
      (o) =>
        new Date(o.scheduled_datetime) >= new Date() ||
        o.completion_status === "in_progress",
    )
    .sort(
      (a, b) => new Date(a.scheduled_datetime) - new Date(b.scheduled_datetime),
    )[0];
  const unpaid = data.bills.filter((b) => b.bill_status !== "paid");
  const stats = [
    [
      "Service requests",
      data.requests.length,
      "All requests",
      FileText,
      "/my-requests",
    ],
    [
      "Active orders",
      activeOrders.length,
      "Scheduled or in progress",
      CalendarDays,
      "/my-orders",
    ],
    [
      "Outstanding bills",
      unpaid.length,
      money(unpaid.reduce((sum, bill) => sum + Number(bill.amount), 0)) +
        " remaining",
      Receipt,
      "/my-bills",
    ],
    [
      "Completed cleans",
      data.orders.filter((o) => o.completion_status === "completed").length,
      "Services completed",
      CheckCircle2,
      "/my-orders",
    ],
  ];

  return (
    <div className="container">
      <PageHeader
        eyebrow="Your overview"
        title={`Welcome back, ${user?.first_name}.`}
        description="Here’s what’s happening with your home."
      >
        <Link to="/new-request" className="btn btn-primary">
          <Plus size={16} />
          New request
        </Link>
      </PageHeader>
      <Notice message={error} error />
      {!error && (
        <>
          <div className="grid">
            {stats.map(([label, value, caption, Icon, to]) => (
              <Link to={to} className="stat-card" key={label}>
                <div className="stat-heading">
                  <h3>{label}</h3>
                  <Icon size={17} />
                </div>
                <div className="value">{value}</div>
                <p className="stat-caption">{caption}</p>
              </Link>
            ))}
          </div>
          <div className="dashboard-columns">
            <div>
              <section className="card">
                <div className="section-heading">
                  <div>
                    <h2>Recent requests</h2>
                    <p>Your latest requests and quotes.</p>
                  </div>
                  <ViewLink to="/my-requests" />
                </div>
                {data.requests.length ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Request</th>
                        <th>Service address</th>
                        <th>Status</th>
                        <th>Budget</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.requests.slice(0, 5).map((request) => (
                        <tr key={request.request_id}>
                          <td>
                            <Link to={`/request/${request.request_id}`}>
                              #{String(request.request_id).padStart(4, "0")}
                            </Link>
                            <br />
                            <small>{date(request.created_at)}</small>
                          </td>
                          <td>
                            {request.service_address}
                            <br />
                            <small>
                              {request.cleaning_type} · {request.num_rooms}{" "}
                              rooms
                            </small>
                          </td>
                          <td>
                            <Status value={request.status} />
                          </td>
                          <td>{money(request.proposed_budget)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState
                    title="Your first clean starts here"
                    description="Tell us about your space and preferred date. Anna will send you a quote."
                  >
                    <Link to="/new-request" className="btn btn-secondary">
                      <Plus size={14} />
                      Create a request
                    </Link>
                  </EmptyState>
                )}
              </section>
              <section className="card">
                <div className="section-heading">
                  <div>
                    <h2>Service schedule</h2>
                    <p>Keep track of your confirmed bookings.</p>
                  </div>
                  <ViewLink to="/my-orders" />
                </div>
                {data.orders.length ? (
                  <Table>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Scheduled</th>
                        <th>Status</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.slice(0, 4).map((order) => (
                        <tr key={order.order_id}>
                          <td>
                            <Link to={`/order/${order.order_id}`}>
                              {order.service_address}
                            </Link>
                            <br />
                            <small>
                              Order #{String(order.order_id).padStart(4, "0")}
                            </small>
                          </td>
                          <td>{date(order.scheduled_datetime)}</td>
                          <td>
                            <Status value={order.completion_status} />
                          </td>
                          <td>{money(order.final_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <EmptyState
                    title="No services scheduled"
                    description="Once you accept a quote, your booking will appear here."
                  />
                )}
              </section>
            </div>
            <aside className="dashboard-aside">
              <section className="card next-service">
                <div className="section-heading">
                  <h3>Next service</h3>
                  <CalendarDays size={17} />
                </div>
                {nextOrder ? (
                  <>
                    <p className="service-date">
                      {new Date(
                        nextOrder.scheduled_datetime,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="service-meta">
                      {new Date(
                        nextOrder.scheduled_datetime,
                      ).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}{" "}
                      · {nextOrder.cleaning_type}
                    </p>
                    <div className="service-address">
                      <MapPin size={14} />
                      {nextOrder.service_address}
                    </div>
                    <ViewLink to={`/order/${nextOrder.order_id}`}>
                      View booking
                    </ViewLink>
                  </>
                ) : (
                  <>
                    <p className="service-date">
                      Room for a<br />
                      fresh start.
                    </p>
                    <p className="service-meta">
                      Choose a time that works for you.
                    </p>
                    <div className="service-address">
                      <ViewLink to="/new-request">Request a clean</ViewLink>
                    </div>
                  </>
                )}
              </section>
              <section className="card">
                <h3>From request to clean</h3>
                <div className="quiet-list">
                  <div className="quiet-list-item">
                    <FileText size={17} />
                    <div>
                      <strong>Tell us about your space</strong>
                      <p>Share the details and your budget.</p>
                    </div>
                  </div>
                  <div className="quiet-list-item">
                    <MessageSquare size={17} />
                    <div>
                      <strong>Review your quote</strong>
                      <p>Accept it or discuss changes with Anna.</p>
                    </div>
                  </div>
                  <div className="quiet-list-item">
                    <Clock size={17} />
                    <div>
                      <strong>We’ll take it from there</strong>
                      <p>Track your service and billing here.</p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
