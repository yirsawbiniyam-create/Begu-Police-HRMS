import {
  MemberProfile,
  PayrollGlobalConfig,
  TaxBracket,
  PayrollDeductionConfig,
  RankSalaryGradeScale,
  MemberPayrollCustomization,
  CalculatedOfficerPayroll,
  PoliceRank
} from '../types/hrms';
import { SALARY_SCALE_MATRIX } from '../data/mockHrmsData';

/**
 * Standard Ethiopian Progressive Income Tax Brackets (Proclamation 979/2016)
 */
export const DEFAULT_ETHIOPIAN_TAX_BRACKETS: TaxBracket[] = [
  { id: 'tax-1', minIncome: 0, maxIncome: 600, rate: 0.00, deduction: 0, label: '0 – 600 ብር (ነፃ / 0%)' },
  { id: 'tax-2', minIncome: 601, maxIncome: 1650, rate: 0.10, deduction: 60, label: '601 – 1,650 ብር (10%)' },
  { id: 'tax-3', minIncome: 1651, maxIncome: 3200, rate: 0.15, deduction: 142.50, label: '1,651 – 3,200 ብር (15%)' },
  { id: 'tax-4', minIncome: 3201, maxIncome: 5250, rate: 0.20, deduction: 302.50, label: '3,201 – 5,250 ብር (20%)' },
  { id: 'tax-5', minIncome: 5251, maxIncome: 7800, rate: 0.25, deduction: 565, label: '5,251 – 7,800 ብር (25%)' },
  { id: 'tax-6', minIncome: 7801, maxIncome: 10900, rate: 0.30, deduction: 955, label: '7,801 – 10,900 ብር (30%)' },
  { id: 'tax-7', minIncome: 10901, maxIncome: null, rate: 0.35, deduction: 1500, label: 'ከ 10,900 ብር በላይ (35%)' }
];

/**
 * Default Standard Deductions for Police Commission Staff
 */
export const DEFAULT_STANDARD_DEDUCTIONS: PayrollDeductionConfig[] = [
  {
    id: 'ded-pension',
    name: 'የመንግስት ሰራተኞችና የፖሊስ ጡረታ መዋጮ',
    nameEn: 'Statutory Pension Contribution (7%)',
    type: 'percentage',
    value: 0.07,
    isStatutory: true,
    category: 'pension',
    appliesTo: 'base_salary',
    isActive: true,
    description: 'በህግ የተደነገገ የሰራተኛ 7% የጡረታ መዋጮ'
  },
  {
    id: 'ded-credit-union',
    name: 'የቤኒሻንጉል ጉሙዝ ፖሊስ ብድርና ቁጠባ ማህበር',
    nameEn: 'Police Credit & Savings Association',
    type: 'fixed',
    value: 150,
    isStatutory: false,
    category: 'credit_union',
    appliesTo: 'gross_salary',
    isActive: true,
    description: 'የወር የቁጠባና የእርዳታ መዋጮ'
  },
  {
    id: 'ded-health-fund',
    name: 'የፖሊስ የህክምናና ጤና መድህን ፈንድ',
    nameEn: 'Police Medical & Health Fund',
    type: 'fixed',
    value: 100,
    isStatutory: false,
    category: 'health_fund',
    appliesTo: 'gross_salary',
    isActive: true,
    description: 'የህክምና ወጪዎች ድጋፍ ፈንድ'
  },
  {
    id: 'ded-red-cross',
    name: 'የኢትዮጵያ ቀይ መስቀል ማህበር ድጋፍ',
    nameEn: 'Red Cross Society Contribution',
    type: 'fixed',
    value: 25,
    isStatutory: false,
    category: 'charity',
    appliesTo: 'gross_salary',
    isActive: true,
    description: 'የቀይ መስቀል ዓመታዊ/ወርሃዊ መዋጮ'
  }
];

export const DEFAULT_PAYROLL_CONFIG: PayrollGlobalConfig = {
  id: 'global_config',
  useStatutoryTaxBrackets: true,
  pensionEmployeeRate: 0.07,
  pensionEmployerRate: 0.11,
  taxBrackets: DEFAULT_ETHIOPIAN_TAX_BRACKETS,
  standardDeductions: DEFAULT_STANDARD_DEDUCTIONS,
  defaultDutyAllowance: 1200,
  defaultHazardAllowance: 800,
  updatedAt: new Date().toISOString(),
  updatedBy: 'የፋይናንስና HR አስተዳደር'
};

/**
 * Initial Master Salary Scales by Police Rank and Grade
 */
