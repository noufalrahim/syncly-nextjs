import { Loader2 } from 'lucide-react';

export default function Loader() {
    return (
        <div className="fixed inset-0 w-full h-full bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className='animate-spin w-16 h-16 text-primary' />
            </div>
        </div>
    )
}
