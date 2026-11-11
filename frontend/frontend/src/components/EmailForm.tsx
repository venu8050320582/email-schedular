import { useState } from "react";
import { createEmail } from "../services/emailApi";

interface Props {
  onCreated: () => void;
}

function EmailForm({ onCreated }: Props) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createEmail({
        recipient,
        subject,
        body,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });

      alert("Email scheduled successfully!");

      setRecipient("");
      setSubject("");
      setBody("");
      setScheduledAt("");

      onCreated();
    } catch (error: any) {
      alert(error.response?.data?.message || "Unable to schedule email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="email-form" onSubmit={handleSubmit}>
      <h2>Schedule New Email</h2>

      <input
        type="email"
        placeholder="Recipient Email"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Email Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        required
      />

      <textarea
        placeholder="Write your message..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />

      <label>Schedule Date and Time</label>

      <input
        type="datetime-local"
        value={scheduledAt}
        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
        onChange={(e) => setScheduledAt(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Email"}
      </button>
    </form>
  );
}

export default EmailForm;