'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from './Stepper';
import {
  assessmentCategories,
  buildAssessmentReport,
  initialAssessmentAnswers,
  type AssessmentAnswers,
  type AssessmentMetadata,
} from '../lib/assessment';

const steps = [
  'Organisation & funding',
  'Apprenticeship activity',
  'Strategy & governance',
  'Provider & culture',
];

const pageGroups = [[0, 1], [2], [3, 4], [5, 6, 7]] as const;

export default function HealthCheckForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AssessmentAnswers>(initialAssessmentAnswers);
  const [organisationName, setOrganisationName] = useState('');
  const [sector, setSector] = useState('Education');
  const [workforceSize, setWorkforceSize] = useState('180');
  const [levyContribution, setLevyContribution] = useState('120000');
  const [monthlyLevySpend, setMonthlyLevySpend] = useState('10000');
  const [apprenticeCount, setApprenticeCount] = useState('25');
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({
    workforceSize: '',
    levyContribution: '',
    monthlyLevySpend: '',
    apprenticeCount: '',
  });

  const router = useRouter();

  const safeNumber = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed || fallback : fallback;
  };

  const validateNumericField = (field: string, value: string) => {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'This field is required.';
    }

    if (!/^[0-9]+$/.test(trimmed)) {
      return 'Enter a valid number.';
    }

    const parsed = Number(trimmed);

    if (field === 'workforceSize' && parsed < 1) {
      return 'Workforce size must be at least 1.';
    }

    if ((field === 'levyContribution' || field === 'monthlyLevySpend') && parsed < 0) {
      return 'Enter a valid amount.';
    }

    if (field === 'apprenticeCount' && parsed < 0) {
      return 'Apprentice count cannot be negative.';
    }

    return '';
  };

  const handleFieldBlur = (field: string, value: string) => {
    setErrors((current) => ({
      ...current,
      [field]: validateNumericField(field, value),
    }));
  };

  const validateAllFields = () => {
    const nextErrors = {
      workforceSize: validateNumericField('workforceSize', workforceSize),
      levyContribution: validateNumericField('levyContribution', levyContribution),
      monthlyLevySpend: validateNumericField('monthlyLevySpend', monthlyLevySpend),
      apprenticeCount: validateNumericField('apprenticeCount', apprenticeCount),
    };

    setErrors(nextErrors);
    return Object.values(nextErrors).every((error) => !error);
  };

  const report = useMemo(
    () =>
      buildAssessmentReport(answers, {
        organisationName,
        sector,
        workforceSize: safeNumber(workforceSize, 1),
        levyContribution: safeNumber(levyContribution, 0),
        monthlyLevySpend: safeNumber(monthlyLevySpend, 0),
        apprenticeCount: safeNumber(apprenticeCount, 0),
        logoDataUrl,
      }),
    [
      answers,
      organisationName,
      sector,
      workforceSize,
      levyContribution,
      monthlyLevySpend,
      apprenticeCount,
      logoDataUrl,
    ]
  );

  const safeStep = Math.min(Math.max(step, 0), pageGroups.length - 1);
  const currentCategories = pageGroups[safeStep]?.map((index) => assessmentCategories[index]) ?? [];

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  const updateAnswer = (questionId: string, score: number) => {
    setAnswers((current) => ({ ...current, [questionId]: score }));
  };

  return (
    <div className="health-form">
      <div className="progress-wrap">
        <div className="progress-meta">
          <span className="progress-step">
            Step {step + 1} of {steps.length}
          </span>
          <span className="progress-label">{steps[step]}</span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${((step + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Stepper steps={steps} current={step} />

      <div className="form-panel">
        {step === 0 ? (
          <section>
            <div className="section-heading">
              <h2>Organisation and workforce profile</h2>
              <p>Capture the core organisation details used in the utilisation assessment report.</p>
            </div>

            <div className="field-group">
              <label htmlFor="organisationName">Organisation name</label>
              <input
                id="organisationName"
                value={organisationName}
                onChange={(event) => setOrganisationName(event.target.value)}
                placeholder="e.g. Orion Group"
              />
            </div>

            <div className="field-group">
              <label htmlFor="clientLogo">Client logo (optional)</label>
              <input
                id="clientLogo"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(event) => {
                  const file = event.target?.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setLogoDataUrl(reader.result);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {logoDataUrl && (
                <img className="logo-preview" src={logoDataUrl} alt="Client logo preview" />
              )}
            </div>

            <div className="field-group">
              <label htmlFor="sector">Sector</label>
              <select id="sector" value={sector} onChange={(event) => setSector(event.target.value)}>
                <option>Education</option>
                <option>Engineering</option>
                <option>Healthcare</option>
                <option>Professional services</option>
                <option>Manufacturing</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="workforceSize">Total workforce size</label>
              <input
                id="workforceSize"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={workforceSize}
                min={10}
                max={5000}
                aria-invalid={Boolean(errors.workforceSize)}
                onChange={(event) => setWorkforceSize(event.target.value)}
                onBlur={(event) => handleFieldBlur('workforceSize', event.target.value)}
              />
              {errors.workforceSize && <span className="field-error">{errors.workforceSize}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="levyContribution">Annual levy contribution (£)</label>
              <input
                id="levyContribution"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={levyContribution}
                min={0}
                step={1000}
                aria-invalid={Boolean(errors.levyContribution)}
                onChange={(event) => setLevyContribution(event.target.value)}
                onBlur={(event) => handleFieldBlur('levyContribution', event.target.value)}
              />
              {errors.levyContribution && (
                <span className="field-error">{errors.levyContribution}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="monthlyLevySpend">Monthly levy spend (£)</label>
              <input
                id="monthlyLevySpend"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={monthlyLevySpend}
                min={0}
                step={100}
                aria-invalid={Boolean(errors.monthlyLevySpend)}
                onChange={(event) => setMonthlyLevySpend(event.target.value)}
                onBlur={(event) => handleFieldBlur('monthlyLevySpend', event.target.value)}
              />
              {errors.monthlyLevySpend && (
                <span className="field-error">{errors.monthlyLevySpend}</span>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="apprenticeCount">Number of apprentices</label>
              <input
                id="apprenticeCount"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={apprenticeCount}
                min={0}
                step={1}
                aria-invalid={Boolean(errors.apprenticeCount)}
                onChange={(event) => setApprenticeCount(event.target.value)}
                onBlur={(event) => handleFieldBlur('apprenticeCount', event.target.value)}
              />
              {errors.apprenticeCount && (
                <span className="field-error">{errors.apprenticeCount}</span>
              )}
            </div>
          </section>
        ) : (
          currentCategories.map((category) => (
            <section key={category.id} className="question-section">
              <div className="section-heading">
                <h2>{category.title}</h2>
                <p>{category.description}</p>
              </div>

              {category.questions.map((question) => (
                <div className="question-group" key={question.id}>
                  <p>{question.prompt}</p>

                  <div className="options-group">
                    {question.options.map((option) => (
                      <label className="option-card" key={option.label}>
                        <input
                          type="radio"
                          name={question.id}
                          value={option.score}
                          checked={answers[question.id] === option.score}
                          onChange={() => updateAnswer(question.id, option.score)}
                        />
                        <span className="option-text">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))
        )}
      </div>

      <div className="report-summary-card">
        <div>
          <p className="small-label">Current utilisation</p>
          <h2>{report.overallScore} / 10</h2>
          <p>{report.maturity} maturity assessment</p>
        </div>
        <div className="report-badge">{report.maturity}</div>
      </div>

      <div className="action-row">
        <button
          type="button"
          className="action-button secondary"
          onClick={prevStep}
          disabled={step === 0}
        >
          Back
        </button>

        {step < steps.length - 1 ? (
          <button type="button" className="action-button primary" onClick={nextStep}>
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="action-button primary"
            onClick={() => {
              if (!validateAllFields()) {
                return;
              }

              try {
                if (typeof window !== 'undefined' && window.localStorage) {
                  window.localStorage.setItem('levyHealthCheckReport', JSON.stringify(report));
                }
              } catch (error) {
                console.error('Unable to save report to localStorage', error);
              }

              router.push('/health-check/results');
            }}
          >
            Generate report
          </button>
        )}
      </div>
    </div>
  );
}