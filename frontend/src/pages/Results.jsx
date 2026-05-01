import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { resultsApi, studentsApi, subjectsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    marks: '',
    grade: '',
    examTerm: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let resultsData, studentsData = [], subjectsData = [];
      
      if (user?.role === 'ROLE_STUDENT') {
        resultsData = await resultsApi.getMe();
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
      
      setResults(resultsData);
      setStudents(studentsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

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
    const doc = new jsPDF();
    
    // School Header
    doc.setFontSize(24);
    doc.setTextColor(49, 46, 129);
    doc.text("Springfield High School", 105, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(63, 81, 181);
    doc.text("Official Examination Report", 105, 30, { align: "center" });

    doc.setDrawColor(224, 231, 255);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Student Name: ${user?.username || 'Student'}`, 14, 45);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 52);

    const tableColumn = ["Subject", "Exam Term", "Marks", "Grade"];
    const tableRows = [];

    results.forEach(record => {
      const resultData = [
        record.subject?.subjectName || record.subject?.name || 'N/A',
        record.examTerm,
        record.marks,
        record.grade
      ];
      tableRows.push(resultData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      styles: { fontSize: 10, cellPadding: 3 }
    });

    doc.save(`Student_Result_Report.pdf`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600">Results</h1>
        {user?.role !== 'ROLE_STUDENT' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg shadow-indigo-200 font-medium"
          >
            <Plus className="w-5 h-5" /> Add Result
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDF}
            disabled={results.length === 0}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:from-emerald-600 hover:to-teal-600 transition-colors shadow-lg shadow-emerald-200 font-medium"
          >
            <Download className="w-5 h-5" /> Download PDF
          </motion.button>
        )}
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
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Exam Term</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Marks</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-indigo-900 uppercase tracking-wider">Grade</th>
              {user?.role !== 'ROLE_STUDENT' && (
                <th className="px-6 py-4 text-right text-xs font-bold text-indigo-900 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-indigo-50">
            {results.map((record) => (
              <tr key={record.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-medium">{record.student?.name} ({record.student?.rollNo})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.subject?.subjectName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">{record.examTerm}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-900 font-bold">{record.marks}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-700">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-xl font-bold">{record.grade}</span>
                </td>
                {user?.role !== 'ROLE_STUDENT' && (
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
            ))}
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
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
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
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
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
                    className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
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
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-indigo-900/80">Grade</label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      className="mt-1.5 block w-full rounded-xl bg-white/50 border border-indigo-100 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 p-2.5 transition-all"
                    />
                  </div>
                </div>
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
