import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

// This component is strictly designed to be rendered INSIDE an iframe on a 3rd party site
const WidgetContent: React.FC = () => {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user');
    const theme = searchParams.get('theme') || 'light';

    // In a real app, use userId to fetch actual stats from Supabase
    // const { data } = await supabase.from('business_profiles').select('rating, reviews_count').eq('user_id', userId).single();

    const [stats] = useState({ rating: 4.9, reviews: 86, platform: 'Яндекс Карты' });

    // The referral link that gives this business owner 10%
    const refLink = `${window.location.origin}/?ref=${userId}`;

    return (
        <div className={`w-full h-full p-2 font-sans ${theme === 'dark' ? 'bg-transparent' : 'bg-transparent'}`}>
            {/* We use a transparent background to blend in, but the card itself has color */}
            <a
                href={refLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full h-full relative overflow-hidden group rounded-2xl border shadow-xl transition-transform hover:scale-[1.02] cursor-pointer
                    ${theme === 'dark' ? 'bg-[#1c1c1e] border-white/10' : 'bg-white border-slate-100'} 
                `}
            >
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-bl-full -z-10"></div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-full flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg">
                            {stats.rating}
                        </div>
                        <div>
                            <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                Наш рейтинг
                            </div>
                            <div className="text-[10px] text-slate-500">
                                На основе {stats.reviews} отзывов
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pb-1">
                        <span className={`text-[10px] font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {stats.platform}
                        </span>
                        <div className="flex text-amber-400">
                            {'★'.repeat(Math.round(stats.rating))}
                            {'☆'.repeat(5 - Math.round(stats.rating))}
                        </div>
                    </div>
                </div>

                {/* Hover overlay with referral intent */}
                <div className="absolute inset-0 bg-blue-600/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <ExternalLink className="text-white mb-2" size={24} />
                    <span className="text-white text-xs font-bold text-center px-4">
                        Подтверждено Noxiss
                    </span>
                </div>
            </a>
        </div>
    );
};

export default WidgetContent;
