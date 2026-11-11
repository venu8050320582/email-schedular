
import { useState } from "react";
import type { Email } from "../types/email";
import { cancelEmail, deleteEmail } from "../services/emailApi";

interface Props {
  emails: Email[];
  onRefresh: () => void;
}

function EmailList({ emails, onRefresh }: Props) {
  const [search, setSearch] = useState("");

  const handleCancel = async (id: number) => {
    try {
      await cancelEmail(id);
      alert("Email cancelled successfully!");
      onRefresh();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Unable to cancel email"
      );
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this email?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmail(id);
      alert("Email deleted successfully!");
      onRefresh();
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
        "Unable to delete email"
      );
    }
  };

  if (!Array.isArray(emails)) {
    return (
      <div className="email-list">
        <h2>All Scheduled Emails</h2>
        <p>Invalid email data received from server.</p>
      </div>
    );
  }

  // Filter emails by recipient, subject, body or status
  const filteredEmails = emails.filter((email) => {
    const searchText = search.toLowerCase();

    return (
      email.recipient?.toLowerCase().includes(searchText) ||
      email.subject?.toLowerCase().includes(searchText) ||
      email.body?.toLowerCase().includes(searchText) ||
      email.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="email-list">
      <h2>All Scheduled Emails</h2>

      {/* Search input */}
      <input
        type="text"
        className="email-search"
        placeholder="Search by recipient, subject, message or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredEmails.length === 0 && (
        <p>No emails found.</p>
      )}

      {filteredEmails.map((email) => (
        <div className="email-item" key={email.id}>
          <div>
            <h3>{email.subject}</h3>

            <p>To: {email.recipient}</p>

            <p>
              Scheduled:{" "}
              {new Date(email.scheduled_at).toLocaleString()}
            </p>

            <p>
              Status: <strong>{email.status}</strong>
            </p>

            {email.sent_at && (
              <p>
                Sent: {new Date(email.sent_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="email-actions">
            {email.status === "SCHEDULED" && (
              <button onClick={() => handleCancel(email.id)}>
                Cancel
              </button>
            )}

            <button
              className="delete-btn"
              onClick={() => handleDelete(email.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmailList;
