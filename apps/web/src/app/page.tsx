import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "£27",
    desc: "AI-generated site from your Instagram. Hosted on your subdomain.",
  },
  {
    name: "Tailored",
    price: "£54",
    desc: "Embedded lead form to collect emails & customers, lead dashboard, and we design it for you one-on-one within 48h.",
    highlight: true,
  },
  {
    name: "Pro",
    price: "£101",
    desc: "Everything in Tailored plus booking calendar and a marketing funnel page.",
  },
  {
    name: "Studio",
    price: "£299",
    desc: "Full CRM with mass email & SMS campaigns to opted-in leads.",
  },
];

export default function HomePage() {
  return (
    <main>
      <header style={{ borderBottom: "1px solid var(--line)", padding: "1rem 0", background: "var(--surface)" }}>
        <div className="mic-container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong className="mic-gradient-text" style={{ fontSize: "1.15rem" }}>My Instagram Canva</strong>
          <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className="mic-btn mic-btn-primary">Start free trial</Link>
          </nav>
        </div>
      </header>

      <section className="mic-container" style={{ padding: "5rem 0 3rem" }}>
        <p className="mic-gradient-text" style={{ letterSpacing: "0.1em", textTransform: "uppercase", fontSize: "0.8rem", fontWeight: 600 }}>
          Instagram-inspired websites for creators
        </p>
        <h1 style={{ fontSize: "clamp(2.25rem, 6vw, 4rem)", lineHeight: 1.08, margin: "1rem 0", fontWeight: 700 }}>
          Turn your Instagram into a website in minutes
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", maxWidth: "600px" }}>
          Enter your username or connect Instagram. We build a clean, gradient-branded site
          at <strong>username.myinstagramcanva.com</strong>. 14-day free trial.
        </p>
        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/signup" className="mic-btn mic-btn-primary">Create your site</Link>
          <Link href="#pricing" className="mic-btn mic-btn-ghost">See pricing</Link>
        </div>
      </section>

      <section id="pricing" className="mic-container" style={{ padding: "2rem 0 4rem" }}>
        <h2 style={{ marginBottom: "1rem", fontWeight: 700 }}>Pricing</h2>
        <div className="mic-grid-4">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="mic-card"
              style={tier.highlight ? { borderColor: "#e1306c", boxShadow: "0 0 0 1px #e1306c" } : undefined}
            >
              <h3 style={{ fontWeight: 700 }}>{tier.name}</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, margin: "0.5rem 0" }} className="mic-gradient-text">
                {tier.price}
              </p>
              <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{tier.desc}</p>
            </article>
          ))}
        </div>
        <p style={{ color: "var(--muted)", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          AI Changer add-on: £10/mo (your OpenAI key) or £18/mo managed (30 edits/month). Tailored includes email alerts when leads submit — not mass campaigns (Studio).
        </p>
      </section>
    </main>
  );
}
