// Single source of truth for all site content. Components read from here —
// never hardcode phone, address, copy of services, etc.

export const site = {
  name: 'FortLink Soluções',
  shortName: 'FortLink',
  url: 'https://www.fortlinksolucoes.com.br',
  tagline: 'Conectando tecnologia, segurança e inovação para o crescimento do seu negócio.',
  description:
    'Hub de tecnologia em Foz do Iguaçu: infraestrutura de TI, redes corporativas, cabeamento estruturado, suporte técnico, CFTV, firewall e monitoramento NOC para empresas que não podem parar.',
  email: 'contato@fortlinksolucoes.com.br',
  whatsapp: '554574008279',
  whatsappDisplay: '(45) 7400-8279',
  address: {
    street: 'Rua Anapu, 67',
    zip: '85857-100',
    city: 'Foz do Iguaçu',
    state: 'PR',
  },
  year: 2026,
} as const;

export const whatsappLink = (text = 'Olá FortLink, gostaria de mais informações.') =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

export const nav = [
  { href: '/', label: 'Quem somos' },
  { href: '/servicos/', label: 'Serviços' },
  { href: '/contato/', label: 'Contato' },
] as const;

export type IconName =
  | 'network'
  | 'cable'
  | 'support'
  | 'datacenter'
  | 'cctv'
  | 'voip'
  | 'shield'
  | 'noc'
  | 'wifi';

export interface Service {
  slug: string;
  icon: IconName;
  title: string;
  summary: string;
  details: string[];
}

export const services: Service[] = [
  {
    slug: 'redes',
    icon: 'network',
    title: 'Infraestrutura de Redes',
    summary: 'Planejamento, implantação e gerenciamento completo da infraestrutura de rede da sua empresa.',
    details: ['Projeto lógico e físico', 'Switches e roteamento gerenciáveis', 'VLANs e segmentação', 'Documentação técnica'],
  },
  {
    slug: 'cabeamento',
    icon: 'cable',
    title: 'Cable Manager',
    summary: 'Organização profissional do cabeamento estruturado com documentação completa e ambiente otimizado.',
    details: ['Cabeamento estruturado Cat6/Cat6A', 'Organização de racks', 'Certificação de pontos', 'Identificação e mapeamento'],
  },
  {
    slug: 'suporte',
    icon: 'support',
    title: 'Suporte Técnico Remoto',
    summary: 'Atendimento rápido e especializado para resolver problemas sem interromper sua operação.',
    details: ['Help desk ágil', 'Acesso remoto seguro', 'Manutenção preventiva', 'Gestão de estações e servidores'],
  },
  {
    slug: 'datacenter',
    icon: 'datacenter',
    title: 'Instalação de Datacenters',
    summary: 'Implantação de ambientes corporativos com energia, refrigeração, cabeamento e segurança física.',
    details: ['Energia e nobreaks', 'Climatização', 'Racks e organização', 'Controle de acesso físico'],
  },
  {
    slug: 'cftv',
    icon: 'cctv',
    title: 'CFTV e Segurança',
    summary: 'Sistemas modernos de monitoramento com acesso remoto e gravação local ou em nuvem.',
    details: ['Câmeras IP de alta resolução', 'Acesso pelo celular', 'Gravação local ou em nuvem', 'Análise inteligente de vídeo'],
  },
  {
    slug: 'voip',
    icon: 'voip',
    title: 'Telefonia VoIP',
    summary: 'Comunicação corporativa moderna integrando voz, vídeo e dados com redução de custos.',
    details: ['PABX IP', 'Ramais remotos', 'URA e filas de atendimento', 'Redução na conta de telefonia'],
  },
  {
    slug: 'firewall',
    icon: 'shield',
    title: 'Segurança e Firewalls',
    summary: 'Proteção avançada da rede com VPN, controle de acesso e políticas personalizadas.',
    details: ['Firewall de nova geração', 'VPN site-to-site e client', 'Filtro de conteúdo', 'Políticas por usuário'],
  },
  {
    slug: 'noc',
    icon: 'noc',
    title: 'Monitoramento NOC',
    summary: 'Monitoramento contínuo da infraestrutura para identificar falhas antes de impactar sua empresa.',
    details: ['Monitoramento 24/7', 'Alertas proativos', 'Dashboards de disponibilidade', 'Relatórios periódicos'],
  },
  {
    slug: 'wifi',
    icon: 'wifi',
    title: 'Site Survey Wi-Fi',
    summary: 'Análise técnica e otimização da cobertura sem fio eliminando pontos cegos da rede.',
    details: ['Mapa de calor de sinal', 'Posicionamento de APs', 'Redes para visitantes', 'Roaming sem quedas'],
  },
];

