// ABOUTME: Home page body: cover hero and "Latest files" rail side by side, then the recent-files list.
// ABOUTME: Renders the empty-state message when no file is published.

import HomeCover from "@/components/HomeCover";
import HomeRail from "@/components/HomeRail";
import RecentFiles from "@/components/RecentFiles";
import { HOME_LABELS } from "@/lib/homeLabels";
import styles from "./HomeFiles.module.css";

export default function HomeFiles({ selection, locale }) {
  const labels = HOME_LABELS[locale] || HOME_LABELS.en;
  const { cover, rail, recent } = selection;

  if (!cover) {
    return (
      <main className={styles.empty}>
        <p className={styles.emptyText}>{labels.empty}</p>
      </main>
    );
  }

  return (
    <main>
      <div className={styles.home}>
        <HomeCover doc={cover} locale={locale} />
        <HomeRail rail={rail} locale={locale} />
      </div>
      <RecentFiles docs={recent} locale={locale} />
    </main>
  );
}
