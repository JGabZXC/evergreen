import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router";
import NotFound404 from "./NotFound404";

describe("NotFound404 Component", () => {
  it("renders the heading and error message", () => {
    // We must wrap the component in MemoryRouter because it uses <Link>
    render(
      <MemoryRouter>
        <NotFound404 />
      </MemoryRouter>
    );

    // Check if the main heading exists
    expect(
      screen.getByRole("heading", { level: 2, name: /Page Not Found/i })
    ).toBeInTheDocument();

    // Check if the paragraph text exists
    expect(
      screen.getByText(/Sorry, the page you are looking for doesn't exist/i)
    ).toBeInTheDocument();
  });

  it("renders the 404 image", () => {
    render(
      <MemoryRouter>
        <NotFound404 />
      </MemoryRouter>
    );

    // Find the image by its alt text
    const image = screen.getByAltText("Page Not Found");

    expect(image).toBeInTheDocument();
    // Optional: verify it has a src attribute (Vitest will mock the path string)
    expect(image).toHaveAttribute("src");
  });

  it("has a link pointing back to home", () => {
    render(
      <MemoryRouter>
        <NotFound404 />
      </MemoryRouter>
    );

    // Find the link by its text
    const homeLink = screen.getByRole("link", { name: /Go Back Home/i });

    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
