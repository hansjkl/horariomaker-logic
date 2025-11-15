import { useState, useEffect } from 'react';
import { make_schedule } from './scheduleLogic';
import CourseSelector from './components/CourseSelector';
import RestrictionsPanel from './components/RestrictionsPanel';
import ScheduleResults from './components/ScheduleResults';
import './App.css';

const DEFAULT_RESTRICTIONS = {
  blocked_modules: Array(54).fill(0),
  allowed_campuses: ['San Joaquín'],
  spanish: true,
  english: true,
  allow_ayu_conflict: true,
  allow_lab_conflict: false
};

function App() {
  const [courses, setCourses] = useState([]);
  const [restrictions, setRestrictions] = useState(DEFAULT_RESTRICTIONS);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classesData, setClassesData] = useState(null);
  const [ofgsData, setOfgsData] = useState(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        const [classesResponse, ofgsResponse] = await Promise.all([
          fetch('/classes.json'),
          fetch('/ofgs.json')
        ]);
        
        const classes = await classesResponse.json();
        const ofgs = await ofgsResponse.json();
        
        setClassesData(classes);
        setOfgsData(ofgs);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar los datos de cursos. Asegúrate de que los archivos JSON estén disponibles.');
      }
    };

    loadData();
  }, []);

  const handleGenerateSchedule = () => {
    if (courses.length === 0) {
      setError('Por favor, agrega al menos un ramo');
      return;
    }

    if (!classesData || !ofgsData) {
      setError('Los datos aún se están cargando. Por favor espera un momento.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Ejecutar el algoritmo en un timeout para no bloquear la UI
      setTimeout(() => {
        const result = make_schedule(courses, restrictions, classesData, ofgsData);
        setSchedule(result);
        setLoading(false);
        
        if (result.length === 0) {
          setError('No se encontró un horario válido con las restricciones dadas.');
        }
      }, 100);
    } catch (err) {
      console.error('Error generando horario:', err);
      setError('Error al generar el horario: ' + err.message);
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setCourses([]);
    setRestrictions(DEFAULT_RESTRICTIONS);
    setSchedule(null);
    setError(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>ArmaHorarios UC</h1>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="dismiss-button">×</button>
          </div>
        )}

        <div className="app-content">
          <div className="input-section">
            <CourseSelector 
              courses={courses} 
              onCoursesChange={setCourses}
              classesData={classesData}
            />
            
            <RestrictionsPanel 
              restrictions={restrictions}
              onRestrictionsChange={setRestrictions}
              onGenerateSchedule={handleGenerateSchedule}
              onClearFilters={handleClearFilters}
              loading={loading}
              coursesCount={courses.length}
            />
          </div>

          {schedule && (
            <div className="results-section">
              <ScheduleResults 
                schedule={schedule}
                onClose={() => setSchedule(null)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
