import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const HEADERS = {
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "ru-RU,ru;q=0.9",
};

// === ЯНДЕКС КАРТЫ ===
async function searchYandex(query: string) {
    try {
        const searchUrl = `https://yandex.ru/maps/api/search?text=${encodeURIComponent(query)}&type=biz&lang=ru_RU&results=1&origin=maps-search-form&snippets=businessrating%2Cmasstransit%2Cexperimental`;

        const res = await fetch(searchUrl, {
            headers: {
                ...HEADERS,
                "Referer": "https://yandex.ru/maps/",
                "Accept": "application/json",
            }
        });

        if (!res.ok) {
            console.log(`Yandex Maps API status: ${res.status}`);
            return await searchYandexFallback(query);
        }

        const data = await res.json();

        if (data?.features && data.features.length > 0) {
            const biz = data.features[0]?.properties?.CompanyMetaData;
            if (biz) {
                const name = biz.name || query;
                const rating = biz.Ratings?.[0]?.ratings || null;
                const score = rating?.['2'] || rating?.score || null;
                const reviews = rating?.reviews || biz.Ratings?.[0]?.reviews || 0;

                if (score) {
                    return {
                        rating: Number(Number(score).toFixed(1)),
                        count: reviews,
                        name
                    };
                }
            }
        }

        return await searchYandexFallback(query);
    } catch (e) {
        console.error("Yandex API error:", e);
        return await searchYandexFallback(query);
    }
}

