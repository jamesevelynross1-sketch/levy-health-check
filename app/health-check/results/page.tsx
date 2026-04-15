'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { AssessmentReport } from '../../../lib/assessment';

export default function HealthCheckResultsPage() {
  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    try {
      const storedReport = window.localStorage.getItem('levyHealthCheckReport');
      if (storedReport) {
        setReport(JSON.parse(storedReport));
      }
    } catch (error) {
      console.error('Unable to load report from localStorage', error);
    }
  }, []);

  const topRecommendations = useMemo(() => {
    if (!report?.recommendations?.length) return [];
    return report.recommendations.slice(0, 5);
  }, [report]);

  if (!report) {
    return (
      <main className="results-page">
        <div className="results-shell">
          <section className="results-hero-card">
            <h1>No report available</h1>
            <p>Please complete the levy health check first.</p>
            <Link href="/health-check" className="action-button primary">
              Return to assessment
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="results-page">
      <div className="results-shell">
        <section className="results-hero-card">
          <div className="results-hero-top">
            <div>
              <p className="results-eyebrow">Levy Health Check Report</p>
              <h1>{report.metadata.organisationName || 'Your organisation'} results</h1>
              <p className="results-intro">
                A structured view of current levy utilisation maturity, capability gaps and
                immediate opportunities for improvement.
              </p>
            </div>

            <div className="results-score-panel">
              <span className="score-label">Overall score</span>
              <strong>{report.overallScore} / 10</strong>
              <span className="score-badge">{report.maturity}</span>
            </div>
          </div>

          <div className="results-meta-grid">
            <div className="meta-stat">
              <span>Sector</span>
              <strong>{report.metadata.sector}</strong>
            </div>
            <div className="meta-stat">
              <span>Workforce size</span>
              <strong>{report.metadata.workforceSize.toLocaleString()}</strong>
            </div>
            <div className="meta-stat">
              <span>Annual levy contribution</span>
              <strong>£{report.metadata.levyContribution.toLocaleString()}</strong>
            </div>
            <div className="meta-stat">
              <span>Monthly levy spend</span>
              <strong>£{report.metadata.monthlyLevySpend.toLocaleString()}</strong>
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <h2>Executive summary</h2>
            <p>High-level interpretation of your current levy maturity and delivery position.</p>
          </div>
          <div className="insight-card">
            <p>{report.executiveSummary}</p>
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <h2>Priority actions</h2>
            <p>The most immediate actions likely to improve utilisation, governance and impact.</p>
          </div>

          <div className="recommendation-list">
            {topRecommendations.length ? (
              topRecommendations.map((recommendation, index) => (
                <article
                  className="recommendation-card"
                  key={`${recommendation.categoryId}-${recommendation.title}-${index}`}
                >
                  <div className={`recommendation-priority ${recommendation.priority.toLowerCase()}`}>
                    {recommendation.priority}
                  </div>
                  <div className="recommendation-content">
                    <p className="recommendation-category">{recommendation.categoryTitle}</p>
                    <h3>{recommendation.title}</h3>
                    <p>{recommendation.detail}</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="insight-card">
                <p>
                  No specific recommendations were triggered. This generally indicates a stronger
                  maturity profile, with focus now shifting to optimisation and scale.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <h2>Category performance</h2>
            <p>How each area is currently performing across the assessment.</p>
          </div>

          <div className="category-results-grid">
            {report.categoryResults.map((result) => (
              <article className="category-result-card" key={result.id}>
                <div className="category-result-top">
                  <h3>{result.title}</h3>
                  <span className="category-score">{result.score} / 10</span>
                </div>
                <div className="mini-progress-track">
                  <div
                    className="mini-progress-fill"
                    style={{ width: `${result.score * 10}%` }}
                  />
                </div>
                <p>{result.comment}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="results-section two-column-section">
          <div>
            <div className="section-heading">
              <h2>Key risks</h2>
              <p>Areas where current maturity may be exposing value or delivery risk.</p>
            </div>
            <div className="simple-card-list">
              {report.keyRisks.map((risk, index) => (
                <article className="simple-insight-card" key={`risk-${index}`}>
                  <p>{risk}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="section-heading">
              <h2>Key opportunities</h2>
              <p>Where stronger alignment and structure could unlock more value.</p>
            </div>
            <div className="simple-card-list">
              {report.keyOpportunities.map((opportunity, index) => (
                <article className="simple-insight-card" key={`opportunity-${index}`}>
                  <p>{opportunity}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="section-heading">
            <h2>Recommended next steps</h2>
            <p>A practical set of actions to improve maturity over the next 30 to 90 days.</p>
          </div>
          <div className="simple-card-list">
            {report.recommendedNextSteps.map((step, index) => (
              <article className="simple-insight-card" key={`step-${index}`}>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="results-cta-card">
          <div>
            <p className="results-eyebrow">Follow-up support</p>
            <h2>Turn this report into an action plan</h2>
            <p>
              MPR Consulting can help translate these findings into a structured levy optimisation
              and apprenticeship implementation plan.
            </p>
          </div>

          <div className="cta-actions">
            <a
              className="action-button primary"
              href="mailto:james@mprconsulting.co.uk?subject=Levy Health Check Follow Up&body=Hi James, I'd like to discuss our levy health check results."
            >
              Request follow-up conversation
            </a>

            <Link href="/health-check" className="action-button secondary">
              Retake assessment
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}