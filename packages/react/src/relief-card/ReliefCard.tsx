import type {
  CSSProperties,
  ElementType,
  ForwardedRef,
  ReactElement,
} from "react";
import { createElement, forwardRef, isValidElement, useEffect } from "react";
import { clsx } from "clsx";
import type {
  ReliefCardActionProps,
  ReliefCardAnimationOptions,
  ReliefCardAnimationPreset,
  ReliefCardDescriptionProps,
  ReliefCardProps,
  ReliefCardTexture,
  ReliefCardTextureOptions,
  ReliefCardTitleProps,
} from "./ReliefCard.types";
import type { PolymorphicComponent } from "../shared/polymorphic";

const RELIEF_TEXTURE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 520 520' fill='none' stroke='%23000' stroke-width='1.5'%3E%3Cpath d='M-20 430C90 380 150 470 260 430S430 350 540 400'/%3E%3Cpath d='M-20 470C90 420 150 505 260 468S430 395 540 445'/%3E%3Cpath d='M-20 390C90 340 150 430 260 392S430 315 540 362'/%3E%3Cpath d='M340 120c60-45 150-30 170 40'/%3E%3Cpath d='M310 150c70-70 200-55 230 45'/%3E%3Cpath d='M60 90c40 0 70 30 70 68'/%3E%3Cpath d='M30 70c60 0 110 45 110 105'/%3E%3C/svg%3E\")";

const runtimeProcess = (
  globalThis as typeof globalThis & {
    process?: { env?: { NODE_ENV?: string } };
  }
).process;
const isDev = Boolean(
  runtimeProcess && runtimeProcess.env?.NODE_ENV !== "production",
);

let mountedInstances = 0;

const animationDurations: Record<ReliefCardAnimationPreset, number> = {
  reveal: 500,
  drift: 9000,
  pulse: 4200,
  none: 0,
};

function resolveAnimation(
  animation: ReliefCardProps["animation"],
): Required<ReliefCardAnimationOptions> {
  const options = typeof animation === "object" ? animation : undefined;
  const preset =
    typeof animation === "string" ? animation : (options?.preset ?? "reveal");
  return {
    preset,
    duration: Math.max(0, options?.duration ?? animationDurations[preset]),
    delay: Math.max(0, options?.delay ?? 0),
    easing: options?.easing ?? (preset === "reveal" ? "ease" : "ease-in-out"),
  };
}

function isTextureElement(
  texture: ReliefCardTexture | undefined,
): texture is ReactElement {
  return isValidElement(texture);
}

function resolveTexture(texture: ReliefCardTexture | undefined): {
  element?: ReactElement;
  options?: ReliefCardTextureOptions;
  kind: "default" | "custom" | "element" | "none";
} {
  if (texture === false) return { kind: "none" };
  if (isTextureElement(texture)) return { element: texture, kind: "element" };
  if (typeof texture === "string") {
    return { options: { source: texture }, kind: "custom" };
  }
  if (texture) return { options: texture, kind: "custom" };
  return { options: { source: RELIEF_TEXTURE }, kind: "default" };
}

