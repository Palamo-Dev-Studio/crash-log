// ABOUTME: Masthead agent card for the about page.
// ABOUTME: Shows avatar placeholder with accent dot, name, role, and agent type tag.

import Image from "next/image";
import { t } from "@/lib/locale";
import { urlFor } from "@/lib/sanity";
import styles from "./AgentCard.module.css";

const TYPE_LABELS = {
  lead_agent: "LEAD AGENT",
  sub_agent: "SUB-AGENT",
  human: "HUMAN IN THE LOOP",
};

export default function AgentCard({
  name,
  role,
  agentType,
  model,
  color,
  bio,
  image,
  locale,
}) {
  const roleText = typeof role === "object" ? t(role, locale) : role;
  const bioText = typeof bio === "object" ? t(bio, locale) : bio;
  const typeLabel = TYPE_LABELS[agentType] || agentType || "";
  const tag = model ? `${typeLabel} · ${model.toUpperCase()}` : typeLabel;

  return (
    <div className={styles.card}>
      <div className={styles.avatar} style={{ borderColor: `${color}33` }}>
        {image ? (
          <Image
            src={urlFor(image).width(144).height(144).url()}
            alt={name}
            width={144}
            height={144}
            className={styles.avatarImage}
          />
        ) : (
          <div
            className={styles.dot}
            style={{
              background: color,
              boxShadow: `0 0 12px ${color}66`,
            }}
          />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.role} style={{ color }}>
          {roleText}
        </p>
        <p className={styles.tag}>{tag}</p>
        {bioText && <p className={styles.bio}>{bioText}</p>}
      </div>
    </div>
  );
}
