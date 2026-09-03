"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronRight } from "lucide-react";
import { GithubIcon as Github } from "@/components/icons";
import { useState } from "react";

import { projects } from "../lib/data";

interface ProjectCardProps {
  project: typeof projects[0];
  expanded: boolean;
  onToggle: (index: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function StationProjects() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  return (
    <section id="projects" className="py-24 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Real projects, <span className="gradient-text">real results</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each project solves a real problem with a thoughtful technical approach.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-4"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              variants={itemVariants}
              className="group card-glow rounded-xl border border-border/50 bg-card/30 hover:border-border hover:bg-card/60 transition-all duration-300 overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedProject(expandedProject === index ? null : index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      {project.featured && (
                        <Badge variant="secondary" className="text-xs shrink-0">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground/60 mb-2">{project.subtitle}</p>
                    <p className="text-sm text-muted-foreground/80">{project.description}</p>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground/40 transition-transform duration-300 shrink-0 mt-1 ${
                      expandedProject === index ? "rotate-90" : ""
                    }`}
                  />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {expandedProject === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="border-t border-border/50 pt-5 space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan mb-2">Problem</h4>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">{project.problem}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan mb-2">What JJ Did</h4>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">{project.whatJJDid}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/30">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan mb-2">Result</h4>
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">{project.result}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg border border-background bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <Github className="h-4 w-4" />
                          Code
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg gradient-bg text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Live Demo
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}