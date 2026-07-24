import { createRecipe } from "../shared/recipe";

/**
 * Style recipe for the Text component. Pass fully resolved values; the
 * component derives `weight` and `family` defaults from `size` before calling
 * the recipe.
 */
export const textClasses = createRecipe({
  base: "gs-text m-gs-0 tracking-gs-normal [&:where(p,h1,h2,h3,h4,h5,h6,div,li,label,figcaption)]:block [&:where(:lang(zh),:lang(ja),:lang(ko),[data-cjk=true])]:tracking-gs-cjk [&:where(:lang(zh),:lang(ja),:lang(ko),[data-cjk=true])]:leading-gs-relaxed",
  variants: {
    size: {
      "2xs": "text-gs-2xs leading-gs-body",
      xs: "text-gs-xs leading-gs-body",
      sm: "text-gs-sm leading-gs-body",
      md: "text-gs-md leading-gs-body",
      lg: "text-gs-lg leading-gs-body",
      xl: "text-gs-xl leading-gs-normal",
      "2xl": "text-gs-2xl leading-gs-normal",
      "3xl": "text-gs-3xl leading-gs-normal tracking-gs-normal",
      "4xl": "text-gs-4xl leading-gs-normal tracking-gs-normal",
    },
    weight: {
      light: "font-gs-light",
      regular: "font-gs-regular",
      medium: "font-gs-medium",
    },
    tone: {
      default: "text-gs-text",
      muted: "text-gs-text-secondary",
      accent: "text-gs-text-accent",
      success: "text-gs-success",
      warning: "text-gs-warning",
      error: "text-gs-error",
    },
    align: {
      start: "text-start",
      center: "text-center",
      end: "text-end",
      justify: "text-justify",
    },
    family: {
      sans: "font-gs-sans",
      serif: "font-gs-serif",
      mono: "font-gs-mono [font-variant-ligatures:none]",
    },
    truncate: {
      true: "block max-w-full truncate",
    },
    lines: {
      1: "max-w-full line-clamp-1",
      2: "max-w-full line-clamp-2",
      3: "max-w-full line-clamp-3",
      4: "max-w-full line-clamp-4",
      5: "max-w-full line-clamp-5",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});
