"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Award, Clock } from "lucide-react";

import { certifications } from "../lib/data";
import { skillCategories } from "../lib/data";

export function StationCertifications() {
  return (
    <section id="certifications" className="py-24 px-6 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            Certifications & <span className="gradient-text">growth</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Pursuing industry-recognized certifications to validate my expertise.
          </p>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {/* Certifications column */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {certifications.map((cert) => (
              <motion.div
                key={cert.name}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div
                  className="card-glow h-full rounded-xl border border-border/50 bg-card/30 p-5 hover:border-border hover:bg-card/60 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <Award className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cert.status === "in-progress" ? (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          In Progress
                        </span>
                      ) : (
                        "Planned"
                      )}
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold mb-1">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground/60 mb-4">{cert.issuer}</p>
                  <div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cert.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full gradient-bg rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Skills column */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {skillCategories.map((category) => (
              <motion.div
                key={category.title}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div
                  className="card-glow h-full rounded-xl border border-border/50 bg-card/30 p-6 hover:border-border hover:bg-card/60 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 rounded-lg bg-muted/50 group-hover:gradient-bg transition-all duration-300">
                      <category.icon className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase">{category.title}</h3>
                  </div>
                  <div className="space-y-2">
                    {category.skills.map((skill) => (
                      <div
                        key={skill}
                        className="flex items-center gap-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors"
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}