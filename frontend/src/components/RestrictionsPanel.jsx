import { useState, useEffect } from 'react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MODULES_PER_DAY = 9;
const MODULE_TYPES = ['Ayudantía', 'Laboratorio'];
const CAMPUSES = ['San Joaquín', 'Casa Central', 'Lo Contador', 'Oriente', 'Villarrica'];
const TIME_SLOTS = [
  '08:20', '09:40', '11:00', '12:20',
  '14:50', '16:10', '17:30', '18:50', '20:10'
];

function RestrictionsPanel({ restrictions, onRestrictionsChange, onGenerateSchedule, onClearFilters, loading, coursesCount }) {
  const [localRestrictions, setLocalRestrictions] = useState(restrictions);

  useEffect(() => {
    setLocalRestrictions(restrictions);
  }, [restrictions]);

  const toggleBlockedModule = (day, module) => {
    const index = day * MODULES_PER_DAY + module;
    const newBlocked = [...localRestrictions.blocked_modules];
    newBlocked[index] = newBlocked[index] === 1 ? 0 : 1;
    const updated = { ...localRestrictions, blocked_modules: newBlocked };
    setLocalRestrictions(updated);
    onRestrictionsChange(updated);
  };

  const toggleCampus = (campus) => {
    const newCampuses = localRestrictions.allowed_campuses.includes(campus)
      ? localRestrictions.allowed_campuses.filter(c => c !== campus)
      : [...localRestrictions.allowed_campuses, campus];
    const updated = { ...localRestrictions, allowed_campuses: newCampuses };
    setLocalRestrictions(updated);
    onRestrictionsChange(updated);
  };

  const toggleModule = (option) => {
    let updated = { ...localRestrictions };
    switch (option) {
      case 'Ayudantía':
        updated.allow_ayu_conflict = !updated.allow_ayu_conflict;
        break;
      case 'Laboratorio':
        updated.allow_lab_conflict = !updated.allow_lab_conflict;
        break;
      default:
        break;
    }
    setLocalRestrictions(updated);
    onRestrictionsChange(updated);
  };

  const isModuleBlocked = (day, module) => {
    const index = day * MODULES_PER_DAY + module;
    return localRestrictions.blocked_modules[index] === 1;
  };

  const getLanguageOption = () => {
    if (localRestrictions.spanish && localRestrictions.english) return 'ambos';
    if (localRestrictions.spanish) return 'español';
    if (localRestrictions.english) return 'inglés';
    return 'español';
  };

  const handleLanguageChange = (e) => {
    const value = e.target.value;
    if (value === 'español') {
      onRestrictionsChange({ ...localRestrictions, spanish: true, english: false });
    } else if (value === 'inglés') {
      onRestrictionsChange({ ...localRestrictions, spanish: false, english: true });
    } else {
      onRestrictionsChange({ ...localRestrictions, spanish: true, english: true });
    }
  };

  return (
    <div className="restrictions-panel">
      <h3>Opciones</h3>

      <div className="restriction-section">
        <h4>Campus</h4>
        <div className="campus-list">
          {CAMPUSES.map(campus => (
            <label key={campus} className="checkbox-label">
              <input
                type="checkbox"
                checked={localRestrictions.allowed_campuses.includes(campus)}
                onChange={() => toggleCampus(campus)}
              />
              <span>{campus}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="restriction-section">
        <h4>¿Ignorar módulos?</h4>
        <div className="campus-list">
          <label key={"ayu-allow"} className="checkbox-label">
            <input
              type="checkbox"
              checked={localRestrictions.allow_ayu_conflict}
              onChange={() => toggleModule("Ayudantía")}
            />
            <span>Ignorar ayudantías</span>
          </label>
          <label key={"lab-allow"} className="checkbox-label">
            <input
              type="checkbox"
              checked={localRestrictions.allow_lab_conflict}
              onChange={() => toggleModule("Laboratorio")}
            />
            <span>Ignorar laboratorios</span>
          </label>
        </div>
      </div>

      <div className="restriction-section">
        <h4>Idioma</h4>
        <select
          value={getLanguageOption()}
          onChange={handleLanguageChange}
          className="language-select"
        >
          <option value="español">Solo español</option>
          <option value="inglés">Solo inglés</option>
          <option value="ambos">Ambos</option>
        </select>
      </div>

      <div className="restriction-section">
        <h4>Bloqueo de Módulos</h4>
        <div className="schedule-grid-container">
          <div className="schedule-grid">
            <div className="schedule-header">
              <div className="time-column-header"></div>
              {DAYS.map(day => (
                <div key={day} className="day-header-cell">{day}</div>
              ))}
            </div>
            <div className="schedule-body">
              {TIME_SLOTS.map((time, moduleIdx) => {
                const isLunch = moduleIdx === 4; // After 12:20 (index 3) comes lunch

                // If it's the lunch index, we render the lunch row FIRST, then the actual module row?
                // No, the user said "include a line for lunch at 13:30".
                // The times are: 8:20, 9:40, 11:00, 12:20. (Indices 0, 1, 2, 3)
                // Then Lunch at 13:30.
                // Then 14:50, 16:10, 17:30, 18:50, 20:10. (Indices 4, 5, 6, 7, 8)
                // So we can iterate from 0 to 8. When we are at index 4, we insert the lunch row before it.

                const rows = [];

                if (moduleIdx === 4) {
                  rows.push(
                    <div key="lunch" className="schedule-row">
                      <div className="time-label">13:30</div>
                      <div style={{
                        gridColumn: '2 / span 6',
                        background: '#E7EAF6',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        padding: '4px',
                        color: '#666',
                        letterSpacing: '2px'
                      }}>
                        ALMUERZO
                      </div>
                    </div>
                  );
                }

                rows.push(
                  <div key={moduleIdx} className="schedule-row">
                    <div className="time-label">{time}</div>
                    {DAYS.map((_, dayIdx) => {
                      const isBlocked = isModuleBlocked(dayIdx, moduleIdx);
                      return (
                        <div
                          key={`${dayIdx}-${moduleIdx}`}
                          className={`module-cell ${isBlocked ? 'blocked' : ''}`}
                          onClick={() => toggleBlockedModule(dayIdx, moduleIdx)}
                          title={isBlocked ? 'Desbloquear' : 'Bloquear'}
                        />
                      );
                    })}
                  </div>
                );

                return rows;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button
          onClick={onGenerateSchedule}
          disabled={loading || coursesCount === 0}
          className="armar-horario-button"
        >
          {loading ? 'Armando...' : 'Armar horario'}
        </button>
        <button
          onClick={onClearFilters}
          className="clear-button"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}

export default RestrictionsPanel;

