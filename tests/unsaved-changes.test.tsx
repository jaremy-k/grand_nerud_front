import { useRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, Link, RouterProvider, useNavigate } from "react-router-dom";
import { afterEach, expect, it } from "vitest";
import UnsavedChangesGuard from "@/features/crm/unsaved-changes-guard";

function Form() {
  const [value, setValue] = useState("");
  const bypass = useRef(false);
  const navigate = useNavigate();
  return <><input aria-label="Комментарий" value={value} onChange={(event) => setValue(event.target.value)} />
    <UnsavedChangesGuard when={Boolean(value)} bypass={bypass} />
    <Link to="/other">Уйти</Link><button onClick={() => { bypass.current = true; navigate("/other"); }}>Сохранить</button></>;
}
function openForm() {
  const router = createMemoryRouter([{ path: "/edit", element: <Form /> }, { path: "/other", element: <p>Другая страница</p> }], { initialEntries: ["/other", "/edit"] });
  render(<RouterProvider router={router} />);
  return router;
}
afterEach(cleanup);

it("не препятствует уходу из неизменённой формы", async () => {
  openForm();
  await act(async () => fireEvent.click(screen.getByRole("link", { name: "Уйти" })));
  expect(screen.getByText("Другая страница")).toBeTruthy();
  expect(screen.queryByRole("alertdialog")).toBeNull();
});
it("оставляет изменения после отмены выхода", async () => {
  openForm();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Правка" } });
  await act(async () => fireEvent.click(screen.getByRole("link", { name: "Уйти" })));
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Остаться" }));
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Правка");
  expect(screen.queryByText("Другая страница")).toBeNull();
});
it("выполняет исходный переход после подтверждения выхода", async () => {
  openForm();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Правка" } });
  await act(async () => fireEvent.click(screen.getByRole("link", { name: "Уйти" })));
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Выйти без сохранения" })));
  expect(screen.getByText("Другая страница")).toBeTruthy();
});
it("блокирует переход назад в истории", async () => {
  const router = openForm();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Правка" } });
  await act(async () => { await router.navigate(-1); });
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(router.state.location.pathname).toBe("/edit");
});
it("предупреждает при закрытии вкладки только с изменениями", () => {
  openForm();
  const clean = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(clean);
  expect(clean.defaultPrevented).toBe(false);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Правка" } });
  const dirty = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(dirty);
  expect(dirty.defaultPrevented).toBe(true);
});
it("пропускает успешное сохранение без лишнего подтверждения", async () => {
  openForm();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Правка" } });
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Сохранить" })));
  expect(screen.getByText("Другая страница")).toBeTruthy();
  expect(screen.queryByRole("alertdialog")).toBeNull();
});
