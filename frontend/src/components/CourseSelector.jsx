import { useState, useMemo } from 'react';
import { ofg_categories } from '../scheduleLogic';

function CourseSelector({ courses, onCoursesChange, classesData }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allCourseCodes = useMemo(() => {
    if (classesData) {
      return Object.keys(classesData).sort();
    }
    return [];
  }, [classesData]);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
    
    // Filtrar sugerencias (solo códigos de ramos, no OFGs)
    if (value.length > 0) {
      const courseSuggestions = allCourseCodes
        .filter(code => code.includes(value))
        .slice(0, 5);
      
      setSuggestions(courseSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddCourse = (course) => {
    if (course && !courses.includes(course)) {
      onCoursesChange([...courses, course]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeCourse = (idx) => {
    let new_courses = [...courses];
    new_courses.splice(idx, 1);
    onCoursesChange(new_courses);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleAddCourse(inputValue.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleAddCourse(suggestion);
  };

  const [selectedOFG, setSelectedOFG] = useState('');

  return (
    <div className="course-selector">
      <h3>Siglas</h3>
      
      <div className="course-input-section">
        <label className="input-label">Ingresar sigla</label>
        <div className="input-group">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Ingresar sigla"
            className="course-input"
          />
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((suggestion, idx) => (
              <li 
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-item"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ofg-section">
        <label className="input-label">Elegir categoría Formación General</label>
        <div className="input-group">
          <select
            value={selectedOFG}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedOFG(value);
              if (value && !courses.includes(value)) {
                handleAddCourse(value);
                setSelectedOFG('');
              }
            }}
            className="ofg-select"
          >
            <option value="">Seleccionar categoría...</option>
            {ofg_categories.map(ofg => (
              <option key={ofg} value={ofg}>
                Formación General - {ofg}
              </option>
            ))}
          </select>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="selected-courses">
          {courses.map((course, idx) => (
            <div className="selected-course-row">
              <input
                key={idx*2}
                type="text"
                value={ofg_categories.includes(course) ? `Formación General - ${course}` : course}
                readOnly
                className="selected-course-input"
              />
              <button key={idx*2 + 1}onClick={() => removeCourse(idx)} className="remove-button">
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseSelector;

