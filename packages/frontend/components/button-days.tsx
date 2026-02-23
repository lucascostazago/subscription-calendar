import dayjs from "dayjs";
import type { Assinatura } from "../src/api";

interface ButtonDaysProps {
    day: number;
    month: number;
    year: number;
    logos?: string[];
    assinaturas?: Assinatura[];
    onDayClick?: (day: number, assinaturas: Assinatura[]) => void;
}

export default function ButtonDays({ day, month, year, logos = [], assinaturas = [], onDayClick }: ButtonDaysProps) {
    const today = dayjs();
    const isToday =
        today.date() === day &&
        today.month() === month &&
        today.year() === year;

    const handleClick = () => {
        if (assinaturas.length > 0 && onDayClick) {
            onDayClick(day, assinaturas);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`w-full h-12 bg-[#2a2a2a] rounded-2xl flex flex-col items-center justify-center py-11 hover:bg-[#3a3a3a] hover:scale-105 transition-all duration-300 ${assinaturas.length > 0 ? "hover:cursor-pointer" : ""} ${isToday ? "bg-[#414040]" : ""}`}
        >
            <p className="text-white/60">{day}</p>
            <div className="p-2 flex items-center justify-center gap-1 flex-wrap">
                {logos.length > 0 ? (
                    logos.slice(0, 3).map((url, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                            <img
                                src={url}
                                alt=""
                                className="w-6 h-6 object-contain rounded-md"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="w-8 h-8" />
                )}
            </div>
        </button>
    );
}