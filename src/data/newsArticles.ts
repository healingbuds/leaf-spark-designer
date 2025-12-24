import conferenceHq from "@/assets/conference-hq.jpg";
import awardHq from "@/assets/award-hq.jpg";
import productionFacility from "@/assets/production-facility-hq.jpg";
import researchLab from "@/assets/research-lab-hq.jpg";

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  featured: boolean;
  externalLink?: string;
  tags: string[];
  author: string;
  date: string;
  content: string[];
  region?: 'GB' | 'PT' | 'ZA' | 'ALL'; // Region-specific articles
}

// UK-specific articles
const ukArticles: NewsArticle[] = [
  {
    id: "uk-medical-cannabis-prescriptions-surge-2024",
    category: "UK News",
    title: "UK Medical Cannabis Prescriptions Surge 34% in 2024 as Access Improves",
    description: "Private clinics across Britain report record patient numbers as awareness grows and prescription pathways become more established, signalling a maturing market.",
    image: conferenceHq,
    featured: true,
    tags: ["UK", "Medical Cannabis", "Healthcare", "Prescriptions"],
    author: "Healing Buds UK",
    date: "Dec 20, 2024",
    region: 'GB',
    content: [
      "The UK medical cannabis sector has witnessed unprecedented growth in 2024, with prescription numbers rising by 34% compared to the previous year. This surge reflects both improved patient awareness and the establishment of more streamlined prescription pathways through private clinics.",
      "Project Twenty21, the UK's largest medical cannabis registry, has played a pivotal role in gathering real-world evidence. The data collected is helping to build the case for broader NHS adoption, though private prescriptions remain the primary route for most patients.",
      "Conditions such as chronic pain, anxiety, and PTSD continue to dominate prescription requests. Neurological conditions including epilepsy and multiple sclerosis also represent significant patient populations seeking cannabis-based treatments.",
      "The General Medical Council's updated guidance for doctors has provided clearer frameworks for prescribing, reducing hesitancy among medical professionals. Combined with growing patient advocacy, this has created momentum toward mainstream acceptance.",
      "Industry analysts predict continued growth through 2025, with potential movement on NHS prescribing for specific conditions. The economic case for medical cannabis as an alternative to opioid-based pain management continues to strengthen."
    ],
  },
  {
    id: "uk-cannabis-research-universities",
    category: "Research",
    title: "British Universities Lead European Cannabis Research Initiative",
    description: "A consortium of UK universities secures major funding for comprehensive medical cannabis studies, focusing on chronic pain and mental health applications.",
    image: researchLab,
    featured: false,
    tags: ["UK", "Research", "Universities", "Science"],
    author: "Healing Buds UK",
    date: "Dec 15, 2024",
    region: 'GB',
    content: [
      "A consortium comprising Imperial College London, the University of Oxford, and King's College London has secured £12 million in funding for the most comprehensive medical cannabis research programme ever conducted in the UK.",
      "The three-year study will examine the efficacy of cannabis-based medicines across multiple conditions, with particular focus on treatment-resistant chronic pain and anxiety disorders. Researchers aim to provide the robust clinical evidence that has been lacking in UK healthcare discussions.",
      "The programme includes pharmacokinetic studies to understand optimal dosing, long-term safety monitoring, and comparative effectiveness research against existing treatments. This evidence base could prove instrumental in future NHS prescribing decisions.",
      "Patient recruitment has already begun, with clinics across England and Scotland participating. The study will include both flower-based and oil-based cannabis medicines, providing comprehensive data on different administration methods.",
      "Professor Sarah Chen, the programme lead, noted that this research could 'fundamentally change how we approach chronic conditions that have resisted conventional treatments.' The findings are expected to influence policy discussions across Europe."
    ],
  },
  {
    id: "uk-cannabis-clinic-expansion",
    category: "Healthcare",
    title: "Medical Cannabis Clinics Expand Across Northern England",
    description: "New clinic openings in Manchester, Leeds, and Newcastle aim to improve access for patients outside London, addressing geographic disparities in care.",
    image: productionFacility,
    featured: false,
    tags: ["UK", "Clinics", "Healthcare Access", "Regional"],
    author: "Healing Buds UK",
    date: "Dec 10, 2024",
    region: 'GB',
    content: [
      "The geographic concentration of medical cannabis clinics in London and the South East has long been a barrier for patients in northern England. A wave of new clinic openings is now addressing this disparity, bringing specialist care closer to patients who need it.",
      "Manchester, Leeds, and Newcastle have all seen new clinics open in the past quarter, with further locations planned for Liverpool and Sheffield in early 2025. These facilities offer both in-person consultations and telemedicine options.",
      "The expansion reflects growing demand from patients who previously faced lengthy journeys for appointments. Telemedicine has helped, but many patients prefer in-person consultations, particularly for initial assessments.",
      "Clinic operators report that northern patients often present with longer treatment histories, having exhausted conventional options before seeking cannabis-based alternatives. The average time from initial symptoms to cannabis prescription remains above five years.",
      "Local NHS trusts have begun engaging with private clinics to understand potential integration pathways. While NHS prescribing remains limited, the collaborative conversations signal evolving attitudes within the health service."
    ],
  },
];

