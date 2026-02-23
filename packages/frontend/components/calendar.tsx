import { useState, useEffect, useCallback } from "react";
import Days from "./days";
import dayjs from "dayjs";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Modal, { type AssinaturaFormData } from "./modal";
import ModalAssinaturasDia from "./modal-assinaturas-dia";
import PlusIcon from "public/icons/plus";
import { fetchAssinaturas, criarAssinatura, getMonthlyTotal, formatPrecoBRL, type Assinatura } from "../src/api";

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialDayForModal, setInitialDayForModal] = useState<number | null>(null);
    const [viewModalState, setViewModalState] = useState<{
        day: number;
        month: number;
        year: number;
        assinaturas: Assinatura[];
    } | null>(null);
    const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const carregarAssinaturas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await fetchAssinaturas();
            setAssinaturas(list);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao carregar assinaturas");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarAssinaturas();
    }, [carregarAssinaturas]);

    const handleSalvarAssinatura = async (data: AssinaturaFormData) => {
        setSaving(true);
        setError(null);
        try {
            const nova = await criarAssinatura({
                nome: data.nome,
                diaRenovacao: data.diaRenovacao,
                preco: data.preco,
                recorrencia: data.recorrencia,
                logoUrl: data.logoUrl || undefined,
                mesInicio: 1,
            });
            setAssinaturas((prev) => [nova, ...prev]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao salvar assinatura");
        } finally {
            setSaving(false);
        }
    };

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

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setInitialDayForModal(null);
        setIsModalOpen(false);
    };

    const handleDayClick = (day: number, month: number, year: number, assinaturas: Assinatura[]) => {
        setViewModalState({ day, month, year, assinaturas });
    };

    const closeViewModal = () => setViewModalState(null);

    const handleAssinaturaExcluida = (assinatura: Assinatura) => {
        setAssinaturas((prev) => prev.filter((a) => a._id !== assinatura._id));
        setViewModalState((prev) => {
            if (!prev) return null;
            const restantes = prev.assinaturas.filter((a) => a._id !== assinatura._id);
            return restantes.length === 0 ? null : { ...prev, assinaturas: restantes };
        });
    };

    return (
    <div className="relative">
        <div className="w-[640px] bg-[#0f0f0f] rounded-3xl border-white/10 border font-mono">
            <div className="flex justify-between items-center px-4 py-6">
                <div className="flex items-center gap-4 text-white">
                    <button className="rounded-4xl p-2">{`${monthNames[month]}, ${year}`}</button>
                    <button className="rounded-4xl px-4 py-2 border-white/10 border hover:cursor-pointer hover:border-white/40 transition-all duration-300" onClick={goToToday}>Today</button>
                    <button className="rounded-4xl hover:scale-125 hover:cursor-pointer transition-all duration-300" onClick={goToPreviousMonth}><ChevronLeftIcon /></button>
                    <button className="rounded-4xl hover:scale-125 hover:cursor-pointer transition-all duration-300" onClick={goToNextMonth}><ChevronRightIcon /></button>
                </div>
                <button className="group bg-[#fd6732] px-6 py-1 rounded-3xl text-black text-2xl items-center hover:bg-[#e0572ada] hover:cursor-pointer transition-all duration-300" onClick={openModal}><PlusIcon /></button>
            </div>
            {error && (
                <div className="px-4 py-2 text-sm text-red-400 bg-red-400/10 rounded-xl mx-4 mb-2">
                    {error}
                </div>
            )}
            <Days
                month={month}
                year={year}
                assinaturas={assinaturas}
                loading={loading}
                onDayClick={handleDayClick}
            />
            <div className="flex justify-between items-center px-4 py-6">
                <div className="flex items-center gap-4 ">
                    {/* <span>Exportar</span>
                    <span>Ia</span>
                    <span>Pesquisar</span> */}
                </div>
                <div className="flex items-center gap-4 text-white/60 font-mono"> Monthly Total: <span className="text-white">R$ {formatPrecoBRL(getMonthlyTotal(assinaturas, month, year))}</span></div>
            </div>
        </div>
        {isModalOpen && (
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSalvarAssinatura}
                initialDay={initialDayForModal}
                saving={saving}
            />
        )}
        {viewModalState && (
            <ModalAssinaturasDia
                isOpen={!!viewModalState}
                onClose={closeViewModal}
                day={viewModalState.day}
                month={viewModalState.month}
                year={viewModalState.year}
                assinaturas={viewModalState.assinaturas}
                onAssinaturaExcluida={handleAssinaturaExcluida}
            />
        )}
    </div>
    );
}