import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function InactiveTask() {
  const [data, setData] = useState([]);
  const navigate = useNavigate()
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const token = localStorage.getItem("token");

        const result = await axios.get(
          "http://localhost:6100/task/alltask",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const inactiveTasks = result.data.filter(
          (task) => task.isactive === false
        );

        setData(inactiveTasks);
      } catch (error) {
        console.log(error);
      }
    };

    fetchdata();
  }, []);

  const handleRestore = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.patch(
        `http://localhost:6100/task/restoretask/${id}`,
        { isactive: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData((prev) => prev.filter((task) => task._id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <button className="btn btn-logout-nav" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>
      <div className="home-container">
        <h2 className="page-title">Inactive Tasks</h2>

        {data.length === 0 ? (
          <h3 className="no-data-text">No Inactive Tasks Found</h3>
        ) : (
          <div className="task-list">
            {data.map((a) => (
              <div key={a._id} className="task-card inactive-card">
                <p className="task-info">
                  <strong>Task Id:</strong> {a._id}
                </p>

                <p className="task-info">
                  <strong>Task Name:</strong> {a.taskName}
                </p>

                <p className="task-info">
                  <strong>Status:</strong> <span className={`status-badge ${a.status}`}>{a.status}</span>
                </p>

                <p className="task-info">
                  <strong>User:</strong>{" "}
                  {a.user_id?.name || a.user_id?.email}
                </p>


                <button className="btn btn-restore" onClick={() => handleRestore(a._id)}>
                  Restore Task
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InactiveTask;