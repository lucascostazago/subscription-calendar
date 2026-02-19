import ButtonDays from "./button-days";
import dayjs from "dayjs";
import { assinaturaApareceNoDia, type Assinatura } from "../src/api";

interface DaysProps {
    month?: number; // 0-11 (Janeiro = 0)
    year?: number;
    assinaturas?: Assinatura[];
    loading?: boolean;
}

export default function Days({ month, year, assinaturas = [], loading = false }: DaysProps = {}) {
    // Usa o mês/ano atual se não for fornecido
    const currentDate = dayjs();
    const targetMonth = month !== undefined ? month : currentDate.month();
    const targetYear = year !== undefined ? year : currentDate.year();
    
    // Cria uma data para o primeiro dia do mês
    const firstDayOfMonth = dayjs().month(targetMonth).year(targetYear).date(1);
    
    // Obtém o dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
    const startDayOfWeek = firstDayOfMonth.day();
    
    // Obtém o número de dias no mês
    const daysInMonth = firstDayOfMonth.daysInMonth();
    
    // Cria um array com os dias vazios no início (quando o mês não começa no domingo)
    const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i);
    
    // Cria um array com todos os dias do mês
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    return (
        <>
            <div className="grid grid-cols-7 gap-1 bg-[#181818] rounded-3xl p-4 justify-items-center border-white/10 border">
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Sun</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Mon</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Tue</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Wed</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Thu</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Fri</p>
                <p className="bg-[#2a2a2a] rounded-2xl w-full flex items-center justify-center py-2">Sat</p>
                
                {/* Renderiza os dias vazios no início */}
                {emptyDays.map((_, index) => (
                    <div key={`empty-${index}`} className="w-full h-12" />
                ))}
                
                {/* Renderiza todos os dias do mês */}
                {days.map((day) => {
                    const doDia = loading
                        ? []
                        : assinaturas.filter((a) => assinaturaApareceNoDia(a, targetMonth, targetYear, day));
                    const logos = doDia.map((a) => a.logoUrl).filter(Boolean);
                    return (
                        <ButtonDays
                            key={day}
                            day={day}
                            month={targetMonth}
                            year={targetYear}
                            logos={logos}
                        />
                    );
                })}
                <div className="flex justify-between w-full col-span-7 py-4 px-2">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-2"> <span className="bg-[#be89f8] w-2 h-2 rounded-full"></span>Monthly</span>
                        <span className="flex items-center gap-2"> <span className="bg-[#fcd52d] w-2 h-2 rounded-full"></span>Yearly</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-2 text-white/60">
                            <span className="text-white">{assinaturas.length}</span>Subscriptions
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}