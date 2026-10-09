import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  MemberProfile,
  PoliceRank,
  DepartmentName,
  StationLocation,
  Role
} from '../../types/hrms';
import {
  X,
  UserPlus,
  Save,
  Shield,
  MapPin,
  Briefcase,
  Phone,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Camera,
  KeyRound
} from 'lucide-react';

interface AdminAddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newMember: MemberProfile) => void;
}

export const AdminAddMemberModal: React.FC<AdminAddMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addMember, salaryScales, t } = useHrms();

  // Basic identification
  const [policeId, setPoliceId] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [fullNameAm, setFullNameAm] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [gender, setGender] = useState<'ወንድ' | 'ሴት'>('ወንድ');
  const [dateOfBirth, setDateOfBirth] = useState('1994-05-12');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [phone, setPhone] = useState('+251 9');

  // Address (Custom free entry by admin)
  const [region, setRegion] = useState('ቤኒሻንጉል ጉሙዝ');
  const [zone, setZone] = useState('አሶሳ ዞን');
  const [wereda, setWereda] = useState('አሶሳ ወረዳ');
  const [kebele, setKebele] = useState('ቀበሌ 03');
  const [dutyStationAddress, setDutyStationAddress] = useState('የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ዋና መምሪያ - አሶሳ');
  const [isCommissionStaff, setIsCommissionStaff] = useState(true);

  // Job Responsibility / Position (Custom free entry by admin)
  const [position, setPosition] = useState('የሰው ኃይልና አስተዳደር መኮንን');
  const [currentRank, setCurrentRank] = useState<PoliceRank>('ረዳት ሳጅን');
  const [currentDepartment, setCurrentDepartment] = useState<DepartmentName>('የሰው ኃይል አስተዳደርና ልማት መምሪያ');
  const [currentStation, setCurrentStation] = useState<StationLocation>('አሶሳ ዋና መምሪያ (Assosa HQ)');

  // Compensation
  const [salaryGrade, setSalaryGrade] = useState<number>(2);
  const [salaryStep, setSalaryStep] = useState<number>(1);
  const [baseSalary, setBaseSalary] = useState<number>(7900);
  const [employmentDate, setEmploymentDate] = useState('2021-09-11');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('+251 9');
  const [emergencyRel, setEmergencyRel] = useState('የትዳር አጋር');

  // Status
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Portal Account Credentials & System Role
  const [accountRole, setAccountRole] = useState<Role>('member');
  const [accountUsername, setAccountUsername] = useState('');
  const [accountPassword, setAccountPassword] = useState('');

  if (!isOpen) return null;

  // Auto-fill base salary when grade or step changes
  const handleGradeChange = (newGrade: number, newStep: number) => {
    setSalaryGrade(newGrade);
    setSalaryStep(newStep);
    const scaleObj = salaryScales.find(s => s.grade === newGrade);
    if (scaleObj && scaleObj.steps[newStep - 1]) {
      setBaseSalary(scaleObj.steps[newStep - 1]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanPid = policeId.trim().toUpperCase();
    if (!cleanPid) {
      setErrorMsg(t('እባክዎ የፖሊስ መታወቂያ ቁጥር ያስገቡ', 'Please enter Police ID'));
      return;
    }

    if (!fullNameAm.trim()) {
      setErrorMsg(t('እባክዎ የአባሉን ሙሉ ስም ያስገቡ', 'Please enter full name'));
      return;
    }

    setIsSubmitting(true);

    const newMemberProfile: MemberProfile = {
      policeId: cleanPid,
      badgeNumber: badgeNumber.trim() || `BG-${Math.floor(1000 + Math.random() * 9000)}`,
      identity: {
        policeId: cleanPid,
        fullName: fullNameAm.trim(),
        fullNameEn: fullNameEn.trim() || undefined,
        photoUrl:
          photoUrl.trim() ||
          (gender === 'ሴት'
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'),
        gender,
        phone: phone.trim(),
        badgeNumber: badgeNumber.trim(),
        rankAm: currentRank,
        responsibilityAm: position.trim(),
        dateOfBirth,
        nationality: 'ኢትዮጵያዊ',
        issueDate: new Date().toISOString().substring(0, 10),
        bloodGroup,
        emergencyContact: {
          name: emergencyName.trim() || 'የቤተሰብ ተወካይ',
          phone: emergencyPhone.trim() || phone.trim(),
          relationship: emergencyRel.trim() || 'አስተዳዳሪ'
        },
        address: {
          region: region.trim(),
          zone: zone.trim(),
          wereda: wereda.trim(),
          kebele: kebele.trim()
        },
        idSystemStatus: 'active'
      },
      currentRank,
      currentDepartment,
      currentStation,
      dutyStationAddress: dutyStationAddress.trim(),
      isCommissionStaff,
      position: position.trim(),
      employmentDate,
      employmentType: 'ቋሚ (Permanent)',
      status: 'active',
      salaryGrade,
      salaryStep,
      baseSalary,
      monthlyAllowances: {
        duty: isCommissionStaff ? 1200 : 0,
        field: 0,
        housing: 0,
        transport: 0,
        hazard: 800,
        ration: 1500
      },
      pensionDeductionRate: 0.07,
      taxDeductionRate: 0.15,
      leaveBalance: {
        annualTotal: 30,
        annualUsed: 0,
        annualRemaining: 30,
        sickUsed: 0,
        specialUsed: 0
      },
      rankHistory: [
        {
          id: `rh-${Date.now()}`,
          rank: currentRank,
          effectiveDate: employmentDate,
          orderNumber: 'የመግቢያ ምደባ',
          approvedBy: 'የኮሚሽኑ ዋና አዛዥ'
        }
      ],
      transferHistory: [],
      trainingHistory: [],
      performanceHistory: [],
      leaveHistory: [],
      benefits: [],
      disciplinaryRecords: [],
      awardsAndHonors: [],
      documents: [],
      userAccount: {
        username: accountUsername.trim() || cleanPid.toLowerCase(),
        password: accountPassword.trim() || `${cleanPid.toLowerCase()}@2026`,
        role: accountRole,
        isActive: true,
        createdDate: new Date().toISOString().substring(0, 10),
        createdBy: 'HR Admin'
      }
    };

    try {
      const res = await addMember(newMemberProfile);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (onSuccess && res.newMember) {
            onSuccess(res.newMember);
          }
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'አባል መመዝገብ አልተቻለም');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {t('አዲስ የፖሊስ አባል እንደ አዲስ መዝግብ (Register New Officer)', 'Register New Police Officer')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('አድሚኑ አድራሻ፣ የስራ ሃላፊነትና ሁሉንም መረጃዎች በራሱ ሞልቶ የሚያስገባበት ማዕከላዊ ፎርም', 'Full officer profile entry with custom address & job responsibility')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Identification */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>{t('1. መታወቂያና የግል መረጃ (Identification)', '1. Identification & Personal Info')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('Police ID (የፖሊስ መታወቂያ ቁጥር) *', 'Police ID *')}
                </label>
                <input
                  type="text"
                  required
                  value={policeId}
                  onChange={e => setPoliceId(e.target.value.toUpperCase())}
                  placeholder="ለምሳሌ፡ BG-000109"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ባጅ ቁጥር (Badge Number)', 'Badge Number')}
                </label>
                <input
                  type="text"
                  value={badgeNumber}
                  onChange={e => setBadgeNumber(e.target.value)}
                  placeholder="ለምሳሌ፡ BG-4821"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ሙሉ ስም (አማርኛ) *', 'Full Name (Amharic) *')}
                </label>
                <input
                  type="text"
                  required
                  value={fullNameAm}
                  onChange={e => setFullNameAm(e.target.value)}
                  placeholder="የአባሉ ሙሉ ስም"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ሙሉ ስም (እንግሊዝኛ)', 'Full Name (English)')}
                </label>
                <input
                  type="text"
                  value={fullNameEn}
                  onChange={e => setFullNameEn(e.target.value)}
                  placeholder="Full Name in English"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ጾታ (Gender)', 'Gender')}
                </label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="ወንድ">ወንድ (Male)</option>
                  <option value="ሴት">ሴት (Female)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ስልክ ቁጥር (Phone)', 'Phone')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የልደት ቀን (Date of Birth)', 'Date of Birth')}
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የደም አይነት (Blood Group)', 'Blood Group')}
                </label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የፎቶ URL (አማራጭ)', 'Photo URL (Optional)')}
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address Custom Entry (Requested by user) */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>⭐ {t('2. የአድራሻ መረጃ (በአድሚኑ በነፃነት የሚሞላ)', '2. Address Info (Admin Custom Entry)')}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {t('አድሚኑ አድራሻ ሲሞላ በራሱ ፍላጎት ማንኛውንም የስራ ቦታና የመኖሪያ አድራሻ በነፃነት እያስገባ ሴቭ ማድረግ ይችላል።', 'Admin enters both residential address and duty station address freely.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ክልል (Region):', 'Region:')}
                </label>
                <input
                  type="text"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  placeholder="ቤኒሻንጉል ጉሙዝ"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ዞን (Zone):', 'Zone:')}
                </label>
                <input
                  type="text"
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  placeholder="አሶሳ ዞን"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ወረዳ (Wereda):', 'Wereda:')}
                </label>
                <input
                  type="text"
                  value={wereda}
                  onChange={e => setWereda(e.target.value)}
                  placeholder="አሶሳ ወረዳ"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ቀበሌ / የቤት ቁጥር:', 'Kebele / House:')}
                </label>
                <input
                  type="text"
                  value={kebele}
                  onChange={e => setKebele(e.target.value)}
                  placeholder="ቀበሌ 03"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Duty Station Address (Official work location) */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-slate-200 font-bold">
                {t('ይፋዊ የስራ ቦታ አድራሻ (Duty Station Address - በነፃነት የሚሞላ):', 'Official Duty Station Address:')}
              </label>
              <input
                type="text"
                value={dutyStationAddress}
                onChange={e => setDutyStationAddress(e.target.value)}
                placeholder="ለምሳሌ፡ የቤኒሻንጉል ጉሙዝ ፖሊስ ኮሚሽን ዋና መምሪያ - አሶሳ"
                className="w-full bg-slate-900 border border-amber-400/50 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
              />

              <label className="flex items-center gap-2 cursor-pointer pt-1 text-slate-300">
                <input
                  type="checkbox"
                  checked={isCommissionStaff}
                  onChange={e => setIsCommissionStaff(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-400"
                />
                <span className="font-semibold text-amber-300">
                  {t('በፖሊስ ኮሚሽን ዋና መምሪያ ፔሮል ላይ በቀጥታ ይመደብ (Commission Staff Payroll Eligibility)', 'Eligible for Commission Payroll')}
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Job Responsibility / Position (Requested by user) */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>⭐ {t('3. የስራ ሃላፊነትና ማዕረግ (በአድሚኑ በነፃነት የሚሞላ)', '3. Job Responsibility & Rank')}</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {t('አድሚኑ የስራ ሃላፊነት ሲሞላ በራሱ ማንኛውንም ሃላፊነትና የስራ መደብ በፅሁፍ እያስገባ ሴቭ ማድረግ ይችላል።', 'Admin types any custom job responsibility or title freely.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Custom Job Responsibility / Position Input */}
              <div className="lg:col-span-2">
                <label className="block text-slate-200 font-bold mb-1">
                  {t('የስራ ሃላፊነት / የስራ መደብ (Job Responsibility / Role - በነፃነት የሚሞላ) *', 'Job Responsibility / Role *')}
                </label>
                <input
                  type="text"
                  required
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  placeholder="ለምሳሌ፡ የመረጃና ምርመራ መኮንን፣ የህዝብ ግንኙነት ኃላፊ፣ የጥበቃ አዛዥ..."
                  className="w-full bg-slate-900 border border-amber-400/50 rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ማዕረግ (Rank)', 'Rank')}
                </label>
                <select
                  value={currentRank}
                  onChange={e => setCurrentRank(e.target.value as PoliceRank)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-bold"
                >
                  <option value="ኮንስታብል">ኮንስታብል (Constable)</option>
                  <option value="ረዳት ሳጅን">ረዳት ሳጅን (Assistant Sergeant)</option>
                  <option value="ምክትል ሳጅን">ምክትል ሳጅን (Deputy Sergeant)</option>
                  <option value="ሳጅን">ሳጅን (Sergeant)</option>
                  <option value="ዋና ሳጅን">ዋና ሳጅን (Chief Sergeant)</option>
                  <option value="ረዳት ኢንስፔክተር">ረዳት ኢንስፔክተር (Assistant Inspector)</option>
                  <option value="ምክትል ኢንስፔክተር">ምክትል ኢንስፔክተር (Deputy Inspector)</option>
                  <option value="ኢንስፔክተር">ኢንስፔክተር (Inspector)</option>
                  <option value="ዋና ኢንስፔክተር">ዋና ኢንስፔክተር (Chief Inspector)</option>
                  <option value="ምክትል ኮማንደር">ምክትል ኮማንደር (Deputy Commander)</option>
                  <option value="ኮማንደር">ኮማንደር (Commander)</option>
                  <option value="ረዳት ኮሚሽነር">ረዳት ኮሚሽነር (Assistant Commissioner)</option>
                  <option value="ምክትል ኮሚሽነር">ምክትል ኮሚሽነር (Deputy Commissioner)</option>
                  <option value="ኮሚሽነር">ኮሚሽነር (Commissioner)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('መምሪያ (Department)', 'Department')}
                </label>
                <select
                  value={currentDepartment}
                  onChange={e => setCurrentDepartment(e.target.value as DepartmentName)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="የሰው ኃይል አስተዳደርና ልማት መምሪያ">የሰው ኃይል አስተዳደርና ልማት መምሪያ</option>
                  <option value="ወንጀል ምርመራ መምሪያ">ወንጀል ምርመራ መምሪያ</option>
                  <option value="ወንጀል መከላከልና ፓትሮል መምሪያ">ወንጀል መከላከልና ፓትሮል መምሪያ</option>
                  <option value="ትራፊክ ደህንነትና ቁጥጥር መምሪያ">ትራፊክ ደህንነትና ቁጥጥር መምሪያ</option>
                  <option value="ልዩ ፈጣን ኃይል መምሪያ">ልዩ ፈጣን ኃይል መምሪያ</option>
                  <option value="ሥልጠናና የፖሊስ ኮሌጅ">ሥልጠናና የፖሊስ ኮሌጅ</option>
                  <option value="ሎጂስቲክስና ንብረት አስተዳደር">ሎጂስቲክስና ንብረት አስተዳደር</option>
                  <option value="ፋይናንስና በጀት መምሪያ">ፋይናንስና በጀት መምሪያ</option>
                  <option value="የኮሚሽኑ ዋና አዛዥ ጽ/ቤት">የኮሚሽኑ ዋና አዛዥ ጽ/ቤት</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ጣቢያ / መምሪያ ጣቢያ', 'Station')}
                </label>
                <select
                  value={currentStation}
                  onChange={e => setCurrentStation(e.target.value as StationLocation)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="አሶሳ ዋና መምሪያ (Assosa HQ)">አሶሳ ዋና መምሪያ (Assosa HQ)</option>
                  <option value="አሶሳ ከተማ ፖሊስ መምሪያ">አሶሳ ከተማ ፖሊስ መምሪያ</option>
                  <option value="መተከል ዞን ፖሊስ መምሪያ (Gilgel Beles)">መተከል ዞን ፖሊስ መምሪያ</option>
                  <option value="ካማሺ ዞን ፖሊስ መምሪያ (Kamashi)">ካማሺ ዞን ፖሊስ መምሪያ</option>
                  <option value="ባምባሲ ወረዳ ፖሊስ ጣቢያ">ባምባሲ ወረዳ ፖሊስ ጣቢያ</option>
                  <option value="ጉባ ወረዳ ፖሊስ ጣቢያ (Grand Renaissance Dam Area)">ጉባ ወረዳ ፖሊስ ጣቢያ</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የቅጥር ቀን (Employment Date)', 'Employment Date')}
                </label>
                <input
                  type="date"
                  value={employmentDate}
                  onChange={e => setEmploymentDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compensation & Salary Grade */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{t('4. የደመወዝ ደረጃና እርከን (Compensation & Grade)', '4. Compensation & Grade')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('ደረጃ (Grade 1 - 12):', 'Salary Grade:')}
                </label>
                <select
                  value={salaryGrade}
                  onChange={e => handleGradeChange(parseInt(e.target.value, 10), salaryStep)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                    <option key={g} value={g}>
                      Grade {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('እርከን (Step 1 - 9):', 'Salary Step:')}
                </label>
                <select
                  value={salaryStep}
                  onChange={e => handleGradeChange(salaryGrade, parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(s => (
                    <option key={s} value={s}>
                      Step {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('መነሻ መሰረታዊ ደመወዝ (ETB):', 'Base Salary (ETB):')}
                </label>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={e => setBaseSalary(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-black text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Emergency Contact */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>{t('5. የአደጋ ጊዜ ተጠሪ (Emergency Contact)', '5. Emergency Contact')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('የተጠሪ ስም:', 'Contact Name:')}</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  placeholder="የቅርብ ዘመድ ስም"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('የተጠሪ ስልክ:', 'Contact Phone:')}</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">{t('ዝምድና:', 'Relationship:')}</label>
                <input
                  type="text"
                  value={emergencyRel}
                  onChange={e => setEmergencyRel(e.target.value)}
                  placeholder="የትዳር አጋር / አባት / እናት"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Portal Login Credentials & System Role */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              <span>{t('6. የመግቢያ መለያና የስራ ሚና (System Role & Credentials)', '6. System Role & Credentials')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የሲስተም የስራ ሚና *', 'System Role Selection *')}
                </label>
                <select
                  value={accountRole}
                  onChange={e => setAccountRole(e.target.value as Role)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="member">👮 አባል (Member Self-Service)</option>
                  <option value="hr_admin">👑 አድሚን (Admin / HR Admin)</option>
                  <option value="management">🎖️ ከፍተኛ አመራር (Command / Management)</option>
                  <option value="payroll_officer">💰 የደመወዝ ባለሙያ (Payroll Officer)</option>
                  <option value="supervisor">🛡️ የቅርብ ሀላፊ (Immediate Supervisor)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የተጠቃሚ ስም (Username):', 'Username:')}
                </label>
                <input
                  type="text"
                  value={accountUsername}
                  onChange={e => setAccountUsername(e.target.value)}
                  placeholder={policeId.toLowerCase() || 'bg-000...'}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  {t('የይለፍ ቃል (Password):', 'Password:')}
                </label>
                <input
                  type="text"
                  value={accountPassword}
                  onChange={e => setAccountPassword(e.target.value)}
                  placeholder="Police@2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">
              {t(
                'አድሚን፣ ከፍተኛ አመራር፣ የደመወዝ ባለሙያ፣ አባል ወይም የቅርብ ሀላፊ በመምረጥ ወዲያውኑ የመግቢያ መለያ በፋየርስቶር ክላውድ ዳታቤዝ ይመዘገባል።',
                'Select among: Admin, Management, Payroll Officer, Member, or Supervisor. Credentials recorded in Firestore.'
              )}
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              {t('ሰርዝ', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? t('በማስቀመጥ ላይ...', 'Saving to Database...')
                  : t('አባል እንደ አዲስ መዝግብና በማህደር አስቀምጥ', 'Register Officer & Save')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
