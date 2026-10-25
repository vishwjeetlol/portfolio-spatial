const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/projects.schema.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/projects.json'), 'utf8'));

const validate = ajv.compile(schema);
const valid = validate(data);

if (!valid) {
  console.error('Validation FAILED:');
  console.error(validate.errors);
  process.exit(1);
} else {
  console.log('Schema Validation PASSED: src/data/projects.json is valid according to schema.');
}
