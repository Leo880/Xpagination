/*import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
*/

import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

// Mock fetch data
const mockData = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  email: `employee${i + 1}@test.com`,
  role: "member",
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test("renders table and pagination controls", async () => {
  render(<App />);

  expect(await screen.findByText("Employee 1")).toBeInTheDocument();
  expect(screen.getByText("Previous")).toBeInTheDocument();
  expect(screen.getByText("Next")).toBeInTheDocument();
  expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
});

test("displays 10 rows on the first page", async () => {
  render(<App />);

  await screen.findByText("Employee 1");
  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(11); // 1 header + 10 rows
});

test("navigates to next page on clicking Next", async () => {
  render(<App />);

  await screen.findByText("Employee 1");

  fireEvent.click(screen.getByText("Next"));

  expect(await screen.findByText("Employee 11")).toBeInTheDocument();
  expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
});

test("navigates to previous page on clicking Previous", async () => {
  render(<App />);

  await screen.findByText("Employee 1");
  fireEvent.click(screen.getByText("Next"));

  await screen.findByText("Employee 11");

  fireEvent.click(screen.getByText("Previous"));

  expect(await screen.findByText("Employee 1")).toBeInTheDocument();
  expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
});

test("Previous button is disabled on first page", async () => {
  render(<App />);

  await screen.findByText("Employee 1");
  expect(screen.getByText("Previous")).toBeDisabled();
});

test("Next button is disabled on last page", async () => {
  render(<App />);

  await screen.findByText("Employee 1");

  // Move to last page
  for (let i = 0; i < 4; i++) {
    fireEvent.click(screen.getByText("Next"));
    // Wait for each page transition
    // eslint-disable-next-line no-await-in-loop
    await screen.findByText(`Employee ${(i + 1) * 10 + 1}`);
  }

  expect(await screen.findByText("Employee 41")).toBeInTheDocument();
  expect(screen.getByText("Page 5 of 5")).toBeInTheDocument();
  expect(screen.getByText("Next")).toBeDisabled();
});

test("shows error alert when fetch fails", async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

  render(<App />);

  // Instead of waitFor, just rely on async findBy (but here we check mock calls)
  await new Promise(process.nextTick); // let the useEffect run

  expect(alertMock).toHaveBeenCalledWith("failed to fetch data");

  alertMock.mockRestore();
});
