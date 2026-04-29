/**
 * Author profiles for blog posts — centralized so byline, schema, and author
 * links stay in sync across every post.
 *
 * To add a new author: add an entry keyed by the string used in frontmatter
 * `author:` field, then reference them by that key. `default` is the fallback
 * when a post specifies an unknown author string.
 *
 * E-E-A-T note: finance content is YMYL (Your Money, Your Life), where Google
 * weighs Experience / Expertise / Authoritativeness / Trustworthiness 2-3x
 * heavier than on other verticals. A real Person author with a bio, credentials,
 * and linked profiles (sameAs) meaningfully improves rankings on this content.
 * Prefer a real founder/editor over "Profit Builders" (Organization) as the
 * primary author once you're comfortable doing so.
 */

export type AuthorProfile = {
  /** Display name on byline */
  name: string
  /** One-line role shown under the name */
  role: string
  /** Avatar/photo URL (square, ideally 400x400+). Leave blank to use monogram fallback */
  image?: string
  /** Optional deep-dive bio for the bottom-of-post author card */
  bio?: string
  /** Link to /about or author page */
  url?: string
  /** External profiles for schema.org sameAs — drives E-E-A-T */
  sameAs?: string[]
}

export const AUTHORS: Record<string, AuthorProfile> = {
  // Default author used when frontmatter specifies "Profit Builders" or an
  // unknown value. Edit this to switch to a real person across every post
  // at once — no per-post updates needed.
  default: {
    name: "Profit Builders",
    role: "Institutional flow analysis",
    image: "/images/pb-monogram.png",
    bio:
      "Profit Builders is an institutional options flow scanner built on the live OPRA tape. Our posts are written by the team that operates the scanner daily, applying CBOE-compliant sweep detection and OPRA condition-code parsing.",
    url: "/about",
    sameAs: ["https://x.com/ProfitBldrs"],
  },

  // Add a real founder entry here and reference it from frontmatter
  // (author: "ralph") to switch specific posts to a person byline.
  // Example scaffold — edit name/role/image/bio when you're ready:
  //
  // ralph: {
  //   name: "Ralph Linson",
  //   role: "Founder, Profit Builders",
  //   image: "/images/authors/ralph.jpg",
  //   bio: "Ralph built the Profit Builders scanner after 10 years trading options flow. Every signal methodology on the platform is something he uses himself.",
  //   url: "/about",
  //   sameAs: [
  //     "https://x.com/your-handle",
  //     "https://linkedin.com/in/your-profile",
  //   ],
  // },
}

export function getAuthor(authorKey: string): AuthorProfile {
  // Frontmatter often contains a display name ("Profit Builders") rather
  // than a key — normalize to lookup key by lowercasing + stripping spaces.
  const normalized = authorKey.toLowerCase().replace(/\s+/g, "-")
  return AUTHORS[normalized] ?? AUTHORS[authorKey] ?? AUTHORS.default
}
