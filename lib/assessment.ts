export type AssessmentRecommendation = {
  title: string;
  detail: string;
  priority?: 'High' | 'Medium' | 'Low';
};

export type ReportRecommendation = {
  questionId: string;
  questionPrompt: string;
  categoryId: string;
  categoryTitle: string;
  title: string;
  detail: string;
  priority: 'High' | 'Medium' | 'Low';
};

export const assessmentCategories: AssessmentCategory[] = [
  {
    id: 'organisation',
    title: 'Organisation and workforce profile',
    description:
      'Evaluate whether apprenticeship planning is anchored in talent strategy, workforce demand and long-term capability needs.',
    weight: 0.12,
    questions: [
      {
        id: 'workforceStrategy',
        prompt: 'Which statement best describes your workforce strategy and apprenticeship integration?',
        options: [
          {
            label: 'No formal workforce strategy for apprenticeships',
            score: 2,
            recommendations: [
              {
                title: 'Define workforce planning alignment',
                detail:
                  'Map critical roles, skill gaps and recruitment challenges to apprenticeship standards to create a structured pipeline.',
                priority: 'High',
              },
              {
                title: 'Establish apprenticeship ownership',
                detail:
                  'Assign responsibility for apprenticeship planning within HR or L&D to ensure alignment with workforce demand.',
                priority: 'High',
              },
            ],
          },
          {
            label: 'Ad hoc plans exist but are not aligned across functions',
            score: 4,
            recommendations: [
              {
                title: 'Align planning across departments',
                detail:
                  'Introduce cross-functional workforce planning sessions to align apprenticeship use with operational and strategic priorities.',
                priority: 'Medium',
              },
            ],
          },
          {
            label: 'Defined apprenticeship pipeline aligned to workforce needs',
            score: 7,
            recommendations: [
              {
                title: 'Enhance pipeline forecasting',
                detail:
                  'Introduce forward-looking workforce modelling to improve timing and scale of apprenticeship starts.',
                priority: 'Low',
              },
            ],
          },
          {
            label: 'Integrated workforce strategy with apprenticeships as core talent pipeline',
            score: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'funding',
    title: 'Levy and funding position',
    description:
      'Measure whether levy funds are forecasted, ring-fenced and deployed to capture maximum employer contribution value.',
    weight: 0.14,
    questions: [
      {
        id: 'levyFundingPosition',
        prompt: 'How mature is your levy funding position and spend planning?',
        options: [
          {
            label: 'Reactive levy spend with no funding strategy',
            score: 2,
            recommendations: [
              {
                title: 'Establish levy visibility and tracking',
                detail:
                  'Create a monthly levy dashboard showing contributions, spend, expiry risk and forecast utilisation.',
                priority: 'High',
              },
              {
                title: 'Identify immediate deployment opportunities',
                detail:
                  'Map current workforce roles to apprenticeship standards to quickly absorb unused levy.',
                priority: 'High',
              },
            ],
          },
          {
            label: 'Basic tracking of levy obligations and spend',
            score: 4,
            recommendations: [
              {
                title: 'Introduce structured planning cycles',
                detail:
                  'Move from tracking to active planning by linking levy spend to workforce demand and business priorities.',
                priority: 'Medium',
              },
            ],
          },
          {
            label: 'Regular planning with transfer or reserve awareness',
            score: 7,
            recommendations: [
              {
                title: 'Optimise levy deployment',
                detail:
                  'Refine timing, transfers and reserve usage to maximise financial return.',
                priority: 'Low',
              },
            ],
          },
          {
            label: 'Proactive levy strategy with optimisation across spend, transfers and reserve use',
            score: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'activity',
    title: 'Current apprenticeship activity',
    description:
      'Review how apprenticeship programmes are delivered, monitored and scaled in line with business demand.',
    weight: 0.13,
    questions: [
      {
        id: 'apprenticeshipActivity',
        prompt: 'How would you describe current apprenticeship delivery and pipeline management?',
        options: [
          {
            label: 'Limited activity with poor tracking of outcomes',
            score: 2,
            recommendations: [
              {
                title: 'Create a visible apprenticeship pipeline',
                detail:
                  'Define clear pathways from application to completion to improve tracking and scalability.',
                priority: 'High',
              },
              {
                title: 'Introduce outcome reporting',
                detail:
                  'Track completion rates, progression and ROI to improve programme effectiveness.',
                priority: 'High',
              },
            ],
          },
          {
            label: 'Some programmes exist but delivery is inconsistent',
            score: 4,
            recommendations: [
              {
                title: 'Standardise programme delivery',
                detail:
                  'Implement consistent onboarding, tracking and reporting across all apprenticeship programmes.',
                priority: 'Medium',
              },
            ],
          },
          {
            label: 'Established programmes with defined targets and reporting',
            score: 7,
            recommendations: [
              {
                title: 'Scale high-performing programmes',
                detail:
                  'Expand successful apprenticeship pathways into additional roles or departments.',
                priority: 'Low',
              },
            ],
          },
          {
            label: 'Mature delivery with strong completion rates and pipeline expansion',
            score: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'governance',
    title: 'Governance and ownership',
    description:
      'Check whether levy decision rights, reporting forums and budget accountability are clearly defined and enforced.',
    weight: 0.15,
    questions: [
      {
        id: 'governanceMaturity',
        prompt: 'What best describes your levy governance and ownership model?',
        options: [
          {
            label: 'No clear owner or governance forum in place',
            score: 2,
            recommendations: [
              {
                title: 'Establish governance structure',
                detail:
                  'Create a formal governance forum with clear accountability for levy decisions and performance.',
                priority: 'High',
              },
            ],
          },
          {
            label: 'Basic governance exists with unclear roles',
            score: 4,
            recommendations: [
              {
                title: 'Clarify roles and accountability',
                detail:
                  'Define ownership across HR, finance and operational teams for levy performance.',
                priority: 'Medium',
              },
            ],
          },
          {
            label: 'Formal governance and reporting is established',
            score: 7,
            recommendations: [
              {
                title: 'Strengthen performance reviews',
                detail:
                  'Introduce more frequent and data-driven governance reviews to improve outcomes.',
                priority: 'Low',
              },
            ],
          },
          {
            label: 'Strong accountability with continuous governance review',
            score: 10,
          },
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
  recommendations: ReportRecommendation[];
  updatedAt: string;
};

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

  const recommendations: ReportRecommendation[] = [];

  for (const category of assessmentCategories) {
    for (const question of category.questions) {
      const selectedScore = answers[question.id];
      const selectedOption = question.options.find((option) => option.score === selectedScore);

      if (selectedOption?.recommendations?.length) {
        for (const recommendation of selectedOption.recommendations) {
          recommendations.push({
            questionId: question.id,
            questionPrompt: question.prompt,
            categoryId: category.id,
            categoryTitle: category.title,
            title: recommendation.title,
            detail: recommendation.detail,
            priority: recommendation.priority ?? 'Medium',
          });
        }
      }
    }
  }

  const dedupedRecommendations = recommendations.filter(
    (recommendation, index, array) =>
      index ===
      array.findIndex(
        (item) =>
          item.title === recommendation.title &&
          item.categoryId === recommendation.categoryId
      )
  );

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  dedupedRecommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    answers,
    metadata: safeMetadata,
    overallScore,
    maturity,
    categoryResults,
    executiveSummary: buildExecutiveSummary(
      overallScore,
      maturity,
      categoryResults,
      safeMetadata
    ),
    keyRisks: buildKeyRisks(overallScore, categoryResults, safeMetadata),
    keyOpportunities: buildKeyOpportunities(overallScore, categoryResults, safeMetadata),
    recommendedNextSteps: buildRecommendedNextSteps(overallScore, categoryResults),
    consultingSupport: buildConsultingSupport(safeMetadata),
    recommendations: dedupedRecommendations,
    updatedAt: new Date().toISOString(),
  };
};
