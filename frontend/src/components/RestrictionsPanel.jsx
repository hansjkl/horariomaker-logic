import { useState, useEffect } from 'react';

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MODULES_PER_DAY = 9;
const CAMPUSES = ['San Joaquín', 'Casa Central', 'Lo Contador', 'Oriente', 'Villarrica'];

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

  const toggleOption = (option) => {
    const updated = { ...localRestrictions, [option]: !localRestrictions[option] };
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

