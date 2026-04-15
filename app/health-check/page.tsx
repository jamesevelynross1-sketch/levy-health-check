'use client';

import HealthCheckForm from '../../components/HealthCheckForm';

export default function HealthCheckPage() {
  return (
    <main className="page-shell">
      <section className="content-panel">
        <div className="section-header">
          <div>
            <p className="eyebrow">Step 1 of 4</p>
            <h1>Organisation health check</h1>
            <p>Collect structured assessment data to generate a professional utilisation report.</p>
          </div>
        </div>
        <HealthCheckForm />
      </section>
    </main>
  );
}