export const highlights = ['Atendimento ágil', 'Monitoramento contínuo', 'Soluções empresariais', 'Equipe especializada'] as const;

export const about = {
  title: 'Tecnologia para sua empresa crescer sem interrupções.',
  paragraphs: [
    'Somos um Hub de Tecnologia com o objetivo de sustentar toda a operação tecnológica da sua empresa, para que você possa se concentrar no que realmente importa: o crescimento do seu negócio.',
    'Atuamos em infraestrutura de TI, suporte técnico, redes corporativas, cabeamento estruturado, monitoramento, locação de equipamentos e soluções tecnológicas personalizadas — de pequenas empresas a ambientes corporativos de alta demanda.',
    'Nosso compromisso vai além do suporte técnico: construímos parcerias sólidas, entendendo as necessidades de cada cliente para desenvolver soluções que aumentem a produtividade, reduzam riscos e garantam desempenho operacional.',
  ],
  mission: 'Oferecer soluções tecnológicas inteligentes que impulsionem o crescimento e a eficiência das empresas.',
  vision: 'Ser referência em soluções de tecnologia, reconhecida pela qualidade, inovação e confiança.',
};

export const values = [
  'Comprometimento',
  'Transparência',
  'Inovação',
  'Segurança',
  'Agilidade',
  'Excelência no atendimento',
  'Foco em resultados',
] as const;

export const differentials = [
  { title: 'Projetos únicos', text: 'Soluções personalizadas para cada necessidade tecnológica da sua empresa.' },
  { title: 'Equipe especializada', text: 'Profissionais certificados com experiência em ambientes corporativos de todos os portes.' },
  { title: 'Suporte contínuo', text: 'Monitoramento e atendimento para garantir que sua operação nunca pare.' },
] as const;

// Process steps (how we work) — used on home/services.
export const process = [
  { step: '01', title: 'Diagnóstico', text: 'Visita técnica e levantamento do ambiente atual, riscos e objetivos.' },
  { step: '02', title: 'Projeto', text: 'Proposta clara com escopo, cronograma e investimento.' },
  { step: '03', title: 'Implantação', text: 'Execução organizada, documentada e sem parar sua operação.' },
  { step: '04', title: 'Monitoramento', text: 'Acompanhamento contínuo e suporte para manter tudo rodando.' },
] as const;

// ---------------------------------------------------------------------------
// Conversion content (Alfa techniques — see docs/ALFA-TECNICAS.md).

/** Entry offer confirmed by the owner (2026-09-24). */
export const offer = {
  label: 'Diagnóstico gratuito',
  title: 'Seu diagnóstico de TI é por nossa conta.',
  emphasis: 'por nossa conta',
  text: 'Avaliamos a infraestrutura da sua empresa, apontamos os riscos e as prioridades — e você decide depois, sem compromisso.',
  cta: 'Agendar diagnóstico gratuito',
  whatsappText: 'Olá FortLink! Quero agendar meu diagnóstico gratuito de TI.',
} as const;

/** Pain → solution rows, written in the customer's own voice. `slug` links to a service. */
export const pains = [
  { text: 'A internet cai toda semana e ninguém sabe o porquê.', slug: 'redes' },
  { text: 'O rack virou um ninho de cabos.', slug: 'cabeamento' },
  { text: 'Cada problema no computador para a equipe por horas.', slug: 'suporte' },
  { text: 'Não sei quem está acessando a minha rede.', slug: 'firewall' },
  { text: 'Só descubro a falha quando o cliente reclama.', slug: 'noc' },
  { text: 'O Wi-Fi não pega na sala de reunião.', slug: 'wifi' },
  { text: 'Não vejo o que acontece na empresa quando não estou lá.', slug: 'cftv' },
  { text: 'A conta de telefone só aumenta.', slug: 'voip' },
  { text: 'O servidor fica num canto, sem energia nem refrigeração adequadas.', slug: 'datacenter' },
] as const;

export const painsHeading = {
  eyebrow: 'Sua TI não pode parar',
  title: 'Não é falta de sorte.',
  accent: 'É falta de estrutura.',
  lead: 'Situações que todo gestor já viveu — e o serviço que resolve cada uma delas.',
  closingLabel: 'Tudo isso com um só parceiro',
  closing: 'Uma operação que não para.',
} as const;

/** WhatsApp message pre-filled with the service name (Alfa: per-item CTA). */
export const serviceWhatsapp = (serviceTitle: string) =>
  whatsappLink(`Olá FortLink! Quero saber mais sobre ${serviceTitle}.`);
