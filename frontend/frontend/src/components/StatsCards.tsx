import type { EmailStats } from "../types/email";

interface Props {
  stats: EmailStats | null;
}

function StatsCards({ stats }: Props) {
  const cards = [
    { title: "Total Emails", value: stats?.total ?? 0 },
    { title: "Scheduled", value: stats?.scheduled ?? 0 },
    { title: "Sent", value: stats?.sent ?? 0 },
    { title: "Failed", value: stats?.failed ?? 0 },
  ];

  return (
    <div className="stats-container">
      {cards.map((card) => (
        <div className="stat-card" key={card.title}>
          <h3>{card.title}</h3>
          <h1>{card.value}</h1>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;