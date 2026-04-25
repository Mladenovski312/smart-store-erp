import { AlertTriangle } from 'lucide-react';

export default function UnderConstructionBanner() {
    return (
        <div
            role="alert"
            className="w-full bg-yellow-300 text-black border-b-2 border-yellow-500"
        >
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                <p className="text-sm sm:text-base font-semibold">
                    Сајтот е во изработка.
                </p>
            </div>
        </div>
    );
}
