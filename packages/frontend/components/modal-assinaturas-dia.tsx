import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { formatPrecoBRL, parsePrecoBRL, excluirAssinatura, type Assinatura, type Recorrencia } from "../src/api";

const RECORRENCIA_LABELS: Record<Recorrencia, string> = {
    mensal: "Mensal",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual",
};

interface ModalAssinaturasDiaProps {
    isOpen: boolean;
    onClose: () => void;
    day: number;
    month: number;
    year: number;
    assinaturas: Assinatura[];
    onAssinaturaExcluida?: (assinatura: Assinatura) => void;
}

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function ModalAssinaturasDia({
    isOpen,
    onClose,
    day,
    month,
    year,
    assinaturas,
    onAssinaturaExcluida,
}: ModalAssinaturasDiaProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const total = assinaturas.reduce((sum, a) => sum + parsePrecoBRL(a.preco), 0);

    const handleExcluir = async (a: Assinatura) => {
        setError(null);
        setDeletingId(a._id);
        try {
            await excluirAssinatura(a._id);
            onAssinaturaExcluida?.(a);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erro ao excluir assinatura");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <dialog
            open={isOpen}
            onClose={onClose}
            className="z-50 absolute top-0 left-0 w-full h-full bg-gray-200/5 backdrop-blur-sm rounded-xl justify-center items-center flex"
        >
            <div className="bg-[#0f0f0f] rounded-xl text-white min-w-[320px] max-w-md border border-white/10">
                <div className="flex items-center justify-between gap-8 p-4 border-b border-white/10">
                    <p className="font-mono">
                        Assinaturas do dia {day} de {MONTH_NAMES[month]}, {year}
                    </p>
                    <button
                        type="button"
                        className="font-mono text-[#fd6732] text-2xl hover:opacity-80 transition-opacity"
                        onClick={onClose}
                    >
                        <X />
                    </button>
                </div>
                {error && (
                    <div className="mx-4 mt-2 p-2 text-sm text-red-400 bg-red-400/10 rounded-xl">
                        {error}
                    </div>
                )}
                <div className="max-h-[70vh] overflow-y-auto">
                    <div className="p-4 flex flex-col gap-3">
                        {assinaturas.map((a) => (
                            <div
                                key={a._id}
                                className="flex items-center gap-4 p-3 rounded-xl bg-[#181818] border border-white/10"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                    {a.logoUrl ? (
                                        <img
                                            src={a.logoUrl}
                                            alt=""
                                            className="w-10 h-10 object-contain rounded-lg"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span className="text-white/40 text-lg font-mono">
                                            {a.nome.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-white truncate">{a.nome}</p>
                                    <p className="text-white/60 text-sm font-mono">
                                        {RECORRENCIA_LABELS[a.recorrencia] ?? a.recorrencia}
                                    </p>
                                </div>
                                <p className="font-mono text-white shrink-0">
                                    R$ {a.preco}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleExcluir(a)}
                                    disabled={deletingId === a._id}
                                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    title="Excluir assinatura"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 py-4 border-t border-white/10 bg-[#181818] rounded-b-xl">
                    <p className="font-mono text-white/70">Total</p>
                    <p className="font-mono text-white text-lg font-medium">
                        R$ {formatPrecoBRL(total)}
                    </p>
                </div>
            </div>
        </dialog>
    );
}
