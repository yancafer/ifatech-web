import React, { useState, useEffect } from "react";
import { supabase } from "../../connections/supabaseClient";

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

  return (
    <div>
      <h1>Alunos Cadastrados</h1>
      <table>
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
          {students.map((student) => (
            <tr key={student.id}>
              {editStudentId === student.id ? (
                <>
                  <td>
                    <input
                      value={newData.Nome}
                      onChange={(e) =>
                        setNewData({ ...newData, Nome: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <select
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
                      value={newData.Série}
                      onChange={(e) =>
                        setNewData({ ...newData, Série: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={newData.Telefone}
                      onChange={(e) =>
                        setNewData({ ...newData, Telefone: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={newData.Email}
                      onChange={(e) =>
                        setNewData({ ...newData, Email: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <input
                      value={newData.Matrícula}
                      onChange={(e) =>
                        setNewData({ ...newData, Matrícula: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => handleUpdate(student.id)}>
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
                    <button onClick={() => handleEdit(student)}>Editar</button>
                    <button onClick={() => handleDelete(student.id)}>
                      Excluir
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FilesStudents;
