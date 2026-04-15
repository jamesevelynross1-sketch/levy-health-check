'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Title,
  type Chart,
} from 'chart.js';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { AssessmentReport, estimateUnusedLevyValue } from '../../../lib/assessment';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale, Tooltip, Legend, Title);

const STORAGE_KEY = 'levyHealthCheckReport';

export default function ResultsPage() {
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const gaugeChartRef = useRef<Chart<'doughnut'> | null>(null);
  const barChartRef = useRef<Chart<'bar'> | null>(null);
  const radarChartRef = useRef<Chart<'radar'> | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setReport(JSON.parse(saved) as AssessmentReport);
      } catch (error) {
        console.error('Unable to parse saved report', error);
      }
    }
  }, []);

  const scoreColor = useMemo(() => {
    if (!report) return '#2563eb';
    if (report.overallScore <= 3) return '#dc2626';
    if (report.overallScore <= 6) return '#f59e0b';
    return '#16a34a';
  }, [report]);

  const sortedCategories = useMemo(
    () => (report ? [...report.categoryResults].sort((a, b) => a.score - b.score) : []),
    [report]
  );
  const chartLabels = useMemo(() => sortedCategories.map((category) => category.title), [sortedCategories]);
  const chartScores = useMemo(() => sortedCategories.map((category) => category.score), [sortedCategories]);
  const maturitySteps = ['Reactive', 'Developing', 'Structured', 'Optimised'];
  const maturityIndex = report ? maturitySteps.indexOf(report.maturity) : 0;
  const safeNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return parsed || fallback;
  };
  const monthlySpend = report ? safeNumber(report.metadata.monthlyLevySpend, 0) : 0;
  const levy = report ? safeNumber(report.metadata.levyContribution, 1) : 1;
  const workforce = report ? safeNumber(report.metadata.workforceSize, 1) : 1;
  const apprentices = report ? safeNumber(report.metadata.apprenticeCount, 0) : 0;
  const displayLevyContribution = report ? (Number(report.metadata.levyContribution) || 0) : 0;
  const displayApprenticeCount = report ? (Number(report.metadata.apprenticeCount) || 0) : 0;
  const annualLevySpend = monthlySpend * 12;
  const utilisationRate = levy > 0 ? Number(((annualLevySpend / levy) * 100).toFixed(1)) : 0;
  const apprenticesPer100 = workforce > 0 ? Number(((apprentices / workforce) * 100).toFixed(1)) : 0;
  const avgSpendPerApprentice = apprentices > 0 ? Math.round(monthlySpend / apprentices) : 0;
  const unusedLevyValue = report ? estimateUnusedLevyValue(Number(report.metadata.levyContribution) || 0, report.overallScore) : 0;
  const priorityActionArea = sortedCategories[0]?.title ?? 'Levy strategy';

  const financialInsight = useMemo(() => {
    if (!report) return '';
    const contribution = levy;
    const available = annualLevySpend;
    if (utilisationRate < 70) {
      return `At ${utilisationRate.toFixed(1)}% utilisation of a £${contribution.toLocaleString()} levy contribution, the profile indicates under-utilisation. There is a real risk that unspent levy will be lost rather than invested in capability, so strategic alignment to high-value skills spend is essential.`;
    }
    return `The current profile is using £${available.toLocaleString()} of a £${contribution.toLocaleString()} levy budget, supporting a disciplined funding position. Continue aligning levy investment to strategic skills priorities to sustain value and avoid otherwise unspent levy capacity.`;
  }, [report, utilisationRate, annualLevySpend, levy]);

  const getKpiStatus = (type: 'annual' | 'utilisation' | 'apprentices', value: number) => {
    if (type === 'annual') {
      if (value < 100000) return { color: '#dc2626', label: 'Below target' };
      if (value < 250000) return { color: '#f59e0b', label: 'Needs review' };
      return { color: '#16a34a', label: 'Healthy spend' };
    }
    if (type === 'utilisation') {
      if (value < 60) return { color: '#dc2626', label: 'Low utilisation' };
      if (value < 90) return { color: '#f59e0b', label: 'Moderate utilisation' };
      return { color: '#16a34a', label: 'Strong utilisation' };
    }
    if (value < 5) return { color: '#dc2626', label: 'Under-indexed' };
    if (value < 12) return { color: '#f59e0b', label: 'Moderate density' };
    return { color: '#16a34a', label: 'Strong density' };
  };

  const topPriorities = useMemo(
    () =>
      sortedCategories.slice(0, 3).map((category, index) => ({
        title: category.title,
        description:
          category.score <= 3
            ? 'Immediate action needed to reduce risk and secure levy value.'
            : category.score <= 6
            ? 'Important improvement opportunity to strengthen delivery outcomes.'
            : 'Maintain momentum and convert capability into ongoing return on investment.',
      })),
    [sortedCategories]
  );

  const impactOfInaction = useMemo(() => {
    if (!report) return '';
    if (report.overallScore <= 4) {
      return `If left unaddressed, there is a significant risk that up to £${unusedLevyValue.toLocaleString()} of levy value will remain unused and fail to support strategic workforce capability.`;
    }
    if (report.overallScore <= 7) {
      return `Without targeted action, the organisation is likely to under-leverage levy contributions, creating a capability gap and lost training ROI.`;
    }
    return `Even well-positioned programmes require proactive refinement; otherwise, some levy investment may still fail to deliver full commercial impact.`;
  }, [report, unusedLevyValue]);

  const getCategoryStatus = (score: number) => {
    if (score <= 3) {
      return { label: 'Critical risk', border: '#f87171', badge: '#fee2e2' };
    }
    if (score <= 6) {
      return { label: 'Opportunity', border: '#fbbf24', badge: '#fef3c7' };
    }
    return { label: 'On track', border: '#34d399', badge: '#d1fae5' };
  };

  const gaugeData = useMemo(
    () => ({
      labels: ['Score', 'Remaining'],
      datasets: [
        {
          data: report ? [report.overallScore, 10 - report.overallScore] : [0, 10],
          backgroundColor: [scoreColor, 'rgba(15, 23, 42, 0.08)'],
          borderWidth: 0,
        },
      ],
    }),
    [report, scoreColor]
  );

  const barData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: 'Score',
          data: chartScores,
          backgroundColor: chartScores.map((score) =>
            score <= 3 ? '#ef4444' : score <= 6 ? '#f59e0b' : '#2563eb'
          ),
          borderRadius: 999,
          maxBarThickness: 22,
        },
      ],
    }),
    [chartLabels, chartScores]
  );

  const radarData = useMemo(
    () => ({
      labels: chartLabels,
      datasets: [
        {
          label: 'Assessment strength',
          data: chartScores,
          backgroundColor: 'rgba(37, 99, 235, 0.18)',
          borderColor: '#2563eb',
          borderWidth: 3,
          pointBackgroundColor: '#1d4ed8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    }),
    [chartLabels, chartScores]
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
        afterDatasetsDraw: (chart: Chart) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar, index) => {
              const data = dataset.data[index] as number;
              const x = bar.x + 12;
              const y = bar.y;
              ctx.fillStyle = '#0f172a';
              ctx.font = '600 12px Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${data.toFixed(1)}`, x, y);
            });
          });
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#475569',
          },
          grid: {
            color: 'rgba(15, 23, 42, 0.08)',
          },
        },
        y: {
          ticks: {
            color: '#334155',
            font: { weight: '600' },
          },
          grid: {
            display: false,
          },
        },
      },
    }),
    []
  );

  const radarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            backdropColor: 'transparent',
            color: '#475569',
            showLabelBackdrop: false,
          },
          grid: {
            color: 'rgba(15, 23, 42, 0.1)',
          },
          angleLines: {
            color: 'rgba(15, 23, 42, 0.15)',
          },
          pointLabels: {
            color: '#0f172a',
            font: { size: 13, weight: '600' },
            padding: 12,
          },
        },
      },
    }),
    []
  );

  const downloadReport = (currentReport: AssessmentReport) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = 80;
    const gaugeImage = gaugeChartRef.current?.toBase64Image();
    const barImage = barChartRef.current?.toBase64Image();
    const radarImage = radarChartRef.current?.toBase64Image();
    const metadataLevyContribution = safeNumber(currentReport.metadata.levyContribution, 0);
    const metadataMonthlySpend = safeNumber(currentReport.metadata.monthlyLevySpend, 0);
    const metadataWorkforceSize = safeNumber(currentReport.metadata.workforceSize, 0);
    const metadataApprenticeCount = safeNumber(currentReport.metadata.apprenticeCount, 0);
    const unusedLevyValue = estimateUnusedLevyValue(metadataLevyContribution, currentReport.overallScore);
    const annualLevySpend = metadataMonthlySpend * 12;
    const utilisationRate = metadataLevyContribution > 0
      ? Number(((annualLevySpend / metadataLevyContribution) * 100).toFixed(1))
      : 0;
    const apprenticesPer100 = metadataWorkforceSize > 0
      ? Number(((metadataApprenticeCount / metadataWorkforceSize) * 100).toFixed(1))
      : 0;

    const addPageHeader = (title: string) => {
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(`${currentReport.metadata.organisationName || 'Organisation'} • ${title}`, margin, 32);
      doc.text(`Report generated: ${new Date().toLocaleDateString()}`, 460, 32, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      return 60;
    };

    doc.setProperties({ title: `${currentReport.metadata.organisationName || 'Levy'} Utilisation Report` });
    if (currentReport.metadata.logoDataUrl) {
      const logoType = currentReport.metadata.logoDataUrl.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(currentReport.metadata.logoDataUrl, logoType, 440, 40, 100, 100);
    }
    doc.setFontSize(24);
    doc.setTextColor(13, 42, 148);
    doc.text('Apprenticeship Levy Utilisation Report', margin, y);

    y += 34;
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    doc.text('Client-ready consultancy assessment', margin, y);

    y += 30;
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text(`Organisation: ${currentReport.metadata.organisationName || 'N/A'}`, margin, y);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 420, y);

    y += 16;
    doc.text(`Sector: ${currentReport.metadata.sector || 'N/A'}`, margin, y);
    doc.text(`Workforce size: ${currentReport.metadata.workforceSize}`, 420, y);

    y += 16;
    doc.text(`Annual levy contribution: £${(Number(currentReport.metadata.levyContribution) || 0).toLocaleString()}`, margin, y);
    doc.text(`Monthly levy spend: £${metadataMonthlySpend.toLocaleString()}`, 420, y);

    y += 16;
    doc.text(`Estimated annual levy spend: £${annualLevySpend.toLocaleString()}`, margin, y);
    doc.text(`Levy utilisation rate: ${utilisationRate.toFixed(1)}%`, 420, y);

    y += 16;
    doc.text(`Apprentices: ${metadataApprenticeCount}`, margin, y);
    doc.text(`Apprentices per 100 employees: ${apprenticesPer100.toFixed(1)}`, 420, y);

    y += 16;
    doc.text(`Estimated unused levy value: £${unusedLevyValue.toLocaleString()}`, margin, y);

    y += 30;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, y, 555, y);

    y += 22;
    doc.setFontSize(14);
    doc.text('Executive summary', margin, y);
    y += 18;

    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(currentReport.executiveSummary, 520);
    doc.text(summaryLines, margin, y);

    if (gaugeImage || barImage) {
      y += summaryLines.length * 14 + 20;
      if (gaugeImage) {
        doc.addImage(gaugeImage, 'PNG', margin, y, 180, 180);
      }
      if (barImage) {
        doc.addImage(barImage, 'PNG', 280, y, 260, 180);
      }
      y += 190;
    }

    if (y > 620) {
      doc.addPage();
      y = addPageHeader('Report summary');
    } else {
      y += 10;
    }

    doc.setFontSize(12);
    doc.text('Overall score', margin, y);
    y += 18;
    doc.setFontSize(10);
    doc.text(`Overall utilisation score: ${currentReport.overallScore} / 10`, margin, y);
    doc.text(`Maturity level: ${currentReport.maturity}`, 320, y);

    y += 28;
    doc.setFontSize(12);
    doc.text('Category breakdown', margin, y);
    y += 18;

    currentReport.categoryResults.forEach((category) => {
      if (y > 720) {
        doc.addPage();
        y = addPageHeader('Category breakdown');
      }
      doc.setFontSize(10);
      doc.text(`• ${category.title}: ${category.score.toFixed(1)} / 10`, margin, y);
      y += 14;
      const categoryLines = doc.splitTextToSize(category.comment, 500);
      doc.text(categoryLines, margin + 12, y);
      y += categoryLines.length * 12 + 10;
    });

    if (radarImage) {
      if (y > 420) {
        doc.addPage();
        y = addPageHeader('Assessment radar');
      }

      doc.setFontSize(12);
      doc.text('Strengths vs weaknesses', margin, y);
      y += 18;
      doc.addImage(radarImage, 'PNG', margin, y, 520, 260);
      y += 280;
    }

    if (y > 620) {
      doc.addPage();
      y = addPageHeader('Risks & opportunities');
    }

    doc.setFontSize(12);
    doc.text('Key risks', margin, y);
    y += 18;
    doc.setFontSize(10);
    currentReport.keyRisks.forEach((risk) => {
      if (y > 720) {
        doc.addPage();
        y = addPageHeader('Risks & opportunities');
      }
      const riskLines = doc.splitTextToSize(`• ${risk}`, 500);
      doc.text(riskLines, margin, y);
      y += riskLines.length * 12 + 8;
    });

    if (y > 620) {
      doc.addPage();
      y = addPageHeader('Risks & opportunities');
    }

    doc.setFontSize(12);
    doc.text('Key opportunities', margin, y);
    y += 18;
    doc.setFontSize(10);
    currentReport.keyOpportunities.forEach((opportunity) => {
      if (y > 720) {
        doc.addPage();
        y = addPageHeader('Risks & opportunities');
      }
      const opportunityLines = doc.splitTextToSize(`• ${opportunity}`, 500);
      doc.text(opportunityLines, margin, y);
      y += opportunityLines.length * 12 + 8;
    });

    if (y > 620) {
      doc.addPage();
      y = addPageHeader('Next steps');
    }

    doc.setFontSize(12);
    doc.text('Recommended next steps', margin, y);
    y += 18;
    doc.setFontSize(10);
    currentReport.recommendedNextSteps.forEach((step, index) => {
      if (y > 720) {
        doc.addPage();
        y = addPageHeader('Next steps');
      }
      const stepLines = doc.splitTextToSize(`${index + 1}. ${step}`, 500);
      doc.text(stepLines, margin, y);
      y += stepLines.length * 12 + 8;
    });

    if (y > 620) {
      doc.addPage();
      y = addPageHeader('MPR Consulting Support');
    }

    doc.setFontSize(12);
    doc.text('Recommended MPR Consulting Support', margin, y);
    y += 18;
    doc.setFontSize(10);
    currentReport.consultingSupport.forEach((item) => {
      if (y > 720) {
        doc.addPage();
        y = addPageHeader('MPR Consulting Support');
      }
      const itemLines = doc.splitTextToSize(`• ${item}`, 500);
      doc.text(itemLines, margin, y);
      y += itemLines.length * 12 + 8;
    });

    doc.save(`${currentReport.metadata.organisationName || 'Levy'}_Utilisation_Report.pdf`);
  };

  if (!report) {
    return (
      <main className="page-shell">
        <section className="content-panel report-page">
          <div className="section-header">
            <div>
              <p className="eyebrow">Report</p>
              <h1>Utilisation report</h1>
              <p>No saved assessment data was found. Start a new health check to generate a report.</p>
            </div>
            <Link href="/health-check" className="secondary-button">
              Start assessment
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="content-panel report-page">
        <div className="section-header report-header">
          <div>
            <p className="eyebrow">Report</p>
            <h1>Utilisation assessment</h1>
            <p>A professional overview of apprenticeship levy readiness, value, and strategic maturity.</p>
          </div>
          <div className="header-actions">
            {report.metadata.logoDataUrl && (
              <img className="client-logo" src={report.metadata.logoDataUrl} alt={`${report.metadata.organisationName} logo`} />
            )}
            <Link href="/health-check" className="secondary-button">
              Update assessment
            </Link>
            <button type="button" className="download-button" onClick={() => report && downloadReport(report)}>
              Download PDF
            </button>
          </div>
        </div>

        <div className="board-summary-grid">
          <article className="summary-tile">
            <p className="summary-label">Overall score</p>
            <h2>{report.overallScore.toFixed(1)} / 10</h2>
            <p>Board-level score for levy readiness and value delivery.</p>
          </article>
          <article className="summary-tile">
            <p className="summary-label">Maturity level</p>
            <h2>{report.maturity}</h2>
            <p>Strategic position against best practice levy capability.</p>
          </article>
          <article className="summary-tile">
            <p className="summary-label">Estimated underused levy</p>
            <h2>£{unusedLevyValue.toLocaleString()}</h2>
            <p>Projected value that could be unlocked through improved deployment.</p>
          </article>
          <article className="summary-tile">
            <p className="summary-label">Priority action area</p>
            <h2>{priorityActionArea}</h2>
            <p>Most urgent focus to improve levy impact and capability alignment.</p>
          </article>
        </div>

        <section className="hero-overview">
          <div className="hero-gauge">
            <div className="gauge-graphic">
              <Doughnut
                data={gaugeData}
                options={{
                  cutout: '78%',
                  rotation: -90,
                  circumference: 180,
                  plugins: { legend: { display: false }, tooltip: { enabled: false } },
              }}
                ref={gaugeChartRef}
              />
              <div className="gauge-center hero-gauge-center">
                <span>{report.overallScore.toFixed(1)}</span>
                <small>/10</small>
              </div>
            </div>
          </div>
          <div className="hero-text">
            <p className="eyebrow">Board summary</p>
            <h2>Strategic levy utilisation performance</h2>
            <p>These insights are organised to support executive decision-making and identify the highest-value areas for immediate intervention.</p>
            <div className="hero-status-pill" style={{ background: scoreColor + '22', color: scoreColor }}>
              {report.maturity} maturity
            </div>
            <p className="hero-subline">
              {financialInsight}
            </p>
            <div className="hero-highlights">
              <div>
                <span>Potential value at risk</span>
                <strong>£{unusedLevyValue.toLocaleString()}</strong>
              </div>
              <div>
                <span>Leading action</span>
                <strong>{priorityActionArea}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="utilisation-insights-card">
          <h2>Utilisation insights</h2>
          <div className="utilisation-insights-grid">
            {[
              {
                title: 'Estimated annual levy spend',
                value: `£${annualLevySpend.toLocaleString()}`,
                status: getKpiStatus('annual', annualLevySpend),
              },
              {
                title: 'Levy utilisation rate',
                value: `${utilisationRate.toFixed(1)}%`,
                status: getKpiStatus('utilisation', utilisationRate),
              },
              {
                title: 'Apprentices per 100 employees',
                value: `${apprenticesPer100.toFixed(1)}`,
                status: getKpiStatus('apprentices', apprenticesPer100),
              },
            ].map((metric) => (
              <article key={metric.title} className="kpi-card">
                <div className="kpi-value" style={{ color: metric.status.color }}>{metric.value}</div>
                <p className="kpi-label">{metric.title}</p>
                <span className="kpi-chip" style={{ background: metric.status.color + '22', color: metric.status.color }}>
                  {metric.status.label}
                </span>
              </article>
            ))}
          </div>
        </section>

        <div className="top-cards-grid">
          <section className="priority-card">
            <div className="card-header">
              <p className="eyebrow">Top 3 intervention priorities</p>
              <h3>Most urgent improvement areas</h3>
            </div>
            <ol>
              {topPriorities.map((item, index) => (
                <li key={item.title}>
                  <strong>{index + 1}. {item.title}</strong>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="impact-card">
            <div className="card-header">
              <p className="eyebrow">Impact of inaction</p>
              <h3>Why the board needs to act now</h3>
            </div>
            <p>{impactOfInaction}</p>
          </section>
        </div>

        <div className="chart-grid premium-chart-grid">
          <section className="chart-panel">
            <h3>Category score breakdown</h3>
            <div className="chart-frame">
              <Bar data={barData} options={chartOptions} ref={barChartRef} />
            </div>
          </section>
          <section className="chart-panel">
            <h3>Strengths and weaknesses</h3>
            <div className="chart-frame radar-frame">
              <Radar data={radarData} options={radarOptions} ref={radarChartRef} />
            </div>
          </section>
        </div>

        <section className="summary-panel organisation-summary">
          <h2>Organisation details</h2>
          <p>
            <strong>{report.metadata.organisationName || 'Organisation'}</strong> • {report.metadata.sector} • Workforce size: {workforce} • Annual levy contribution: £{displayLevyContribution.toLocaleString()} • Monthly levy spend: £{monthlySpend.toLocaleString()} • Apprentices: {displayApprenticeCount}
          </p>
          <p>
            Monthly levy spend: £{monthlySpend.toLocaleString()} • Estimated annual levy spend: £{annualLevySpend.toLocaleString()} • Levy utilisation rate: {utilisationRate.toFixed(1)}%
          </p>
          <p>
            Apprentices: {displayApprenticeCount} • Apprentices per 100 employees: {apprenticesPer100.toFixed(1)}
          </p>
        </section>

        <div className="report-grid">
          {sortedCategories.map((category) => {
            const status = getCategoryStatus(category.score);
            const whyText =
              category.score <= 3
                ? 'This gap directly undermines levy value and raises delivery and compliance risk.'
                : category.score <= 6
                ? 'Strengthening this area will convert levy funding into more consistent workforce outcomes.'
                : 'Maintaining performance here preserves strategic capability and supports levy ROI.';

            return (
              <article className="report-card status-card" key={category.id} style={{ borderColor: status.border }}>
                <div className="card-status-pill" style={{ background: status.badge, color: status.border }}>
                  {status.label}
                </div>
                <div className="card-heading">
                  <h3>{category.title}</h3>
                  <strong>{category.score.toFixed(1)} / 10</strong>
                </div>
                <p>{category.comment}</p>
                <p className="why-matters">Why this matters: {whyText}</p>
              </article>
            );
          })}
        </div>

        <section className="summary-panel">
          <h2>Executive summary</h2>
          <p>{report.executiveSummary}</p>
        </section>

        <div className="grid-two-columns">
          <div className="bullet-section">
            <h3>Key risks</h3>
            <ul>
              {report.keyRisks.map((risk, index) => (
                <li key={`risk-${index}`}>{risk}</li>
              ))}
            </ul>
          </div>
          <div className="bullet-section">
            <h3>Key opportunities</h3>
            <ul>
              {report.keyOpportunities.map((opportunity, index) => (
                <li key={`opp-${index}`}>{opportunity}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="summary-panel">
          <h2>Recommended next steps</h2>
          <ul className="report-list">
            {report.recommendedNextSteps.map((step, index) => (
              <li key={`step-${index}`}>{step}</li>
            ))}
          </ul>
        </section>

        <section className="consulting-panel featured-consulting">
          <div className="consulting-copy">
            <p className="eyebrow">Recommended MPR Consulting Support</p>
            <h2>Featured advisory engagement</h2>
            <p>Focus support on the highest-risk levy interventions and convert this assessment into board-ready outcomes.</p>
            <ul className="report-list">
              {report.consultingSupport.map((item, index) => (
                <li key={`consult-${index}`}>{item}</li>
              ))}
            </ul>
            <a className="primary-button" href="mailto:contact@mprconsulting.co.uk?subject=Levy%20Health%20Check%20Follow-up">
              Request follow-up conversation
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
