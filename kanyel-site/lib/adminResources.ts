export type FieldType = "text" | "textarea" | "number" | "boolean" | "select" | "image" | "relation" | "date";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  help?: string;
  /** Marks the field as mandatory: shows a "*" next to the label (and sets native `required` for non-image fields). */
  required?: boolean;
  /** For type "relation": the admin API resource to fetch options from, e.g. "departments". */
  relatedResource?: string;
  /** For type "relation": field used as the option's value (must match what the API expects), e.g. "slug". */
  relatedValueField?: string;
  /** For type "relation": field used as the option's display label, e.g. "title_fr". */
  relatedLabelField?: string;
}

export interface ResourceConfig {
  key: string;
  label: string;
  idField: "id" | "slug";
  titleField: string;
  subtitleField?: string;
  imageField?: string;
  fields: FieldConfig[];
}

const ICON_OPTIONS: FieldOption[] = [
  { value: "plot", label: "Lotissement (parcelle)" },
  { value: "building", label: "BTP (bâtiment)" },
  { value: "globe", label: "Import-Export (globe)" },
  { value: "truck", label: "Transport (camion)" },
  { value: "exchange", label: "Achats-Ventes (échange)" },
  { value: "home", label: "Immobilier (maison)" },
  { value: "box", label: "Négoce (colis)" },
];

const ACCENT_OPTIONS: FieldOption[] = [
  { value: "navy", label: "Bleu marine" },
  { value: "gold", label: "Or" },
];

