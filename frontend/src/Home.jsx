import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useTable from "./useTable";
import moment from 'moment'
import DateCalender from "./DateCalender";

function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState('');
  const [sorting, setsorting] = useState('');
  const [selectedAssignedBy, setSelectedAssignedBy] = useState("");
  const [showCalender,setshowCalender]=useState(false)

  const { table, tableview } = useTable()


  const currentUser = JSON.parse(localStorage.getItem("user"));

  const userrole = currentUser.role
  // console.log(`>>>>userrole`, userrole)

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }
    const fetchdata = async () => {
      try {
        const token = localStorage.getItem("token");
        setLoading(true);

        const result = await axios.get(
          "http://localhost:6100/task/alltask",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(">>>>resultHome", result);

        setData(result.data.filter(
          (a) => a.isactive === true
        ));
        setAllTasks(result.data.filter(
          (a) => a.isactive === true
        ));


      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchdata();
  }, []);

  const [tome, setTome] = useState('')

  const assignedToMe = () => {
    const filtered = allTasks.filter(
      (task) => task.assignedto?._id === currentUser?._id
    );
    setTome("assigntome")
    setData(filtered);
  };


  const assignedByMe = () => {
    const filtered = allTasks.filter(
      (task) => task.assignedby?._id === currentUser?._id
    );
    setTome('')
    setData(filtered);
  };
  const showAllTasks = () => {
    setData(allTasks);
  };
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const deletetask = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const result = await axios.delete(
        `http://localhost:6100/task/deletetask/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Delete Response:", result.data);

      setData(data.filter((a) => a._id !== id));
      setAllTasks(allTasks.filter((a) => a._id !== id));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const softdelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const result = await axios.patch(
        `http://localhost:6100/task/softdeletetask/${id}`,
        { isactive: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Soft Delete Response:", result.data);

      setData(data.filter((a) => a._id !== id));
      setAllTasks(allTasks.filter((a) => a._id !== id));
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };


  const statusdone = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");

      const newStatus =
        currentStatus === "done" ? "pending" : "done";
      const result = await axios.patch(
        `http://localhost:6100/task/statusdone/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(result.data);

      setData((prev) =>
        prev.map((task) =>
          task._id === id
            ? { ...task, status: newStatus }
            : task
        )
      );
      setAllTasks((prev) =>
        prev.map((task) =>
          task._id === id
            ? { ...task, status: newStatus }
            : task
        )
      );
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };


  useEffect(() => {
    const getUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const result = await axios.get(
          "http://localhost:6100/taskuser/getalluser",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    getUsers();
  }, []);

  const filterByUser = (userId) => {
    setsorting(userId);

    if (!userId) {
      setData(allTasks);
      return;
    }

    const filtered = allTasks.filter(
      (task) => task.assignedto?._id === userId
    );

    setData(filtered);
  };

  const filterByAssignedBy = (userId) => {
    setSelectedAssignedBy(userId);

    if (!userId) {
      setData(allTasks);
      return;
    }

    const filtered = allTasks.filter(
      (task) => task.assignedby?._id === userId
    );

    setData(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearching(value);

    if (!value.trim()) {
      setData(allTasks);
      return;
    }

    const filtered = data.filter(
      (task) =>
        task.taskName?.toLowerCase().includes(value.toLowerCase()) ||
        task.assignedto?.name?.toLowerCase().includes(value.toLowerCase()) ||
        task.assignedby?.name?.toLowerCase().includes(value.toLowerCase())
    );

    setData(filtered);
  };

  const getCardColor = (task) => {
    const today = moment().startOf("day");
    const dueDate = moment(task.duedate).startOf("day");

    if (task.status?.toLowerCase() === "done") {
      return "task-due-before";
    }

    if (today.isAfter(dueDate)) {
      return "task-due-after";
    }

    if (today.isSame(dueDate)) {
      return "task-due-same";
    }

    return "task-due-before";
  };

  return (
    <div className="home-container">


      <div className="filter-controls-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by"
          value={searching}
          onChange={handleSearch}
        />

        <select
          className="form-select filter-select"
          value={sorting}
          onChange={(e) => filterByUser(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name || user.email}
            </option>
          ))}

        </select>
        <button className="btn btn-filter" onClick={tableview}>
          {table === "card" ? "Table View" : "Card View"}
        </button>

        <select
          className="form-select filter-select"
          value={selectedAssignedBy}
          onChange={(e) => filterByAssignedBy(e.target.value)}
        >
          <option value="">All Assigned By</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name || user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="action-buttons-bar">

        {userrole !== "admin" &&
          <button className="btn btn-filter" onClick={assignedToMe}>
            My Tasks
          </button>
        }
        <button className="btn btn-filter" onClick={assignedByMe}>
          Tasks By Me
        </button>

        {userrole === "admin" &&
          <button className="btn btn-filter" onClick={showAllTasks}>
            All Tasks
          </button>
        }

        <button className="btn btn-add-task" onClick={() => { navigate("/addtask") }}>
          Assign Task
        </button>

        <button className="btn btn-logout-nav" onClick={logout}>
          Logout
        </button>
        <div >
          <button className="btn btn-add-task" onClick={()=>setshowCalender(!showCalender)}>
           calender
          </button>
         
        </div>

      </div>


      {loading ? (
        <h2 className="loading-text">Loading...</h2>
      ) : table === "card" ? (
        <div className="task-list">
          {data.map((a) =>

          (
            <div key={a._id} className={`task-card ${getCardColor(a)}`}>
              <div>
                {/* <p className="task-info">
                  <strong>Task Id:</strong> {a._id}
                </p> */}
                <img src={a.images} width="250px"/>
                <p className="task-info">
                  <strong>Task Name:</strong> {a.taskName}
                </p>
                <p className="task-info">
                  <strong>Due Date:</strong>  {moment(a.duedate).format("DD-MM-YYYY")}
                </p>

                <p className="task-info">
                  <strong>Assigned To:</strong> {a.assignedto?.name}
                </p>

                <p className="task-info">
                  <strong>Assigned By:</strong> {a.assignedby?.name}
                </p>

                <p className="task-info">
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${a.status?.toLowerCase() || "pending"
                      }`}
                  >
                    {a.status}
                  </span>
                </p>
              </div>

              <div className="task-actions">
                {!tome && (
                  <div>
                    <button
                      className="btn btn-delete"
                      onClick={() => deletetask(a._id)}
                    >
                      Delete
                    </button>

                    <button
                      className="btn btn-soft-delete"
                      onClick={() => softdelete(a._id)}
                    >
                      Soft Delete
                    </button>

                    <button
                      className="btn btn-update"
                      onClick={() =>
                        navigate("/addtask", { state: { a } })
                      }
                    >
                      Update
                    </button>
                  </div>
                )}

                <button
                  className="btn btn-status"
                  onClick={() => statusdone(a._id, a.status)}
                >
                  {a.status === "done"
                    ? "Mark Pending"
                    : "Mark Done"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered" >
            <thead>
              <tr>
                <th>Task Id</th>
                <th>Task Name</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Assigned By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {data.map((a) => (
                <tr key={a._id} className={getCardColor(a)}>
                  <td>{a._id}</td>
                  <td>{a.taskName}</td>
                  <td>
                    {moment(a.duedate).format("DD-MM-YYYY")}
                  </td>
                  <td>{a.assignedto?.name}</td>
                  <td>{a.assignedby?.name}</td>
                  <td>{a.status}</td>

                  <td>
                    {!tome && (
                      <>
                        <button
                          className="btn btn-delete"
                          onClick={() => deletetask(a._id)}
                        >
                          Delete
                        </button>

                        <button
                          className="btn btn-soft-delete"
                          onClick={() => softdelete(a._id)}
                        >
                          Soft Delete
                        </button>

                        <button
                          className="btn btn-update"
                          onClick={() =>
                            navigate("/addtask", { state: { a } })
                          }
                        >
                          Update
                        </button>
                      </>
                    )}

                    <button
                      className="btn btn-status"
                      onClick={() => statusdone(a._id, a.status)}
                    >
                      {a.status === "done"
                        ? "Mark Pending"
                        : "Mark Done"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       <DateCalender showCalender={showCalender} setshowCalender={setshowCalender} tasks={data}/>
    </div>
  );
}

export default Home;