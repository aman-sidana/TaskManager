const { jsPDF } = require("jspdf");

exports.doc = () => {
    return new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });
};