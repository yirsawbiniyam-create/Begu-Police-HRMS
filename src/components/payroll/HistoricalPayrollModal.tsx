import React from 'react';
import { MonthlyPayrollArchive, CalculatedOfficerPayroll } from '../../types/hrms';
import { useHrms } from '../../context/HrmsContext';
import {
  X,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Building,
  Shield,
  CheckCircle,
  FileText
} from 'lucide-react';

interface HistoricalPayrollModalProps {
  archive: MonthlyPayrollArchive | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoricalPayrollModal: React.FC<HistoricalPayrollModalProps> = ({
  archive,
  isOpen,
  onClose
}) => {
  const { t, systemLogo } = useHrms();

  if (!isOpen || !archive) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = [
      'id number',
      'ማዕረግ',
      'N AME',
      'GROSS',
      'NO.TAX',
      'Gross PENSION',
      'Total SALARY',
      'TAX',
      'PENSION',
      'other didaction',
      'Total DIDACTION',
      'Net PAY',
      'SIG.'
    ];

    const rows = archive.records.map((r: CalculatedOfficerPayroll) => {
      const gross = r.baseSalary;
      const noTax = r.allowances.ration || 0;
      const nonRation = Math.max(0, r.allowances.totalAllowances - noTax);
      const grossPension = nonRation;
      const totalSalary = gross + noTax + grossPension;
      const tax = r.deductions.incomeTax;
      const pension = r.deductions.pensionEmployee;
      const other =
        (r.deductions.creditAssociation || 0) +
        (r.deductions.personalLoan || 0) +
        (r.deductions.selamBiruhSavings || 0) +
        (r.deductions.selamBiruhLotteryShare || 0) +
        (r.deductions.selamBiruhLoan || 0) +
        (r.deductions.generalCreditLoan || 0) +
        (r.deductions.hivFund || 0) +
        (r.deductions.medical || 0) +
        (r.deductions.other || 0) +
        (r.deductions.redCross || 0) +
        (r.deductions.courtPenalty || 0) +
        (r.deductions.customItems?.reduce((acc, c) => acc + c.amount, 0) || 0);
      const totalDeduction = tax + pension + other;
      const netPay = totalSalary - totalDeduction;

      return [
        `"${r.policeId}"`,
        `"${r.rank}"`,
        `"${r.fullName}"`,
        gross,
        noTax,
        grossPension,
        totalSalary,
        tax,
        pension,
        other,
        totalDeduction,
        netPay,
        '""'
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Payroll_Archive_${archive.monthName.replace(/[^a-zA-Z0-9\u1200-\u137F]/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-7xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0 print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            {systemLogo ? (
              <img
                src={systemLogo}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-lg border border-amber-500/30 p-0.5 bg-slate-900"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase">
                  {t('በማህደር የተቀመጠ ይፋዊ ሰነድ', 'Official Archived Record')}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {archive.id}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5 print:text-black">
                {archive.monthName} - {t('የወር ክፍያ ይፋዊ ሉህ (ፋይል)', 'Official Monthly Payroll Archive')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('Excel / CSV አውርድ', 'Download Excel')}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t('አትም / PDF', 'Print / PDF')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Aggregate Summary Badges */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs flex-shrink-0 print:border-b print:py-2">
          <div>
            <span className="text-[10px] text-slate-400 block">{t('ተከፋይ አባላት', 'Total Officers')}</span>
            <span className="font-bold text-white font-mono text-sm print:text-black">{archive.totalOfficers}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">{t('መሰረታዊ ደመወዝ', 'Base Salary')}</span>
            <span className="font-bold text-white font-mono print:text-black">{archive.totalBaseSalary.toLocaleString()} ETB</span>
          </div>
          <div>
            <span className="text-[10px] text-amber-400 block">⭐ {t('የቀለብ ብር', 'Ration')}</span>
            <span className="font-bold text-amber-400 font-mono print:text-black">+{archive.totalRationAllowance.toLocaleString()} ETB</span>
          </div>
          <div>
            <span className="text-[10px] text-rose-400 block">{t('ግብርና ጡረታ', 'Tax & Pension')}</span>
            <span className="font-bold text-rose-400 font-mono print:text-black">-{(archive.totalIncomeTax + archive.totalPensionEmployee).toLocaleString()} ETB</span>
          </div>
          <div>
            <span className="text-[10px] text-rose-400 block">{t('ጠቅላላ ቅነሳ', 'Total Deductions')}</span>
            <span className="font-bold text-rose-400 font-mono print:text-black">-{archive.totalDeductions.toLocaleString()} ETB</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block">{t('የተጣራ ክፍያ (Net)', 'Total Net Pay')}</span>
            <span className="font-black text-emerald-400 font-mono text-sm print:text-black">{archive.totalNetPay.toLocaleString()} ETB</span>
          </div>
        </div>

        {/* The Exact 13 Columns Matching User's Image */}
        <div className="p-4 sm:p-6 overflow-x-auto flex-1 print:p-0 print:overflow-visible">
          <div className="min-w-[1250px]">
            <table className="w-full border-collapse text-xs print:text-[10px]">
              {/* EXACT YELLOW HEADER MATCHING USER'S IMAGE */}
              <thead>
                <tr className="bg-[#ffff00] text-black font-black uppercase text-center border-2 border-black divide-x-2 divide-black">
                  <th className="py-2.5 px-2 border-black whitespace-nowrap">id number</th>
                  <th className="py-2.5 px-2 border-black whitespace-nowrap">ማዕረግ</th>
                  <th className="py-2.5 px-3 border-black text-left whitespace-nowrap">N AME</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">GROSS</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">NO.TAX</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">Gross PENSION</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">Total SALARY</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">TAX</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">PENSION</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">other didaction</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">Total DIDACTION</th>
                  <th className="py-2.5 px-2 border-black text-right whitespace-nowrap">Net PAY</th>
                  <th className="py-2.5 px-4 border-black text-center whitespace-nowrap">SIG.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/40 border-2 border-black text-slate-100 print:text-black">
                {archive.records.map((r: CalculatedOfficerPayroll) => {
                  const gross = r.baseSalary;
                  const noTax = r.allowances.ration || 0;
                  const nonRation = Math.max(0, r.allowances.totalAllowances - noTax);
                  const grossPension = nonRation;
                  const totalSalary = gross + noTax + grossPension;
                  const tax = r.deductions.incomeTax;
                  const pension = r.deductions.pensionEmployee;
                  const other =
                    (r.deductions.creditAssociation || 0) +
                    (r.deductions.personalLoan || 0) +
                    (r.deductions.selamBiruhSavings || 0) +
                    (r.deductions.selamBiruhLotteryShare || 0) +
                    (r.deductions.selamBiruhLoan || 0) +
                    (r.deductions.generalCreditLoan || 0) +
                    (r.deductions.hivFund || 0) +
                    (r.deductions.medical || 0) +
                    (r.deductions.other || 0) +
                    (r.deductions.redCross || 0) +
                    (r.deductions.courtPenalty || 0) +
                    (r.deductions.customItems?.reduce((acc, c) => acc + c.amount, 0) || 0);
                  const totalDeduction = tax + pension + other;
                  const netPay = totalSalary - totalDeduction;

                  return (
                    <tr
                      key={r.policeId}
                      className="border-b border-black/30 hover:bg-slate-800/40 print:hover:bg-transparent divide-x divide-black/30"
                    >
                      <td className="py-2 px-2 font-mono font-bold text-amber-300 print:text-black text-center whitespace-nowrap">
                        {r.policeId}
                      </td>
                      <td className="py-2 px-2 text-slate-200 print:text-black whitespace-nowrap text-center">
                        {r.rank}
                      </td>
                      <td className="py-2 px-3 font-semibold text-white print:text-black whitespace-nowrap">
                        {r.fullName}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-slate-100 print:text-black whitespace-nowrap">
                        {gross.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-amber-300 print:text-black whitespace-nowrap font-bold">
                        {noTax > 0 ? `+${noTax.toLocaleString()}` : '0'}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-slate-200 print:text-black whitespace-nowrap">
                        {grossPension > 0 ? `+${grossPension.toLocaleString()}` : '0'}
                      </td>
                      <td className="py-2 px-2 font-mono text-right font-black text-white print:text-black whitespace-nowrap bg-slate-950/40 print:bg-transparent">
                        {totalSalary.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-rose-300 print:text-black whitespace-nowrap">
                        -{tax.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-rose-300 print:text-black whitespace-nowrap">
                        -{pension.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right text-sky-300 print:text-black whitespace-nowrap">
                        -{other.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right font-bold text-rose-400 print:text-black whitespace-nowrap bg-rose-500/10 print:bg-transparent">
                        -{totalDeduction.toLocaleString()}
                      </td>
                      <td className="py-2 px-2 font-mono text-right font-black text-emerald-400 print:text-black whitespace-nowrap bg-emerald-500/10 print:bg-transparent text-sm">
                        {netPay.toLocaleString()}
                      </td>
                      <td className="py-2 px-4 text-center border-black">
                        <div className="w-20 h-6 border-b border-dashed border-slate-600 print:border-black mx-auto" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Grand Totals Footer */}
              <tfoot>
                <tr className="bg-amber-400/20 text-white font-black border-2 border-black divide-x-2 divide-black text-right print:text-black">
                  <td colSpan={3} className="py-2.5 px-3 text-center uppercase tracking-wider text-xs">
                    {t('ጠቅላላ ድምር (GRAND TOTAL)', 'Grand Total')}
                  </td>
                  <td className="py-2 px-2 font-mono">{archive.totalBaseSalary.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono text-amber-300 print:text-black">+{archive.totalRationAllowance.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono">
                    +{archive.records.reduce((acc, r) => acc + Math.max(0, r.allowances.totalAllowances - (r.allowances.ration || 0)), 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 font-mono font-black text-white print:text-black">{archive.totalGrossSalary.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono text-rose-300 print:text-black">-{archive.totalIncomeTax.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono text-rose-300 print:text-black">-{archive.totalPensionEmployee.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono text-sky-300 print:text-black">
                    -{archive.records.reduce((acc, r) => {
                      const other =
                        (r.deductions.creditAssociation || 0) +
                        (r.deductions.personalLoan || 0) +
                        (r.deductions.selamBiruhSavings || 0) +
                        (r.deductions.selamBiruhLotteryShare || 0) +
                        (r.deductions.selamBiruhLoan || 0) +
                        (r.deductions.generalCreditLoan || 0) +
                        (r.deductions.hivFund || 0) +
                        (r.deductions.medical || 0) +
                        (r.deductions.other || 0) +
                        (r.deductions.redCross || 0) +
                        (r.deductions.courtPenalty || 0) +
                        (r.deductions.customItems?.reduce((sum, c) => sum + c.amount, 0) || 0);
                      return acc + other;
                    }, 0).toLocaleString()}
                  </td>
                  <td className="py-2 px-2 font-mono font-black text-rose-400 print:text-black">-{archive.totalDeductions.toLocaleString()}</td>
                  <td className="py-2 px-2 font-mono font-black text-emerald-400 print:text-black text-sm">{archive.totalNetPay.toLocaleString()}</td>
                  <td className="py-2 px-2 text-center text-[10px] text-slate-400 print:text-black">
                    {t('የፋይናንስ ማህተም', 'Authorized')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Signature & Processing Notes Footer for Print */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 print:border-t-2 print:border-black print:bg-white print:text-black">
          <div>
            <span>{t('ያዘጋጀው ባለሙያ:', 'Prepared by:')} </span>
            <strong className="text-white print:text-black">{archive.processedBy}</strong>
            <span className="ml-4 font-mono text-[11px]">({archive.createdAt})</span>
          </div>

          <div className="flex items-center gap-8 print:flex">
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 mb-1">{t('የፔሮል ኦፊሰር ፊርማ', 'Payroll Officer')}</span>
              <div className="w-32 border-b border-slate-600 print:border-black h-4" />
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-400 mb-1">{t('የኮሚሽኑ ፋይናንስ ኃላፊ ፊርማ', 'Finance Head Signature')}</span>
              <div className="w-36 border-b border-slate-600 print:border-black h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
