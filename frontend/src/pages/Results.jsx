import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, Download, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { resultsApi, studentsApi, subjectsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Results() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  
  // Student filter for Teacher/Admin
  const [filterStudentId, setFilterStudentId] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    marks: '',
    grade: '',
    examTerm: ''
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      let resultsData, studentsData = [], subjectsData = [];
      
      if (user?.role === 'ROLE_STUDENT') {
        resultsData = await resultsApi.getMe();
        setFilterStudentId('me'); // students inherently filter to themselves
      } else {
        const responses = await Promise.all([
          resultsApi.getAll(),
          studentsApi.getAll(),
          subjectsApi.getAll()
        ]);
        resultsData = responses[0];
        studentsData = responses[1];
        subjectsData = responses[2];
      }
      
      // Auto-calculate GPA and Status on frontend as fallback if backend transient fields didn't serialize
      const enrichedResults = resultsData.map(r => {
        let gpa = r.gpa;
        let status = r.status;
        let grade = r.grade;
        if (r.marks != null) {
          if (!status) status = parseFloat(r.marks) >= 40 ? 'PASS' : 'FAIL';
          if (gpa == null) {
            const m = parseFloat(r.marks);
            if (m >= 90) gpa = 4.0;
            else if (m >= 80) gpa = 4.0;
            else if (m >= 70) gpa = 3.0;
            else if (m >= 60) gpa = 2.0;
            else if (m >= 50) gpa = 1.0;
            else gpa = 0.0;
          }
          if (!grade) {
            const m = parseFloat(r.marks);
            if (m >= 90) grade = 'A+';
            else if (m >= 80) grade = 'A';
            else if (m >= 70) grade = 'B';
            else if (m >= 60) grade = 'C';
            else if (m >= 50) grade = 'D';
            else grade = 'F';
          }
        }
        return { ...r, gpa, status, grade };
      });

      setResults(enrichedResults);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = useMemo(() => {
    if (!filterStudentId || filterStudentId === 'all' || filterStudentId === 'me') {
      return results;
    }
    return results.filter(r => r.student?.id === parseInt(filterStudentId));
  }, [results, filterStudentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student: { id: formData.studentId },
        subject: { id: formData.subjectId },
        marks: parseFloat(formData.marks),
        grade: formData.grade,
        examTerm: formData.examTerm
      };
      if (editingResult) {
        await resultsApi.update(editingResult.id, payload);
      } else {
        await resultsApi.create(payload);
      }
      setIsModalOpen(false);
      setEditingResult(null);
      setFormData({ studentId: '', subjectId: '', marks: '', grade: '', examTerm: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save result', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this result?')) {
      try {
        await resultsApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Failed to delete result', error);
        alert('Failed to delete result record.');
      }
    }
  };

  const openModal = (record = null) => {
    if (record) {
      setEditingResult(record);
      setFormData({
        studentId: record.student.id,
        subjectId: record.subject.id,
        marks: record.marks,
        grade: record.grade || '',
        examTerm: record.examTerm || ''
      });
    } else {
      setEditingResult(null);
      setFormData({ 
        studentId: students[0]?.id || '', 
        subjectId: subjects[0]?.id || '', 
        marks: '', grade: '', examTerm: '' 
      });
    }
    setIsModalOpen(true);
  };

  const generatePDF = () => {
    if (filteredResults.length === 0) return;

    const doc = new jsPDF();
    
    // Get student details
    const targetStudentName = user?.role === 'ROLE_STUDENT' 
      ? user.username 
      : students.find(s => s.id === parseInt(filterStudentId))?.name || 'Unknown Student';
    
    // Calculate Cumulative Stats
    let totalGPA = 0;
    let totalMarks = 0;
    let failedSubjects = 0;
    filteredResults.forEach(r => {
      totalGPA += parseFloat(r.gpa || 0);
      totalMarks += parseFloat(r.marks || 0);
      if (r.status === 'FAIL') failedSubjects++;
    });
    
    const cgpa = (filteredResults.length > 0 ? (totalGPA / filteredResults.length) : 0).toFixed(2);
    const avgMarks = (filteredResults.length > 0 ? (totalMarks / filteredResults.length) : 0).toFixed(1);
    const finalStatus = failedSubjects > 0 ? 'FAILED' : 'PASSED';
    
    // Professional Report Card Header
    doc.setFillColor(63, 81, 181); // Indigo color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text("Springfield High School", 105, 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("OFFICIAL ACADEMIC REPORT CARD", 105, 30, { align: "center" });
    
    // Student Information Block
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Student Name: `, 14, 55);
    doc.setFont(undefined, 'bold');
    doc.text(targetStudentName, 45, 55);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Date of Issue: `, 130, 55);
    doc.setFont(undefined, 'bold');
    doc.text(new Date().toLocaleDateString(), 160, 55);
    
    doc.setFont(undefined, 'normal');
    doc.text(`Academic Standing: `, 14, 65);
    doc.setTextColor(finalStatus === 'PASSED' ? 34 : 220, finalStatus === 'PASSED' ? 197 : 38, finalStatus === 'PASSED' ? 94 : 38);
    doc.setFont(undefined, 'bold');
    doc.text(finalStatus, 50, 65);

    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Cumulative GPA: `, 130, 65);
    doc.setFont(undefined, 'bold');
    doc.text(`${cgpa} / 4.0`, 165, 65);

    // Table
    const tableColumn = ["Subject", "Exam Term", "Marks", "Grade", "GPA", "Status"];
    const tableRows = [];

    filteredResults.forEach(record => {
      const resultData = [
        record.subject?.subjectName || record.subject?.name || 'N/A',
        record.examTerm,
        record.marks,
        record.grade,
        record.gpa,
        record.status
      ];
      tableRows.push(resultData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181], textColor: 255, fontSize: 11, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10, cellPadding: 4 },
      alternateRowStyles: { fillColor: [245, 247, 255] },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 5) {
           if(data.cell.raw === 'PASS') {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
           } else {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = 'bold';
           }
        }
      }
    });

    // Footer signature line
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFont(undefined, 'normal');
    doc.text("Principal's Signature: _______________________", 14, finalY + 30);
    doc.text("Date: _______________________", 130, finalY + 30);

    doc.save(`${targetStudentName.replace(' ', '_')}_Report_Card.pdf`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Results</h1>
        
        <div className="flex gap-4 items-center">
          {/* Student Filter for Teachers/Admins */}
          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400" />
              <select 
                value={filterStudentId} 
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl bg-white/60 backdrop-blur-xl border border-indigo-100 shadow-sm focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900 outline-none"
              >
                <option value="all">All Students</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                ))}
              </select>
            </div>
          )}

          {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openModal()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
            >
              <Plus className="w-5 h-5" /> Add Result
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDF}
            disabled={filteredResults.length === 0 || filterStudentId === 'all' || filterStudentId === ''}
            className={`px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg font-medium ${
              filteredResults.length === 0 || filterStudentId === 'all' || filterStudentId === ''
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200'
            }`}
            title={filterStudentId === 'all' || filterStudentId === '' ? "Select a student to generate a report card" : "Download PDF Report Card"}
          >
            <Download className="w-5 h-5" /> Report Card
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-white/50"
      >
        <table className="min-w-full divide-y divide-indigo-50">
          <thead className="bg-indigo-50/50">
            <tr>
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
              )}
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Exam Term</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Marks</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">GPA</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Status</th>
              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {filteredResults.length > 0 ? filteredResults.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.subject?.subjectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.examTerm}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">{record.marks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl font-bold">{record.grade}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">{record.gpa}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl ${
                    record.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                {(user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_TEACHER') && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openModal(record)} className="text-indigo-600 hover:text-indigo-900 mr-3 bg-indigo-50 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(record.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-indigo-400">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-indigo-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/50"
          >
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">{editingResult ? 'Edit Result' : 'Add Result'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Student</label>
                  <select
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  >
                    <option value="" disabled>Select a student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Subject</label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  >
                    <option value="" disabled>Select a subject</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.subjectName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-indigo-900/80">Exam Term</label>
                  <input
                    type="text"
                    required
                    value={formData.examTerm}
                    onChange={(e) => setFormData({...formData, examTerm: e.target.value})}
                    placeholder="e.g., Mid-Term, Final"
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Marks</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.marks}
                      onChange={(e) => setFormData({...formData, marks: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Grade (Optional)</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      placeholder="Auto"
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all font-medium text-indigo-900"
                    />
                  </div>
                </div>
                <p className="text-xs text-indigo-400 font-medium">Leave grade blank to calculate automatically based on marks.</p>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-indigo-200 rounded-xl text-indigo-700 font-medium hover:bg-indigo-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
