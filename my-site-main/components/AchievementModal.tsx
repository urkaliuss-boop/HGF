import React, { useState, useEffect } from 'react';
import { Trophy, Share2, X, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import confetti from 'canvas-confetti';

interface AchievementModalProps {
    userId: string;
    earnedTotal: number;
    onClose: () => void;
}

const AchievementModal: React.FC<AchievementModalProps> = ({ userId, earnedTotal, onClose }) => {
    const [milestone, setMilestone] = useState<number | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasAttemptedShare, setHasAttemptedShare] = useState(false);

    const refLink = `${window.location.origin}/?ref=${userId}`;

    useEffect(() => {
        const checkMilestone = async () => {
            // Check if user has already seen/shared achievements
            const { data } = await supabase
                .from('profiles')
                .select('achievements')
                .eq('id', userId)
                .single();

            const shared = data?.achievements?.shared_milestones || [];
            const seen = data?.achievements?.seen_milestones || [];
            const dismissed = [...shared, ...seen];

            // Determine if they hit a new milestone
            let newMilestone = null;
            if (earnedTotal >= 5000 && !dismissed.includes(5000)) newMilestone = 5000;
            else if (earnedTotal >= 1000 && !dismissed.includes(1000)) newMilestone = 1000;
            else if (earnedTotal >= 100 && !dismissed.includes(100)) newMilestone = 100;

            if (newMilestone) {
                setMilestone(newMilestone);
                setIsVisible(true);
                // Fire confetti on load
                setTimeout(() => {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#0071e3', '#a855f7', '#fbbf24']
                    });
                }, 300);
            }
        };

        if (earnedTotal > 0) {
            checkMilestone();
        }
    }, [userId, earnedTotal]);

    const handleShare = async (platform: 'vk' | 'telegram') => {
        setHasAttemptedShare(true);
        let url = '';
        const text = encodeURIComponent(`Я заработал первые ${milestone}₽ на простых заданиях в Noxiss! Присоединяйся и получай деньги за отзывы:\n`);

        if (platform === 'vk') {
            url = `https://vk.com/share.php?url=${encodeURIComponent(refLink)}&title=${text}`;
        } else {
            url = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`;
        }

        window.open(url, '_blank');

        // Note: We can't actually verify if they posted it due to API restrictions, 
        // so we trust that clicking the button implies intent.
        grantReward();
    };

    const grantReward = async () => {
        if (!milestone) return;

        // Give a small bonus (e.g. 50 rubles) and mark milestone as shared
        const bonus = 50;

        try {
            // First get current profile data
            const { data: profile } = await supabase
                .from('profiles')
                .select('balance, achievements')
                .eq('id', userId)
                .single();

            if (!profile) return;

            const currentAchievements = profile.achievements || {};
            const sharedMilestones = currentAchievements.shared_milestones || [];

            if (sharedMilestones.includes(milestone)) {
                // Already rewarded
                setTimeout(() => {
                    setIsVisible(false);
                    onClose();
                }, 1500);
                return;
            }

            // Update
            await supabase.from('profiles').update({
                balance: profile.balance + bonus,
                achievements: {
                    ...currentAchievements,
                    shared_milestones: [...sharedMilestones, milestone]
                }
            }).eq('id', userId);

            setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 2000);

        } catch (e) {
            console.error(e);
        }
    };

    const dismissMilestone = async () => {
        if (!milestone) return;
        const { data: profile } = await supabase
            .from('profiles')
            .select('achievements')
            .eq('id', userId)
            .single();

        const currentAchievements = profile?.achievements || {};
        const seenMilestones = currentAchievements.seen_milestones || [];

        if (!seenMilestones.includes(milestone)) {
            await supabase.from('profiles').update({
                achievements: {
                    ...currentAchievements,
                    seen_milestones: [...seenMilestones, milestone]
                }
            }).eq('id', userId);
        }

        setIsVisible(false);
        onClose();
    };

    if (!isVisible || !milestone) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#1c1c1e] w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative border border-slate-100 dark:border-white/10 text-center overflow-hidden">

                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/20 to-transparent -z-10"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-400/20 blur-3xl rounded-full -z-10"></div>

                <button
                    onClick={() => dismissMilestone()}
                    className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-white/10 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-colors z-20"
                >
                    <X size={16} className="text-slate-500" />
                </button>

                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6 relative">
                    <Trophy size={48} className="text-white" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1c1c1e]">
                        <Star size={16} className="text-white fill-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                    Заработано {milestone} ₽!
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                    Отличное достижение! Расскажите друзьям о своих успехах и получите <strong className="text-green-500 font-bold dark:text-green-400">+50₽</strong> на баланс прямо сейчас.
                </p>

                {hasAttemptedShare ? (
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl flex items-center justify-center gap-2 animate-fade-in font-bold text-sm">
                        <CheckCircle2 size={18} /> Бонус начислен!
                    </div>
                ) : (
                    <div className="space-y-3 relative z-10">
                        <button
                            onClick={() => handleShare('vk')}
                            className="w-full py-3.5 px-4 bg-[#0077FF] hover:bg-[#0066dd] text-white rounded-xl text-sm font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#0077FF]/25"
                        >
                            <Share2 size={16} /> Поделиться ВКонтакте
                        </button>
                        <button
                            onClick={() => handleShare('telegram')}
                            className="w-full py-3.5 px-4 bg-[#2AABEE] hover:bg-[#2292ce] text-white rounded-xl text-sm font-bold transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-[#2AABEE]/25"
                        >
                            <Share2 size={16} /> Отправить в Telegram
                        </button>
                        <button
                            onClick={() => dismissMilestone()}
                            className="w-full py-3 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            Не сейчас
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementModal;
