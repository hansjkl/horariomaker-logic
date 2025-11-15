import { ofg_categories } from '../scheduleLogic';

const DAYS = ['L', 'M', 'W', 'J', 'V', 'S'];
const DAYS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const TIME_SLOTS_START = ['08:20', '09:40', '11:00', '12:20', '13:30', '14:50', '16:10', '17:30', '18:50', '20:10'];
const MODULES_PER_DAY = 9;
const LUNCH_MODULE = 4; // Módulo 5 (índice 4) es donde va el almuerzo

// Función para agregar 1:10 (70 minutos) a una hora
const addTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  let newMinutes = minutes + 70;
  let newHours = hours + Math.floor(newMinutes / 60);
  newMinutes = newMinutes % 60;
  newHours = newHours % 24;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

function ScheduleResults({ schedule, onClose }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="schedule-results">
        <div className="no-results">
          <p>No se encontró un horario válido con las restricciones dadas.</p>
          <p>Intenta ajustar tus restricciones o códigos de ramos.</p>
        </div>
      </div>
    );
  }

  // Ordenar schedule por código de curso y luego por número de sección
  const sortedSchedule = schedule.map(equiv => ({
    ...equiv,
    sections: [...equiv.sections].sort((a, b) => a.section - b.section)
  })).sort((a, b) => {
    if (a.code !== b.code) {
      return a.code.localeCompare(b.code);
    }
    return a.sections[0].section - b.sections[0].section;
  });

  // Crear matriz de horario con información de bloques que ocupan múltiples módulos
  const scheduleMatrix = Array(6).fill(null).map(() => Array(9).fill(null).map(() => []));
  const blockMap = new Map(); // Para rastrear bloques que ocupan múltiples celdas

  sortedSchedule.forEach(equiv => {
    equiv.sections.forEach(section => {
      // Agrupar módulos consecutivos del mismo tipo
      const moduleGroups = [];
      let currentGroup = null;
      
      section.modules
        .sort((a, b) => {
          if (a.day !== b.day) return a.day - b.day;
          return a.module - b.module;
        })
        .forEach(module => {
          if (!currentGroup || 
              currentGroup.day !== module.day || 
              currentGroup.type !== module.type ||
              currentGroup.endModule !== module.module - 1) {
            if (currentGroup) moduleGroups.push(currentGroup);
            currentGroup = {
              day: module.day,
              startModule: module.module - 1,
              endModule: module.module - 1,
              type: module.type,
              code: equiv.code,
              section: section
            };
          } else {
            currentGroup.endModule = module.module - 1;
          }
        });
      if (currentGroup) moduleGroups.push(currentGroup);

      // Colocar bloques en la matriz
      moduleGroups.forEach(group => {
        const key = `${group.day}-${group.startModule}-${group.endModule}`;
        blockMap.set(key, group);
        for (let m = group.startModule; m <= group.endModule; m++) {
          scheduleMatrix[group.day][m].push({
            code: group.code,
            section: group.section,
            type: group.type,
            blockKey: key,
            isStart: m === group.startModule,
            span: group.endModule - group.startModule + 1
          });
        }
      });
    });
  });

  // Colores según tipo de actividad
  const getTypeColor = (type) => {
    const colorMap = {
      'CLAS': '#fbc575', // Cátedra
      'TAL': '#c7c2f8',  // Taller
      'AYU': '#99cc99',  // Ayudantía
      'LAB': '#b3d4f5',  // Laboratorio
      'PRA': '#cccc99',  // Práctica
      'TES': '#b2efef',  // Tesis
      'TER': '#ffccff',  // Terreno
      'OTR': '#ff9999'   // Otro
    };
    return colorMap[type] || '#CCCCCC'; // Gris por defecto
  };

  return (
    <div className="schedule-results">
      <div className="results-header">
        <h2>Horario armado</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">×</button>
        )}
      </div>

      <div className="schedule-courses-list">
        {sortedSchedule.flatMap((equiv, equivIdx) => 
          equiv.sections.map((section, sectionIdx) => {
            const displayText = `${equiv.code}-${section.section}: ${section.name}`;
            return (
              <input
                key={`${equivIdx}-${sectionIdx}`}
                type="text"
                value={displayText}
                readOnly
                className="schedule-course-input"
              />
            );
          })
        )}
      </div>

      <div className="schedule-visualization">
        <div style={{ padding: '5px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0" border="0" style={{ border: '1px solid #CCD1E5', background: '#FFF' }}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center', border: '1px solid #CCD1E5' }}>Módulos</td>
                {DAYS_FULL.map(day => (
                  <td key={day} style={{ textAlign: 'center', border: '1px solid #CCD1E5' }}>{day}</td>
                ))}
              </tr>
              {Array.from({ length: MODULES_PER_DAY }, (_, moduleIdx) => {
                const isLunchRow = moduleIdx === LUNCH_MODULE;
                if (isLunchRow) {
                  return (
                    <tr key={moduleIdx}>
                      <td style={{ textAlign: 'center', border: '1px solid #CCD1E5' }}>
                        <div>13:30</div>
                        <div>{addTime('13:30')}</div>
                      </td>
                      <td 
                        colSpan="6" 
                        style={{ 
                          background: '#E7EAF6', 
                          textAlign: 'center', 
                          border: '1px solid #CCD1E5', 
                          letterSpacing: '30px' 
                        }}
                      >
                        &nbsp;ALMUERZO
                      </td>
                    </tr>
                  );
                }
                const startTime = TIME_SLOTS_START[moduleIdx];
                const endTime = addTime(startTime);
                return (
                  <tr key={moduleIdx}>
                    <td style={{ textAlign: 'center', width: '20px', border: '1px solid #CCD1E5' }}>
                      <div>{startTime}</div>
                      <div>{endTime}</div>
                    </td>
                    {DAYS.map((_, dayIdx) => {
                      const items = scheduleMatrix[dayIdx][moduleIdx]
                        .filter(item => item.isStart)
                        .sort((a, b) => {
                          // Ordenar por código de curso
                          if (a.code !== b.code) {
                            return a.code.localeCompare(b.code);
                          }
                          // Si mismo código, ordenar por número de sección
                          return a.section.section - b.section.section;
                        });
                      return (
                        <td 
                          key={dayIdx} 
                          style={{ 
                            textAlign: 'center', 
                            width: '60px', 
                            border: '1px solid #CCD1E5' 
                          }}
                        >
                          {items.map((item, itemIdx) => {
                            const color = getTypeColor(item.type);
                            const typeClass = item.type === 'CLAS' ? 'horarioCAT' :
                                            item.type === 'LAB' ? 'horarioLAB' :
                                            item.type === 'AYU' ? 'horarioAYUD' :
                                            item.type === 'TAL' ? 'horarioTALL' :
                                            item.type === 'PRA' ? 'horarioPRAC' :
                                            item.type === 'TES' ? 'horarioTES' :
                                            item.type === 'TER' ? 'horarioTERR' : 'horarioOTRO';
                            return (
                              <span 
                                key={itemIdx} 
                                className={`horarioTABLA ${typeClass}`}
                                style={{ backgroundColor: color }}
                              >
                                {item.code}-{item.section.section}
                              </span>
                            );
                          })}
                          {items.length === 0 && <>&nbsp;</>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <table width="100%" style={{ marginTop: '20px' }}>
          <tbody>
            <tr>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioCAT">&nbsp;</div>
                Cátedra
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioAYUD">&nbsp;</div>
                Ayudantía
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioLAB">&nbsp;</div>
                Laboratorio
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioTERR">&nbsp;</div>
                Terreno
              </td>
            </tr>
            <tr>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioTALL">&nbsp;</div>
                Taller
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioPRAC">&nbsp;</div>
                Práctica
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioTES">&nbsp;</div>
                Tesis
              </td>
              <td className="horarioSIMBOLOGIA">
                <div style={{ width: '12px', float: 'left', marginRight: '5px' }} className="horarioOTRO">&nbsp;</div>
                Otro
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ScheduleResults;

