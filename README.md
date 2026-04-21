# ASA - Advisor Stock App 📈

Application mobile de conseil en investissement boursier propulsée par l'IA Claude Opus (Anthropic).

## Fonctionnalités

### 🤖 Conseiller IA (Claude Opus 4.6)
- Chat en temps réel avec un expert IA en trading
- Recommandations buy/sell/hold avec niveau de confiance
- Analyse technique (RSI, MACD, moyennes mobiles)
- Analyse fondamentale (PER, BPA, free cash-flow)
- Intégration actualités géopolitiques et macroéconomiques
- Adaptée à votre profil de risque (conservateur/modéré/agressif)

### 📊 Marchés
- Watchlist avec données en temps réel
- Indices mondiaux (S&P 500, NASDAQ, CAC 40, DAX)
- Recherche d'actions
- Vue par secteurs (Tech, Finance, Énergie, Luxe)
- Actualités financières avec analyse de sentiment

### 💼 Portefeuille
- Suivi de vos positions
- P&L en temps réel
- Conseils de gestion du risque personnalisés

### 📚 Formation
- 8 modules pédagogiques (débutant → avancé)
- Quiz interactifs pour valider les connaissances
- Sujets : bases de la Bourse, analyse technique/fondamentale, macroéconomie, psychologie

## Installation

```bash
# Installer les dépendances
npm install

# Lancer l'application
npx expo start
```

## Configuration des clés API

Dans l'application → ⚙️ Paramètres :

### Anthropic (Obligatoire pour le Conseiller IA)
1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générez une clé API
3. Entrez la clé dans Paramètres → Clé Anthropic

### Alpha Vantage (Optionnel - données de marché en temps réel)
1. Inscrivez-vous sur [alphavantage.co](https://www.alphavantage.co)
2. Obtenez votre clé gratuite (500 requêtes/jour)
3. Entrez la clé dans Paramètres → Clé Alpha Vantage

> Sans clé Alpha Vantage, l'app utilise des données de démonstration réalistes.

## Architecture

```
src/
├── context/        # State global (profil, portefeuille, historique chat)
├── services/       # APIs (Claude, Alpha Vantage, news)
├── navigation/     # React Navigation
├── screens/        # 8 écrans principaux
├── components/     # Composants réutilisables (charts, cards)
└── constants/      # Thème, couleurs, contenu éducatif
```

## Modèle IA

- **Modèle** : Claude Opus 4.6 (Anthropic)
- **Streaming** : Réponses en temps réel
- **Contexte** : Profil utilisateur, portefeuille, conditions de marché
- **Personnalité** : Expert trader avec 20+ ans d'expérience

## Disclaimer

⚠️ **ASA est un outil informatif uniquement.** Il ne constitue pas un conseil financier réglementé au sens de la directive MIF2. Les analyses sont générées par IA et peuvent contenir des erreurs. Tout investissement comporte un risque de perte en capital. Les performances passées ne garantissent pas les performances futures. Consultez un conseiller financier agréé avant toute décision d'investissement.
