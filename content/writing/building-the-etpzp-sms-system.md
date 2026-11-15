---
title: Building an SMS system for my old high school
date: 2026-03-02
summary: How a final school project in Portugal turned into a Flash SMS system the staff still use for urgent announcements.
tags: Next.js, Docker, DevOps
---

My final project at ETPZP in Portugal was a system for sending Flash SMS messages to the whole staff. Flash messages show up on the screen straight away, which is what you want when something urgent happens.

## The problem

Announcements went out by phone calls and group chats. People missed them, and nobody could tell who had actually seen a message.

## What I built

A small web app where an administrator writes a message, picks a group, and sends it. It runs on the school's own server, so the staff phone numbers never leave the building.

- Messages can go to one person or to a whole group.
- Every send is logged, so there is a record of what went out and when.
- It is self-hosted and deployed with Docker.

## What I'd do again

Keep the first version small. The school needed one thing to work every time, and a short feature list made that possible. It is still in use, which is the best review I could ask for.