// Portugal-specific articles
const ptArticles: NewsArticle[] = [
  {
    id: "portugal-cannabis-cultivation-expansion",
    category: "Notícias PT",
    title: "Portugal Emerges as Europe's Premier Cannabis Cultivation Hub",
    description: "Mediterranean climate and progressive regulations position Portugal as the leading destination for EU GMP certified cannabis production facilities.",
    image: conferenceHq,
    featured: true,
    tags: ["Portugal", "Cultivation", "EU GMP", "Industry"],
    author: "Healing Buds Portugal",
    date: "Dec 18, 2024",
    region: 'PT',
    content: [
      "Portugal's combination of optimal growing conditions and supportive regulatory framework has established the country as Europe's premier destination for medical cannabis cultivation. Multiple EU GMP certified facilities now operate across the Alentejo and Algarve regions.",
      "The Portuguese government's INFARMED licensing process, while rigorous, provides clear pathways for cultivation and manufacturing operations. This regulatory certainty has attracted significant international investment from companies seeking reliable European production bases.",
      "Climate advantages cannot be overstated. Year-round sunshine, mild temperatures, and low humidity create ideal conditions for both greenhouse and outdoor cultivation. Energy costs for indoor operations remain competitive due to abundant solar resources.",
      "Export capabilities have expanded dramatically, with Portuguese-grown medical cannabis now reaching patients across Germany, the UK, and other European markets. The country's position within the EU simplifies logistics and regulatory compliance for cross-border distribution.",
      "Industry associations project continued growth, with cultivation acreage expected to double by 2026. The sector now employs over 3,000 people directly, with significant multiplier effects in supporting industries from packaging to laboratory services."
    ],
  },
  {
    id: "portugal-medical-cannabis-patient-access",
    category: "Healthcare",
    title: "Portuguese Healthcare System Expands Medical Cannabis Access",
    description: "New guidelines from INFARMED streamline prescription processes, enabling more physicians to prescribe cannabis-based medicines for qualifying conditions.",
    image: researchLab,
    featured: false,
    tags: ["Portugal", "Healthcare", "Access", "INFARMED"],
    author: "Healing Buds Portugal",
    date: "Dec 12, 2024",
    region: 'PT',
    content: [
      "INFARMED's updated guidelines represent a significant step forward for patient access in Portugal. The new framework clarifies qualifying conditions and simplifies the prescription process for physicians, removing previous ambiguities that had limited adoption.",
      "Chronic pain, multiple sclerosis, epilepsy, and chemotherapy-induced nausea remain primary indications. However, the updated guidelines also acknowledge emerging evidence for anxiety disorders and post-traumatic stress, opening pathways for patients with these conditions.",
      "Physician education programmes have accompanied the regulatory changes. Medical associations in Lisbon and Porto have hosted workshops attended by over 500 doctors in the past quarter, addressing both clinical applications and prescription procedures.",
      "Pharmacies across Portugal are increasingly stocking cannabis-based medicines, improving distribution beyond the major urban centres. Rural patients who previously faced significant access barriers now have more local options.",
      "Patient advocacy groups have welcomed the changes while noting that reimbursement remains limited. Campaigns for inclusion in the national health service formulary continue, with decisions expected in mid-2025."
    ],
  },
  {
    id: "portugal-cannabis-research-partnership",
    category: "Research",
    title: "University of Lisbon Partners with Industry for Cannabis Research",
    description: "Academic-industry collaboration aims to develop novel cannabis formulations and delivery methods, leveraging Portugal's research expertise.",
    image: awardHq,
    featured: false,
    tags: ["Portugal", "Research", "University", "Innovation"],
    author: "Healing Buds Portugal",
    date: "Dec 5, 2024",
    region: 'PT',
    content: [
      "The Faculty of Pharmacy at the University of Lisbon has announced a landmark partnership with leading cannabis cultivation companies to advance pharmaceutical research. The collaboration focuses on novel formulations, improved bioavailability, and standardized dosing.",
      "Research priorities include development of transdermal delivery systems, water-soluble cannabinoid formulations, and extended-release preparations. These innovations could significantly improve patient experience and therapeutic outcomes.",
      "The partnership provides student researchers with industry exposure while giving companies access to advanced analytical capabilities and academic rigour. Multiple PhD candidates are now working on cannabis-related dissertations.",
      "Funding combines private investment with EU research grants, creating a sustainable model for long-term studies. The programme has already produced several patent applications for novel delivery mechanisms.",
      "This academic-industry bridge positions Portugal as not just a cultivation hub but an innovation centre. The research outputs could influence cannabis pharmaceutical development globally."
    ],
  },
];

