import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const getTaskForm = (task) => ({
  taskName: task?.taskName || "",
  status: task?.status || "pending",
  assignedto: task?.assignedto?._id || task?.assignedto || "",
  duedate: task?.duedate ? task.duedate.split("T")[0] : "",
  images: task?.images || ""
});

function AddTask() {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([])

  const editData = location.state?.a;

  const [form, setForm] = useState(() => getTaskForm(editData));

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("taskName", form.taskName);
      formData.append("status", form.status);
      formData.append("assignedto", form.assignedto);
      formData.append("duedate", form.duedate);

      if (form.images) {
        formData.append("image", form.images);
      }

      const result = await axios.post(
        "http://localhost:6100/task/addtask",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(result.data);

      setForm({
        taskName: "",
        status: "pending",
        assignedto: "",
        duedate: "",
        images: "",
      });

      navigate("/tasks");
    } catch (error) {
      console.log(error);
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      formData.append("taskName", form.taskName);
      formData.append("status", form.status);
      formData.append("assignedto", form.assignedto);
      formData.append("duedate", form.duedate);

      if (form.images instanceof File) {
        formData.append("image", form.images);
      }

      await axios.patch(
        `http://localhost:6100/task/updatetask/${editData._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/tasks");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let ignore = false;

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

        if (!ignore) {
          setUsers(result.data);
        }
      } catch (error) {
        console.log("Error fetching users:", error);
      }
    }

    getalluser();

    return () => {
      ignore = true;
    };
  }, []);

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

          <input
            type="file"
            name="images"
            onChange={(e) =>
              setForm({
                ...form,
                images: e.target.files[0],
              })
            }
          />

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
