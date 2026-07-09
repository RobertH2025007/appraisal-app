(function () {
  function excelSerialToDate(serial) {
    return new Date(Date.UTC(1899, 11, 30) + Math.round(serial * 86400000));
  }
  function fmt(date, hasTime) {
    const datePart = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (!hasTime) return datePart;
    const timePart = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return `${datePart} ${timePart}`;
  }
  function normalize(value) {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) return value;
    const serial = parseFloat(trimmed);
    if (serial <= 20000 || serial >= 80000) return value;
    const hasTime = serial % 1 !== 0;
    return fmt(excelSerialToDate(serial), hasTime);
  }

  const targets = ["4822 Tocaloma Ln", "24892 Pine Mountain Ter"];
  const orders = JSON.parse(localStorage.getItem("am_orders") ?? "[]");
  let fixedCount = 0;
  const updated = orders.map(o => {
    if (!targets.some(t => (o.address || "").includes(t))) return o;
    const newDue = normalize(o.dueDate);
    const newInspection = normalize(o.inspectionDate);
    if (newDue !== o.dueDate || newInspection !== o.inspectionDate) {
      fixedCount++;
      console.log(`Fixed ${o.address}: dueDate "${o.dueDate}" -> "${newDue}", inspectionDate "${o.inspectionDate}" -> "${newInspection}"`);
    }
    return { ...o, dueDate: newDue, inspectionDate: newInspection };
  });
  localStorage.setItem("am_orders", JSON.stringify(updated));
  window.dispatchEvent(new Event("am-orders-updated"));
  console.log(`Done. ${fixedCount} order(s) updated. Refresh the page to see the change.`);
})();
