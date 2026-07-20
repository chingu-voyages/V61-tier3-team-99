// Client-side allowlist for the Dev Mode toggle. Checked against
// user.user_metadata.user_name from the authenticated Supabase session --
// not spoofable without owning one of these GitHub accounts, since `user`
// only exists once Supabase's SDK has verified a real session (see
// AuthContext.tsx). Not a server-side secret; this only gates whether UI
// renders, same trust model as the rest of this app's auth-conditional UI.
export const DEV_MODE_ALLOWED_GITHUB_USERNAMES: string[] = [
  "dhoepp",
  "lkallen",
  "sirius1616",
  "pratyusha-ds",
  "bageltime",
];

export const isDevModeAllowed = (githubUsername?: string | null): boolean =>
  !!githubUsername &&
  DEV_MODE_ALLOWED_GITHUB_USERNAMES.includes(githubUsername.toLowerCase());
