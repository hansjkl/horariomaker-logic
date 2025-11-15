// Lógica del algoritmo de generación de horarios adaptada para el navegador

const ofg_categories = [
  "Salud y Bienestar",
  "Ecolog Integra y Sustentabilid",
  "Pensamiento Matematico",
  "Artes",
  "Ciencia y Tecnologia",
  "Ciencias Sociales",
  "Humanidades",
  "Formacion Filosofica",
  "Formacion Teologica"
]

const empty_mod = []
for(let i = 0; i < 54; i++) empty_mod.push(0);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function modules_equal(mod1, mod2){
  for(let i = 0; i < 54; i++){
    if(mod1[i] != mod2[i]) return false
  }
  return true
}

function modules_conflict(mod1, mod2){
  for(let i = 0; i < 54; i++){
    if(mod1[i] === 1 && mod2[i] === 1) return true
  }
  return false
}

function modules_combine(mod1, mod2){
  let modules_array = [...empty_mod];
  for(let i = 0; i < 54; i++){
    modules_array[i] = (mod1[i] === 1 || mod2[i] === 1 ? 1 : 0);
  }
  return modules_array;
}

function get_modules_array(modules, restrictions){
  let modules_array = [...empty_mod];
  for(let i = 0; i < modules.length; i++){
    let module = modules[i];
    if(module.type === "AYU" && restrictions.allow_ayu_conflict) continue;
    if(module.type === "LAB" && restrictions.allow_lab_conflict) continue;
    modules_array[module.day * 9 + module.module - 1] = 1;
  }
  return modules_array
}

function check_restrictions(section, modules_array, restrictions){
  if(modules_conflict(modules_array, restrictions.blocked_modules)) return false;
  if(!restrictions.allowed_campuses.includes(section.campus)) return false;
  if(!restrictions.spanish && !section.english_version) return false;
  if(!restrictions.english && section.english_version) return false;
  return true
}

function get_equiv_class(code, is_ofg_cat, restrictions, classes, ofgs){
  let sections = null
  if(!is_ofg_cat) {
    if (!classes[code]) return [];
    sections = classes[code].sections;
  } else {
    if (!ofgs[code]) return [];
    sections = ofgs[code];
  }
  shuffle(sections) // randomize to ensure users get different results (important for OFGs)

  let equiv_sections = []
  for(let i = 0; i < sections.length; i++){
    let section = sections[i];
    let modules_array = get_modules_array(section.modules, restrictions);
    if(!check_restrictions(section, modules_array, restrictions)) continue;
    // Para categorías OFG, usar el course_code de la sección; para cursos normales, usar el code
    let section_code = is_ofg_cat ? section.course_code : code;
    let found = false;
    for(let j = 0; j < equiv_sections.length; j++){
      let equiv = equiv_sections[j];
      // Agrupar por módulos iguales Y mismo código de curso
      if(modules_equal(modules_array, equiv.modules_array) && equiv.code === section_code){
        equiv_sections[j].sections.push(section);
        found = true;
        break;
      }
    }
    if(!found){
      equiv_sections.push({"modules_array": modules_array, "code": section_code, "sections": [section]})
    }
  }
  return equiv_sections
}

function schedule_step(class_sections, modules_array, step, length){
  let sections = class_sections[step];
  for(let equiv of sections){
    if(modules_conflict(modules_array, equiv.modules_array)) continue;
    if(step === length - 1){
      return [equiv]
    }
    else{
      let result = schedule_step(class_sections, modules_combine(modules_array, equiv.modules_array), step + 1, length)
      if(result.length !== 0){
        return [equiv, ...result]
      }
    }
  }
  return [];
}

export function make_schedule(codes, restrictions, classes, ofgs){
  let error = false;
  let class_sections = []
  for(let code of codes){
    let sections = get_equiv_class(code, ofg_categories.includes(code), restrictions, classes, ofgs);
    if(sections.length === 0){
      console.log(`ERROR: ${code} no encontrado con restricciones`);
      error = true
    }
    class_sections.push(sections);
  }
  if(error){
    return [];
  }
  class_sections.sort((a, b) => a.length - b.length);

  return schedule_step(class_sections, empty_mod, 0, class_sections.length)
}

export { ofg_categories };

