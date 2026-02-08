import { XIcon } from "lucide-react";
import { useState } from "react";

export default function Modal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {

    return (
        <dialog open={isOpen} onClose={onClose} className="z-50 absolute top-0 left-0 w-full h-full bg-gray-200/5 backdrop-blur-sm rounded-xl  justify-center items-center flex">
            <div className="bg-[#0f0f0f] rounded-xl text-white">
                <div className="flex item-center text-center justify-around gap-8 p-4">
                    <p>Adicionar Nova Assinatura</p>
                    <button className="font-mono text-[#fd6732] text-2xl" onClick={(onClose)}><XIcon /></button>
                </div>
                <div className="bg-[#181818] p-4  font-mono rounded-xl flex flex-col gap-4 border border-white/10">
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Nome da assinatura" className="w-full p-2 rounded-xl bg-white/10 border-white/10 border text-white font-mono" />
                    </div>
                </div>
            </div>
        </dialog>
    );
}