function ReliefCardImpl(
  {
    children,
    className,
    style,
    animation = "reveal",
    texture,
    ...props
  }: ReliefCardProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const animationOptions = resolveAnimation(animation);
  const {
    element: textureElement,
    options: textureOptions,
    kind: textureKind,
  } = resolveTexture(texture);
  const transitionDuration =
    animationOptions.preset === "reveal"
      ? animationOptions.duration
      : animationOptions.preset === "none"
        ? 0
        : animationDurations.reveal;
  const textureAnimation =
    animationOptions.preset === "drift" || animationOptions.preset === "pulse"
      ? `gs-relief-${animationOptions.preset} ${animationOptions.duration}ms ${animationOptions.easing} ${animationOptions.delay}ms infinite`
      : "none";
  useEffect(() => {
    if (!isDev) {
      return undefined;
    }
    mountedInstances += 1;
    if (mountedInstances === 2) {
      console.warn(
        "[velune] ReliefCard: more than one instance is mounted. " +
          "ReliefCard is intended as the single decorative moment of a page; rendering it " +
          "twice dilutes the effect. Keep at most one per view.",
      );
    }
    return () => {
      mountedInstances -= 1;
    };
  }, []);

  return (
    <section
      ref={ref}
      {...props}
      className={clsx(
        "gs-relief-card group relative block overflow-hidden rounded-gs-relief-radius border-gs-relief-border-width border-gs-relief-border bg-gs-relief-bg bg-gs-surface-highlight px-gs-relief-padding-inline pb-gs-relief-padding-block-end pt-gs-relief-padding-block-start font-gs-sans text-gs-relief-color shadow-gs-relief",
        className,
      )}
      style={
        {
          "--relief-texture-src": RELIEF_TEXTURE,
          ...(textureOptions
            ? {
                "--relief-texture-src": textureOptions.source,
                "--relief-texture-custom-size": textureOptions.size,
                "--relief-texture-position": textureOptions.position,
                "--relief-texture-repeat": textureOptions.repeat,
              }
            : {}),
          "--relief-animation-duration": `${animationOptions.duration}ms`,
          "--relief-animation-easing": animationOptions.easing,
          "--relief-transition-delay": `${
            animationOptions.preset === "reveal" ? animationOptions.delay : 0
          }ms`,
          "--relief-transition-duration": `${transitionDuration}ms`,
          "--relief-texture-animation": textureAnimation,
          ...style,
        } as CSSProperties
      }
      data-animation={animationOptions.preset}
      data-texture={textureKind}
    >
      {texture !== false ? (
        <span
          className={clsx(
            "gs-relief-card-texture pointer-events-none absolute inset-0 opacity-gs-relief-texture-opacity animate-[var(--relief-texture-animation)] [transition-delay:var(--relief-transition-delay)] [transition-duration:var(--relief-transition-duration)] [transition-timing-function:var(--relief-animation-easing)] motion-reduce:animate-none motion-reduce:transition-none [[data-reduced-motion=true]_&]:animate-none [[data-reduced-motion=true]_&]:transition-none",
            textureOptions &&
              "bg-gs-text-primary [mask-image:var(--relief-texture-src)] [mask-position:var(--relief-texture-position,100%_100%)] [mask-repeat:var(--relief-texture-repeat,no-repeat)] [mask-size:var(--relief-texture-custom-size,var(--relief-texture-size))]",
            textureElement && "[&>*]:block [&>*]:size-full",
            (animationOptions.preset === "reveal" ||
              animationOptions.preset === "drift") &&
              "transition-opacity",
            (animationOptions.preset === "reveal" ||
              animationOptions.preset === "drift") &&
              "group-hover:opacity-gs-relief-texture-opacity-hover group-focus-within:opacity-gs-relief-texture-opacity-hover",
          )}
          aria-hidden="true"
        >
          {textureElement}
        </span>
      ) : null}
      <div className="gs-relief-card-content relative grid max-w-[60ch] gap-gs-relief-gap">
        {children}
      </div>
    </section>
  );
}

const ReliefCardRoot = forwardRef(ReliefCardImpl);
ReliefCardRoot.displayName = "ReliefCard";

function ReliefCardTitleImpl(
  {
    as = "h2",
    className,
    children,
    ...props
  }: ReliefCardTitleProps<ElementType>,
  ref: ForwardedRef<HTMLElement>,
) {
  return createElement(
    as,
    {
      ref,
      ...props,
      className: clsx(
        "gs-relief-card-title m-0 font-gs-serif text-gs-relief-title-size font-gs-relief-title-weight leading-gs-normal text-gs-relief-color",
        className,
      ),
    },
    children,
  );
}

const ReliefCardTitle = forwardRef(
  ReliefCardTitleImpl,
) as unknown as PolymorphicComponent<
  "h2",
  import("./ReliefCard.types").ReliefCardTitleOwnProps
>;
ReliefCardTitle.displayName = "ReliefCard.Title";

const ReliefCardDescription = forwardRef<
  HTMLParagraphElement,
  ReliefCardDescriptionProps
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={clsx(
      "gs-relief-card-description m-0 text-gs-relief-description-size leading-gs-body text-gs-text-secondary",
      className,
    )}
    {...props}
  >
    {children}
  </p>
));
ReliefCardDescription.displayName = "ReliefCard.Description";

const ReliefCardAction = forwardRef<HTMLDivElement, ReliefCardActionProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx("gs-relief-card-action flex flex-wrap gap-2", className)}
      {...props}
    >
      {children}
    </div>
  ),
);
ReliefCardAction.displayName = "ReliefCard.Action";

export const ReliefCard = Object.assign(ReliefCardRoot, {
  Title: ReliefCardTitle,
  Description: ReliefCardDescription,
  Action: ReliefCardAction,
});
