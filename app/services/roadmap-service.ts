export type RoadmapTask = {
  label: string;
  completed: boolean;
};

export type RoadmapPhase = {
  phase: string;
  title: string;
  goal: string;
  duration: string;
  skills: string[];
  resources: string[];
  certification: string;
  project: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  tasks: RoadmapTask[];
};

const ROADMAP_KEY = 'skillgap-roadmap';

export const defaultRoadmapPhases: RoadmapPhase[] = [
  {
    phase: 'PHASE 1',
    title: 'SQL Fundamentals',
    goal: 'Improve SQL skill gap from 55% → 80%',
    duration: '4 weeks',
    skills: ['SQL', 'Relational Databases', 'Data Filtering'],
    resources: [
      'PostgreSQL Official Documentation',
      'Mode Analytics SQL Tutorial for Data Analysis',
      'LeetCode 50 SQL Study Plan',
    ],
    certification: 'Google Data Analytics Professional Certificate',
    project: 'SQL Case Study: E-Commerce Funnel & Retention Analysis',
    status: 'In Progress',
    tasks: [
      { label: 'SELECT & filtering (WHERE, LIKE, IN, BETWEEN)', completed: true },
      { label: 'JOIN operations (INNER, LEFT, RIGHT, FULL OUTER)', completed: true },
      { label: 'Aggregation functions (COUNT, SUM, AVG, GROUP BY, HAVING)', completed: false },
      { label: 'Subquery, CTEs, and Window Functions (ROW_NUMBER, RANK)', completed: false },
    ],
  },
  {
    phase: 'PHASE 2',
    title: 'Python for Data Analysis',
    goal: 'Tingkatkan penguasaan wrangling dataset dari 40% → 75%',
    duration: '6 weeks',
    skills: ['Python', 'Pandas', 'NumPy', 'Data Cleaning'],
    resources: [
      'Python for Data Analysis (O’Reilly)',
      'Kaggle Pandas Micro-course',
      'Real Python Data Science Tutorials',
    ],
    certification: 'IBM Data Analyst Professional Certificate',
    project: 'Fintech Transaction Fraud & Cleaning Case Study',
    status: 'Not Started',
    tasks: [
      { label: 'Data types, Series, and DataFrames operations', completed: false },
      { label: 'Handling missing values, deduplication, and parsing dates', completed: false },
      { label: 'Feature transformation and group operations', completed: false },
      { label: 'Exploratory data analysis (EDA) summary reports', completed: false },
    ],
  },
  {
    phase: 'PHASE 3',
    title: 'Interactive Dashboard & Business Storytelling',
    goal: 'Kuasai pembuatan visualisasi bisnis dari 50% → 85%',
    duration: '5 weeks',
    skills: ['Power BI / Tableau', 'DAX', 'Data Storytelling', 'KPI Design'],
    resources: [
      'Microsoft Learn: Power BI Data Analyst Track',
      'Storytelling with Data by Cole Nussbaumer',
      'Tableau Public Community Projects',
    ],
    certification: 'Microsoft Certified: Power BI Data Analyst (PL-300)',
    project: 'Executive Sales & Customer Churn Dashboard',
    status: 'Not Started',
    tasks: [
      { label: 'Star schema data modeling and relationship building', completed: false },
      { label: 'DAX measures and calculations for time-intelligence', completed: false },
      { label: 'UI design and usability testing for executive reporting', completed: false },
      { label: 'Presentation and stakeholder recommendation briefing', completed: false },
    ],
  },
  {
    phase: 'PHASE 4',
    title: 'End-to-End Portfolio & Career Preparation',
    goal: 'Mempersiapkan portofolio kerja dan kesiapan teknis interview',
    duration: '5 weeks',
    skills: ['GitHub Documentation', 'Technical Interview', 'Business Communication'],
    resources: [
      'Data Science Interview Prep Guide',
      'GitHub Markdown & Project Showcase Template',
      'Ken Jee Data Science Portfolio Guide',
    ],
    certification: 'Associate Data Scientist Certification',
    project: 'Comprehensive Portfolio Case Study published on GitHub & LinkedIn',
    status: 'Not Started',
    tasks: [
      { label: 'Document project methodology and reproducible code in README', completed: false },
      { label: 'Create interactive portfolio landing page or Medium article', completed: false },
      { label: 'Practice technical SQL/Python live coding interviews', completed: false },
      { label: 'Simulasi behavioral interview and CV personalization', completed: false },
    ],
  },
];

export const calculatePhaseStatus = (phase: RoadmapPhase): RoadmapPhase['status'] => {
  const completedCount = phase.tasks.filter((t) => t.completed).length;
  if (completedCount === 0) {
    return phase.status === 'In Progress' ? 'In Progress' : 'Not Started';
  }
  if (completedCount === phase.tasks.length) {
    return 'Completed';
  }
  return 'In Progress';
};

export const roadmapService = {
  get(): RoadmapPhase[] {
    if (typeof window === 'undefined') return defaultRoadmapPhases;
    try {
      const value = JSON.parse(localStorage.getItem(ROADMAP_KEY) ?? '[]');
      if (!Array.isArray(value) || value.length === 0) {
        localStorage.setItem(ROADMAP_KEY, JSON.stringify(defaultRoadmapPhases));
        return defaultRoadmapPhases;
      }
      return value;
    } catch {
      return defaultRoadmapPhases;
    }
  },

  save(phases: RoadmapPhase[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ROADMAP_KEY, JSON.stringify(phases));
  },

  toggleTask(phaseIndex: number, taskIndex: number): RoadmapPhase[] {
    const phases = this.get();
    const updated = phases.map((phase, pIdx) => {
      if (pIdx !== phaseIndex) return phase;
      const updatedTasks = phase.tasks.map((task, tIdx) => {
        if (tIdx !== taskIndex) return task;
        return { ...task, completed: !task.completed };
      });
      const updatedPhase = { ...phase, tasks: updatedTasks };
      return {
        ...updatedPhase,
        status: calculatePhaseStatus(updatedPhase),
      };
    });
    this.save(updated);
    return updated;
  },

  startPhase(phaseIndex: number): RoadmapPhase[] {
    const phases = this.get();
    const updated = phases.map((phase, pIdx) => {
      if (pIdx !== phaseIndex) return phase;
      return {
        ...phase,
        status: 'In Progress' as const,
      };
    });
    this.save(updated);
    return updated;
  },

  calculateOverallProgress(phases: RoadmapPhase[]): number {
    const tasks = phases.flatMap((p) => p.tasks);
    if (!tasks.length) return 0;
    const completed = tasks.filter((t) => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  },
};