// Фоллбэк: парсим HTML страницы поиска Яндекса
async function searchYandexFallback(query: string) {
    try {
        const url = `https://yandex.ru/search/?text=${encodeURIComponent(query + ' отзывы яндекс карты')}&lr=213`;
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;

        const html = await res.text();

        const patterns = [
            /(\d[.,]\d)\s*(?:из\s*5|\/5)/i,
            /(?:рейтинг|оценка)[:\s]*(\d[.,]\d)/i,
            /aria-label="[^"]*(\d[.,]\d)[^"]*(?:из 5|звёзд|звезд)/i,
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                const rating = parseFloat(match[1].replace(',', '.'));
                if (rating >= 1 && rating <= 5) {
                    const countMatch = html.match(/(\d[\d\s]*)\s*(?:отзыв|оценк|голос)/i);
                    const count = countMatch ? parseInt(countMatch[1].replace(/\s/g, ''), 10) : 0;
                    return { rating, count, name: query };
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Yandex fallback error:", e);
        return null;
    }
}

// === 2GIS ===
async function search2GIS(query: string) {
    try {
        const searchUrl = `https://catalog.api.2gis.com/3.0/items?q=${encodeURIComponent(query)}&type=branch&fields=items.reviews&key=rubnkm7490`;

        const res = await fetch(searchUrl, {
            headers: {
                ...HEADERS,
                "Referer": "https://2gis.ru/",
                "Origin": "https://2gis.ru"
            }
        });

        if (!res.ok) {
            console.log(`2GIS API status: ${res.status}`);
            return null;
        }

        const data = await res.json();

        if (data?.result?.items && data.result.items.length > 0) {
            const item = data.result.items[0];
            const reviews = item.reviews || {};
            const name = item.name || query;

            if (reviews.general_rating) {
                return {
                    rating: Number(Number(reviews.general_rating).toFixed(1)),
                    count: reviews.general_review_count || 0,
                    name
                };
            }
        }
        return null;
    } catch (e) {
        console.error("2GIS error:", e);
        return null;
    }
}

// === Авито (через DuckDuckGo) ===
async function searchAvito(query: string) {
    try {
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' авито отзывы рейтинг')}`;

        const res = await fetch(searchUrl, {
            headers: {
                ...HEADERS,
                "Referer": "https://duckduckgo.com/",
            }
        });

        if (!res.ok) return null;

        const html = await res.text();

        const patterns = [
            /(\d[.,]\d)\s*(?:из\s*5|\/5|★|звёзд)/i,
            /(?:рейтинг|оценка)[:\s]*(\d[.,]\d)/i,
        ];

        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (match) {
                const rating = parseFloat(match[1].replace(',', '.'));
                if (rating >= 1 && rating <= 5) {
                    const countMatch = html.match(/(\d[\d\s]*)\s*(?:отзыв|оценк)/i);
                    const count = countMatch ? parseInt(countMatch[1].replace(/\s/g, ''), 10) : 0;
                    return { rating, count, name: query };
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Avito search error:", e);
        return null;
    }
}

// === URL DETECTION ===
// Определяем, является ли ввод URL-ом и извлекаем название компании
function extractQueryFromUrl(input: string): string {
    const trimmed = input.trim();

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed);
        const hostname = url.hostname.toLowerCase();
        const path = decodeURIComponent(url.pathname);

        // Google Maps: /maps/place/НАЗВАНИЕ/...
        if (hostname.includes('google.com') && path.includes('/maps/place/')) {
            const match = path.match(/\/maps\/place\/([^/]+)/);
            if (match) {
                const name = match[1].replace(/\+/g, ' ');
                console.log(`[URL] Google Maps -> "${name}"`);
                return name;
            }
        }

        // Yandex Maps: /maps/org/НАЗВАНИЕ/ID/
        if (hostname.includes('yandex.ru') && path.includes('/maps/')) {
            const match = path.match(/\/org\/([^/]+)/);
            if (match) {
                const name = match[1].replace(/_/g, ' ').replace(/-/g, ' ');
                console.log(`[URL] Yandex Maps -> "${name}"`);
                return name;
            }
        }

        // 2GIS
        if (hostname.includes('2gis.ru') || hostname.includes('2gis.com')) {
            // Из URL 2GIS название не достать — возвращаем как есть, пусть поищет
            const parts = path.split('/').filter(Boolean);
            if (parts.length > 0) {
                console.log(`[URL] 2GIS link detected`);
                return parts[0]; // Обычно первый сегмент — город
            }
        }

        // Авито
        if (hostname.includes('avito.ru')) {
            const parts = path.split('/').filter(Boolean);
            if (parts.length >= 2) {
                const lastPart = parts[parts.length - 1]
                    .replace(/-\d+\.html$/, '')
                    .replace(/_/g, ' ')
                    .replace(/-/g, ' ');
                console.log(`[URL] Avito -> "${lastPart}"`);
                return lastPart;
            }
        }

        return trimmed;
    } catch (e) {
        return trimmed;
    }
}

// Раскрываем сокращённые ссылки
async function resolveShortUrl(shortUrl: string): Promise<string> {
    try {
        const res = await fetch(shortUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            redirect: 'follow',
        });
        const finalUrl = res.url;
        console.log(`[Short URL] ${shortUrl} -> ${finalUrl}`);
        return finalUrl;
    } catch (e) {
        console.error("[Short URL] Error:", e);
        return shortUrl;
    }
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { query: rawQuery } = await req.json();

        if (!rawQuery) {
            return new Response(JSON.stringify({ error: 'Query is required' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Если это короткая ссылка — раскрываем
        let input = rawQuery.trim();
        if (input.match(/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl|clck\.ru|bit\.ly|t\.co|tinyurl\.com)\//i)) {
            console.log(`[scrape] Resolving short URL: ${input}`);
            input = await resolveShortUrl(input);
        }

        // Извлекаем название из URL (если это ссылка)
        const query = extractQueryFromUrl(input);
        console.log(`[scrape] Input: "${rawQuery}" -> Query: "${query}"`);

        // Запускаем 3 парсера параллельно
        const [yandexData, avitoData, gisData] = await Promise.all([
            searchYandex(query),
            searchAvito(query),
            search2GIS(query),
        ]);

        console.log(`[scrape] Results:`, { yandex: yandexData, avito: avitoData, '2gis': gisData });

        const getStatus = (rating: number | null) => {
            if (!rating) return 'unknown';
            if (rating >= 4.5) return 'excellent';
            if (rating >= 4.0) return 'warning';
            return 'critical';
        };

        const validRatings: number[] = [];
        if (yandexData?.rating) validRatings.push(yandexData.rating);
        if (avitoData?.rating) validRatings.push(avitoData.rating);
        if (gisData?.rating) validRatings.push(gisData.rating);

        const avg = validRatings.length > 0
            ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
            : 0;

        const totalReviews =
            (yandexData?.count || 0) +
            (avitoData?.count || 0) +
            (gisData?.count || 0);

        const averageCheck = 2500;
        const lostClientsPercent = avg > 0 ? Math.max(0, (5.0 - avg) * 30) : 0;
        const monthlyTraffic = 1000;
        const possibleLostRevenue = Math.round(monthlyTraffic * (lostClientsPercent / 100) * averageCheck);

        let verdict: string;
        if (validRatings.length === 0) {
            verdict = 'Не удалось найти данные о компании. Попробуйте ввести точное название.';
        } else if (avg >= 4.7) {
            verdict = 'У вас отличная репутация! Но всегда есть куда расти.';
        } else if (avg >= 4.0) {
            verdict = 'Репутация в норме, но вы теряете клиентов.';
        } else {
            verdict = 'Критическая ситуация. Срочно нужны положительные отзывы.';
        }

        const responseData = {
            query,
            timestamp: new Date().toISOString(),
            platforms: {
                yandex: yandexData ? {
                    rating: yandexData.rating,
                    count: yandexData.count,
                    name: yandexData.name,
                    status: getStatus(yandexData.rating),
                    found: true
                } : { found: false, status: 'unknown' },

                avito: avitoData ? {
                    rating: avitoData.rating,
                    count: avitoData.count,
                    name: avitoData.name,
                    status: getStatus(avitoData.rating),
                    found: true
                } : { found: false, status: 'unknown' },

                '2gis': gisData ? {
                    rating: gisData.rating,
                    count: gisData.count,
                    name: gisData.name,
                    status: getStatus(gisData.rating),
                    found: true
                } : { found: false, status: 'unknown' },
            },
            averageRating: validRatings.length > 0 ? Number(avg.toFixed(1)) : null,
            totalReviews,
            platformsFound: validRatings.length,
            lostRevenueMonthly: possibleLostRevenue,
            verdict,
            status: 'success'
        };

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('[scrape] Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
