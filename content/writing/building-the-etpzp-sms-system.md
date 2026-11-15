---
title: Building an SMS system for my old high school
date: 2026-03-02
summary: How a final school project in Portugal in 2024 and 2025 turned into a Flash SMS system for staff announcements.
tags: Next.js, Docker, DevOps
---

My final project at ETPZP in Portugal was a system for sending Flash SMS messages to the whole staff. Flash messages show up on the screen straight away, which is what you want when something urgent happens.

## The problem

Announcements went out by phone calls and group chats. People missed them, and nobody could tell who had actually seen a message.

## What I built

A small web app where an administrator writes a message, picks a group, and sends it. It runs on a computer at the school, and the SMS itself goes out through GatewayAPI, a third-party service that receives each recipient’s number.

- Messages can go to one person or to a whole group.
- Every send is logged, so there is a record of what went out and when.
- It is self-hosted and deployed with Docker.

## What I'd do again

Keep the first version small. The school needed one thing to work every time, and a short feature list made that possible. I can’t speak to how it is used there today, but the final report documents its installation at the school.
