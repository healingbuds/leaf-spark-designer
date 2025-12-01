import newsMarlonWayans from "@/assets/news-marlon-wayans.webp";
import newsNftMinting from "@/assets/news-nft-minting.jpg";
import newsRicardoCapone from "@/assets/news-ricardo-capone.jpg";
import newsMaxWhite from "@/assets/news-max-white.jpg";
import newsShaggyBrown from "@/assets/news-shaggy-brown.jpg";
import newsRicardoTech from "@/assets/news-ricardo-tech.jpg";
import conferenceHq from "@/assets/conference-hq.jpg";
import awardHq from "@/assets/award-hq.jpg";
import clinicPortugal from "@/assets/clinic-portugal.jpg";
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
}

export const newsArticles: NewsArticle[] = [
  {
    id: "healing-buds-budstacks-partnership",
    category: "Healing Buds",
    title: "Healing Buds Global: How Budstacks Built the Blueprint for Compliant Cannabis Technology",
    description: "Healing Buds Global stands as the flagship implementation of Budstacks' comprehensive cannabis SaaS platform, demonstrating how white-label technology enables rapid market entry under Dr. Green's EU GMP certification.",
    image: conferenceHq,
    featured: true,
    tags: ["Healing Buds", "Budstacks", "Technology", "SaaS"],
    author: "Healing Buds Editorial",
    date: "Nov 28, 2024",
    content: [
      "Healing Buds Global represents the definitive proof of concept for Budstacks' end-to-end cannabis business platform. As a specialist agency in web and app development, payment processing, customer support infrastructure, white-labeling, and NFT franchising, Budstacks has created a turnkey solution that transforms how entrepreneurs enter the regulated cannabis market.",
      "The Healing Buds platform showcases every capability in the Budstacks stack: a fully responsive patient-facing website, integrated eligibility checking, secure payment processing compliant with cannabis industry regulations, and backend systems that connect directly to Dr. Green's EU GMP certified supply chain.",
      "What makes this partnership significant is the replicability. Budstacks designed the Healing Buds infrastructure to be white-labeled, meaning any entrepreneur operating under the Dr. Green License framework can deploy an identical caliber platform customized to their brand within weeks, not years.",
      "Ricardo Capone, CTO of Dr. Green, stated: 'Budstacks solved the technology problem that has held back cannabis entrepreneurship for years. Before this, you needed millions in development costs just to build a compliant platform. Now that barrier is gone.'",
      "The NFT franchising component is particularly innovative. Using blockchain technology, Budstacks has created a transparent system for managing franchise agreements, tracking royalties, and verifying compliance across the entire network of operators working under the Dr. Green umbrella.",
      "For aspiring cannabis entrepreneurs, Healing Buds Global isn't just a medical cannabis provider—it's a template for what's possible when world-class technology meets proper regulatory framework."
    ],
  },
  {
    id: "university-competition-cannabis-innovation",
    category: "Healing Buds",
    title: "€500,000 University Competition: Healing Buds Invests in Tomorrow's Cannabis Industry Leaders",
    description: "A groundbreaking initiative offers students in Business, Computer Science, Marketing, Bio Science, Pharmaceutical Sciences, and Agricultural Technology the chance to win funding, equity, and guaranteed career pathways.",
    image: researchLab,
    featured: false,
    tags: ["Healing Buds", "University", "Innovation", "Funding", "Education"],
    author: "Healing Buds Editorial",
    date: "Nov 22, 2024",
    content: [
      "The cannabis industry faces a talent crisis. As legalization expands globally, companies struggle to find qualified professionals who understand both the science and the business of regulated cannabis. Healing Buds Global, in partnership with Dr. Green and Budstacks, is addressing this head-on with a €500,000 university competition designed to identify and develop the next generation of industry leaders.",
      "The competition welcomes students from diverse disciplines, recognizing that the cannabis industry needs more than just botanists. Business Studies students can tackle market expansion strategies. Computer Science students can improve blockchain traceability systems. Marketing students can develop compliant promotional frameworks. Bio Science and Pharmaceutical Sciences students can advance personalized medicine approaches. Agricultural Technology students can optimize sustainable cultivation methods.",
      "Winners receive more than prize money. The top performers earn equity shares in participating ventures within the Healing Buds and Dr. Green ecosystem, creating genuine ownership stakes in the industry they'll help build. Guaranteed internships and career pathways ensure that talented graduates have clear routes into meaningful roles.",
      "Dr. Jaspreet Patti, Medical Director at Dr. Green, emphasized the scientific imperative: 'Cannabis medicine is still in its early stages. We need fresh minds asking questions we haven't thought to ask. This competition isn't charity—it's strategic investment in the research and innovation that will define our industry's future.'",
      "The competition structure includes regional rounds across European universities, culminating in a final event at Dr. Green's Portuguese facilities where finalists present to industry leaders. Mentorship from Budstacks technologists, Healing Buds operators, and Dr. Green scientists supports participants throughout.",
      "Beyond the competition itself, this initiative signals a maturation of the cannabis industry. By engaging with traditional academic institutions, Healing Buds and its partners are building bridges between cannabis entrepreneurship and mainstream career paths—exactly the normalization that long-term industry success requires."
    ],
  },
  {
    id: "dr-green-franchise-opportunity-announcement",
    category: "Dr. Green",
    title: "Dr. Green License: The Franchise Model Democratizing Cannabis Entrepreneurship",
    description: "How Dr. Green's EU GMP certification creates a pathway for entrepreneurs to operate compliant cannabis businesses without million-dollar facility investments.",
    image: productionFacility,
    featured: false,
    tags: ["Dr. Green", "Franchise", "Healing Buds", "Business", "Compliance"],
    author: "Dr. Green",
    date: "Nov 18, 2024",
    content: [
      "Traditional cannabis entrepreneurship requires staggering capital—cultivation facilities, extraction labs, compliance teams, regulatory applications. Dr. Green has spent years and tens of millions building that infrastructure. Now, through its innovative franchise model, that investment becomes accessible to entrepreneurs who share the vision but lack the capital.",
      "The Dr. Green License framework operates on a simple principle: centralize the complexity, distribute the opportunity. Dr. Green maintains the EU GMP certified facilities, the regulatory relationships, the quality control systems, and the product development. Franchisees focus on their local markets, patient relationships, and business growth.",
      "Technology partner Budstacks provides the operational infrastructure. Every franchisee receives a fully-configured platform including patient management, order processing, compliance documentation, and direct integration with Dr. Green's supply chain. Healing Buds Global serves as the showcase implementation, demonstrating the platform's capabilities to prospective franchisees.",
      "Maximillian White, founder of Dr. Green, explained the philosophy: 'We could keep everything centralized and maximize our margins. But that's not how you change an industry. Real transformation comes from empowering thousands of entrepreneurs to serve their communities. Our success is their success.'",
      "Franchise packages accommodate various ambitions and capital levels. Entry-level dropshipping arrangements require minimal upfront investment. Mid-tier packages include branded storefronts and local marketing support. Enterprise packages enable multi-location operators to build regional cannabis businesses under the Dr. Green umbrella.",
      "The response has been overwhelming. Entrepreneurs across Portugal, the UK, and expanding European markets are applying for franchise positions, attracted by the combination of regulatory certainty, technology infrastructure, and the Dr. Green brand's growing recognition."
    ],
  },
  {
    id: "budstacks-white-label-cannabis-saas",
    category: "Technology",
    title: "Inside Budstacks: The SaaS Platform Powering Healing Buds and the Cannabis Franchise Revolution",
    description: "A deep dive into the technology agency's comprehensive platform for web development, payment processing, support systems, white-labeling, and NFT-based franchise management.",
    image: awardHq,
    featured: false,
    tags: ["Budstacks", "Technology", "Healing Buds", "SaaS", "NFT"],
    author: "Budstacks",
    date: "Nov 15, 2024",
    content: [
      "Budstacks emerged from a recognition that the cannabis industry's technology needs were fundamentally underserved. Entrepreneurs faced a brutal choice: spend millions on custom development or cobble together inadequate generic solutions. Budstacks built the third option—purpose-built cannabis SaaS that deploys in weeks and scales indefinitely.",
      "The platform encompasses every operational requirement. Web and mobile applications handle patient-facing interactions with compliant design patterns. Payment processing navigates the complex banking relationships that plague cannabis businesses. Customer support systems manage the high-touch communication that medical cannabis patients require. Backend integrations connect to supply chain, inventory, and compliance systems.",
      "White-labeling sits at the platform's core. Healing Buds Global runs on Budstacks infrastructure, but nothing in the patient experience reveals that. The same applies to any operator using the platform—they present their own brand while benefiting from enterprise-grade technology.",
      "The NFT franchising module represents Budstacks' most innovative contribution. Franchise agreements, revenue sharing arrangements, and compliance certifications are recorded on blockchain, creating transparent and auditable records that satisfy both business partners and regulators. This isn't cryptocurrency speculation—it's practical application of blockchain for business operations.",
      "For Dr. Green's franchise network, Budstacks provides the connective tissue. Every franchisee operates on compatible systems, enabling network-wide analytics, standardized compliance reporting, and seamless product distribution. The technology creates the consistency that makes franchise models work.",
      "Development continues rapidly. Upcoming releases include enhanced telemedicine integration, AI-powered patient matching for strain recommendations, and expanded payment options as banking relationships in the cannabis industry mature. Budstacks isn't just serving the current market—it's building for the industry's future."
    ],
  },
  {
    id: "marlon-wayans-dr-green",
    category: "Cannabis",
    title: "Marlon Wayans Discusses the Benefits of Blockchain in Medical Cannabis",
    description: "Actor and comedian Marlon Wayans shares his insights on how blockchain technology is revolutionizing transparency and traceability in the regulated medical cannabis industry.",
    image: newsMarlonWayans,
    featured: false,
    externalLink: "https://drgreennft.com/news/marlon-wayans-talks-selling-weed-on-the-blockchain-is-dr-green-legit-he-isnt-afraid-to-answer-the-tough-questions",
    tags: ["Cannabis", "Dr. Green", "Healing Buds", "Celebrity"],
    author: "Dr. Green",
    date: "Oct 15, 2024",
    content: [
      "Actor and comedian Marlon Wayans, famous for his roles in iconic films like Scary Movie, White Chicks, and the Wayans Bros, has transitioned his lifelong relationship with cannabis into a purposeful partnership with Dr. Green NFT.",
      "In a candid, no-holds-barred conversation, Wayans addresses the tough questions head-on. Is Dr. Green legitimate? How does blockchain actually work in cannabis? Why would a Hollywood star stake his reputation on this venture?",
      "Wayans' answers reflect genuine due diligence. He visited facilities, met the team, and examined the regulatory framework before committing. 'I've been offered a lot of cannabis deals,' he explained. 'Dr. Green was the first one where the people actually knew what they were talking about.'",
      "The partnership goes beyond endorsement. Wayans is actively involved in shaping how Dr. Green communicates with mainstream audiences, bringing entertainment industry expertise to an industry often hampered by its counter-culture image.",
      "For Dr. Green, celebrity partnerships like this serve a strategic purpose beyond marketing. They signal legitimacy to regulators, investors, and partners who might otherwise view cannabis ventures with skepticism. When Marlon Wayans puts his name on something, people pay attention.",
      "The blockchain component particularly intrigued Wayans. The ability to trace every product from seed to sale, with immutable records that satisfy both regulators and consumers, represents exactly the transparency the cannabis industry needs to mature."
    ],
  },
  {
    id: "unlocking-future-nft-minting",
    category: "Dr. Green",
    title: "Unlocking the Future: Next Steps After Minting Your NFT",
    description: "Minting your NFT is just the beginning of your journey into a revolutionary platform that combines blockchain technology with the medical cannabis industry.",
    image: newsNftMinting,
    featured: false,
    externalLink: "https://drgreennft.com/news/unlocking-the-future-next-steps-after-minting-your-nft",
    tags: ["Dr. Green", "NFT", "Healing Buds", "Blockchain"],
    author: "Dr. Green",
    date: "Sep 20, 2024",
    content: [
      "Minting your Digital Key NFT marks your entry into the Dr. Green ecosystem, but the real journey begins afterward. This guide walks new keyholders through the phases ahead and the opportunities each unlocks.",
      "The admin centre provides your operational hub. From here, keyholders access the dropshipping platform, track performance metrics, and manage their participation in the cannabis distribution network—all without ever handling cannabis products directly.",
      "Tiered access determines your capabilities. Standard Keys provide entry-level participation. Gold Keys unlock additional features and revenue opportunities. Platinum Keys offer maximum access including custom strain development and priority placement.",
      "Smart contracts handle the complex calculations automatically. As the network generates activity—patients onboarded, orders fulfilled, compliance verified—rewards distribute to keyholders based on transparent, auditable blockchain logic.",
      "Healing Buds Global demonstrates the ecosystem's full potential. By observing how this flagship operation leverages the platform, keyholders gain insights into maximizing their own participation and understanding the infrastructure their NFTs support.",
      "The roadmap extends well beyond current functionality. Upcoming phases introduce enhanced analytics, expanded geographic coverage, and deeper integration with the franchise network that partners like Scott are building across Portugal and beyond."
    ],
  },
  {
    id: "ricardo-capone-spotlight",
    category: "Dr. Green",
    title: "Sniper Spotlight with Ricardo Capone from Dr. Green Cannabis",
    description: "For the last five years, we've been involved heavily in the medical cannabis space in Portugal. We have facilities where we grow medical cannabis for distribution to institutions.",
    image: newsRicardoCapone,
    featured: false,
    externalLink: "https://drgreennft.com/news/sniper-spotlight-with-ricardo-capone-from-dr-green-canabis",
    tags: ["Dr. Green", "NFT", "Medical Cannabis", "Healing Buds", "Technology"],
    author: "Dr. Green",
    date: "Sep 9, 2024",
    content: [
      "Ricardo Capone's background spans VOIP systems, CRM development, networking infrastructure, and web design. As CTO of Dr. Green, he's channeled that diverse technical expertise into building the cannabis industry's most sophisticated technology stack.",
      "For five years, the team has operated cultivation facilities in Portugal, producing EU GMP certified medical cannabis for institutional distribution. But Capone's focus has always been on the technology that makes scaling possible.",
      "The biotechnology approach is particularly innovative. Patient DNA analysis identifies specific endocannabinoid system variations, enabling personalized strain recommendations rather than one-size-fits-all prescriptions. 'The problem is usually in the endocannabinoid system,' Capone explained. 'If we understand exactly where, we can target treatment precisely.'",
      "The strain library contains approximately 2,100 analyzed varieties across 50,000 seeds, with detailed nuclear and mitochondrial genetics for each. This database enables the personalization that distinguishes Dr. Green's medical approach.",
      "Platforms like Healing Buds Global represent the practical application of this research infrastructure. Patients accessing Healing Buds benefit from Capone's technology stack even if they never see the complexity behind their simple user interface.",
      "For Capone, the cannabis industry represents an opportunity to apply technology for genuine human benefit. 'We're not building apps that waste people's time. We're building systems that help sick people get better. That matters.'"
    ],
  },
  {
    id: "ricardo-capone-pioneering",
    category: "Dr. Green",
    title: "Ricardo Capone: Pioneering Technological Solutions in the Cannabis Industry",
    description: "How Dr. Green's CTO combines biotechnology, blockchain, and business systems to create the infrastructure for global cannabis compliance.",
    image: newsRicardoTech,
    featured: false,
    externalLink: "https://drgreennft.com/news/ricardo-capone-pioneering-technological-solutions-in-the-cannabis-industry",
    tags: ["Dr. Green", "Healing Buds", "Technology", "Biotechnology"],
    author: "Dr. Green",
    date: "Aug 28, 2024",
    content: [
      "The story of Dr. Green's technology leadership begins with adversity. When Maximillian White lost $39 million in the Cypriot banking collapse, he and Ricardo Capone transformed that setback into determination to build something meaningful in the cannabis industry.",
      "Capone's technology-first approach addresses the fragmentation that plagues cannabis businesses. Rather than bolting together separate systems for cultivation, compliance, distribution, and patient management, Dr. Green built integrated infrastructure from the ground up.",
      "Blockchain traceability ensures every product's journey is documented immutably. From seed genetics to cultivation conditions to processing and distribution, the chain of custody remains verifiable by regulators, partners, and patients.",
      "The plant genomics work feeds directly into product development. By understanding the precise chemical profiles that different genetics produce under various growing conditions, the team can cultivate specific cannabinoid and terpene combinations for targeted therapeutic applications.",
      "Healing Buds Global serves as the consumer-facing expression of this infrastructure. Patients experience a polished, supportive interface; behind it runs the sophisticated technology stack that Capone's team spent years developing.",
      "Looking ahead, Capone sees AI integration as the next frontier—systems that can recommend strains based on patient history, predict cultivation outcomes, and optimize supply chain logistics. The foundation is built; now it's about building higher."
    ],
  },
  {
    id: "maximillian-white-elon-musk-weed",
    category: "Dr. Green",
    title: "Maximillian White 'Elon Musk of weed' will legalise cannabis around the world",
    description: "Billionaire Maximillian White dubbed the 'Elon Musk of weed' vouches to legalise marijuana around the globe. The founder of Dr. Green aims to be the number-one supplier.",
    image: newsMaxWhite,
    featured: false,
    externalLink: "https://drgreennft.com/news/maximillian-white-elon-musk-of-weed-will-legalise-cannabis-around-the-world",
    tags: ["Cannabis", "Dr. Green", "Healing Buds", "Leadership"],
    author: "Dr. Green",
    date: "Aug 15, 2024",
    content: [
      "The 'Elon Musk of weed' comparison captures Maximillian White's approach: think bigger than anyone else, build the infrastructure others can't, and transform an entire industry in the process.",
      "White's vision extends beyond simply selling cannabis. He aims to change global policy by demonstrating that regulated, traceable, quality-controlled cannabis serves public health better than prohibition. Every successful patient outcome becomes evidence in that argument.",
      "The Dr. Green model—EU GMP certification, blockchain traceability, personalized medicine protocols—creates the template White believes regulators worldwide will eventually require. By building to the highest standards now, Dr. Green positions itself as the natural partner when new markets open.",
      "Franchise networks like Healing Buds Global and entrepreneurs like Scott with his Portugal operations extend White's reach without requiring centralized expansion. The infrastructure supports independent operators who share the commitment to compliance and quality.",
      "Celebrity partnerships with figures like Marlon Wayans bring mainstream attention that accelerates normalization. When respected public figures openly associate with cannabis ventures, the remaining stigma erodes faster.",
      "White remains focused on the long game. Global cannabis legalization may take decades, but the companies building serious infrastructure now will dominate when it arrives. Dr. Green intends to be ready."
    ],
  },
  {
    id: "shaggy-brown-joins-dr-green",
    category: "Dr. Green",
    title: "From Hollywood's 'Weed Man' to Regulatory Pioneer: Shaggy Brown Joins Dr Green",
    description: "From Hollywood's trusted 'weed man to the stars' to global cannabis pioneer, Shaggy Brown has spent 25+ years curating the highest-quality cannabis for icons like Tyson, Snoop, and DMX.",
    image: newsShaggyBrown,
    featured: false,
    externalLink: "https://drgreennft.com/news/from-hollywoods-weed-man-to-regulatory-pioneer-shaggy-brown-joins-forces-with-dr-green",
    tags: ["Dr. Green", "Healing Buds", "Cannabis Culture"],
    author: "Dr. Green",
    date: "Sep 16, 2024",
    content: [
      "Shaggy Brown's reputation precedes him. For over 25 years, he's been the trusted source for Hollywood's elite—Mike Tyson, Snoop Dogg, DMX, and countless others relied on his judgment when quality mattered most.",
      "That expertise now serves Dr. Green's mission. Brown's understanding of what distinguishes exceptional cannabis from merely adequate product informs quality standards across the operation. When Shaggy approves a strain, it means something.",
      "The transition from underground legend to regulatory pioneer reflects the industry's maturation. The same discernment that made Brown invaluable to celebrities now helps Dr. Green maintain the quality standards that EU GMP certification requires.",
      "For platforms like Healing Buds Global, Brown's involvement provides additional credibility. Patients can trust that the products they receive meet standards set by someone who's spent decades understanding what quality cannabis actually means.",
      "Brown sees blockchain traceability as the natural evolution of what he's always done—ensuring that people know exactly what they're getting. The technology simply formalizes the trust relationships he built through personal reputation.",
      "His network of relationships across the cannabis world opens doors that would otherwise remain closed. Cultivators, processors, and distributors who know Brown's reputation engage with Dr. Green because of that trusted connection."
    ],
  },
];
