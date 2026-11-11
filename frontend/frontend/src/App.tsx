import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import StatsCards from "./components/StatsCards";
import EmailForm from "./components/EmailForm";
import EmailList from "./components/EmailList";
import { getEmails, getEmailStats } from "./services/emailApi";
import type { Email, EmailStats } from "./types/email";
import SearchBar from "./components/SearchBar";
import "./App.css";

function App() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);

  const loadDashboard = async () => {
  try {
    const [emailResponse, statsResponse] = await Promise.all([
      getEmails(),
      getEmailStats(),
    ]);

    console.log("EMAIL RESPONSE:", emailResponse);
    console.log("STATS RESPONSE:", statsResponse);

    const emailArray = Array.isArray(emailResponse)
      ? emailResponse
      : emailResponse.emails ??
        emailResponse.data?.emails ??
        emailResponse.data ??
        [];

    setEmails(Array.isArray(emailArray) ? emailArray : []);

    const actualStats =
      statsResponse.stats ??
      statsResponse.data?.stats ??
      statsResponse.data ??
      statsResponse;

    setStats(actualStats);
  } catch (error) {
    console.error("Dashboard loading failed:", error);
  }
};

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <>
      <Navbar />

      <main className="dashboard" id="dashboard">
        <h1>Email Scheduler Dashboard</h1>
        <p>Manage and schedule your emails easily.</p>

        <StatsCards stats={stats} />

        <section id="create">
          <EmailForm onCreated={loadDashboard} />
        </section>

        <section id="emails">
          <EmailList emails={emails} onRefresh={loadDashboard} />
        </section>
      </main>
    </>
  );
}

export default App;