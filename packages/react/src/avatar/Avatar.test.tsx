// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Profiler } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "./Avatar";

afterEach(cleanup);

describe("Avatar", () => {
  it("sets readable displayNames", () => {
    expect(Avatar.displayName).toBe("Avatar");
    expect(Avatar.Group.displayName).toBe("Avatar.Group");
  });

  it("preserves consumer image errors while activating the fallback", () => {
    const onError = vi.fn();
    const { container } = render(
      <Avatar src="/missing.png" name="Kai Xin" imgProps={{ onError }} />,
    );

    fireEvent.error(container.querySelector("img")!);

    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByText("KX")).not.toBeNull();
  });

  it("shows a replacement source without an effect-driven extra commit", () => {
    const onRender = vi.fn();
    const renderAvatar = (src: string) => (
      <Profiler id="avatar" onRender={onRender}>
        <Avatar src={src} name="Kai Xin" />
      </Profiler>
    );
    const { container, rerender } = render(renderAvatar("/missing.png"));
    fireEvent.error(container.querySelector("img")!);
    onRender.mockClear();

    rerender(renderAvatar("/replacement.png"));

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "/replacement.png",
    );
    expect(onRender).toHaveBeenCalledOnce();
  });

  it("protects image sources while composing image classes", () => {
    const { container } = render(
      <Avatar
        src="/owned.png"
        alt="Owned image"
        data-size="invalid"
        imgProps={
          {
            src: "/overridden.png",
            alt: "Overridden image",
            className: "consumer-image",
          } as React.ComponentProps<"img">
        }
      />,
    );
    const root = container.firstElementChild!;
    const image = container.querySelector("img")!;

    expect(root.getAttribute("data-size")).toBe("md");
    expect(screen.getAllByRole("img", { name: "Owned image" })).toHaveLength(1);
    expect(image.getAttribute("src")).toBe("/owned.png");
    expect(image.getAttribute("alt")).toBe("Owned image");
    expect(image.classList.contains("gs-avatar-image")).toBe(true);
    expect(image.classList.contains("size-full")).toBe(true);
    expect(image.classList.contains("object-cover")).toBe(true);
    expect(image.classList.contains("consumer-image")).toBe(true);
    expect(root.classList.contains("size-gs-avatar-size-md")).toBe(true);
  });

  it("maps size and shape to Tailwind utilities", () => {
    const { container } = render(
      <Avatar size="xl" shape="square" name="Kai" />,
    );
    const root = container.firstElementChild!;

    expect(root.classList.contains("size-gs-avatar-size-xl")).toBe(true);
    expect(root.classList.contains("text-gs-avatar-font-size-xl")).toBe(true);
    expect(root.classList.contains("rounded-gs-avatar-radius-square")).toBe(
      true,
    );
  });

  it("uses a custom group overflow label", () => {
    render(
      <Avatar.Group
        max={1}
        overflowLabel={(count) => `${count} additional members`}
      >
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
      </Avatar.Group>,
    );

    const overflow = screen.getByRole("img", {
      name: "2 additional members",
    });
    expect(overflow.textContent).toBe("+2");
    expect(overflow.classList.contains("-ms-gs-avatar-group-overlap")).toBe(
      true,
    );
  });
});
