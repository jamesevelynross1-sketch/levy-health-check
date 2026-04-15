import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Levy advisory</p>
          <h1>Apprenticeship Levy Health Check</h1>
          <p className="lead">
            Assess your organisation’s levy utilisation with a structured scoring model, then generate a clear consultancy report.
          </p>
          <Link href="/health-check" className="primary-button">
            Start the health check
          </Link>
        </div>
      </section>
    </main>
  );
}
