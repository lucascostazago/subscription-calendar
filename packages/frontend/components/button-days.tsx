interface ButtonDaysProps {
    day: number;
}

export default function ButtonDays({ day }: ButtonDaysProps) {
    return (
        <button className="w-full h-12 bg-[#2a2a2a] rounded-2xl flex flex-col items-center justify-center py-11 hover:bg-[#3a3a3a] hover:scale-105 hover:cursor-pointer transition-all duration-300">
            <p className="text-white/60">{day}</p>
            <div className="p-7">
                <p></p>
            </div>
        </button>
    );
}