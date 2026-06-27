import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function AddTask() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([])

  const editData = location.state?.a;

  const [form, setForm] = useState({
    taskName: "",
    status: "pending",
    assignedto: "",
    duedate: ""
  });

  useEffect(() => {
    if (editData) {
      setForm({
        taskName: editData.taskName,
        status: editData.status,
        assignedto: editData.user_id?._id || editData.user_id || "",
        duedate: editData.duedate ? editData.duedate.split("T")[0] : ""
      });
    }
  }, [editData]);

  useEffect(() => {
    getalluser();
  }, []);



  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:6100/task/addtask",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setForm({
        taskName: "",
        status: "pending",
        assignedto: "",
        duedate: ""
      });

      navigate("/tasks");
    } catch (error) {
      console.log(error);
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `http://localhost:6100/task/updatetask/${editData._id}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      navigate("/tasks");
    } catch (error) {
      console.log(error);
    }
  };

  const getalluser = async () => {
    try {
      const token = localStorage.getItem('token')
      const result = await axios.get("http://localhost:6100/taskuser/getalluser",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(`>>>>resultaddtask`, result);
      setUsers(result.data);
    } catch (error) {
      console.log("Error fetching users:", error);
    }
  }

  console.log(form)
  return (
    <div>
      <div>
        <button className="btn btn-logout-nav" onClick={() => navigate(-1)}>
         ⬅ Back
        </button>
      </div>
      <div className="form-container">

        <h2 className="form-title">{editData ? "Update Task" : "Add Task"}</h2>

        <form className="task-form" onSubmit={editData ? handleUpdate : handleSubmit}>
          <input
            type="text"
            name="taskName"
            placeholder="Task Name"
            value={form.taskName}
            onChange={handleChange}
            className="form-input"
          />

          <input
            type="date"
            name="duedate"
            value={form.duedate}
            onChange={handleChange}
            className="form-input"
          />
          <br />
          <br />

          <select
            name="assignedto"
            value={form.assignedto}
            onChange={handleChange}
          >
            <option value="">select user</option>
            {users.map((a) => (
              <option key={a._id} value={a._id}>
                {a.email}
              </option>
            ))}
          </select>
          <br />
          <br />

          <button type="submit" className="form-btn">
            {editData ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddTask;