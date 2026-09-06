import type { ComponentType, SVGProps } from "react";
import {
  Cloud,
  Server,
  Network,
  Code2,
  BrainCircuit,
  Workflow,
  Database,
  ShieldCheck,
} from "lucide-react";

export const projects = [
  {
    title: "Family Media & Web Platform",
    subtitle: "Self-hosted family travel platform",
    description: "A self-hosted family travel/scrapbook site deployed through a CI/CD pipeline with collaborative development.",
    problem: "Needed a private, self-hosted platform for family to share travel stories and photos without relying on third-party services.",
    whatJJDid: "Built a custom WordPress multisite with nested \"sub-adventures\" content feature. Set up a GitHub → Coolify → Cloudflare Tunnel deployment pipeline. Collaborated with a second developer using shared GitHub workflows. Generated custom branding assets using ComfyUI.",
    result: "A fully self-hosted, publicly accessible family platform with custom branding, deployed via automated pipeline.",
    techStack: ["WordPress Multisite", "Coolify", "Cloudflare", "ComfyUI"],
    liveUrl: "https://adventures.jewellcore.com",
    githubUrl: "https://github.com/Jjjewell1/family-media",
    featured: true,
  },
  {
    title: "Home Lab Infrastructure",
    subtitle: "Unraid server 'Venus'",
    description: "Complete home lab server running containerized services on Unraid with ZFS storage.",
    problem: "Needed a centralized, reliable self-hosted infrastructure for family services, media, and productivity tools.",
    whatJJDid: "Administer an Unraid server hosting Coolify, Homepage dashboard, Nextcloud, and multiple containerized services on a ZFS storage pool. Diagnosed and resolved Docker named-volume caching issues. Troubleshot KVM/libvirt VM startup failures tied to loop-device conflicts.",
    result: "A stable, high-uptime home lab hosting 10+ services with secure public access via Cloudflare Tunnels.",
    techStack: ["Unraid", "Docker", "ZFS", "KVM/QEMU", "Cloudflare Tunnels"],
    featured: true,
  },
  {
    title: "Local AI Development Environment",
    subtitle: "Private LLM-powered coding workflow",
    description: "Local LLM hosting and AI-assisted coding workflow on a Windows workstation.",
    problem: "Wanted to leverage local AI models for coding assistance without sending code to external cloud services.",
    whatJJDid: "Configured Ollama on a Windows workstation (RTX 4060, 8GB VRAM) for local model inference. Diagnosed and fixed Cline tool-call failures caused by context window limits. Evaluated and integrated OpenCode as a CLI-based coding agent.",
    result: "A fully functional local AI development stack enabling private, fast AI-assisted coding.",
    techStack: ["Ollama", "NVIDIA RTX 4060", "Cline", "OpenCode", "VS Code"],
    featured: true,
  },
  {
    title: "Caregiver Support Tools",
    subtitle: "Mobile-first wellness tools",
    description: "Responsive wellness scheduling and medication tracking tools.",
    problem: "Needed responsive, mobile-friendly tools for daily care tasks that work across different devices.",
    whatJJDid: "Designed a mobile-friendly wellness schedule using fluid CSS Grid. Built an interactive medication-logging tool with per-dose checkboxes, timestamps, CSV export, and countdown timer with audio and haptic alerts.",
    result: "Practical, responsive tools that work seamlessly on phones, tablets, and desktops.",
    techStack: ["HTML", "CSS Grid", "JavaScript", "PWA"],
    featured: false,
  },
  {
    title: "WordPress Client Sites",
    subtitle: "Freelance web development",
    description: "Professional WordPress development with Elementor, ACF, and custom post types.",
    problem: "Clients needed professional, responsive websites with easy content management.",
    whatJJDid: "Develop and maintain WordPress sites using Elementor, Advanced Custom Fields, and custom post types. Manage hosting environments, plugin configuration, backups, DNS, and performance optimization.",
    result: "Multiple successful client websites with ongoing maintenance and support since 2021.",
    techStack: ["WordPress", "Elementor", "ACF", "PHP", "MySQL"],
    liveUrl: "https://jewellcore.com",
    featured: false,
  },
];

export const certifications = [
  { name: "CompTIA A+", issuer: "CompTIA", status: "in-progress", progress: 30 },
  { name: "CompTIA Network+", issuer: "CompTIA", status: "planned", progress: 10 },
  { name: "CompTIA Security+", issuer: "CompTIA", status: "planned", progress: 10 },
  { name: "Linux+", issuer: "CompTIA", status: "planned", progress: 5 },
  { name: "Azure Fundamentals (AZ-900)", issuer: "Microsoft", status: "planned", progress: 5 },
  { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", status: "planned", progress: 5 },
];

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const skillCategories: {
  title: string;
  color: string;
  icon: IconComponent;
  skills: string[];
}[] = [
  {
    title: "Cloud & Virtualization",
    color: "#8b5cf6",
    icon: Cloud,
    skills: ["Docker", "Docker Compose", "Portainer", "Coolify", "KVM/QEMU", "Unraid"],
  },
  {
    title: "Systems Administration",
    color: "#3b82f6",
    icon: Server,
    skills: ["Unraid", "Self-Hosted Apps", "Web Hosting", "Windows Admin", "Linux Admin", "Log Analysis"],
  },
  {
    title: "Networking",
    color: "#22d3ee",
    icon: Network,
    skills: ["TCP/IP", "Container Networking", "Docker Net Config", "DNS", "Cloudflare Tunnels"],
  },
  {
    title: "Software & Web",
    color: "#ec4899",
    icon: Code2,
    skills: ["WordPress", "Elementor", "ACF", "HTML/CSS", "PHP", "Next.js"],
  },
  {
    title: "AI & Automation Tools",
    color: "#a855f7",
    icon: BrainCircuit,
    skills: ["Ollama (Local LLM)", "AI-Assisted Dev", "ComfyUI", "OpenCode CLI"],
  },
  {
    title: "Scripting & DevOps",
    color: "#10b981",
    icon: Workflow,
    skills: ["YAML Config", "Git", "GitHub Workflows", "CI/CD Pipelines"],
  },
  {
    title: "Databases",
    color: "#06b6d4",
    icon: Database,
    skills: ["MySQL/MariaDB", "PostgreSQL", "Database Troubleshooting"],
  },
  {
    title: "Cybersecurity",
    color: "#f59e0b",
    icon: ShieldCheck,
    skills: ["Network Security", "Access Control", "CompTIA A+ (Studying)", "SIEM Concepts"],
  },
];

export const experiences = [
  {
    company: "Self-Employed",
    role: "Freelance Web Developer",
    startDate: "2021",
    endDate: "Present",
    description: "Consult with clients to build and maintain responsive WordPress websites. Manage hosting environments, DNS, backups, and ongoing server troubleshooting.",
    tags: ["WordPress", "Elementor", "ACF", "PHP", "MySQL", "DNS"],
  },
  {
    company: "Self-Employed",
    role: "Landscaping Business Owner",
    startDate: "2010",
    endDate: "2021",
    description: "Managed daily operations, crews, budgeting, scheduling, and equipment purchasing for an independent business. Over a decade of leadership, budgeting, and customer-facing experience.",
    tags: ["Leadership", "Budgeting", "Customer Relations", "Operations"],
  },
];

export const education = {
  institution: "Southwest Virginia Community College",
  degrees: [
    { name: "Associate — Information Systems Technology", field: "Information Systems Technology" },
    { name: "Associate — Cyber Security", field: "Cyber Security" },
  ],
  status: "In Progress",
};

export const stats = [
  { number: "11+", label: "Years Leadership", sublabel: "Business Operations" },
  { number: "30+", label: "Technical Skills", sublabel: "Across 8 Categories" },
  { number: "5", label: "Projects Built", sublabel: "Self-Hosted & Deployed" },
  { number: "6", label: "Certifications", sublabel: "In Progress / Planned" },
];

export const learningTopics = [
  "Python",
  "Linux Administration",
  "Network Security",
  "Digital Forensics",
  "SIEM Concepts",
  "Cloud Technologies",
  "Cybersecurity",
  "Active Directory",
];

export const contactInfo = {
  email: "jj@jewellcore.com",
  github: "github.com/Jjjewell1",
  linkedin: "linkedin.com/in/jjewell",
  location: "Richlands, Virginia",
};

export const heroContent = {
  title: "Jeffrey JJ Jewell",
  subtitle: "IT Professional & Cybersecurity Student",
  tagline: "Self-Hosted Infrastructure & Automation",
  location: "Richlands, Virginia",
  description: "Designing, deploying, and troubleshooting self-hosted infrastructure spanning containerized services, virtualization, CI/CD pipelines, and local AI tooling. Former business owner bringing over a decade of leadership to a technical career.",
};