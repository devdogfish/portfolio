'use client';
import { useEffect } from 'react';
export default function EntryCleanup() {
  useEffect(() => {
    if (/^\/r\/[^/]+\/?$/.test(window.location.pathname)) window.history.replaceState(window.history.state, '', '/');
  }, []);
  return null;
}
