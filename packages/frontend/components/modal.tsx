import { X, Search, Check } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

const RECORRENCIAS = [
    { value: "mensal", label: "Mensal" },
    { value: "trimestral", label: "Trimestral" },
    { value: "semestral", label: "Semestral" },
    { value: "anual", label: "Anual" },
] as const;

const BRANDFETCH_CLIENT_ID = "1idopMlqoI8HalkWPvF";
const SEARCH_API = `https://api.brandfetch.io/v2/search`;

function buildLogoUrl(domain: string): string {
    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0] ?? "";
    const normalized = d.includes(".") ? d : `${d}.com`;
    // symbol + theme dark + fallback/404: retorna 404 quando não existe, permitindo onError usar imagem padrão
    return `https://cdn.brandfetch.io/${normalized}/theme/dark/fallback/404/type/symbol?c=${BRANDFETCH_CLIENT_ID}`;
}

/** Formata centavos (string só dígitos) para exibição em Real: "1000" -> "10,00", "123456" -> "1.234,56" */
function formatarPreco(centavos: string): string {
    const n = parseInt(centavos || "0", 10);
    const reais = n / 100;
    const [inteiro = "0", dec = "00"] = reais.toFixed(2).split(".");
    const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${inteiroFormatado},${dec}`;
}

interface BrandSearchResult {
    brandId: string;
    domain: string;
    name: string;
    icon: string;
}

export interface AssinaturaFormData {
    nome: string;
    diaRenovacao: string;
    preco: string;
    recorrencia: typeof RECORRENCIAS[number]["value"];
    logoUrl: string;
}

export default function Modal({
    isOpen,
    onClose,
    onSave,
    initialDay,
    saving = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: AssinaturaFormData) => void | Promise<void>;
    initialDay?: number | null;
    saving?: boolean;
}) {
    const [pesquisa, setPesquisa] = useState("");
    const [diaRenovacao, setDiaRenovacao] = useState("");
    const [preco, setPreco] = useState("");
    const [recorrencia, setRecorrencia] = useState<typeof RECORRENCIAS[number]["value"]>("mensal");
    const [logoSelecionada, setLogoSelecionada] = useState<string>("");
    const [logoFallback, setLogoFallback] = useState<string>(""); // fallback quando dark/symbol não existe
    const [searchResults, setSearchResults] = useState<BrandSearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const justSelectedBrand = useRef(false);

    const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);

    useEffect(() => {
        if (isOpen && initialDay != null) {
            setDiaRenovacao(String(initialDay));
        }
    }, [isOpen, initialDay]);

    const fetchBrands = useCallback(async (name: string) => {
        if (!name.trim()) {
            setSearchResults([]);
            return;
        }
        setSearchLoading(true);
        try {
            const res = await fetch(
                `${SEARCH_API}/${encodeURIComponent(name.trim())}?c=${BRANDFETCH_CLIENT_ID}`
            );
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
            setShowDropdown(true);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    }, []);

    useEffect(() => {
        if (justSelectedBrand.current) {
            justSelectedBrand.current = false;
            return;
        }
        const t = setTimeout(() => fetchBrands(pesquisa), 300);
        return () => clearTimeout(t);
    }, [pesquisa, fetchBrands]);

    const handleSelecionarMarca = (brand: BrandSearchResult) => {
        justSelectedBrand.current = true;
        setPesquisa(brand.name);
        setLogoSelecionada(buildLogoUrl(brand.domain)); // prioridade: dark symbol
        setLogoFallback(brand.icon); // fallback quando dark/symbol não existe
        setSearchResults([]);
        setShowDropdown(false);
    };

    const resetForm = () => {
        setPesquisa("");
        setDiaRenovacao("");
        setPreco("");
        setLogoSelecionada("");
        setLogoFallback("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: AssinaturaFormData = {
            nome: pesquisa,
            diaRenovacao,
            preco: formatarPreco(preco),
            recorrencia,
            logoUrl: logoSelecionada,
        };
        const result = onSave?.(data);
        if (result instanceof Promise) {
            await result;
        }
        resetForm();
        onClose();
    };

    return (
        <dialog open={isOpen} onClose={handleClose} className="z-50 absolute top-0 left-0 w-full h-full bg-gray-200/5 backdrop-blur-sm rounded-xl justify-center items-center flex">
            <div className="bg-[#0f0f0f] rounded-xl text-white min-w-[320px] max-w-md">
                <div className="flex items-center justify-between gap-8 p-4 border-b border-white/10">
                    <p className="font-mono">Adicionar Nova Assinatura</p>
                    <button type="button" className="font-mono text-[#fd6732] text-2xl hover:opacity-80 transition-opacity" onClick={handleClose}><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="bg-[#181818] p-4 font-mono rounded-b-xl flex flex-col gap-4 border border-white/10 border-t-0">
                    {/* Pesquisa da marca (API Brandfetch) */}
                    <div className="flex flex-col gap-1 relative">
                        <label className="text-white/70 text-sm">Pesquisar assinatura</label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-4 h-4 text-white/40 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Ex: Netflix, Spotify..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono placeholder:text-white/40 focus:border-[#fd6732]/50 focus:outline-none transition-colors"
                            />
                        </div>
                        {showDropdown && (searchResults.length > 0 || searchLoading) && (
                            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-xl z-10 max-h-56 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="p-3 text-white/50 text-sm">Buscando...</div>
                                ) : (
                                    searchResults.map((brand) => (
                                        <button
                                            key={brand.brandId}
                                            type="button"
                                            onClick={() => handleSelecionarMarca(brand)}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white/10 text-left transition-colors first:rounded-t-xl"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                <img
                                                    src={brand.icon}
                                                    alt=""
                                                    className="w-8 h-8 object-contain rounded-xl"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                                />
                                            </div>
                                            <span className="font-mono text-white truncate">{brand.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Logo da marca (atualizada ao escolher acima) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-white/70 text-sm">Logo da marca</label>
                        {logoSelecionada ? (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center ">
                                    <img
                                        src={logoSelecionada}
                                        alt="Logo selecionada"
                                        className="max-w-full max-h-full object-contain rounded-xl"
                                        onError={() => {
                                            if (logoFallback) {
                                                setLogoSelecionada(logoFallback);
                                                setLogoFallback("");
                                            }
                                        }}
                                    />
                                </div>
                                <span className="text-emerald-400 text-sm flex items-center gap-1">
                                    <Check className="w-4 h-4" /> Logo selecionada
                                </span>
                            </div>
                        ) : (
                            <p className="text-white/40 text-sm">Selecione uma marca na pesquisa acima.</p>
                        )}
                    </div>

                    {/* Dia de renovação */}
                    <div className="flex flex-col gap-1">
                        <label className="text-white/70 text-sm">Dia de renovação</label>
                        <select
                            value={diaRenovacao}
                            onChange={(e) => setDiaRenovacao(e.target.value)}
                            className="w-full p-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono focus:border-[#fd6732]/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                            <option value="" className="bg-[#181818] text-white">Selecione o dia</option>
                            {diasDoMes.map((dia) => (
                                <option key={dia} value={dia} className="bg-[#181818] text-white">{dia}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preço */}
                    <div className="flex flex-col gap-1">
                        <label className="text-white/70 text-sm">Preço</label>
                        <div className="relative flex items-center">
                            <span className="absolute left-3 text-white/50 font-mono">R$</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                value={preco ? formatarPreco(preco) : ""}
                                onChange={(e) => {
                                    const v = e.target.value.replace(/\D/g, "");
                                    if (v === "" || /^\d+$/.test(v)) setPreco(v);
                                }}
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono placeholder:text-white/40 focus:border-[#fd6732]/50 focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Quando se repete (recorrência) */}
                    <div className="flex flex-col gap-1">
                        <label className="text-white/70 text-sm">Recorrência</label>
                        <select
                            value={recorrencia}
                            onChange={(e) => setRecorrencia(e.target.value as typeof recorrencia)}
                            className="w-full p-2.5 rounded-xl bg-white/10 border border-white/10 text-white font-mono focus:border-[#fd6732]/50 focus:outline-none transition-colors appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23fff' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                            {RECORRENCIAS.map((r) => (
                                <option key={r.value} value={r.value} className="bg-[#181818] text-white">{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 rounded-xl bg-[#fd6732] text-black font-mono font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? "Salvando..." : "Salvar assinatura"}
                    </button>
                </form>
            </div>
        </dialog>
    );
}