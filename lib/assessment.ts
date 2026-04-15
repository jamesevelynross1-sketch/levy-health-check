export type AssessmentOption = {
  label: string;
  score: number;
};

export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: AssessmentOption[];
};

export type AssessmentCategory = {
  id: string;
  title: string;
  description: string;
  weight: number;
  questions: AssessmentQuestion[];
};

export type AssessmentAnswers = Record<string, number>;

export type AssessmentMetadata = {
  organisationName: string;
  sector: string;
  workforceSize: number;
  levyContribution: number;
  monthlyLevySpend: number;
  apprenticeCount: number;
  logoDataUrl?: string;
};

const safeNumber = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed || fallback : fallback;
};

export const assessmentCategories: AssessmentCategory[] = [
  {
    id: 'organisation',
    title: 'Organisation and workforce profile',
    description: 'Evaluate whether apprenticeship planning is anchored in talent strategy, workforce demand and long-term capability needs.',
    weight: 0.12,
    questions: [
      {
        id: 'workforceStrategy',
        prompt: 'Which statement best describes your workforce strategy and apprenticeship integration?',
        options: [
          { label: 'No formal workforce strategy for apprenticeships', score: 2 },
          { label: 'Ad hoc plans exist but are not aligned across functions', score: 4 },
          { label: 'Defined apprenticeship pipeline aligned to workforce needs', score: 7 },
          { label: 'Integrated workforce strategy with apprenticeships as core talent pipeline', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'funding',
    title: 'Levy and funding position',
    description: 'Measure whether levy funds are forecasted, ring-fenced and deployed to capture maximum employer contribution value.',
    weight: 0.14,
    questions: [
      {
        id: 'levyFundingPosition',
        prompt: 'How mature is your levy funding position and spend planning?',
        options: [
          { label: 'Reactive levy spend with no funding strategy', score: 2 },
          { label: 'Basic tracking of levy obligations and spend', score: 4 },
          { label: 'Regular planning with transfer or reserve awareness', score: 7 },
          { label: 'Proactive levy strategy with optimisation across spend, transfers and reserve use', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'activity',
    title: 'Current apprenticeship activity',
    description: 'Review how apprenticeship programmes are delivered, monitored and scaled in line with business demand.',
    weight: 0.13,
    questions: [
      {
        id: 'apprenticeshipActivity',
        prompt: 'How would you describe current apprenticeship delivery and pipeline management?',
        options: [
          { label: 'Limited activity with poor tracking of outcomes', score: 2 },
          { label: 'Some programmes exist but delivery is inconsistent', score: 4 },
          { label: 'Established programmes with defined targets and reporting', score: 7 },
          { label: 'Mature delivery with strong completion rates and pipeline expansion', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'strategy',
    title: 'Training and development strategy',
    description: 'Assess whether skills investment is targeted to priority capability gaps and business transformation goals.',
    weight: 0.13,
    questions: [
      {
        id: 'developmentStrategy',
        prompt: 'How aligned is your training and development strategy to future business priorities?',
        options: [
          { label: 'Training is ad hoc and not aligned to capability needs', score: 2 },
          { label: 'Some plans exist, but integration is limited', score: 4 },
          { label: 'Training supports priority skills with regular review', score: 7 },
          { label: 'Development strategy is fully integrated with future business priorities', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'governance',
    title: 'Governance and ownership',
    description: 'Check whether levy decision rights, reporting forums and budget accountability are clearly defined and enforced.',
    weight: 0.15,
    questions: [
      {
        id: 'governanceMaturity',
        prompt: 'What best describes your levy governance and ownership model?',
        options: [
          { label: 'No clear owner or governance forum in place', score: 2 },
          { label: 'Basic governance exists with unclear roles', score: 4 },
          { label: 'Formal governance and reporting is established', score: 7 },
          { label: 'Strong accountability with continuous governance review', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'provider',
    title: 'Provider usage and effectiveness',
    description: 'Assess whether apprenticeship suppliers are delivering measurable outcomes, cost transparency and delivery flexibility.',
    weight: 0.11,
    questions: [
      {
        id: 'providerEffectiveness',
        prompt: 'How effective is your provider management and performance review process?',
        options: [
          { label: 'Provider relationships are unmanaged', score: 2 },
          { label: 'Some reviews occur but effectiveness is inconsistent', score: 4 },
          { label: 'Providers are regularly reviewed with improvement action', score: 7 },
          { label: 'Provider ecosystem is managed strategically for value and innovation', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'culture',
    title: 'Culture and awareness',
    description: 'Gauge whether levy initiatives are understood across the business and supported by hiring managers and leaders.',
    weight: 0.11,
    questions: [
      {
        id: 'cultureAwareness',
        prompt: 'Which statement best describes your culture and awareness of levy initiatives?',
        options: [
          { label: 'Awareness is patchy and adoption is limited', score: 2 },
          { label: 'Stakeholders understand levy but wider engagement is low', score: 4 },
          { label: 'Good awareness with active communication across teams', score: 7 },
          { label: 'A culture of apprenticeship value is embedded throughout the business', score: 10 },
        ],
      },
    ],
  },
  {
    id: 'priorities',
    title: 'Strategic priorities',
    description: 'Review whether levy investment is aligned to growth, digital transformation and operational capability priorities.',
    weight: 0.12,
    questions: [
      {
        id: 'strategicAlignment',
        prompt: 'How closely aligned is levy spend to your strategic priorities?',
        options: [
          { label: 'Activity is tactical and not linked to strategy', score: 2 },
          { label: 'Some alignment exists but it is inconsistent', score: 4 },
          { label: 'Levy investment supports core priorities with measures', score: 7 },
          { label: 'Strategic priorities are clearly aligned to levy investment and capability', score: 10 },
        ],
      },
    ],
  },
];

export const initialAssessmentAnswers: AssessmentAnswers = assessmentCategories.reduce(
  (answers, category) => {
    category.questions.forEach((question) => {
      answers[question.id] = question.options[0].score;
    });
    return answers;
  },
  {} as AssessmentAnswers
);

const getProgressComment = (score: number) => {
  if (score >= 8) {
    return 'This area is well established and supporting effective levy utilisation.';
  }
  if (score >= 6) {
    return 'This area is showing good progress but could benefit from further maturity.';
  }
  if (score >= 4) {
    return 'This area is developing, with gaps that should be addressed to improve results.';
  }
  return 'This area requires focused attention to avoid levy underperformance and risk.';
};

export type CategoryResult = {
  id: string;
  title: string;
  score: number;
  weight: number;
  comment: string;
};

export type AssessmentReport = {
  answers: AssessmentAnswers;
  metadata: AssessmentMetadata;
  overallScore: number;
  maturity: string;
  categoryResults: CategoryResult[];
  executiveSummary: string;
  keyRisks: string[];
  keyOpportunities: string[];
  recommendedNextSteps: string[];
  consultingSupport: string[];
  updatedAt: string;
};

export const getCategoryResults = (answers: AssessmentAnswers): CategoryResult[] =>
  assessmentCategories.map((category) => {
    const total = category.questions.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
    const score = Number((total / category.questions.length).toFixed(1));

    return {
      id: category.id,
      title: category.title,
      score,
      weight: category.weight,
      comment: getProgressComment(score),
    };
  });

export const getOverallScore = (answers: AssessmentAnswers) => {
  const categoryResults = getCategoryResults(answers);
  const totalWeight = assessmentCategories.reduce((sum, category) => sum + category.weight, 0);
  const weightedScore = categoryResults.reduce((sum, result) => sum + result.score * result.weight, 0);

  return Number((weightedScore / totalWeight).toFixed(1));
};

export const getMaturityLevel = (score: number) => {
  if (score >= 8) return 'Optimised';
  if (score >= 6) return 'Structured';
  if (score >= 4) return 'Developing';
  return 'Reactive';
};

export const estimateUnusedLevyValue = (levyContribution: number, score: number) => {
  const approximation = levyContribution * ((10 - score) / 10) * 0.7;
  return Math.max(0, Math.round(approximation / 1000) * 1000);
};

const getPrimaryOpportunity = (categoryResults: CategoryResult[]) => {
  const improvementAreas = categoryResults.filter((result) => result.score < 8);
  if (!improvementAreas.length) {
    return 'Maintain the strong approach and continue to refine execution against strategic priorities.';
  }
  const weakest = improvementAreas.reduce((prev, current) => (current.score < prev.score ? current : prev), improvementAreas[0]);
  return `Focus on strengthening ${weakest.title.toLowerCase()} to drive a higher overall utilisation rating.`;
};

const buildExecutiveSummary = (
  overallScore: number,
  maturity: string,
  categoryResults: CategoryResult[],
  metadata: AssessmentMetadata
) => {
  const strongestCategory = categoryResults.reduce((prev, current) =>
    current.score > prev.score ? current : prev
  , categoryResults[0]);
  const weakestCategory = categoryResults.reduce((prev, current) =>
    current.score < prev.score ? current : prev
  , categoryResults[0]);

  const averageSpendPerApprentice = metadata.apprenticeCount
    ? Math.round(metadata.monthlyLevySpend / metadata.apprenticeCount)
    : 0;

  const financialContext =
    overallScore >= 8
      ? 'The current profile suggests the organisation is capturing strong levy value and has the foundation to convert this into measurable capability outcomes.'
      : overallScore >= 6
      ? 'The assessment identifies a solid levy position, but several improvement areas may still be leaving financial value on the table.'
      : overallScore >= 4
      ? 'The business is at risk of underutilising levy funding, exposing the organisation to lost apprenticeship value and discretionary spend inefficiency.'
      : 'The current approach exposes the organisation to material levy waste, with a high chance of unspent budget and missed strategic outcomes.';

  return `For ${metadata.organisationName || 'the organisation'}, the assessment delivers an overall utilisation score of ${overallScore}/10 and a ${maturity} maturity rating. ${financialContext} Based on a monthly levy spend of £${metadata.monthlyLevySpend.toLocaleString()} and ${metadata.apprenticeCount} apprentices, this represents an average investment of £${averageSpendPerApprentice.toLocaleString()} per apprentice each month. The strongest performance is in ${strongestCategory.title.toLowerCase()}, while the primary gap is ${weakestCategory.title.toLowerCase()}. Addressing this gap will be critical to turning levy spend into a more commercial and capability-driven investment.`;
};

const buildKeyRisks = (
  overallScore: number,
  categoryResults: CategoryResult[],
  metadata: AssessmentMetadata
) => {
  const risks: string[] = [];
  const enterpriseLabel = metadata.organisationName || 'The organisation';

  if (overallScore < 6) {
    risks.push(`${enterpriseLabel} may find levy funds remain unused if planning and governance do not keep pace with demand.`);
  }

  categoryResults
    .filter((result) => result.score < 6)
    .slice(0, 3)
    .forEach((area) => {
      risks.push(`Weak maturity in ${area.title.toLowerCase()} risks converting levy contribution into only tactical training activity rather than strategic capability uplift.`);
    });

  if (overallScore < 4) {
    risks.push('Inadequate oversight increases the chance of compliance gaps and inefficient provider spend as the year closes.');
  }

  if (risks.length === 0) {
    risks.push('The assessment did not identify critical risks, but continued discipline is required to sustain performance as levy conditions evolve.');
  }

  return risks;
};

const buildKeyOpportunities = (overallScore: number, categoryResults: CategoryResult[], metadata: AssessmentMetadata) => {
  const opportunities: string[] = [];

  if (overallScore < 8) {
    opportunities.push(`Use the levy position to fund priority skills and reduce future recruitment cost pressure for ${metadata.organisationName || 'the business'}.`);
  }

  if (categoryResults.some((result) => result.id === 'governance' && result.score < 8)) {
    opportunities.push('Introduce a structured governance forum to align levy decisions with financial and workforce planning cycles.');
  }

  if (categoryResults.some((result) => result.id === 'provider' && result.score < 8)) {
    opportunities.push('Refresh provider evaluation criteria to prioritise measurable learner outcomes and commercial value.');
  }

  if (categoryResults.some((result) => result.id === 'culture' && result.score < 8)) {
    opportunities.push('Deploy targeted stakeholder messaging to increase levy awareness and internal sponsorship.');
  }

  if (!opportunities.length) {
    opportunities.push('Build on existing strength by scaling high-impact programmes and linking levy spend to broader capability milestones.');
  }

  return opportunities;
};

const buildRecommendedNextSteps = (overallScore: number, categoryResults: CategoryResult[]) => {
  const steps: string[] = [
    'Conduct a rapid gap analysis between levy-funded training and the organisation’s priority skills requirements.',
    'Create a monthly levy dashboard to track spend, transfer capacity and utilisation effectiveness.',
    'Establish a governance forum with clear accountability for levy outcomes and budget decisions.',
  ];

  if (categoryResults.some((result) => result.id === 'provider' && result.score < 8)) {
    steps.push('Refresh provider performance metrics to focus on employer return, completion quality and delivery flexibility.');
  }

  if (overallScore < 6) {
    steps.unshift('Agree a quick-win optimisation plan to recover unspent levy capacity before the next funding cycle.');
  }

  if (overallScore >= 8) {
    steps.push('Validate the current model through quarterly performance reviews and expand high-value apprenticeship pathways.');
  }

  return steps;
};

const buildConsultingSupport = (metadata: AssessmentMetadata) => [
  `MPR Consulting can help turn this review into an immediate action plan tailored to ${metadata.organisationName || 'your organisation'}.`,
  'We support levy optimisation, governance design, provider review and capability-aligned training strategy.',
  'A short follow-up conversation will identify the highest-value 90-day interventions and help secure measurable apprentice ROI.',
];

export const buildAssessmentReport = (
  answers: AssessmentAnswers,
  metadata: AssessmentMetadata
): AssessmentReport => {
  const safeMetadata: AssessmentMetadata = {
    ...metadata,
    workforceSize: safeNumber(metadata.workforceSize, 1),
    levyContribution: safeNumber(metadata.levyContribution, 0),
    monthlyLevySpend: safeNumber(metadata.monthlyLevySpend, 0),
    apprenticeCount: safeNumber(metadata.apprenticeCount, 0),
  };

  const categoryResults = getCategoryResults(answers);
  const overallScore = getOverallScore(answers);
  const maturity = getMaturityLevel(overallScore);

  return {
    answers,
    metadata: safeMetadata,
    overallScore,
    maturity,
    categoryResults,
    executiveSummary: buildExecutiveSummary(overallScore, maturity, categoryResults, metadata),
    keyRisks: buildKeyRisks(overallScore, categoryResults, metadata),
    keyOpportunities: buildKeyOpportunities(overallScore, categoryResults, metadata),
    recommendedNextSteps: buildRecommendedNextSteps(overallScore, categoryResults),
    consultingSupport: buildConsultingSupport(metadata),
    updatedAt: new Date().toISOString(),
  };
};
