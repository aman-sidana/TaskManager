import { useState } from "react";

function useTable() {
  const [table, setTable] = useState("card");

  const tableview = () => {
    setTable((prev) => (prev === "card" ? "table" : "card"));
  };

  return { table, tableview };
}

export default useTable;