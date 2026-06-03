# Sample Data

## `sample_employees.xlsx`

Sample spreadsheet export representing the kind of salary data ACME's HR team previously managed in Excel.

The file includes 50 deterministic sample rows with these columns:

- Employee ID
- Full Name
- Country
- Job Title
- Department
- Annual Salary
- Notes

This file is provided for assessment reference and demo context. Excel import is intentionally out of scope for the web application; the backend seed script loads the full 10,000 employee dataset into PostgreSQL.

To regenerate the sample file:

```bash
cd backend
source .venv/bin/activate
pip install openpyxl
python scripts/generate_sample_excel.py
```
