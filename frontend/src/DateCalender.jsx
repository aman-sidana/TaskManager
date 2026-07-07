import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

function DateCalender({ showCalender, setshowCalender, tasks }) {
  const [startDate, setStartDate] = useState(new Date());

  if (!showCalender) return null;

  const dueTasks = tasks.filter(
    (task) =>
      task.duedate &&
      moment(task.duedate).isSame(startDate, "day")
  );

  return (
    <div
      className="calendar-modal-overlay"
      onClick={() => setshowCalender(false)}
    >
      <div
        className="calendar-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="calendar-close-btn"
          onClick={() => setshowCalender(false)}
        >
          ✖
        </button>

        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          inline
        />

        <hr />

        <h3>
          Tasks Due On {moment(startDate).format("DD-MM-YYYY")}
        </h3>

        {dueTasks.length === 0 ? (
          <p>No tasks due.</p>
        ) : (
          dueTasks.map((task) => (
            <div
              key={task._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
              }}
            >
              <h4>{task.taskName}</h4>

              <p>
                <strong>Status:</strong> {task.status}
              </p>

              <p>
                <strong>Assigned To:</strong>{" "}
                {task.assignedto?.name}
              </p>

              <p>
                <strong>Assigned By:</strong>{" "}
                {task.assignedby?.name}
              </p>

              <p>
                <strong>Due Date:</strong>{" "}
                {moment(task.duedate).format("DD-MM-YYYY")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DateCalender;