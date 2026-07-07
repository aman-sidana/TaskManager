const { jsPDF } = require("jspdf");

exports.doc = () => {
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    return pdf;
};  