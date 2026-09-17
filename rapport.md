# Rapport de conception — Site KANYEL SARL

*Dernière mise à jour : 17 septembre 2026*

## 1. Présentation du projet

Site web bilingue (français/anglais) pour **KANYEL SARL**, entreprise ivoirienne
multisectorielle basée à Nanan, à côté de l'Hôtel Holidays, Yamoussoukro,
active dans : Lotissement & Aménagement, Bâtiment & Travaux Publics, Import &
Export, Transport & Logistique, Achats & Ventes, Gestion Immobilière.

Le projet comprend deux applications séparées :

- **`kanyel-site`** — site public + panneau d'administration (Next.js 16, App
  Router, Turbopack, next-intl, Tailwind CSS v4, framer-motion, React 19)
- **`kanyel-admin`** — API backend (Django 6.1 + Django REST Framework,
  SQLite, authentification par token)

Les deux communiquent via une API REST (`localhost:8000/api/...` en
développement). Le contenu du site (activités, biens, témoignages, offres
d'emploi, etc.) est entièrement géré depuis un panneau d'administration
personnalisé sur mesure (`/admin`), et non l'admin Django par défaut.

## 2. Architecture technique

### Backend (`kanyel-admin`)

| Modèle | Rôle |
|---|---|
| `SiteSettings` | Paramètres globaux (identité, coordonnées, réseaux sociaux, textes Hero/À propos), singleton |
| `Department` | Les 6 activités, avec image de détail et contenu bilingue |
| `DepartmentImage` | Galerie photo par activité |
| `Credential` | Reconnaissances institutionnelles (HPCO-CI, RIHDE, ISO) |
| `GalleryItem` | Galerie "Domaines d'activité" de la page d'accueil |
| `Property` | Biens immobiliers gérés (villas, terrains, bureaux...) |
| `Testimonial` | Témoignages clients |
| `Stat` | Statistiques clés manuelles (en plus des compteurs automatiques) |
| `Partner` | Logos partenaires (bande défilante) |
| `JobOffer` / `JobApplication` | Offres d'emploi et candidatures reçues |
| `ContactMessage` | Messages du formulaire de contact |
| `Realisation` / `RealisationImage` | Portfolio de projets réalisés |
| `Article` | Actualités / blog |
| `FAQ` | Questions fréquentes (générales ou par activité) |
| `QuoteRequest` | Demandes de devis structurées |

Chaque modèle exposant à la fois une écriture publique (formulaire visiteur)
et une gestion admin utilise **deux serializers distincts** (`*CreateSerializer`
public / `*Serializer` admin) — un choix de sécurité important établi tôt
dans le projet après un bug ayant exposé un risque de perte de données.

### Frontend (`kanyel-site`)

- Routage `/[locale]/...` (`fr` / `en`) via `next-intl`, avec un panneau
  admin sous `/[locale]/admin/...`
- Système de traduction centralisé dans `messages/fr.json` et `messages/en.json`
- Panneau d'administration générique : un même composant `ResourceCrud` +
  `AdminField` pilote la création/édition de toutes les ressources à partir
  d'une simple configuration (`lib/adminResources.ts`) — ajouter une nouvelle
  ressource ne demande pas de nouveau code de formulaire
- SEO : sitemap dynamique, `robots.txt`, données structurées JSON-LD
  (LocalBusiness), image Open Graph générée dynamiquement

## 3. Historique des étapes de conception

1. Construction initiale du site vitrine (Accueil, À propos, Nos activités,
   Pourquoi nous, Galerie, Témoignages, Contact) avec design bilingue
2. Menu dynamique avec sous-menu déroulant pour les activités
3. Audit et harmonisation du design par un passage "expert en conception web"
4. Durcissement sécurité du backend Django (variables d'environnement,
   CORS, hôtes autorisés)
5. Remplacement de l'admin Django par un **panneau d'administration sur
   mesure** dans Next.js (sidebar fixe, header fixe)
6. Ajout des statistiques clés (visiteurs, puis automatiques : activités,
   biens, partenaires, réalisations)
7. Refonte de la section "À propos" (mot du Directeur Général en bande
   pleine largeur avec photo réelle du dirigeant)
8. Bloc partenaires défilant (logos réels, couleur, infobulle au survol)
9. Icône de l'onglet du navigateur = vrai "K" du logo KANYEL
10. Contenu illustré (photos libres de droit vérifiées une à une) sur
    chaque page d'activité, avec galerie de 4 photos par activité et
    photo d'en-tête
11. Page "Offres d'emploi" avec candidature (formulaire + upload CV),
    candidature spontanée, visibles dans l'admin
12. Audit de sécurité complet des serializers (correction d'un bug où le
    formulaire de contact public enregistrait des messages vides)
13. Astérisques sur tous les champs obligatoires (formulaires publics et
    admin), téléphone rendu obligatoire partout
14. Réseaux sociaux flottants : d'abord alignés verticalement, puis
    regroupés en un seul bouton qui se déploie au survol avec infobulle
    du nom de chaque réseau (WhatsApp inclus au même niveau que les autres)
15. Formulaire de contact repliable (accordéon) en page Contact
16. Adresse et slogan traduisibles séparément en français/anglais
17. **Incident du 17/09/2026** : suppression accidentelle de tout le
    dossier `kanyel-site` par une commande shell mal formée — voir
    section 4
18. Intégration du vrai logo KANYEL (fichier fourni par l'utilisateur) en
    remplacement de la reconstruction approximative, sur tout le site
    (header, footer, favicon, image de partage)
19. Mise en place d'un dépôt Git privé
    ([github.com/Josselin225/KANYEL-sarl](https://github.com/Josselin225/KANYEL-sarl))
    comme sauvegarde du code, avec `.gitignore` excluant secrets, base de
    données et fichiers uploadés (données personnelles)
20. Analyse complète du projet et ajout de 8 fonctionnalités
    complémentaires : Nos réalisations, Actualités, FAQ, Demande de devis
    structurée, notifications e-mail automatiques, sauvegarde automatique
    quotidienne (tâche planifiée Windows), anti-spam (honeypot), export
    CSV des candidatures/messages/devis
21. Correctifs d'affichage du menu (retour à la ligne, logo trop éloigné
    du bord) — passage à un header pleine largeur

## 4. Incident notable : suppression accidentelle du 17/09/2026

Une commande de nettoyage mal formée (`rm -f ... -r`) a supprimé tout le
contenu du dossier `kanyel-site`. Le dossier `kanyel-admin` (base de
données, médias uploadés) n'a pas été touché — aucune donnée métier n'a
été perdue. L'intégralité du code frontend a été **reconstruite de zéro**
à partir de l'historique de conversation et des données réelles du
backend. Cet incident est la raison directe de la mise en place du dépôt
Git (étape 19) et de la sauvegarde automatique (étape 20), pour qu'une
telle perte ne puisse plus se reproduire.

## 5. État actuel — ce qui est en place

- Site public entièrement fonctionnel en français et anglais
- Panneau d'administration complet (toutes les ressources listées en
  section 2 sont gérables sans toucher au code)
- 6 activités, 11 biens immobiliers, 7 partenaires, 3 témoignages,
  2 offres d'emploi actuellement en base
- Sauvegarde automatique quotidienne (2h du matin) de la base de données
  et des fichiers uploadés
- Anti-spam actif sur les formulaires de contact, candidature et devis
- Code source sauvegardé sur GitHub (dépôt privé)

## 6. Points nécessitant une action de ta part

- **Notifications e-mail** : en attente d'un mot de passe d'application
  Gmail pour `kanyelsarl3@gmail.com` (ou un autre compte/service) — le
  code est prêt mais désactivé tant qu'aucun identifiant n'est fourni
- **Réseaux sociaux** : Instagram, LinkedIn, X, TikTok et YouTube pointent
  tous actuellement vers la même URL Facebook (probablement un test) — à
  corriger avec les vraies URLs dans Paramètres du site
- **RCCM** : le numéro de registre du commerce est encore marqué "à
  compléter" sur la page Mentions légales
- **Nos réalisations, Actualités, FAQ** : ces 3 nouvelles sections sont
  vides et affichent un message honnête en attendant du vrai contenu — à
  remplir depuis l'admin quand tu es prêt

## 7. Étapes à venir / suggestions

- Déploiement en production (hébergement, nom de domaine, base de données
  de production, HTTPS) — le site tourne actuellement uniquement en local
  (`localhost`)
- Vérifier régulièrement que la tâche planifiée de sauvegarde s'exécute
  bien (elle nécessite que le PC soit allumé et la session ouverte à 2h du
  matin) et envisager une synchronisation supplémentaire vers un stockage
  cloud (OneDrive, Google Drive) pour plus de sécurité
- Ajouter du contenu réel dans Réalisations, Actualités et FAQ
- Éventuellement remplacer l'anti-spam "honeypot" par un reCAPTCHA si le
  spam devient un problème réel
- Envisager des témoignages clients authentiques pour remplacer les
  exemples actuels
