import { useSearchParams } from "react-router-dom";

export function useRecordTab(tabs: readonly { value: string }[]) {
  const [params, setParams] = useSearchParams();
  const value = tabs.find((tab) => tab.value === params.get("tab"))?.value ?? tabs[0].value;
  const change = (next: string) => {
    const updated = new URLSearchParams(params);
    if (next === tabs[0].value) updated.delete("tab");
    else updated.set("tab", next);
    updated.delete("page");
    setParams(updated, { replace: true });
  };
  return { value, change };
}