// South Africa-specific articles
const zaArticles: NewsArticle[] = [
  {
    id: "south-africa-cannabis-industry-growth",
    category: "SA News",
    title: "South Africa's Cannabis Industry Creates Thousands of New Jobs",
    description: "The rapidly growing cannabis sector is becoming a significant employer in rural areas, with cultivation and processing operations transforming local economies.",
    image: conferenceHq,
    featured: true,
    tags: ["South Africa", "Economy", "Employment", "Industry"],
    author: "Healing Buds South Africa",
    date: "Dec 19, 2024",
    region: 'ZA',
    content: [
      "South Africa's cannabis industry has emerged as a significant economic driver, particularly in rural areas where employment opportunities have historically been limited. Cultivation operations in the Eastern Cape and KwaZulu-Natal have created over 15,000 direct jobs in the past two years.",
      "The sector offers employment across skill levels, from agricultural workers to laboratory technicians, quality control specialists, and management positions. Training programmes are developing local expertise that will support long-term industry growth.",
      "Community benefit agreements ensure that cannabis operations contribute to local infrastructure, education, and healthcare. Some cultivation companies have built schools and clinics in their operating areas, creating lasting benefits beyond direct employment.",
      "Export opportunities continue to expand as South African products gain recognition for quality. EU GMP certified facilities are shipping to European markets, while African regional trade presents additional growth potential.",
      "Government projections suggest the cannabis industry could contribute R28 billion to GDP by 2028. This economic argument has strengthened support for continued regulatory development and industry expansion."
    ],
  },
  {
    id: "south-africa-traditional-knowledge-integration",
    category: "Culture",
    title: "Traditional Cannabis Knowledge Informs Modern Medical Applications",
    description: "Research initiatives are documenting indigenous cannabis use patterns, bridging ancestral wisdom with contemporary pharmaceutical development.",
    image: researchLab,
    featured: false,
    tags: ["South Africa", "Traditional Medicine", "Research", "Culture"],
    author: "Healing Buds South Africa",
    date: "Dec 14, 2024",
    region: 'ZA',
    content: [
      "South Africa's long history of cannabis use provides a unique knowledge base that is now informing modern medical research. Ethnobotanical studies are documenting traditional preparation methods, dosing practices, and therapeutic applications used by indigenous communities for generations.",
      "Researchers at the University of the Western Cape are conducting interviews with traditional healers, creating records that might otherwise be lost as elder practitioners age. This documentation serves both cultural preservation and scientific inquiry.",
      "Certain traditional preparations show particular promise for specific conditions. Researchers are investigating these leads while ensuring that intellectual property protections benefit the communities from which the knowledge originates.",
      "Benefit-sharing agreements are being developed to ensure that any commercialisation of traditionally-derived applications provides returns to source communities. These frameworks could serve as models for other countries with indigenous cannabis traditions.",
      "The integration of traditional knowledge with modern pharmacology represents a decolonisation of cannabis science, acknowledging that valuable insights existed long before contemporary research began."
    ],
  },
  {
    id: "south-africa-cannabis-regulatory-update",
    category: "Regulation",
    title: "South Africa Advances Cannabis Regulatory Framework",
    description: "SAHPRA's updated guidelines clarify licensing requirements for cultivation, manufacturing, and export, providing greater certainty for industry operators.",
    image: productionFacility,
    featured: false,
    tags: ["South Africa", "Regulation", "SAHPRA", "Policy"],
    author: "Healing Buds South Africa",
    date: "Dec 8, 2024",
    region: 'ZA',
    content: [
      "The South African Health Products Regulatory Authority (SAHPRA) has released comprehensive updated guidelines for the cannabis industry, addressing long-standing ambiguities that had created uncertainty for operators and investors.",
      "The new framework clarifies licensing categories, application requirements, and quality standards for cultivation, manufacturing, and distribution operations. Timeline expectations for license processing have also been specified, improving predictability.",
      "Export regulations receive particular attention, with detailed requirements for documentation, quality testing, and batch tracking. These standards align with international expectations, facilitating access to European and other premium markets.",
      "Small-scale cultivator provisions acknowledge the diversity of the South African industry, creating pathways for traditional farmers to participate in the legal market. These inclusive approaches balance commercial development with community equity.",
      "Industry associations have responded positively, noting that regulatory clarity will accelerate investment decisions. Several major projects that had been delayed pending regulatory confirmation are now moving forward."
    ],
  },
];

