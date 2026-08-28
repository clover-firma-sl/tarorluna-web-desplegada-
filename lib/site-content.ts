import { BriefcaseBusiness, Coins, Heart, House, Sparkles } from "lucide-react";

export const categories = {
  amor: { title: "Consultas de Amor", eyebrow: "Sentimientos y relaciones", description: "Una lectura personal para comprender tu situación sentimental con calma, claridad y total confidencialidad.", icon: Heart, topics: ["Situación de pareja", "Distanciamiento", "Rupturas y reconciliación", "Dudas sentimentales"] },
  trabajo: { title: "Consultas de Trabajo", eyebrow: "Decisiones profesionales", description: "Orientación para momentos de cambio, nuevas oportunidades o decisiones importantes en tu vida laboral.", icon: BriefcaseBusiness, topics: ["Cambios de empleo", "Nuevas oportunidades", "Conflictos laborales", "Proyectos profesionales"] },
  economia: { title: "Consultas de Economía", eyebrow: "Claridad en tus decisiones", description: "Una visión orientativa para entender bloqueos y valorar con perspectiva tus próximos pasos económicos.", icon: Coins, topics: ["Etapas de cambio", "Decisiones económicas", "Proyectos personales", "Perspectivas de futuro"] },
  familia: { title: "Consultas de Familia", eyebrow: "Vínculos y convivencia", description: "Lecturas enfocadas en relaciones familiares, comunicación y situaciones que necesitan una mirada más serena.", icon: House, topics: ["Relaciones familiares", "Conflictos y comunicación", "Cambios en el hogar", "Preocupaciones familiares"] },
  general: { title: "Consulta General", eyebrow: "Una visión completa", description: "Explora distintas áreas de tu vida en una consulta amplia y personalizada realizada directamente por Tarot Luna.", icon: Sparkles, topics: ["Amor", "Trabajo", "Economía", "Familia"] },
} as const;

export type CategoryKey = keyof typeof categories;
export const navigation = [
  { label: "Inicio", href: "/" }, { label: "Quiénes somos", href: "/quienes-somos" },
  { label: "Amor", href: "/amor" }, { label: "Trabajo", href: "/trabajo" },
  { label: "Economía", href: "/economia" }, { label: "Familia", href: "/familia" },
  { label: "General", href: "/general" }, { label: "Redes", href: "/redes-sociales" }, { label: "Reservar", href: "/reservar" },
] as const;

