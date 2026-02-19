import dayjs from "dayjs";

interface ButtonDaysProps {
    day: number;
    month: number;
    year: number;
    logos?: string[];
}

export default function ButtonDays({ day, month, year, logos = [] }: ButtonDaysProps) {
    const today = dayjs();
    const isToday =
        today.date() === day &&
        today.month() === month &&
        today.year() === year;

    return (
        <button
            type="button"
            className={`w-full h-12 bg-[#2a2a2a] rounded-2xl flex flex-col items-center justify-center py-11 hover:bg-[#3a3a3a] hover:scale-105 hover:cursor-pointer transition-all duration-300 ${isToday ? "bg-[#414040]" : ""}`}
        >
            <p className="text-white/60">{day}</p>
            <div className="p-2 flex items-center justify-center gap-1 flex-wrap">
                {logos.length > 0 ? (
                    logos.slice(0, 3).map((url, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            <img
                                src={url}
                                alt=""
                                className="w-6 h-6 object-contain"
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