// Global/shared articles
const globalArticles: NewsArticle[] = [
  {
    id: "healing-buds-popcorn-partnership",
    category: "Company",
    title: "Healing Buds Global: How Popcorn Built the Blueprint for Compliant Cannabis Technology",
    description: "Healing Buds Global stands as the flagship implementation of Popcorn's comprehensive cannabis SaaS platform, demonstrating how white-label technology enables rapid market entry under EU GMP certification.",
    image: awardHq,
    featured: false,
    tags: ["Healing Buds", "Technology", "SaaS", "Global"],
    author: "Healing Buds Editorial",
    date: "Nov 28, 2024",
    region: 'ALL',
    content: [
      "Healing Buds Global represents the definitive proof of concept for Popcorn's end-to-end cannabis business platform. As a specialist agency in web and app development, payment processing, customer support infrastructure, white-labeling, and NFT franchising, Popcorn has created a turnkey solution that transforms how entrepreneurs enter the regulated cannabis market.",
      "The Healing Buds platform showcases every capability in the Popcorn stack: a fully responsive patient-facing website, integrated eligibility checking, secure payment processing compliant with cannabis industry regulations, and backend systems that connect directly to EU GMP certified supply chain.",
      "What makes this partnership significant is the replicability. Popcorn designed the Healing Buds infrastructure to be white-labeled, meaning any entrepreneur operating under the franchise framework can deploy an identical caliber platform customized to their brand within weeks, not years.",
      "The NFT franchising component is particularly innovative. Using blockchain technology, Popcorn has created a transparent system for managing franchise agreements, tracking royalties, and verifying compliance across the entire network of operators.",
      "For aspiring cannabis entrepreneurs, Healing Buds Global isn't just a medical cannabis provider—it's a template for what's possible when world-class technology meets proper regulatory framework."
    ],
  },
];

// Function to get articles based on region
export const getNewsArticlesByRegion = (countryCode: string): NewsArticle[] => {
  let regionArticles: NewsArticle[];
  
  switch (countryCode) {
    case 'GB':
      regionArticles = [...ukArticles, ...globalArticles];
      break;
    case 'PT':
      regionArticles = [...ptArticles, ...globalArticles];
      break;
    case 'ZA':
      regionArticles = [...zaArticles, ...globalArticles];
      break;
    default:
      // Default to UK articles for unsupported regions
      regionArticles = [...ukArticles, ...globalArticles];
  }
  
  return regionArticles;
};

// Default export for backward compatibility (uses UK articles)
export const newsArticles: NewsArticle[] = [...ukArticles, ...globalArticles];
