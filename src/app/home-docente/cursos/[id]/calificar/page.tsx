import AssignmentGrading from '@/components/home-docente/AssignmentGrading';

interface Props {
  params: {
    id: string;
  };
}

export default function CalificarPage({ params }: Props) {
  const { id } = params;
  return (
    <div>
      <h1>Calificar entregas del curso</h1>
      <AssignmentGrading idCurso={id} />
    </div>
  );
}