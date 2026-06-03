def test_employee_model_metadata():
    from app.models.employee import Employee

    table = Employee.__table__

    assert table.name == "employees"
    assert "id" in table.c
    assert "full_name" in table.c
    assert "country" in table.c
    assert "job_title" in table.c
    assert "department" in table.c
    assert "salary" in table.c
    assert "created_at" in table.c
    assert "updated_at" in table.c

    index_names = {index.name for index in table.indexes}
    assert "ix_employees_country" in index_names
    assert "ix_employees_job_title" in index_names
    assert "ix_employees_country_job_title" in index_names
    assert "ix_employees_department" in index_names
