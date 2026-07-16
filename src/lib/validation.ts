import { z } from "zod";

/** First human-readable issue from a failed parse, for surfacing to the user. */
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}

/**
 * Parse a value with a schema, returning a discriminated result so callers can
 * surface a friendly message instead of throwing.
 */
export function parse<T>(
  schema: z.ZodType<T>,
  value: unknown
): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: firstError(result.error) };
}

const FISH_TYPES = [
  "sardine",
  "tuna",
  "mackerel",
  "salmon",
  "anchovy",
  "trout",
  "herring",
  "cod",
  "mussel",
  "oyster",
  "clam",
  "squid",
  "other",
] as const;

const SALT_LEVELS = ["salted", "low_sodium", "no_salt"] as const;

const score = z.coerce
  .number({ message: "Scores must be numbers." })
  .int("Scores must be whole numbers.")
  .min(1, "Scores must be between 1 and 10.")
  .max(10, "Scores must be between 1 and 10.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .optional()
    .transform((v) => (v ? v : null));

// ---- Auth ----

/**
 * Username / display name rules — shared by sign-up and the change-username
 * flow so they can never drift apart. Keep in sync with the DB unique index.
 */
export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(30, "Username must be 30 characters or fewer.")
  .regex(
    /^[A-Za-z0-9_ ]+$/,
    "Letters, numbers, spaces, and underscores only."
  );

/** Password minimum, shared by sign-up and the recovery-reset flow. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.");

export const signupSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: passwordSchema,
  name: usernameSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const resetSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

// ---- Fish (admin) ----
export const fishSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(300),
  brand: z.string().trim().min(1, "Brand is required.").max(200),
  fish_type: z.enum(FISH_TYPES, { message: "Choose a fish type." }),
  price_usd: z.coerce
    .number({ message: "Price must be a number." })
    .positive("Price must be greater than 0."),
  weight_g: z.coerce
    .number({ message: "Weight must be a number." })
    .positive("Weight must be greater than 0."),
  calories: z.coerce
    .number({ message: "Calories must be a number." })
    .min(0, "Calories can't be negative."),
  protein_g: z.coerce
    .number({ message: "Protein must be a number." })
    .min(0, "Protein can't be negative."),
  fat_g: z.coerce.number().min(0).nullish(),
  sodium_mg: z.coerce.number().min(0).nullish(),
  salt_level: z.enum(SALT_LEVELS).default("salted"),
  description: optionalText(2000),
  sourcing_notes: optionalText(500),
});

// ---- Review ----
export const reviewSchema = z.object({
  fish_id: z.string().uuid("Invalid fish."),
  flavor_score: score,
  texture_score: score,
  value_score: score,
  overall_score: score,
  notes: optionalText(4000),
});

// ---- Feedback ----
export const feedbackSchema = z.object({
  type: z.enum(["bug", "feature"], {
    message: "Choose bug or feature request.",
  }),
  message: z
    .string()
    .trim()
    .min(1, "Feedback message is required.")
    .max(4000, "Feedback must be 4,000 characters or fewer."),
  page_url: optionalText(2000),
});

// ---- Tasting ----
export const createTastingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Please give your tasting a name.")
    .max(200, "Title is too long."),
  visibility: z.enum(["public", "private"]).default("private"),
  fish_ids: z
    .array(z.string().uuid())
    .min(2, "Pick at least two fish for the tasting.")
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Each fish can only be added once.",
    }),
});

export const eventCodeSchema = z.object({
  code: z.string().trim().min(1, "Enter an event code.").max(20),
});

const nullableScore = score.nullish();

export const blindResponseSchema = z.object({
  blind_number: z.number().int().positive(),
  flavor_score: nullableScore,
  texture_score: nullableScore,
  overall_score: nullableScore,
  notes: z.string().max(4000).nullish(),
  review_text: z.string().max(4000).nullish(),
});

export const guessSchema = z.object({
  blind_number: z.number().int().positive(),
  guess_primary: z.string().uuid().nullish(),
  guess_alternate: z.string().uuid().nullish(),
});

export const uuidSchema = z.string().uuid("Invalid id.");