export const DEPARTMENTS_RESOURCE: ResourceConfig = {
  key: "departments",
  label: "Nos activités",
  idField: "slug",
  titleField: "title_fr",
  subtitleField: "description_fr",
  imageField: "detail_image",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "icon", label: "Icône", type: "select", options: ICON_OPTIONS },
    { name: "accent", label: "Couleur d'accent", type: "select", options: ACCENT_OPTIONS },
    { name: "title_fr", label: "Titre (français)", type: "text", required: true },
    { name: "title_en", label: "Titre (anglais)", type: "text", required: true },
    { name: "description_fr", label: "Description courte (français)", type: "textarea", required: true },
    { name: "description_en", label: "Description courte (anglais)", type: "textarea", required: true },
    {
      name: "detail_content_fr",
      label: "Contenu détaillé (français)",
      type: "textarea",
      help: "Texte affiché sur la page dédiée. Laisser vide pour réutiliser la description courte.",
    },
    { name: "detail_content_en", label: "Contenu détaillé (anglais)", type: "textarea" },
    { name: "detail_image", label: "Photo de la page détail", type: "image" },
    {
      name: "has_property_listing",
      label: "Afficher la liste des biens immobiliers",
      type: "boolean",
      help: "À cocher uniquement pour Gestion Immobilière.",
    },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const DEPARTMENT_IMAGES_RESOURCE: ResourceConfig = {
  key: "department-images",
  label: "Galerie des activités",
  idField: "id",
  titleField: "department",
  subtitleField: "caption_fr",
  imageField: "image",
  fields: [
    {
      name: "department",
      label: "Activité",
      type: "relation",
      relatedResource: "departments",
      relatedValueField: "slug",
      relatedLabelField: "title_fr",
      required: true,
    },
    { name: "order", label: "Ordre", type: "number" },
    { name: "image", label: "Photo", type: "image", required: true },
    { name: "caption_fr", label: "Légende (français)", type: "text" },
    { name: "caption_en", label: "Légende (anglais)", type: "text" },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const PROPERTIES_RESOURCE: ResourceConfig = {
  key: "properties",
  label: "Biens immobiliers",
  idField: "id",
  titleField: "title_fr",
  subtitleField: "location",
  imageField: "image",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    {
      name: "category",
      label: "Catégorie",
      type: "select",
      options: [
        { value: "villa", label: "Villa" },
        { value: "appartement", label: "Appartement" },
        { value: "terrain", label: "Terrain" },
        { value: "bureau_commerce", label: "Bureau / Commerce" },
        { value: "immeuble", label: "Immeuble" },
      ],
    },
    { name: "title_fr", label: "Titre (français)", type: "text", required: true },
    { name: "title_en", label: "Titre (anglais)", type: "text", required: true },
    { name: "description_fr", label: "Description (français)", type: "textarea", required: true },
    { name: "description_en", label: "Description (anglais)", type: "textarea", required: true },
    { name: "location", label: "Localisation", type: "text" },
    { name: "price", label: "Prix / Loyer", type: "text", help: 'Ex. "25 000 000 FCFA" ou "Sur demande".' },
    { name: "image", label: "Photo", type: "image", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const PROPERTY_IMAGES_RESOURCE: ResourceConfig = {
  key: "property-images",
  label: "Galerie des biens",
  idField: "id",
  titleField: "property",
  imageField: "image",
  fields: [
    {
      name: "property",
      label: "Bien immobilier",
      type: "relation",
      relatedResource: "properties",
      relatedValueField: "id",
      relatedLabelField: "title_fr",
      required: true,
    },
    { name: "order", label: "Ordre", type: "number" },
    { name: "image", label: "Photo", type: "image", required: true },
  ],
};

export const TESTIMONIALS_RESOURCE: ResourceConfig = {
  key: "testimonials",
  label: "Témoignages",
  idField: "id",
  titleField: "client_name",
  subtitleField: "city",
  imageField: "photo",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "client_name", label: "Nom du client", type: "text", required: true },
    { name: "city", label: "Ville", type: "text" },
    { name: "photo", label: "Photo", type: "image", help: "Facultatif — sinon les initiales du client sont affichées." },
    { name: "message_fr", label: "Témoignage (français)", type: "textarea", required: true },
    { name: "message_en", label: "Témoignage (anglais)", type: "textarea", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const PARTNERS_RESOURCE: ResourceConfig = {
  key: "partners",
  label: "Partenaires",
  idField: "id",
  titleField: "name",
  subtitleField: "website_url",
  imageField: "logo",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "name", label: "Nom du partenaire", type: "text", required: true },
    { name: "logo", label: "Logo", type: "image", required: true },
    { name: "website_url", label: "Site web", type: "text", help: "Facultatif. Rend le logo cliquable." },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const STATS_RESOURCE: ResourceConfig = {
  key: "stats",
  label: "Statistiques clés",
  idField: "id",
  titleField: "value",
  subtitleField: "label_fr",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "value", label: "Valeur", type: "text", help: 'Ex. "120", "500+", "15 ans".', required: true },
    { name: "label_fr", label: "Libellé (français)", type: "text", required: true },
    { name: "label_en", label: "Libellé (anglais)", type: "text", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const JOB_OFFERS_RESOURCE: ResourceConfig = {
  key: "jobs",
  label: "Offres d'emploi",
  idField: "id",
  titleField: "title_fr",
  subtitleField: "location",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    {
      name: "contract_type",
      label: "Type de contrat",
      type: "select",
      options: [
        { value: "cdi", label: "CDI" },
        { value: "cdd", label: "CDD" },
        { value: "stage", label: "Stage" },
        { value: "freelance", label: "Freelance / Prestation" },
      ],
    },
    { name: "title_fr", label: "Intitulé du poste (français)", type: "text", required: true },
    { name: "title_en", label: "Intitulé du poste (anglais)", type: "text", required: true },
    { name: "location", label: "Lieu", type: "text" },
    { name: "description_fr", label: "Description du poste (français)", type: "textarea", required: true },
    { name: "description_en", label: "Description du poste (anglais)", type: "textarea", required: true },
    { name: "requirements_fr", label: "Profil recherché (français)", type: "textarea" },
    { name: "requirements_en", label: "Profil recherché (anglais)", type: "textarea" },
    { name: "deadline", label: "Date limite de candidature", type: "date", help: "Facultatif." },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const CREDENTIALS_RESOURCE: ResourceConfig = {
  key: "credentials",
  label: "Reconnaissances",
  idField: "id",
  titleField: "title_fr",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "title_fr", label: "Titre (français)", type: "text", required: true },
    { name: "title_en", label: "Titre (anglais)", type: "text", required: true },
    { name: "description_fr", label: "Description (français)", type: "textarea", required: true },
    { name: "description_en", label: "Description (anglais)", type: "textarea", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const GALLERY_RESOURCE: ResourceConfig = {
  key: "gallery",
  label: "Galerie",
  idField: "id",
  titleField: "label_fr",
  imageField: "image",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    { name: "icon", label: "Icône", type: "select", options: ICON_OPTIONS },
    { name: "accent", label: "Couleur d'accent", type: "select", options: ACCENT_OPTIONS },
    { name: "label_fr", label: "Libellé (français)", type: "text", required: true },
    { name: "label_en", label: "Libellé (anglais)", type: "text", required: true },
    { name: "image", label: "Photo", type: "image", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const REALISATIONS_RESOURCE: ResourceConfig = {
  key: "realisations",
  label: "Nos réalisations",
  idField: "id",
  titleField: "title_fr",
  subtitleField: "client_name",
  imageField: "image",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    {
      name: "department",
      label: "Activité concernée",
      type: "relation",
      relatedResource: "departments",
      relatedValueField: "slug",
      relatedLabelField: "title_fr",
      help: "Facultatif.",
    },
    { name: "title_fr", label: "Titre (français)", type: "text", required: true },
    { name: "title_en", label: "Titre (anglais)", type: "text", required: true },
    { name: "description_fr", label: "Description (français)", type: "textarea", required: true },
    { name: "description_en", label: "Description (anglais)", type: "textarea", required: true },
    { name: "client_name", label: "Client", type: "text", help: "Facultatif." },
    { name: "location", label: "Lieu", type: "text" },
    { name: "completed_at", label: "Terminé le", type: "date", help: "Facultatif." },
    { name: "image", label: "Photo principale", type: "image", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const REALISATION_IMAGES_RESOURCE: ResourceConfig = {
  key: "realisation-images",
  label: "Galerie des réalisations",
  idField: "id",
  titleField: "realisation",
  imageField: "image",
  fields: [
    {
      name: "realisation",
      label: "Réalisation",
      type: "relation",
      relatedResource: "realisations",
      relatedValueField: "id",
      relatedLabelField: "title_fr",
      required: true,
    },
    { name: "order", label: "Ordre", type: "number" },
    { name: "image", label: "Photo", type: "image", required: true },
  ],
};

export const ARTICLES_RESOURCE: ResourceConfig = {
  key: "articles",
  label: "Actualités",
  idField: "id",
  titleField: "title_fr",
  subtitleField: "excerpt_fr",
  imageField: "cover_image",
  fields: [
    { name: "title_fr", label: "Titre (français)", type: "text", required: true },
    { name: "title_en", label: "Titre (anglais)", type: "text", required: true },
    { name: "excerpt_fr", label: "Résumé (français)", type: "text", help: "Facultatif, affiché dans la liste." },
    { name: "excerpt_en", label: "Résumé (anglais)", type: "text" },
    { name: "content_fr", label: "Contenu (français)", type: "textarea", required: true },
    { name: "content_en", label: "Contenu (anglais)", type: "textarea", required: true },
    { name: "cover_image", label: "Photo de couverture", type: "image", help: "Facultatif." },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const FAQS_RESOURCE: ResourceConfig = {
  key: "faqs",
  label: "Questions fréquentes",
  idField: "id",
  titleField: "question_fr",
  fields: [
    { name: "order", label: "Ordre", type: "number" },
    {
      name: "department",
      label: "Activité concernée",
      type: "relation",
      relatedResource: "departments",
      relatedValueField: "slug",
      relatedLabelField: "title_fr",
      help: "Laisser vide pour une question générale.",
    },
    { name: "question_fr", label: "Question (français)", type: "text", required: true },
    { name: "question_en", label: "Question (anglais)", type: "text", required: true },
    { name: "answer_fr", label: "Réponse (français)", type: "textarea", required: true },
    { name: "answer_en", label: "Réponse (anglais)", type: "textarea", required: true },
    { name: "is_published", label: "Publié", type: "boolean" },
  ],
};

export const SETTINGS_FIELDS: { title: string; fields: FieldConfig[] }[] = [
  {
    title: "Identité",
    fields: [
      { name: "company_name", label: "Nom de l'entreprise", type: "text" },
      { name: "slogan_fr", label: "Slogan (français)", type: "text" },
      { name: "slogan_en", label: "Slogan (anglais)", type: "text" },
      { name: "leader_name", label: "Nom du dirigeant", type: "text" },
      { name: "leader_role_fr", label: "Fonction (français)", type: "text" },
      { name: "leader_role_en", label: "Fonction (anglais)", type: "text" },
      { name: "leader_photo", label: "Photo du dirigeant", type: "image" },
    ],
  },
  {
    title: "Mot du DG",
    fields: [
      { name: "ceo_message_fr", label: "Mot du DG (français)", type: "textarea" },
      { name: "ceo_message_en", label: "Mot du DG (anglais)", type: "textarea" },
    ],
  },
  {
    title: "Coordonnées",
    fields: [
      { name: "address_fr", label: "Adresse (français)", type: "text" },
      { name: "address_en", label: "Adresse (anglais)", type: "text" },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        help: "Coordonnée GPS, ex. 6.827400. Laisser vide pour positionner la carte à partir de l'adresse texte.",
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        help: "Coordonnée GPS, ex. -5.289400. Laisser vide pour positionner la carte à partir de l'adresse texte.",
      },
      { name: "phone_1", label: "Téléphone 1", type: "text" },
      { name: "phone_2", label: "Téléphone 2", type: "text" },
      { name: "phone_3", label: "Téléphone 3", type: "text" },
      { name: "whatsapp_number", label: "Numéro WhatsApp", type: "text", help: "Laisser vide pour masquer le bouton WhatsApp." },
      { name: "email_main", label: "E-mail principal", type: "text" },
      { name: "email_leader", label: "E-mail du dirigeant", type: "text" },
      { name: "website", label: "Site web", type: "text" },
      { name: "hours_fr", label: "Horaires (français)", type: "text" },
      { name: "hours_en", label: "Horaires (anglais)", type: "text" },
    ],
  },
  {
    title: "Réseaux sociaux",
    fields: [
      { name: "facebook_url", label: "Facebook", type: "text" },
      { name: "instagram_url", label: "Instagram", type: "text" },
      { name: "linkedin_url", label: "LinkedIn", type: "text" },
      { name: "x_url", label: "X (Twitter)", type: "text" },
      { name: "tiktok_url", label: "TikTok", type: "text" },
      { name: "youtube_url", label: "YouTube", type: "text" },
    ],
  },
  {
    title: "Page d'accueil (Hero)",
    fields: [
      { name: "hero_title_fr", label: "Titre principal (français)", type: "text" },
      { name: "hero_title_en", label: "Titre principal (anglais)", type: "text" },
      { name: "hero_subtitle_fr", label: "Sous-titre (français)", type: "textarea" },
      { name: "hero_subtitle_en", label: "Sous-titre (anglais)", type: "textarea" },
      { name: "hero_image", label: "Photo de couverture", type: "image" },
    ],
  },
  {
    title: "Section À propos",
    fields: [
      { name: "about_paragraph_1_fr", label: "Paragraphe 1 (français)", type: "textarea" },
      { name: "about_paragraph_1_en", label: "Paragraphe 1 (anglais)", type: "textarea" },
      { name: "about_paragraph_2_fr", label: "Paragraphe 2 (français)", type: "textarea" },
      { name: "about_paragraph_2_en", label: "Paragraphe 2 (anglais)", type: "textarea" },
      { name: "about_image", label: "Photo à propos", type: "image" },
      { name: "about_image_caption", label: "Légende de la photo", type: "text" },
    ],
  },
];
