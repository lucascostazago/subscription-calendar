import { useState } from "react";
import Days from "./days";
import dayjs from "dayjs";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";


export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(dayjs());

    const month = currentDate.month(); // 0-11
    const year = currentDate.year();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

    const goToPreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
    };

    const goToNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
    };

    const goToToday = () => {
    setCurrentDate(dayjs());
    };

    return (
    <div className="w-[640px] bg-[#0f0f0f] rounded-3xl border-white/10 border font-mono">
        <div className="flex justify-between items-center px-4 py-6">
            <div className="flex items-center gap-4 text-white">
                <p className="rounded-4xl p-2">{monthNames[month]} <span>{year}</span></p>
                <button className="rounded-4xl px-4 py-2 border-white/10 border hover:cursor-pointer hover:border-white/40 transition-all duration-300" onClick={goToToday}>Today</button>
                <button className="rounded-4xl hover:scale-115 hover:cursor-pointer transition-all duration-300" onClick={goToPreviousMonth}><ChevronLeftIcon /></button>
                <button className="rounded-4xl hover:scale-115 hover:cursor-pointer transition-all duration-300" onClick={goToNextMonth}><ChevronRightIcon /></button>
            </div>
            <p className="bg-[#fd6732] px-6 py-1 rounded-3xl text-black text-2xl items-center hover:bg-[#e0572ada] hover:cursor-pointer hover:px-[26.5px] transition-all duration-300">+</p>
        </div>
        <Days month={month} year={year} />
        <div className="flex justify-between items-center px-4 py-6">
            <div className="flex items-center gap-4 ">
                {/* <span>Exportar</span>
                <span>Ia</span>
                <span>Pesquisar</span> */}
            </div>
            <div className="flex items-center gap-4 text-white/60 font-mono"> Monthly Total: <span className="text-white">$ 100.00</span></div>
        </div>
    </div>
    );
}