export const DEFAULT_RANK_SALARY_SCALES: RankSalaryGradeScale[] = [
  {
    grade: 1,
    rank: 'ኮንስታብል',
    rankEn: 'Constable',
    steps: SALARY_SCALE_MATRIX[1] || [6850, 7150, 7470, 7800, 8150, 8520, 8900, 9300, 9720],
    notes: 'የመግቢያ ደረጃ 1'
  },
  {
    grade: 2,
    rank: 'ረዳት ሳጅን',
    rankEn: 'Assistant Sergeant',
    steps: SALARY_SCALE_MATRIX[2] || [7900, 8250, 8620, 9000, 9400, 9820, 10260, 10720, 11200],
    notes: 'ደረጃ 2'
  },
  {
    grade: 3,
    rank: 'ምክትል ሳጅን',
    rankEn: 'Deputy Sergeant',
    steps: SALARY_SCALE_MATRIX[3] || [9100, 9510, 9940, 10380, 10850, 11340, 11850, 12380, 12940],
    notes: 'ደረጃ 3'
  },
  {
    grade: 4,
    rank: 'ሳጅን',
    rankEn: 'Sergeant',
    steps: SALARY_SCALE_MATRIX[4] || [10500, 10970, 11460, 11980, 12520, 13080, 13670, 14280, 14920],
    notes: 'ደረጃ 4'
  },
  {
    grade: 5,
    rank: 'ዋና ሳጅን',
    rankEn: 'Chief Sergeant',
    steps: SALARY_SCALE_MATRIX[5] || [12100, 12640, 13210, 13800, 14420, 15070, 15750, 16460, 17200],
    notes: 'ደረጃ 5'
  },
  {
    grade: 6,
    rank: 'ረዳት ኢንስፔክተር',
    rankEn: 'Assistant Inspector',
    steps: SALARY_SCALE_MATRIX[6] || [14200, 14840, 15510, 16210, 16940, 17700, 18500, 19330, 20200],
    notes: 'የመኮንኖች መግቢያ ደረጃ 6'
  },
  {
    grade: 7,
    rank: 'ምክትል ኢንስፔክተር',
    rankEn: 'Deputy Inspector',
    steps: SALARY_SCALE_MATRIX[7] || [16800, 17560, 18350, 19180, 20040, 20940, 21880, 22860, 23890],
    notes: 'ደረጃ 7'
  },
  {
    grade: 8,
    rank: 'ዋና ኢንስፔክተር',
    rankEn: 'Chief Inspector',
    steps: SALARY_SCALE_MATRIX[8] || [19900, 20790, 21730, 22710, 23730, 24800, 25920, 27080, 28300],
    notes: 'ደረጃ 8'
  },
  {
    grade: 9,
    rank: 'ኮማንደር',
    rankEn: 'Commander',
    steps: SALARY_SCALE_MATRIX[9] || [24200, 25290, 26430, 27620, 28860, 30160, 31520, 32940, 34420],
    notes: 'የከፍተኛ አመራር ደረጃ 9'
  },
  {
    grade: 10,
    rank: 'ረዳት ኮሚሽነር',
    rankEn: 'Assistant Commissioner',
    steps: SALARY_SCALE_MATRIX[10] || [30500, 31870, 33300, 34800, 36370, 38010, 39720, 41510, 43380],
    notes: 'የኮሚሽኑ ከፍተኛ አመራር ደረጃ 10'
  },
  {
    grade: 11,
    rank: 'ምክትል ኮሚሽነር',
    rankEn: 'Deputy Commissioner',
    steps: [36000, 37500, 39100, 40800, 42600, 44500, 46500, 48600, 50800],
    notes: 'የኮሚሽኑ ም/ኮሚሽነር ደረጃ 11'
  },
  {
    grade: 12,
    rank: 'ኮሚሽነር',
    rankEn: 'Commissioner',
    steps: [43000, 44800, 46700, 48700, 50800, 53000, 55300, 57700, 60200],
    notes: 'የክልሉ ፖሊስ ኮሚሽነር ደረጃ 12'
  }
];

/**
 * Calculates progressive income tax based on Ethiopian Tax Brackets
 */
export function calculateIncomeTax(taxableGrossIncome: number, brackets: TaxBracket[] = DEFAULT_ETHIOPIAN_TAX_BRACKETS): number {
  if (taxableGrossIncome <= 600) {
    return 0;
  }

  // Find matching bracket
  for (const b of brackets) {
    if (b.maxIncome === null) {
      if (taxableGrossIncome >= b.minIncome) {
        return Math.max(0, Math.round(taxableGrossIncome * b.rate - b.deduction));
      }
    } else if (taxableGrossIncome >= b.minIncome && taxableGrossIncome <= b.maxIncome) {
      return Math.max(0, Math.round(taxableGrossIncome * b.rate - b.deduction));
    }
  }

  // Fallback flat 15%
  return Math.round(taxableGrossIncome * 0.15);
}

