import { useState, useEffect } from "react";
import { db, addDoc, collection, getDocs, deleteDoc, doc } from "./firebase";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts";
import "./MoneyManager.css";
import { IoIosAdd } from "react-icons/io";

const Card = ({ children }) => (
    <div className="card bg-white p-4 rounded-2xl shadow-md mb-6 border border-pink-200">
        {children}
    </div>
);

const CardContent = ({ children }) => (
    <div className="card-content">{children}</div>
);

const Input = ({ ...props }) => <input className="input" {...props} />;

const Button = ({ children, ...props }) => (
    <button className="button" {...props}>
        {children}
    </button>
);

const Label = ({ children }) => <label className="label">{children}</label>;

export default function MoneyManager() {
    const [income, setIncome] = useState(1000);
    const [savingRate, setSavingRate] = useState(20);
    const [emergencyRate, setEmergencyRate] = useState(5);
    const [records, setRecords] = useState([]);
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [timeFrame, setTimeFrame] = useState("monthly");
    const [expandedDate, setExpandedDate] = useState(null); // State สำหรับเปิด/ปิดวันที่

    const saving = (income * savingRate) / 100;
    const emergency = (income * emergencyRate) / 100;
    const spending = income - saving - emergency;

    const addRecord = async (type) => {
        if (!desc || !amount || !selectedDate) return;
        const newRecord = { desc, amount: parseFloat(amount), date: selectedDate, type };
        try {
            const docRef = await addDoc(collection(db, "records"), newRecord);
            setRecords([...records, { ...newRecord, id: docRef.id }]);
            setDesc("");
            setAmount("");
            setSelectedDate("");
        } catch (error) {
            console.error("Error adding record:", error);
        }
    };

    const deleteRecord = async (id) => {
        try {
            await deleteDoc(doc(db, "records", id));
            setRecords(records.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            const snapshot = await getDocs(collection(db, "records"));
            const data = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setRecords(data);
        };
        fetchData();
    }, []);

    const sumRecords = (arr) => arr.reduce((acc, item) => acc + item.amount, 0);

    const groupBy = (arr, fn) =>
        arr.reduce((acc, item) => {
            const key = fn(item);
            acc[key] = acc[key] || [];
            acc[key].push(item);
            return acc;
        }, {});

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const pad = (n) => n.toString().padStart(2, "0");
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());

        switch (timeFrame) {
            case "daily":
                return `${year}-${month}-${day}`;
            case "weekly": {
                const firstDay = new Date(d.getFullYear(), 0, 1);
                const week = Math.ceil(((d - firstDay) / 86400000 + firstDay.getDay() + 1) / 7);
                return `${year}-W${week}`;
            }
            case "monthly":
                return `${year}-${month}`;
            case "yearly":
                return `${year}`;
            default:
                return dateStr;
        }
    };

    const recordsByDate = groupBy(
        records.sort((a, b) => b.date.localeCompare(a.date)),
        (r) => r.date
    );

    const chartData = Object.entries(recordsByDate).map(([key, items]) => ({
        label: key,
        amount: sumRecords(items),
    }));

    const incomeRecords = records.filter((r) => r.type === "income");
    const expenseRecords = records.filter((r) => r.type === "expense");

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4 text-center">ตัวจัดการเงิน</h1>

            <Card>
                <Label>รายรับต่อสัปดาห์ (บาท)</Label>
                <Input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value === "" ? "" : Number(e.target.value))}
                />

                <Label>เปอร์เซ็นต์เก็บออม (%)</Label>
                <Input
                    type="number"
                    value={savingRate}
                    onChange={(e) => setSavingRate(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <Label>เปอร์เซ็นต์เงินสำรองฉุกเฉิน (%)</Label>
                <Input
                    type="number"
                    value={emergencyRate}
                    onChange={(e) => setEmergencyRate(e.target.value === "" ? "" : Number(e.target.value))}
                />
            </Card>

            <Card>
                <h2 className="text-lg font-semibold mb-2">ผลลัพธ์การแบ่งเงิน</h2>
                <p>💰 เงินเก็บ: {saving.toFixed(2)} บาท</p>
                <p>🛡 เงินสำรองฉุกเฉิน: {emergency.toFixed(2)} บาท</p>
                <p>🛍 เงินสำหรับใช้จ่าย: {spending.toFixed(2)} บาท</p>
            </Card>

            <Card>
                <CardContent className="form-grid">
                    <h2 className="text-xl font-semibold" style={{ gridColumn: "span 2" }}>
                        บันทึกรายรับรายจ่าย
                    </h2>

                    <Label>วันที่</Label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />

                    <Label>รายละเอียด</Label>
                    <Input
                        placeholder="รายละเอียด เช่น ข้าวเย็น"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />

                    <Label>จำนวนเงิน</Label>
                    <Input
                        type="number"
                        placeholder="จำนวนเงิน"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />

                    <div className="flex space-x-2">
                        <Button onClick={() => addRecord("income")}><IoIosAdd />เพิ่มรายรับ</Button>
                        <Button onClick={() => addRecord("expense")}><IoIosAdd />เพิ่มรายจ่าย</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <div className="mb-4">
                    <Label>เลือกช่วงเวลา:</Label>
                    <select
                        className="input"
                        value={timeFrame}
                        onChange={(e) => setTimeFrame(e.target.value)}
                    >
                        <option value="daily">รายวัน</option>
                        <option value="weekly">รายสัปดาห์</option>
                        <option value="monthly">รายเดือน</option>
                        <option value="yearly">รายปี</option>
                    </select>
                </div>

                <h2 className="text-lg font-semibold mb-2">กราฟแสดงรายจ่าย</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#f8bbd0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            {/* แสดงรายการตามวัน */}
            <Card>
                <h2 className="text-lg font-semibold mb-4">รายการตามวัน</h2>
                {Object.entries(recordsByDate).map(([date, items]) => (
                    <div key={date} className="mb-4">
                        <button
                            className="w-full text-left bg-pink-100 p-4 rounded-lg font-medium text-pink-800 hover:bg-pink-200 flex justify-between items-center"
                            onClick={() => setExpandedDate(expandedDate === date ? null : date)}
                        >
                            <span>{date} ({items.length} รายการ)</span>
                            <span className="text-sm">{expandedDate === date ? "ซ่อน" : "ดูรายละเอียด"}</span>
                        </button>

                        {expandedDate === date && (
                            <div className="mt-2 bg-white border border-pink-100 rounded-lg p-4 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex justify-between items-center rounded-xl px-4 py-3 shadow-md ${item.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                                    >
                                        <div className="flex flex-col">
                                            <div className="font-semibold">
                                                {item.desc} ({item.type === "income" ? "รายรับ" : "รายจ่าย"})
                                            </div>
                                            <div className="text-sm">{item.amount} บาท</div>
                                        </div>
                                        <div className="bt-del ml-4">
                                            <button
                                                onClick={() => deleteRecord(item.id)}
                                                className="text-sm text-white bg-pink-400 px-3 py-2 rounded-md hover:bg-pink-500 transition duration-300 ease-in-out"
                                            >
                                                ลบ
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </Card>
        </div>
    );
}
