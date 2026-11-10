import { ArrowDown, ArrowDownToLine, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/shared";
import { getJob, getProject, jobs } from "@/lib/data";
import {
  clientContent,
  clientProcess,
  clientServices,
  defaultContent,
  employerContent,
} from "@/lib/portfolio-content";
import type { ProfileId } from "@/lib/profiles";

const label = "font-mono text-xs leading-relaxed tracking-[0.15em] uppercase text-muted-foreground";
const section = "scroll-mt-6 border-t border-border py-14 sm:py-20";
const heading = "text-3xl font-light tracking-tight sm:text-4xl";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground";
const textLink = `inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline ${focus}`;
const button = `inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80 ${focus}`;

function DiscussProject() {
  return (
    <Link href="/contact" className={button} data-track="contact_open" data-track-target="contact">
      Discuss your project <ArrowUpRight className="size-4" aria-hidden />
    </Link>
  );
}

export default function PortfolioHome({ profileId }: { profileId: ProfileId }) {
  const isClient = profileId === "client";
  const employer = profileId === "default" || isClient ? null : employerContent[profileId];
  const content = employer ?? (isClient ? clientContent : defaultContent);
  const experience = employer ? employer.jobs.map((slug) => getJob(slug)!) : jobs;
  const email = employer ? "job@luigigirke.com" : "contact@luigigirke.com";
  const resume = employer ? `/resumes/${profileId}.pdf` : null;

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-9 lg:px-14">
      <header id="intro" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-border py-3 sm:py-4">
        <Link href="/" className={`inline-flex min-h-11 items-center text-base font-semibold tracking-tight ${focus}`}>
          Luigi Girke
        </Link>
        <nav aria-label="On this page" className="flex flex-wrap gap-x-5 sm:gap-x-8">
          {isClient && <a className={textLink} href="#services">Services</a>}
          <a className={textLink} href="#projects">Work</a>
          <a className={textLink} href={isClient ? "#about" : "#jobs"}>{isClient ? "About" : "Experience"}</a>
          {employer ? (
            <a className={textLink} href="#connect">Contact</a>
          ) : (
            <Link className={textLink} href="/contact" data-track="contact_open" data-track-target="contact">Contact</Link>
          )}
        </nav>
      </header>

      <main>
        <section aria-labelledby="portfolio-headline" className="grid items-end gap-12 py-16 sm:py-22 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:gap-16 lg:py-28">
          <div>
            <p className={label}>Halifax, Nova Scotia</p>
            <h1 id="portfolio-headline" className="mt-5 max-w-[15ch] text-[clamp(2.65rem,6.5vw,5.45rem)] font-light leading-[1.02] tracking-[-0.055em] text-balance">
              {content.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {content.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              {resume ? (
                <a href={resume} download className={button} data-track="resume_download" data-track-target={profileId}>
                  Download résumé <ArrowDownToLine className="size-4" aria-hidden />
                </a>
              ) : isClient ? <DiscussProject /> : null}
              <a href="#projects" className={resume || isClient ? textLink : button}>
                View selected work <ArrowDown className="size-4" aria-hidden />
              </a>
              {!resume && !isClient && (
                <Link href="/contact" className={textLink} data-track="contact_open" data-track-target="contact">
                  Discuss your project <ArrowUpRight className="size-4" aria-hidden />
                </Link>
              )}
            </div>
          </div>

          <aside aria-label="Work highlight" className="relative overflow-hidden rounded-md border border-border bg-muted/45 px-5 pt-7 pb-6 sm:px-6">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(90deg,var(--border)_0px,var(--border)_1px,transparent_1px,transparent_10px)]" aria-hidden />
            <p className={label}>{content.feature.label}</p>
            <p className="mt-5 text-3xl font-light tracking-[-0.045em] sm:text-4xl">{content.feature.value}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{content.feature.description}</p>
            <Link
              href={`/project/${isClient ? "kristina-girke" : "rbc-analytics"}`}
              data-track="project_open"
              data-track-target={isClient ? "kristina-girke" : "rbc-analytics"}
              className={`mt-3 ${textLink}`}
            >
              Read case study <ArrowRight className="size-4" aria-hidden />
            </Link>
          </aside>
        </section>

        {isClient && (
          <section id="services" className={section} aria-labelledby="services-heading">
            <h2 id="services-heading" className={heading}>What I can build for you</h2>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {clientServices.map((service) => (
                <div key={service.title} className="rounded-md border border-border p-5 sm:p-6">
                  <h3 className="text-lg font-medium tracking-tight">{service.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="projects" className={section} aria-labelledby="projects-heading">
          <h2 id="projects-heading" className={heading}>Selected work</h2>
          <ul className="mt-7 divide-y divide-border border-y border-border">
            {content.projects.map((slug) => {
              const project = getProject(slug)!;
              const liveLabel = project.slug === "rbc-analytics" || project.slug === "etpzp-sms" ? "View demo" : "Visit site";

              return (
                <li key={slug} className="grid gap-x-8 gap-y-3 py-5 sm:grid-cols-[5rem_1fr_auto] sm:items-start sm:py-7">
                  <span className={`sm:pt-1.5 ${label}`}>{project.year}</span>
                  <div>
                    <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
                      <Link
                        href={`/project/${slug}`}
                        className={`inline-flex items-baseline gap-2 underline-offset-4 hover:underline ${focus}`}
                        data-track="project_open"
                        data-track-target={slug}
                      >
                        {project.title} <ArrowRight className="size-4 shrink-0 self-center text-muted-foreground" aria-hidden />
                      </Link>
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {content.evidence?.[slug] ?? project.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-4 sm:flex-col sm:items-end sm:gap-x-0">
                    {project.deployed && (
                      <a href={project.deployed} target="_blank" rel="noreferrer" className={textLink}
                        data-track="demo_open" data-track-target={slug}
                        aria-label={`${liveLabel} for ${project.title} (opens in a new tab)`}
                      >
                        {liveLabel} <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    )}
                    {project.github?.map((repo) => (
                      <a key={repo.url} href={repo.url} target="_blank" rel="noreferrer" className={textLink}
                        data-track="repository_open" data-track-target={slug}
                        aria-label={`${repo.label} for ${project.title} (opens in a new tab)`}
                      >
                        {repo.label} <ArrowUpRight className="size-4" aria-hidden />
                      </a>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {employer && (
          <section className={section} aria-labelledby="skills-heading">
            <h2 id="skills-heading" className={heading}>Skills and tools</h2>
            <dl className="mt-7 grid gap-3 sm:grid-cols-3">
              {employer.skills.map(({ title, tools }) => (
                <div key={title} className="rounded-md border border-border p-5 sm:p-6">
                  <dt className="font-medium">{title}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{tools}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {isClient ? (
          <>
            <section id="process" className={section} aria-labelledby="process-heading">
              <h2 id="process-heading" className={heading}>How we’ll work together</h2>
              <ol className="mt-7 grid gap-x-7 gap-y-6 sm:grid-cols-3">
                {clientProcess.map((step, index) => (
                  <li key={step.title} className="border-t border-border pt-5">
                    <p className={label}>0{index + 1}</p>
                    <h3 className="mt-3 text-lg font-medium tracking-tight">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section id="about" className={`${section} grid gap-5 sm:grid-cols-[1fr_2fr]`} aria-labelledby="about-heading">
              <h2 id="about-heading" className={heading}>About me</h2>
              <div className="max-w-xl space-y-4 leading-relaxed text-muted-foreground">
                <p>I’m Luigi Girke. I’m based in Halifax and have built websites and tools for agencies, a karting school, and teams at RBC Capital Markets.</p>
                <p>I care about the details you’ll notice after launch, like how easy it is to publish an update or whether a sign-up form makes sense on a phone.</p>
              </div>
            </section>
          </>
        ) : (
          <section id="jobs" className={section} aria-labelledby="jobs-heading">
            <h2 id="jobs-heading" className={heading}>Experience</h2>
            <ul className="mt-7 divide-y divide-border border-y border-border">
              {experience.map((job) => {
                const tailoredRbc = job.slug === "rbc" ? employer : null;
                return (
                  <li key={job.slug} className="grid gap-2 py-5 sm:grid-cols-[5rem_1fr] sm:gap-8 sm:py-7">
                    <span className={`sm:pt-1 ${label}`}>{job.year}</span>
                    <div>
                      <h3 className="text-lg font-medium tracking-tight">
                        <Link href={`/job/${job.slug}`} className={`inline-flex items-center gap-2 underline-offset-4 hover:underline ${focus}`}>
                          {job.company} <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{tailoredRbc?.roleAtRbc ?? job.role}</p>
                      <p className="mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">{tailoredRbc?.rbcSummary ?? job.subtitle}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 grid gap-2 sm:grid-cols-[5rem_1fr] sm:gap-8">
              <p className={`sm:pt-1 ${label}`}>Education</p>
              <p>Computer Science at Dalhousie University <span className="text-muted-foreground">· Expected 2029</span></p>
            </div>
          </section>
        )}

        <section id="connect" className={section} aria-labelledby="connect-heading">
          <h2 id="connect-heading" className={heading}>
            {isClient ? "What are you working on?" : "Get in touch"}
          </h2>
          {isClient ? (
            <>
              <p className="mt-4 mb-6 max-w-lg leading-relaxed text-muted-foreground">
                Tell me what you’d like to build or what’s taking up too much time. We can start there.
              </p>
              <DiscussProject />
            </>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-x-6">
              <a href={`mailto:${email}`} className={textLink} data-track="email_click" data-track-target={employer ? "careers-email" : "contact-email"}>
                {email} <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <a href="https://www.linkedin.com/in/luigigirke/" target="_blank" rel="noreferrer" className={textLink}>
                LinkedIn <ArrowUpRight className="size-4" aria-hidden />
              </a>
              <a href="https://github.com/devdogfish" target="_blank" rel="noreferrer" className={textLink} data-track="repository_open" data-track-target="github-profile">
                GitHub <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
