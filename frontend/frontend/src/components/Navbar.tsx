function Navbar() {
  return (
    <nav className="navbar">
      <h2>📧 Email Scheduler</h2>

      <div>
        <a href="#dashboard">Dashboard</a>
        <a href="#create">Create Email</a>
        <a href="#emails">My Emails</a>
      </div>
    </nav>
  );
}

export default Navbar;