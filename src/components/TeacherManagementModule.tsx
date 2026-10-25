/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Award,
  BookOpen,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  Lock,
  Download,
  X,
  Plus,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  TeacherStaffRecord,
  GradeLevel,
  AuthUser,
} from '../types/school';
import { ALL_GRADES } from '../data/mockSchoolData';

interface TeacherManagementModuleProps {
  currentUser: AuthUser;
  teachers: TeacherStaffRecord[];
  onAddTeacher: (teacher: TeacherStaffRecord) => void;
  onLogAudit: (action: any, resource: string, details: string) => void;
}

export const TeacherManagementModule: React.FC<TeacherManagementModuleProps> = ({
  currentUser,
  teachers,
  onAddTeacher,
  onLogAudit,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cadreFilter, setCadreFilter] = useState<'All' | string>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | string>('All');

  // New Teacher form states
  const [name, setName] = useState('');
  const [tscOrIdNo, setTscOrIdNo] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('+254 ');
  const [email, setEmail] = useState('');
  const [cadre, setCadre] = useState<TeacherStaffRecord['cadre']>('TSC Permanent');
  const [role, setRole] = useState<TeacherStaffRecord['role']>('Subject Teacher');
  const [assignedGrade, setAssignedGrade] = useState<GradeLevel>('Grade 7');
  const [assignedStream, setAssignedStream] = useState('7 Amboseli');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics']);
  const [dateOfJoining, setDateOfJoining] = useState(new Date().toISOString().substring(0, 10));
  const [basicSalary, setBasicSalary] = useState<number>(55000);
  const [qualification, setQualification] = useState('B.Ed Science - Kenyatta University');

  const SUBJECT_OPTIONS = [
    'Mathematics',
    'English Language',
    'Kiswahili',
    'Integrated Science',
    'Pre-Technical Studies',
    'Agriculture & Nutrition',
    'Social Studies',
    'Religious Education (CRE/IRE)',
    'Creative Arts & Sports',
    'Literacy / Language Activities',
    'Numeracy Activities',
    'Environmental Activities',
  ];

  const handleToggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tscOrIdNo.trim()) return;

    const newTeacher: TeacherStaffRecord = {
      id: 'tch_' + Date.now(),
      name: name.trim(),
      tscOrIdNo: tscOrIdNo.trim(),
      nationalId: nationalId.trim() || 'ID-' + Math.floor(20000000 + Math.random() * 15000000),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/[^a-z]/g, '')}@limurumodel.sc.ke`,
      cadre,
      role,
      assignedGrade,
      assignedStream,
      assignedSubjects: selectedSubjects.length > 0 ? selectedSubjects : ['General Studies'],
      dateOfJoining,
      basicSalary: Number(basicSalary),
      qualification: qualification.trim(),
      status: 'Active',
    };

    onAddTeacher(newTeacher);
    onLogAudit(
      'TEACHER_ONBOARDED',
      `Teacher Registry: ${newTeacher.name} (${newTeacher.tscOrIdNo})`,
      `Onboarded as ${newTeacher.role} (${newTeacher.cadre}) assigned to ${newTeacher.assignedGrade} ${newTeacher.assignedStream}.`
    );

    // Reset & Close
    setIsModalOpen(false);
    setName('');
    setTscOrIdNo('');
    setNationalId('');
    setPhone('+254 ');
    setEmail('');
    setSelectedSubjects(['Mathematics']);
  };

  const filteredTeachers = teachers.filter((t) => {
    if (cadreFilter !== 'All' && t.cadre !== cadreFilter) return false;
    if (roleFilter !== 'All' && t.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.tscOrIdNo.toLowerCase().includes(q) ||
        t.assignedSubjects.some((s) => s.toLowerCase().includes(q)) ||
        (t.assignedStream && t.assignedStream.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const canManageTeachers = currentUser.role === 'principal';

  return (
    <div className="space-y-6">
      {/* Header & Metric Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Teaching Faculty & Pedagogical Staff Directory
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              {teachers.length} Active Educators
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teacher Service Commission (TSC) Permanent, BoM Contract & Intern appointments across Grades 1 to 9
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageTeachers && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add New Teacher
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">TSC Permanent Cadre</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {teachers.filter((t) => t.cadre === 'TSC Permanent').length}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">100% IPPD Pensionable</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">BoM & Intern Educators</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {teachers.filter((t) => t.cadre !== 'TSC Permanent').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">School BoM Contracted</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Class Masters Assigned</div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {teachers.filter((t) => t.role === 'Class Master').length}
          </div>
          <div className="text-[11px] text-sky-700 mt-1 font-medium">Grades 1 through 9</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">TPAD 2.0 Compliance</div>
          <div className="text-2xl font-bold text-emerald-800 tabular-nums">100%</div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">All Lesson Plans Filed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by teacher name, TSC No, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Cadre:</span>
            <select
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Cadres</option>
              <option value="TSC Permanent">TSC Permanent</option>
              <option value="BoM Contract">BoM Contract</option>
              <option value="TSC Intern">TSC Intern</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="All">All Roles</option>
              <option value="Class Master">Class Master</option>
              <option value="Subject Teacher">Subject Teacher</option>
              <option value="Senior Teacher">Senior Teacher</option>
              <option value="HOD">Head of Department (HOD)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((tch) => {
          return (
            <div
              key={tch.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 border-2 border-emerald-500">
                      {tch.name
                        .replace('Mr. ', '')
                        .replace('Mdm. ', '')
                        .replace('Dr. ', '')
                        .replace('Eng. ', '')
                        .replace('Tr. ', '')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{tch.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[11px] text-slate-500">{tch.tscOrIdNo}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {tch.cadre}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tch.role === 'Class Master'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : tch.role === 'HOD'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {tch.role}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs">
                  {tch.assignedStream && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Assigned Class:</span>
                      <strong className="text-slate-900 font-semibold">
                        {tch.assignedGrade} · {tch.assignedStream}
                      </strong>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block mb-1 font-medium">Teaching Learning Areas:</span>
                    <div className="flex flex-wrap gap-1">
                      {tch.assignedSubjects.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1 leading-snug">
                    <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                    {tch.qualification}
                  </div>
                </div>
              </div>

              {/* Card Footer with Contact details */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{tch.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          MODAL: ADD NEW TEACHER
          ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700/80 text-white flex items-center justify-center font-bold shadow-xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Onboard New Teacher / Faculty Staff</h3>
                  <p className="text-xs text-slate-400">
                    Register academic staff with TSC credentials, teaching areas, and class master allocations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teacher Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mwl. David K. Mutiso"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    TSC Number or BoM Staff ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TSC/582910"
                    value={tscOrIdNo}
                    onChange={(e) => setTscOrIdNo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kenya National ID Number
                  </label>
                  <input
                    type="text"
                    placeholder="ID-28190432"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="dmutiso@limurumodel.sc.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cadre Appointment</label>
                  <select
                    value={cadre}
                    onChange={(e) => setCadre(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium bg-white"
                  >
                    <option value="TSC Permanent">TSC Permanent (Government Pensionable)</option>
                    <option value="BoM Contract">BoM Contract (School Funded)</option>
                    <option value="TSC Intern">TSC Intern</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institutional Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium bg-white"
                  >
                    <option value="Class Master">Class Master</option>
                    <option value="Subject Teacher">Subject Teacher</option>
                    <option value="Senior Teacher">Senior Teacher</option>
                    <option value="HOD">Head of Department (HOD)</option>
                    <option value="Deputy Principal">Deputy Principal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Grade Level</label>
                  <select
                    value={assignedGrade}
                    onChange={(e) => setAssignedGrade(e.target.value as GradeLevel)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium bg-white"
                  >
                    {ALL_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. 7 Amboseli or 8 Mara"
                    value={assignedStream}
                    onChange={(e) => setAssignedStream(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              {/* Teaching Learning Areas Multi-select */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Teaching Subjects / Strands (Select all that apply)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg max-h-44 overflow-y-auto">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isChecked = selectedSubjects.includes(subj);
                    return (
                      <label
                        key={subj}
                        className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors ${
                          isChecked ? 'bg-emerald-50 text-emerald-950 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSubject(subj)}
                          className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] leading-tight">{subj}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Highest Academic Qualification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B.Ed Science (Maths/Chem) - Kenyatta Univ"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Basic Monthly Salary (KES)
                  </label>
                  <input
                    type="number"
                    min={20000}
                    step={1000}
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save Teacher Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
