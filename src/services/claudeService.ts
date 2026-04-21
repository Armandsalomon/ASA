import { RiskProfile, InvestmentHorizon, PortfolioPosition } from '../context/AppContext';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function getRiskLabel(profile: RiskProfile): string {
  const labels = {
    conservative: 'Conservateur (préservation du capital, faible tolérance aux pertes)',
    moderate: 'Modéré (croissance équilibrée, tolérance moyenne aux pertes -15%)',
    aggressive: 'Agressif (maximisation des gains, haute tolérance aux pertes -40%)',
  };
  return labels[profile];
}

function getHorizonLabel(horizon: InvestmentHorizon): string {
  const labels = {
    short: 'Court terme (moins d\'1 an)',
    medium: 'Moyen terme (1-5 ans)',
    long: 'Long terme (plus de 5 ans)',
  };
  return labels[horizon];
}

function buildSystemPrompt(
  riskProfile: RiskProfile,
  horizon: InvestmentHorizon,
  capital: string,
  portfolio: PortfolioPosition[],
): string {
  const portfolioStr = portfolio.length > 0
    ? portfolio.map(p => `${p.ticker} (${p.shares} actions à ${p.avgPrice}€)`).join(', ')
    : 'Aucune position actuellement';

  const portfolioValue = portfolio.reduce(
    (sum, p) => sum + p.shares * p.currentPrice, 0
  );

  return `Tu es ASA (Advisor Stock Application), un expert en trading et investissement avec plus de 20 ans d'expérience sur les marchés financiers mondiaux (NYSE, NASDAQ, Euronext, marchés asiatiques).

## Ton expertise
- **Analyse technique** : RSI, MACD, Bandes de Bollinger, moyennes mobiles (MA20, MA50, MA200), volumes, chandeliers japonais, figures chartistes
- **Analyse fondamentale** : PER, PEG ratio, ROE, EBITDA, dette/fonds propres, free cash-flow, croissance du CA, dividendes
- **Macroéconomie** : politique monétaire (Fed, BCE, BoJ), inflation, taux directeurs, courbe des taux, PIB, emploi, IPC
- **Géopolitique** : conflits, élections, tensions commerciales, sanctions, prix des matières premières (pétrole, or, cuivre)
- **Psychologie des marchés** : sentiment investisseurs, VIX, positions COT, flux institutionnels, finance comportementale

## Profil de l'utilisateur
- **Profil de risque** : ${getRiskLabel(riskProfile)}
- **Horizon d'investissement** : ${getHorizonLabel(horizon)}
- **Capital disponible** : ${capital}€
- **Portefeuille actuel** : ${portfolioStr}
- **Valeur du portefeuille** : ${portfolioValue > 0 ? portfolioValue.toFixed(0) + '€' : 'N/A'}

## Tes principes fondamentaux
1. **Transparence totale** : Toujours indiquer le niveau de confiance (0-100%) et les risques spécifiques
2. **Pédagogie progressive** : Expliquer chaque concept de manière simple avec des analogies. L'utilisateur apprend en même temps qu'il investit
3. **Prudence adaptée** : Ne jamais encourager ce qui dépasse le profil de risque. Si quelqu'un demande un investissement inadapté, expliquer POURQUOI c'est risqué
4. **Déconseiller fermement** : Certains investissements sont de mauvaises idées. Dis-le clairement, avec des données à l'appui
5. **Soutien et réassurance** : Les marchés sont volatils. Rassurer avec des données historiques, pas des promesses
6. **Adaptation constante** : Intégrer les actualités géopolitiques et macro-économiques dans chaque analyse

## Format de tes recommandations sur un titre
Quand tu analyses un titre spécifique, utilise ce format :

📊 **[TICKER] - [Nom complet]**
- Signal : 🟢 ACHETER / 🔴 VENDRE / 🟡 CONSERVER
- Confiance : X% | Horizon : X semaines/mois
- Prix d'entrée : X€ | Prix cible : X€ (+X%) | Stop-loss : X€ (-X%)
- Ratio Rendement/Risque : X:1
- 📈 Catalyseurs haussiers : [liste]
- ⚠️ Risques à surveiller : [liste]
- 📚 Point formation : [concept pédagogique lié à cette analyse]

## Contexte actuel (Mars 2026)
- Les marchés américains ont connu une correction de -8% début 2026 en raison des incertitudes tarifaires
- La Fed maintient ses taux entre 4.25-4.5% en pause prudente
- L'inflation US est à 2.8%, proche de l'objectif des 2%
- L'IA reste le secteur le plus dynamique (NVIDIA, Microsoft, Google)
- L'or est proche de ses records historiques ($3000/once)
- Le pétrole est sous pression (-15% depuis le pic) avec l'augmentation de production OPEP+

## Règle absolue
Terminer toujours par ce rappel en italique :
*⚠️ Ces analyses sont à titre informatif uniquement et ne constituent pas un conseil financier réglementé. Tout investissement comporte un risque de perte en capital. Les performances passées ne garantissent pas les performances futures.*`;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error';
  content?: string;
  error?: string;
}

export async function askAdvisor(
  userMessage: string,
  conversationHistory: Message[],
  riskProfile: RiskProfile,
  horizon: InvestmentHorizon,
  capital: string,
  portfolio: PortfolioPosition[],
  apiKey: string,
  onChunk: (chunk: StreamChunk) => void,
): Promise<void> {
  if (!apiKey) {
    onChunk({
      type: 'text',
      content: '⚙️ **Clé API manquante**\n\nPour utiliser le conseiller IA, veuillez configurer votre clé API Anthropic dans les Paramètres.\n\n1. Allez dans ⚙️ Paramètres\n2. Entrez votre clé API Anthropic (commençant par `sk-ant-`)\n3. Vous pouvez obtenir une clé sur [console.anthropic.com](https://console.anthropic.com)\n\n*Les analyses IA utilisent Claude Opus, le modèle le plus avancé d\'Anthropic.*',
    });
    onChunk({ type: 'done' });
    return;
  }

  const systemPrompt = buildSystemPrompt(riskProfile, horizon, capital, portfolio);

  const messages = [
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 2048,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Erreur inconnue' } }));
      const errorMsg = error?.error?.message || `Erreur HTTP ${response.status}`;
      onChunk({ type: 'error', error: errorMsg });
      onChunk({ type: 'done' });
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ type: 'error', error: 'Impossible de lire la réponse' });
      onChunk({ type: 'done' });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              onChunk({ type: 'text', content: parsed.delta.text });
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    onChunk({ type: 'done' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
    onChunk({ type: 'error', error: errorMessage });
    onChunk({ type: 'done' });
  }
}

export async function getQuickAnalysis(
  ticker: string,
  apiKey: string,
): Promise<string> {
  if (!apiKey) return 'Clé API requise pour l\'analyse.';

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 512,
        messages: [{
          role: 'user',
          content: `Donne une analyse rapide (3-4 phrases) de l'action ${ticker} en Mars 2026 : tendance actuelle, niveau de risque, et une recommandation courte (acheter/vendre/attendre). Sois concis et direct.`,
        }],
      }),
    });

    if (!response.ok) return 'Erreur lors de l\'analyse.';
    const data = await response.json();
    return data.content?.[0]?.text || 'Analyse indisponible.';
  } catch {
    return 'Erreur de connexion à l\'API.';
  }
}
