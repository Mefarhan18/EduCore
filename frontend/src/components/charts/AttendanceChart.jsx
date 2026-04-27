import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AttendanceChart({ attendance }) {
  if (!attendance || attendance.length === 0) return null;

  const presentCount = attendance.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendance.filter(a => a.status === 'ABSENT').length;
  const lateCount = attendance.filter(a => a.status === 'LATE').length;

  const data = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#f43f5e' },
    { name: 'Late', value: lateCount, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-xl shadow-indigo-100 p-6 border border-white/50">
      <h2 className="text-xl font-bold text-indigo-900 mb-6">Attendance Distribution</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
