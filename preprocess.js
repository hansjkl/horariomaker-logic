var fs = require('fs')
var classes = {};

const data = JSON.parse(fs.readFileSync('raw.json', 'utf-8'))

for(let i = 0; i < data.resources.length; i++) {
  let class_data = data.resources[i];
  classes[class_data.course_code] = {"name": class_data.name, "sections": class_data.sections};
}
fs.writeFileSync('parsed.json',  JSON.stringify(classes));

var ofgs = {};

for(let i = 0; i < data.resources.length; i++) {
  for(let j = 0; j < data.resources[i].sections.length; j++){
    let section_data = data.resources[i].sections[j];
    if(!Object.hasOwn(section_data, "general_education")){
      continue;
    }
    if(!Object.hasOwn(ofgs, section_data.general_education)){
      ofgs[section_data.general_education] = [];
    }
    ofgs[section_data.general_education].push(section_data);
  }
}

fs.writeFileSync('ofgs.json',  JSON.stringify(ofgs));


