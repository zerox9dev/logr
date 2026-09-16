"use client";

import { useState, type ReactNode } from "react";

/** Jira's avatar URLs need the server's OAuth token, so they are always loaded
 *  through the proxy route rather than hit directly from the browser. */
export function jiraAvatarSrc(url: string): string {
  return `/api/jira/avatar?url=${encodeURIComponent(url)}`;
}

/** Project avatar pulled from Jira. Falls back to `fallback` when there is no
 *  avatar or the image fails, so a row never collapses around a broken image. */
export function JiraAvatar({
  url,
  alt,
  className = "size-4",
  fallback = null,
}: {
  url: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) return <>{fallback}</>;
  return (
    // next/image is not usable here: it would fetch through the optimizer,
    // which carries no session cookie to the authenticated proxy route.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={jiraAvatarSrc(url)}
      alt={alt}
      width={24}
      height={24}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-[3px] object-cover ${className}`}
    />
  );
}
