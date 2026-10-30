// ABOUTME: Masthead person card for the about page: photo (or initial), name, role, type tag and short bio.
// ABOUTME: Field Manual styling; the Sanity accent color is not used as text so contrast stays AA on cream.

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
  bio,
  image,
  locale,
}) {
  const roleText = typeof role === "object" ? t(role, locale) : role;
  const bioText = typeof bio === "object" ? t(bio, locale) : bio;
  const typeLabel = TYPE_LABELS[agentType] || agentType || "";
  const modelText = typeof model === "object" ? t(model, locale) : model;
  const tag = modelText
    ? `${typeLabel} · ${modelText.toUpperCase()}`
    : typeLabel;

  return (
    <div className={styles.card}>
      <div className={styles.avatar}>
        {image ? (
          // alt repeats the adjacent name on purpose: the photo identifies the
          // person and tests find the avatar by it; the duplicate read is brief.
          <Image
            src={urlFor(image).width(240).height(240).url()}
            alt={name}
            width={240}
            height={240}
            className={styles.avatarImage}
          />
        ) : (
          <span className={styles.monogram} aria-hidden="true">
            {name?.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.role}>{roleText}</p>
        <p className={styles.tag}>{tag}</p>
        {bioText && <p className={styles.bio}>{bioText}</p>}
      </div>
    </div>
  );
}
