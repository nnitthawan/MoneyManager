// Records.js
import React, { useState, useEffect } from "react";
import { db, getDocs, collection, deleteDoc, doc } from "./firebase";
import { IoIosAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { MdDeleteForever } from "react-icons/md";
import { BsFillCaretRightFill } from "react-icons/bs";
import './Records.css';

const Records = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [filter, setFilter] = useState("all");
  const [expandedDate, setExpandedDate] = useState(null);

  const fetchRecords = async () => {
    const snapshot = await getDocs(collection(db, "records"));
    const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setRecords(data);
    setFilteredRecords(data);
  };

  const deleteRecord = async (id) => {
    try {
      await deleteDoc(doc(db, "records", id));
      setRecords((prev) => prev.filter((item) => item.id !== id));
      setFilteredRecords((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const calculateTotals = (records) => {
    const income = records.filter((r) => r.type === "income");
    const expense = records.filter((r) => r.type === "expense");
    setTotalIncome(income.reduce((acc, item) => acc + item.amount, 0));
    setTotalExpense(expense.reduce((acc, item) => acc + item.amount, 0));
  };

  const handleFilter = (type) => {
    setFilter(type);
    if (type === "all") {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(records.filter((record) => record.type === type));
    }
  };

  const toggleDetails = (date) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    calculateTotals(filteredRecords);
  }, [filteredRecords]);

  const groupByDate = (records) => {
    return records.reduce((grouped, record) => {
      const date = record.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(record);
      return grouped;
    }, {});
  };

  const groupedRecords = groupByDate(filteredRecords);

  return (
    <div className="App">
      <h1 className="title">รายการการเงิน</h1>

      <div className="filter-buttons">
        <button className={`button ${filter === "all" ? "active" : ""}`} onClick={() => handleFilter("all")}>ทั้งหมด</button>
        <button className={`button ${filter === "income" ? "active" : ""}`} onClick={() => handleFilter("income")}>รายรับ</button>
        <button className={`button ${filter === "expense" ? "active" : ""}`} onClick={() => handleFilter("expense")}>รายจ่าย</button>
      </div>

      <div className="total-summary">
        <p>รายรับรวม: {totalIncome.toFixed(2)} บาท</p>
        <p>รายจ่ายรวม: {totalExpense.toFixed(2)} บาท</p>
        <p>ยอดสุทธิ: {(totalIncome - totalExpense).toFixed(2)} บาท</p>
      </div>

      {Object.keys(groupedRecords).length === 0 ? (
        <p className="no-records">ยังไม่มีรายการ</p>
      ) : (
        Object.keys(groupedRecords).sort((a, b) => new Date(b) - new Date(a)).map((date) => (
          <div key={date} className="record-item">
            <div className="record-item-header" onClick={() => toggleDetails(date)}>
              <div className="date-header">
                <BsFillCaretRightFill className={expandedDate === date ? "rotate" : ""} />
                <strong>{date}</strong>
              </div>
              <div className="divIncome">
                <span className="income-type">
                  {groupedRecords[date].some((r) => r.type === "income") ? "รายรับ" : "รายจ่าย"}
                </span>
                <p className="unitbath">
                  {groupedRecords[date].reduce((acc, record) => acc + record.amount, 0)} บาท
                </p>
              </div>
            </div>

            {expandedDate === date && (
              <div className="record-item-details">
                {groupedRecords[date].map((record) => (
                  <div key={record.id} className="record-detail">
                    <p>รายละเอียด: {record.desc} ({record.type === "income" ? "รายรับ" : "รายจ่าย"})</p>
                    <p className="amount">{record.amount.toFixed(2)} บาท</p>
                    <button className="delete-button" onClick={() => deleteRecord(record.id)}>
                      <MdDeleteForever /> ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <Link to="/" className="button add-button">
        <IoIosAdd /> เพิ่มรายการ
      </Link>
    </div>
  );
};

export default Records;
