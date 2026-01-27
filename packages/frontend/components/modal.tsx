export default function Modal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    return (
        <dialog open={isOpen} onClose={onClose} className="z-50 absolute top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm justify-center items-center flex">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border-white/10 border text-white font-mono">
                <h1>Modal</h1>
            </div>
        </dialog>
    );
}