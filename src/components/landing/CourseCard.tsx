export interface Course {
  title: string;
  description: string;
  gradient?: string;
}

export const CourseCard = ({ course }: { course: Course }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
    <div className={`w-full h-40 ${course.gradient || 'bg-gray-200'} rounded-lg mb-4`}></div>
    <h4 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h4>
    <p className="text-gray-600 mb-4">{course.description}</p>
  </div>
);