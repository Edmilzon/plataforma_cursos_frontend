export interface Teacher {
  initials: string;
  name: string;
  role: string;
  courses: string;
  gradient: string;
  textColor: string;
  marginLeft?: string;
}

export const TeacherCard = ({ teacher }: { teacher: Teacher }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 ${teacher.marginLeft || ''}`}>
    <div className="flex items-center space-x-4">
      <div className={`w-16 h-16 ${teacher.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl`}>
        {teacher.initials}
      </div>
      <div className="flex-grow">
        <h4 className="text-xl font-bold text-gray-900 mb-1">{teacher.name}</h4>
        <p className={`${teacher.textColor} font-medium mb-1`}>{teacher.role}</p>
        <p className="text-gray-600 text-sm">{teacher.courses}</p>
      </div>
    </div>
  </div>
);