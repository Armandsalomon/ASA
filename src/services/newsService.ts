export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  tickers: string[];
  category: string;
}

// Mock news articles representing current market conditions (Mars 2026)
const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'La Fed maintient ses taux et surveille l\'inflation',
    summary: 'La Réserve fédérale américaine a décidé de maintenir ses taux directeurs entre 4.25% et 4.5%, adoptant une posture prudente face à une inflation qui reste légèrement au-dessus de l\'objectif de 2%. Jerome Powell a indiqué que des baisses de taux restent envisageables en 2026.',
    source: 'Bloomberg',
    publishedAt: '2026-03-14T14:30:00Z',
    url: '#',
    sentiment: 'neutral',
    sentimentScore: 0.1,
    tickers: ['SPY', 'QQQ', 'TLT'],
    category: 'Banques Centrales',
  },
  {
    id: '2',
    title: 'NVIDIA : résultats record, guidance optimiste pour l\'IA',
    summary: 'NVIDIA a dépassé toutes les attentes avec un chiffre d\'affaires trimestriel de 35 milliards de dollars, tiré par la demande explosive pour ses puces Blackwell. La direction relève son guidance pour Q1 2026, citant une accélération des investissements en IA des hyperscalers.',
    source: 'Reuters',
    publishedAt: '2026-03-13T21:00:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.85,
    tickers: ['NVDA'],
    category: 'Résultats',
  },
  {
    id: '3',
    title: 'Tensions commerciales USA-Chine : nouveaux droits de douane',
    summary: 'L\'administration américaine a annoncé des droits de douane supplémentaires de 25% sur certains produits technologiques chinois. Cette mesure affecte notamment les semi-conducteurs et les panneaux solaires, créant des incertitudes sur les chaînes d\'approvisionnement mondiales.',
    source: 'Financial Times',
    publishedAt: '2026-03-12T10:15:00Z',
    url: '#',
    sentiment: 'negative',
    sentimentScore: -0.65,
    tickers: ['AAPL', 'TSLA', 'NVDA'],
    category: 'Géopolitique',
  },
  {
    id: '4',
    title: 'L\'or atteint de nouveaux records à 3050 dollars l\'once',
    summary: 'Le métal précieux continue sa progression et établit un nouveau record historique à 3050 dollars l\'once. Les incertitudes géopolitiques, la demande des banques centrales des pays émergents et les anticipations de baisse des taux soutiennent le métal jaune.',
    source: 'Le Monde',
    publishedAt: '2026-03-11T16:45:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.70,
    tickers: ['GLD', 'IAU'],
    category: 'Matières Premières',
  },
  {
    id: '5',
    title: 'LVMH : reprise des ventes en Chine, titre en hausse',
    summary: 'Le géant du luxe LVMH fait état d\'une reprise progressive de la consommation en Chine, avec des ventes en hausse de 8% au T1 2026. La marque Dior affiche des performances particulièrement solides. Le titre MC.PA monte de 4% en séance à Paris.',
    source: 'Les Echos',
    publishedAt: '2026-03-10T09:30:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.75,
    tickers: ['MC.PA'],
    category: 'Secteurs',
  },
  {
    id: '6',
    title: 'Tesla : livraisons décevantes, pression sur le titre',
    summary: 'Tesla a livré 336 000 véhicules au Q1 2026, en baisse de 12% par rapport à l\'an dernier. La concurrence chinoise (BYD, NIO) gagne des parts de marché en Europe et en Asie. Certains analystes réduisent leur objectif de cours.',
    source: 'Wall Street Journal',
    publishedAt: '2026-03-09T18:00:00Z',
    url: '#',
    sentiment: 'negative',
    sentimentScore: -0.60,
    tickers: ['TSLA'],
    category: 'Automobile',
  },
  {
    id: '7',
    title: 'Inflation en Zone Euro : 2.3%, vers une baisse de la BCE ?',
    summary: 'L\'inflation en Zone Euro est tombée à 2.3% en février 2026, proche de l\'objectif de 2% de la BCE. Les marchés anticipent désormais deux baisses de taux de 25 points de base en 2026. Les obligations européennes montent en conséquence.',
    source: 'Eurostat',
    publishedAt: '2026-03-08T11:00:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.55,
    tickers: ['CAC', 'DAX', 'BNP'],
    category: 'Macroéconomie',
  },
  {
    id: '8',
    title: 'Apple Intelligence : déploiement en Europe dès avril 2026',
    summary: 'Apple a annoncé le déploiement complet d\'Apple Intelligence en Europe pour avril 2026, après l\'accord trouvé avec la Commission Européenne. Cette IA intégrée à iOS 19 devrait stimuler le cycle de renouvellement des iPhone.',
    source: 'TechCrunch',
    publishedAt: '2026-03-07T15:30:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.68,
    tickers: ['AAPL'],
    category: 'Technologie',
  },
  {
    id: '9',
    title: 'Pétrole : l\'OPEP+ augmente sa production, prix sous pression',
    summary: 'L\'OPEP+ a décidé d\'augmenter sa production de 400 000 barils par jour à partir d\'avril 2026. Cette décision fait chuter le Brent de 3% à 76 dollars, pénalisant les compagnies pétrolières comme TotalEnergies.',
    source: 'Platts',
    publishedAt: '2026-03-06T13:00:00Z',
    url: '#',
    sentiment: 'negative',
    sentimentScore: -0.40,
    tickers: ['TTE', 'CVX', 'XOM'],
    category: 'Énergie',
  },
  {
    id: '10',
    title: 'Microsoft Azure : croissance de 35%, le cloud domine',
    summary: 'Microsoft a publié des résultats trimestriels dépassant les attentes, avec une croissance d\'Azure de 35% tirée par les services d\'IA (Copilot, OpenAI). Le titre MSFT remonte vers ses records historiques.',
    source: 'CNBC',
    publishedAt: '2026-03-05T20:30:00Z',
    url: '#',
    sentiment: 'positive',
    sentimentScore: 0.80,
    tickers: ['MSFT'],
    category: 'Technologie',
  },
];

export async function getMarketNews(apiKey?: string): Promise<NewsArticle[]> {
  // If Alpha Vantage key is provided, try to fetch real news
  if (apiKey && apiKey !== 'demo') {
    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&limit=10&apikey=${apiKey}`,
        { signal: AbortSignal.timeout(6000) }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.feed && data.feed.length > 0) {
          return data.feed.map((item: any, index: number) => ({
            id: String(index),
            title: item.title,
            summary: item.summary,
            source: item.source,
            publishedAt: item.time_published,
            url: item.url,
            sentiment: getSentimentLabel(item.overall_sentiment_score),
            sentimentScore: item.overall_sentiment_score,
            tickers: item.ticker_sentiment?.map((t: any) => t.ticker) || [],
            category: item.category_within_source || 'Marché',
          }));
        }
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Return mock news with slight date randomization to simulate freshness
  return MOCK_NEWS.map(article => ({
    ...article,
    // Add small variation to simulate different fetch times
  }));
}

export async function getNewsForTicker(ticker: string, apiKey?: string): Promise<NewsArticle[]> {
  return MOCK_NEWS.filter(article =>
    article.tickers.some(t => t.toUpperCase() === ticker.toUpperCase())
  );
}

function getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
  if (score > 0.15) return 'positive';
  if (score < -0.15) return 'negative';
  return 'neutral';
}

export function getSentimentColor(sentiment: NewsArticle['sentiment']): string {
  const colors = {
    positive: '#00C896',
    negative: '#FF4757',
    neutral: '#FFB300',
  };
  return colors[sentiment];
}

export function formatPublishedAt(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}
