import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useHighContrast } from "../hooks/useHighContrast";

type TeamMember = {
  initials: string;
  name: string;
  role: string;
  github: string;
  linkedin: string;
};

const teamMembers: TeamMember[] = [
  {
    initials: "AT",
    name: "Alex Thomas",
    role: "Scrum Master",
    github: "https://github.com/BagelTime",
    linkedin: "https://www.linkedin.com/in/ajt11176/",
  },
  {
    initials: "DH",
    name: "Dustin Hoeppner",
    role: "Web Developer",
    github: "https://github.com/dhoepp",
    linkedin: "https://www.linkedin.com/in/dustin-hoeppner/",
  },
  {
    initials: "JOE",
    name: "John Omokhagbon Ezekiel",
    role: "Web Developer",
    github: "https://github.com/Sirius1616",
    linkedin: "https://www.linkedin.com/in/john-ezekiel-dev/",
  },
  {
    initials: "LA",
    name: "Lindsay Allen",
    role: "Web Developer",
    github: "https://github.com/lkallen",
    linkedin: "https://www.linkedin.com/in/lindsay-allen-dev/",
  },
  {
    initials: "PD",
    name: "Pratyusha Dasari",
    role: "Web Developer",
    github: "https://github.com/pratyusha-ds",
    linkedin: "https://www.linkedin.com/in/pratyusha-ds/",
  },
];

const TeamPage = () => {
  const { isHighContrast } = useHighContrast();

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to Wordle-ish
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Meet the Team
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            The people behind Wordle-ish.
          </p>
        </div>

        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className={`flex items-center gap-4 rounded-3xl border p-5 transition-transform duration-200 hover:-translate-y-1 ${
                isHighContrast
                  ? "border-border bg-card shadow-sm"
                  : "border-border/60 bg-card/40 shadow-lg shadow-black/5 backdrop-blur-md backdrop-saturate-150 dark:shadow-black/40"
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-bold tracking-[0.2em] text-background">
                {member.initials}
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate text-lg font-semibold">
                  {member.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {member.role}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-xs font-semibold text-background transition-opacity hover:opacity-80"
                  >
                      <ExternalLink className="h-4 w-4" />
                    GitHub
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#0077b5] px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                  >
                      <ExternalLink className="h-4 w-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamPage;