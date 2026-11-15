'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { isAudienceProfile, profileHome, type ProfileId } from '@/lib/profiles';

const key = 'portfolio-audience';
const subscribe = () => () => {};
const defaultHome = () => '/';

function storedHome() {
  try {
    const profile = sessionStorage.getItem(key);
    return isAudienceProfile(profile) ? profileHome(profile) : '/';
  } catch {
    return '/';
  }
}

export function RememberAudience({ profile }: { profile: ProfileId }) {
  useEffect(() => {
    try {
      if (profile === 'default') sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, profile);
    } catch { /* Continue with default navigation when storage is unavailable. */ }
  }, [profile]);
  return null;
}

export function BackToWork({ children, className }: { children: React.ReactNode; className: string }) {
  const home = useSyncExternalStore(subscribe, storedHome, defaultHome);
  return <Link href={home + '#projects'} className={className}>{children}</Link>;
}
