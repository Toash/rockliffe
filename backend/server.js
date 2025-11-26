const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// adjust path to your actual DB file
// const db = new sqlite3.Database('../northwind-SQLite3/Northwind_large.sqlite');
const db = new sqlite3.Database("./db/northwind.db");

// POST /api/login
app.post("/api/login", (req, res) => {
  const { employeeId, password } = req.body;

  db.get(
    `SELECT EmployeeID, FirstName, LastName
     FROM Employees
     WHERE EmployeeID = ? AND Password = ?`,
    [employeeId, password],
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
      if (!row) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({
        employeeId: row.EmployeeID,
        name: `${row.FirstName} ${row.LastName}`,
      });
    }
  );
});

// GET /api/orders?employeeId=1
app.get("/api/orders", (req, res) => {
  const { employeeId } = req.query;

  db.all(
    `SELECT OrderID, CustomerID, OrderDate, ShipCountry
     FROM Orders
     WHERE EmployeeID = ?`,
    [employeeId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(rows);
    }
  );
});

// GET /api/orders/:id/details
app.get("/api/orders/:id/details", (req, res) => {
  const orderId = req.params.id;

  db.all(
    `SELECT od.OrderID, p.ProductName, od.Quantity, od.UnitPrice
     FROM "Order Details" od
     JOIN Products p ON od.ProductID = p.ProductID
     WHERE od.OrderID = ?`,
    [orderId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }
      res.json(rows);
    }
  );
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
