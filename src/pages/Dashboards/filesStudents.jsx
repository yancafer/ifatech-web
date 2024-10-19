import React, { useState, useEffect } from "react";
import { supabase } from "../../connections/supabaseClient";
import "./styles/filesStudents.css";

function FilesStudents() {
  const [students, setStudents] = useState([]);
  const [editStudentId, setEditStudentId] = useState(null);
  const [newData, setNewData] = useState({
    Nome: "",
    Curso: "",
    Série: "",
    Telefone: "",
    Email: "",
    Matrícula: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*");
    if (error) {
      console.error("Erro ao buscar alunos:", error);
    } else {
      setStudents(data);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir aluno:", error);
    } else {
      fetchStudents();
    }
  };

  const handleEdit = (student) => {
    setEditStudentId(student.id);
    setNewData({
      Nome: student.Nome,
      Curso: student.Curso,
      Série: student.Série,
      Telefone: student.Telefone,
      Email: student.Email,
      Matrícula: student.Matrícula,
    });
  };

  const handleUpdate = async (id) => {
    const { error } = await supabase
      .from("students")
      .update(newData)
      .eq("id", id);
    if (error) {
      console.error("Erro ao atualizar aluno:", error);
    } else {
      setEditStudentId(null);
      fetchStudents();
    }
  };

  // Paginação
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = students.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const totalPages = Math.ceil(students.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="page-wrapper">
      <div className="content">
        <h1 className="page-title">Alunos Cadastrados</h1>
        <table className="students-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Curso</th>
              <th>Série</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Matrícula</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.map((student) => (
              <tr key={student.id}>
                {editStudentId === student.id ? (
                  <>
                    <td>
                      <input
                        className="input-field"
                        value={newData.Nome}
                        onChange={(e) =>
                          setNewData({ ...newData, Nome: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <select
                        className="input-field"
                        value={newData.Curso}
                        onChange={(e) =>
                          setNewData({ ...newData, Curso: e.target.value })
                        }
                      >
                        <option value="Biotecnologia">Biotecnologia</option>
                        <option value="Alimentos">Alimentos</option>
                        <option value="Agropecuária">Agropecuária</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="input-field"
                        value={newData.Série}
                        onChange={(e) =>
                          setNewData({ ...newData, Série: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input-field"
                        value={newData.Telefone}
                        onChange={(e) =>
                          setNewData({ ...newData, Telefone: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input-field"
                        value={newData.Email}
                        onChange={(e) =>
                          setNewData({ ...newData, Email: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input-field"
                        value={newData.Matrícula}
                        onChange={(e) =>
                          setNewData({ ...newData, Matrícula: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => handleUpdate(student.id)}
                      >
                        Salvar
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{student.Nome}</td>
                    <td>{student.Curso}</td>
                    <td>{student.Série}</td>
                    <td>{student.Telefone}</td>
                    <td>{student.Email}</td>
                    <td>{student.Matrícula}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn"
                          onClick={() => handleEdit(student)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleDelete(student.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Paginação */}
        <div className="pagination">
          <button
            className="btn"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className="btn"
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="btn"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilesStudents;
