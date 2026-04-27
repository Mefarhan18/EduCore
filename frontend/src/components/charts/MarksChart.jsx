import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MarksChart({ results }) {
  if (!results || results.length === 0) return null;

  const data = results.map(r => ({
    subject: r.subject?.name || r.subject?.subjectName || 'Unknown',
    marks: r.marks
  }));

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50">
      <h2 className="text-xl font-bold text-indigo-900 mb-6">Marks Performance</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
            <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{fill: '#4f46e5', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#4f46e5', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#e0e7ff', opacity: 0.4}}
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
            />
            <Bar dataKey="marks" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