/**
 * Master automated payroll calculation engine for a police officer
 */
export function calculateOfficerPayroll(
  member: MemberProfile,
  config: PayrollGlobalConfig = DEFAULT_PAYROLL_CONFIG,
  customization?: MemberPayrollCustomization
): CalculatedOfficerPayroll {
  // 1. Determine Base Salary
  const grade = customization?.salaryGrade ?? member.salaryGrade ?? 1;
  const step = customization?.salaryStep ?? member.salaryStep ?? 1;
  const baseSalary = customization?.customBaseSalary ?? member.baseSalary ?? 7000;

  // 2. Allowances
  const duty = customization?.monthlyAllowances?.duty ?? member.monthlyAllowances.duty ?? 0;
  const field = customization?.monthlyAllowances?.field ?? member.monthlyAllowances.field ?? 0;
  const housing = customization?.monthlyAllowances?.housing ?? member.monthlyAllowances.housing ?? 0;
  const transport = customization?.monthlyAllowances?.transport ?? member.monthlyAllowances.transport ?? 0;
  const hazard = customization?.monthlyAllowances?.hazard ?? member.monthlyAllowances.hazard ?? 0;

  const additional = customization?.additionalAllowances ?? [];
  const additionalTotal = additional.reduce((sum, item) => sum + (item.amount || 0), 0);

  const totalAllowances = duty + field + housing + transport + hazard + additionalTotal;
  const grossSalary = baseSalary + totalAllowances;

  // 3. Pension Deductions
  const pensionEmployeeRate = config.pensionEmployeeRate || 0.07;
  const pensionEmployerRate = config.pensionEmployerRate || 0.11;
  const pensionEmployee = Math.round(baseSalary * pensionEmployeeRate);
  const pensionEmployer = Math.round(baseSalary * pensionEmployerRate);

  // 4. Income Tax
  let incomeTax = 0;
  if (config.useStatutoryTaxBrackets) {
    // Taxable gross usually excludes non-taxable allowances or applies to whole gross
    incomeTax = calculateIncomeTax(grossSalary, config.taxBrackets);
  } else {
    incomeTax = Math.round(grossSalary * (member.taxDeductionRate || 0.15));
  }

  // 5. Standard Institutional Deductions
  let creditAssociation = customization?.creditAssociationDeduction ?? 150;
  let healthInsurance = customization?.healthInsuranceDeduction ?? 100;
  let redCross = customization?.redCrossDeduction ?? 25;

  // Check if standard deduction configs override or disable
  const creditDeductionConfig = config.standardDeductions.find(d => d.id === 'ded-credit-union');
  if (creditDeductionConfig && !creditDeductionConfig.isActive) {
    creditAssociation = 0;
  }

  const healthDeductionConfig = config.standardDeductions.find(d => d.id === 'ded-health-fund');
  if (healthDeductionConfig && !healthDeductionConfig.isActive) {
    healthInsurance = 0;
  }

  const redCrossDeductionConfig = config.standardDeductions.find(d => d.id === 'ded-red-cross');
  if (redCrossDeductionConfig && !redCrossDeductionConfig.isActive) {
    redCross = 0;
  }

  // 6. Court & Custom Deductions
  const courtPenalty = customization?.courtOrDisciplinaryPenalty ?? 0;
  const customItems = customization?.customDeductions ?? [];
  const customItemsTotal = customItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  // 7. Totals
  const totalDeductions =
    pensionEmployee +
    incomeTax +
    creditAssociation +
    healthInsurance +
    redCross +
    courtPenalty +
    customItemsTotal;

  const netPay = Math.max(0, grossSalary - totalDeductions);

  return {
    policeId: member.policeId,
    fullName: member.identity.fullName,
    rank: member.currentRank,
    department: member.currentDepartment,
    grade,
    step,
    baseSalary,
    allowances: {
      duty,
      field,
      housing,
      transport,
      hazard,
      additional,
      totalAllowances
    },
    grossSalary,
    deductions: {
      pensionEmployee,
      pensionEmployer,
      incomeTax,
      creditAssociation,
      healthInsurance,
      redCross,
      courtPenalty,
      customItems,
      totalDeductions
    },
    netPay
  };
}
