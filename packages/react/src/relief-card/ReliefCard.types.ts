import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import type { PolymorphicProps } from "../shared/polymorphic";

export type ReliefCardAnimationPreset = "reveal" | "drift" | "pulse" | "none";

export interface ReliefCardAnimationOptions {
  /** Animation behavior. Default: `reveal`. */
  preset?: ReliefCardAnimationPreset;
  /** Duration in milliseconds. */
  duration?: number;
  /** Delay in milliseconds. Default: `0`. */
  delay?: number;
  /** CSS timing function. */
  easing?: CSSProperties["animationTimingFunction"];
}

export interface ReliefCardTextureOptions {
  /** CSS mask image, such as `url(...)`, a gradient, or `image-set(...)`. */
  source: string;
  /** CSS mask size. Defaults to the ReliefCard texture token. */
  size?: CSSProperties["maskSize"];
  /** CSS mask position. Default: `100% 100%`. */
  position?: CSSProperties["maskPosition"];
  /** CSS mask repeat. Default: `no-repeat`. */
  repeat?: CSSProperties["maskRepeat"];
}

export type ReliefCardTexture =
  | string
  | ReliefCardTextureOptions
  | ReactElement
  | false;

export type ReliefCardProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  children?: ReactNode;
  /** Texture animation preset or detailed animation options. */
  animation?: ReliefCardAnimationPreset | ReliefCardAnimationOptions;
  /** Custom mask source, mask options, React texture layer, or `false`. */
  texture?: ReliefCardTexture;
};

/** Semantic heading element defaults to `h2`. */
export type ReliefCardTitleOwnProps = object;

export type ReliefCardTitleProps<TElement extends ElementType = "h2"> =
  PolymorphicProps<TElement, ReliefCardTitleOwnProps>;

export interface ReliefCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

export interface ReliefCardActionProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
