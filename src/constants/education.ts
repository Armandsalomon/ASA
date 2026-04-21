export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  icon: string;
  content: Section[];
  quiz: QuizQuestion[];
}

export interface Section {
  title: string;
  text: string;
  tip?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'Les bases de la Bourse',
    subtitle: 'Comprendre le marché boursier',
    duration: '8 min',
    difficulty: 'débutant',
    icon: '📈',
    content: [
      {
        title: 'Qu\'est-ce que la Bourse ?',
        text: 'La Bourse est un marché organisé où s\'échangent des valeurs mobilières (actions, obligations). Elle permet aux entreprises de lever des capitaux et aux investisseurs de faire fructifier leur épargne.',
        tip: '💡 La Bourse existe depuis le 17e siècle. La première bourse moderne a été créée à Amsterdam en 1602.',
      },
      {
        title: 'Pourquoi investir en Bourse ?',
        text: 'Historiquement, les marchés boursiers ont généré des rendements moyens de 7-10% par an sur le long terme, bien supérieurs à l\'inflation. Le S&P 500 a multiplié sa valeur par plus de 100 en 50 ans.',
      },
      {
        title: 'Les risques à connaître',
        text: 'Tout investissement comporte des risques. Le cours d\'une action peut baisser, parfois significativement. C\'est pourquoi il est essentiel de diversifier son portefeuille et d\'investir sur le long terme.',
        tip: '⚠️ N\'investissez que l\'argent dont vous n\'avez pas besoin à court terme.',
      },
    ],
    quiz: [
      {
        question: 'Quel est le rendement moyen historique des marchés boursiers par an ?',
        options: ['1-3%', '7-10%', '15-20%', '25-30%'],
        answer: 1,
        explanation: 'Les marchés boursiers ont historiquement généré des rendements de 7 à 10% par an en moyenne sur le long terme.',
      },
    ],
  },
  {
    id: '2',
    title: 'Lire une action',
    subtitle: 'Ticker, prix, volume, capitalisation',
    duration: '10 min',
    difficulty: 'débutant',
    icon: '🔍',
    content: [
      {
        title: 'Le ticker (symbole boursier)',
        text: 'Chaque action est identifiée par un code court : AAPL pour Apple, MSFT pour Microsoft, TSLA pour Tesla. Ce code unique permet d\'identifier rapidement une entreprise sur n\'importe quelle bourse mondiale.',
      },
      {
        title: 'Le prix et la variation',
        text: 'Le prix d\'une action reflète ce que le marché est prêt à payer pour une part de l\'entreprise. La variation journalière (en % et en valeur absolue) indique l\'évolution depuis la veille.',
        tip: '💡 Une variation de +2% semble faible, mais sur 252 jours de trading, cela représente une multiplication par plus de 60 !',
      },
      {
        title: 'Le volume de transactions',
        text: 'Le volume indique combien d\'actions ont été échangées sur la journée. Un volume élevé confirme généralement une tendance (hausse ou baisse). Un volume faible suggère un mouvement peu fiable.',
      },
      {
        title: 'La capitalisation boursière',
        text: 'C\'est la valeur totale de l\'entreprise en Bourse = prix de l\'action × nombre d\'actions. Apple dépasse les 3 000 milliards de dollars, ce qui en fait l\'une des plus grandes entreprises au monde.',
      },
    ],
    quiz: [
      {
        question: 'Que signifie un volume de transactions élevé lors d\'une hausse ?',
        options: ['La hausse est suspecte', 'La hausse est confirmée et fiable', 'Le titre est surévalué', 'L\'entreprise rachète ses actions'],
        answer: 1,
        explanation: 'Un volume élevé lors d\'une hausse confirme que de nombreux investisseurs participent au mouvement, ce qui le rend plus crédible.',
      },
    ],
  },
  {
    id: '3',
    title: 'Analyse Technique',
    subtitle: 'RSI, MACD, moyennes mobiles',
    duration: '15 min',
    difficulty: 'intermédiaire',
    icon: '📊',
    content: [
      {
        title: 'Les moyennes mobiles (MA)',
        text: 'La moyenne mobile calcule le prix moyen sur une période donnée. La MA20 (20 jours) suit la tendance court terme, la MA50 le moyen terme, la MA200 le long terme. Quand le prix passe au-dessus de la MA200, c\'est souvent un signal haussier.',
      },
      {
        title: 'Le RSI (Relative Strength Index)',
        text: 'Le RSI mesure la force d\'une tendance sur une échelle de 0 à 100. En dessous de 30 = survendu (potentiel achat), au-dessus de 70 = suracheté (potentiel vente). C\'est l\'un des indicateurs les plus utilisés au monde.',
        tip: '💡 Un RSI à 80 ne signifie pas forcément une chute imminente. Dans une forte tendance haussière, le RSI peut rester élevé longtemps.',
      },
      {
        title: 'Le MACD',
        text: 'Le MACD (Moving Average Convergence Divergence) identifie les changements de tendance. Quand la ligne MACD croise sa ligne signal vers le haut, c\'est un signal d\'achat. Le croisement vers le bas est un signal de vente.',
      },
    ],
    quiz: [
      {
        question: 'Un RSI à 25 signifie que le titre est :',
        options: ['Suracheté', 'En forte hausse', 'Survendu', 'À son juste prix'],
        answer: 2,
        explanation: 'Un RSI en dessous de 30 indique que le titre est survendu, ce qui peut représenter une opportunité d\'achat (mais pas automatiquement).',
      },
    ],
  },
  {
    id: '4',
    title: 'Analyse Fondamentale',
    subtitle: 'PER, BPA, dividendes et ratios clés',
    duration: '12 min',
    difficulty: 'intermédiaire',
    icon: '💼',
    content: [
      {
        title: 'Le PER (Price-to-Earnings Ratio)',
        text: 'Le PER = Prix de l\'action / Bénéfice par action. Un PER de 20 signifie que vous payez 20€ pour chaque euro de bénéfice. Un PER bas peut indiquer une sous-évaluation, mais aussi des problèmes structurels.',
        tip: '💡 Le PER moyen historique du S&P 500 est d\'environ 15-20. Au-dessus de 25, l\'action est considérée chère.',
      },
      {
        title: 'Le BPA (Bénéfice Par Action)',
        text: 'Le BPA mesure la rentabilité d\'une entreprise par action. Une croissance régulière du BPA (+10-15%/an) est un signe de bonne santé. C\'est l\'un des indicateurs les plus importants pour évaluer une entreprise.',
      },
      {
        title: 'Les dividendes',
        text: 'Certaines entreprises partagent leurs bénéfices sous forme de dividendes. Un rendement de dividende de 3-5% peut être attractif, surtout en période de taux bas. Attention aux dividendes trop élevés (+8%) qui peuvent signaler une détresse financière.',
      },
    ],
    quiz: [
      {
        question: 'Que mesure le PER ?',
        options: ['Le bénéfice total de l\'entreprise', 'Le nombre d\'années pour récupérer son investissement en bénéfices', 'La dette de l\'entreprise', 'La croissance du chiffre d\'affaires'],
        answer: 1,
        explanation: 'Un PER de 20 signifie théoriquement qu\'il faudrait 20 ans de bénéfices constants pour récupérer le prix payé pour l\'action.',
      },
    ],
  },
  {
    id: '5',
    title: 'Gestion du Risque',
    subtitle: 'Diversification, stop-loss, position sizing',
    duration: '12 min',
    difficulty: 'intermédiaire',
    icon: '🛡️',
    content: [
      {
        title: 'La diversification',
        text: 'Ne jamais mettre tous ses œufs dans le même panier. Un portefeuille bien diversifié inclut différents secteurs (tech, santé, finance, énergie) et différentes géographies (USA, Europe, marchés émergents). L\'objectif est de réduire le risque sans sacrifier le rendement.',
        tip: '💡 La règle générale : aucune position ne devrait dépasser 5-10% de votre portefeuille total.',
      },
      {
        title: 'Le stop-loss',
        text: 'Un stop-loss est un ordre automatique de vente si le prix descend en dessous d\'un seuil défini. Il protège contre les pertes excessives. Par exemple, un stop-loss à -10% limite automatiquement votre perte maximale sur une position.',
      },
      {
        title: 'Le position sizing',
        text: 'Combien investir dans chaque position ? La règle des 1-2% : ne risquez jamais plus de 1-2% de votre capital total sur une seule trade. Si vous avez 10 000€, perdre 100-200€ sur une trade est acceptable. Perdre 2 000€ ne l\'est pas.',
      },
    ],
    quiz: [
      {
        question: 'Quel pourcentage maximum de votre portefeuille devrait représenter une seule position selon les experts ?',
        options: ['1-2%', '5-10%', '20-25%', '50%'],
        answer: 1,
        explanation: 'La règle générale des gestionnaires de risque est de ne pas dépasser 5-10% par position pour maintenir une diversification efficace.',
      },
    ],
  },
  {
    id: '6',
    title: 'Macroéconomie & Marchés',
    subtitle: 'Taux, inflation, banques centrales',
    duration: '15 min',
    difficulty: 'avancé',
    icon: '🌍',
    content: [
      {
        title: 'Les taux d\'intérêt',
        text: 'Les taux directeurs fixés par la Fed et la BCE influencent directement les marchés. Des taux bas favorisent les actions (l\'argent cherche du rendement). Des taux élevés pèsent sur les valorisations (les obligations deviennent plus attractives).',
        tip: '💡 La règle TINA (There Is No Alternative) : quand les taux sont à 0%, les investisseurs n\'ont pas d\'alternative aux actions.',
      },
      {
        title: 'L\'inflation',
        text: 'Une inflation modérée (2-3%) est saine pour les entreprises qui peuvent augmenter leurs prix. Une inflation élevée (+7%) érode le pouvoir d\'achat et pousse les banques centrales à augmenter les taux, ce qui fait baisser les marchés.',
      },
      {
        title: 'La géopolitique',
        text: 'Les conflits, sanctions, élections et tensions commerciales créent de l\'incertitude sur les marchés. L\'incertitude fait baisser les marchés (les investisseurs préfèrent les actifs refuges comme l\'or ou les obligations). Mais les crises géopolitiques créent aussi des opportunités.',
      },
    ],
    quiz: [
      {
        question: 'Quel est l\'impact d\'une hausse des taux d\'intérêt sur les marchés actions ?',
        options: ['Aucun impact', 'Impact généralement positif', 'Impact généralement négatif', 'Cela dépend uniquement du secteur'],
        answer: 2,
        explanation: 'La hausse des taux rend les obligations plus attractives et augmente le coût du crédit pour les entreprises, ce qui pèse généralement sur les valorisations des actions.',
      },
    ],
  },
  {
    id: '7',
    title: 'Psychologie de l\'Investisseur',
    subtitle: 'Biais cognitifs et discipline',
    duration: '10 min',
    difficulty: 'avancé',
    icon: '🧠',
    content: [
      {
        title: 'Le biais de confirmation',
        text: 'Nous cherchons instinctivement les informations qui confirment nos croyances. En Bourse, cela peut nous pousser à ignorer les signaux négatifs sur une action que l\'on aime. Toujours chercher activement les arguments contraires à votre thèse.',
      },
      {
        title: 'La peur et la cupidité',
        text: 'Warren Buffett dit : "Soyez craintif quand les autres sont avides, et avide quand les autres sont craintifs." Les meilleures opportunités se créent souvent dans les moments de panique. Les erreurs se font souvent au sommet d\'une euphorie.',
        tip: '💡 L\'indice VIX (surnommé "l\'indice de la peur") mesure la volatilité attendue. Un VIX élevé = peur = opportunités potentielles.',
      },
      {
        title: 'La discipline',
        text: 'Définir votre stratégie AVANT d\'investir et s\'y tenir est la clé du succès. Tenir un journal de trading aide à identifier ses erreurs récurrentes. Les meilleurs traders perdent souvent sur 40-50% de leurs trades, mais gagnent beaucoup sur leurs bonnes positions.',
      },
    ],
    quiz: [
      {
        question: 'Que conseille Warren Buffett lorsque les autres investisseurs sont craintifs ?',
        options: ['Vendre aussi', 'Ne rien faire', 'Être avide (acheter)', 'Investir dans l\'or'],
        answer: 2,
        explanation: 'Warren Buffett préconise d\'acheter quand les autres vendent par peur, car c\'est souvent là que les prix sont les plus bas et les opportunités les meilleures.',
      },
    ],
  },
  {
    id: '8',
    title: 'Stratégies d\'Investissement',
    subtitle: 'DCA, valeur, croissance, dividendes',
    duration: '12 min',
    difficulty: 'intermédiaire',
    icon: '🎯',
    content: [
      {
        title: 'Le Dollar-Cost Averaging (DCA)',
        text: 'Investir une somme fixe régulièrement (ex: 200€/mois) indépendamment du cours. Cette stratégie réduit l\'impact de la volatilité : vous achetez plus d\'actions quand les prix sont bas, moins quand ils sont hauts. Idéale pour les investisseurs réguliers.',
        tip: '💡 Sur 10 ans, le DCA sur un ETF S&P 500 a historiquement généré des rendements excellents même en commençant juste avant un krach.',
      },
      {
        title: 'L\'investissement "Valeur"',
        text: 'Acheter des entreprises sous-évaluées par le marché. La méthode de Benjamin Graham et Warren Buffett : trouver des actions avec un PER bas, une dette faible, un free cash-flow positif. Patience requise : le marché peut mettre des années à reconnaître la vraie valeur.',
      },
      {
        title: 'L\'investissement "Croissance"',
        text: 'Investir dans des entreprises à forte croissance, même si elles sont chères. Amazon, Netflix, Tesla ont eu des PER très élevés pendant des années. Cette stratégie est plus risquée mais peut générer des rendements exceptionnels. Adaptée aux profils agressifs.',
      },
    ],
    quiz: [
      {
        question: 'Qu\'est-ce que le DCA (Dollar-Cost Averaging) ?',
        options: ['Acheter une grande quantité d\'une seule fois', 'Investir une somme fixe à intervalles réguliers', 'Vendre ses actions progressivement', 'Diversifier dans 100 actions différentes'],
        answer: 1,
        explanation: 'Le DCA consiste à investir régulièrement une somme fixe, ce qui permet de lisser le prix d\'achat moyen et de réduire l\'impact de la volatilité.',
      },
    ],
  },
];
