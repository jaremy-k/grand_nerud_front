import { useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function RecordTabs({ tabs, value, onChange, children, label }: {
  tabs: readonly { value: string; label: string }[]; value: string;
  onChange: (value: string) => void; children: ReactNode; label: string;
}) {
  const id = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  return <div className="min-w-0">
    <div className="max-w-full overflow-x-auto border-b">
      <div role="tablist" aria-label={label} className="flex w-max min-w-full gap-5">
        {tabs.map((tab, index) => <button key={tab.value} ref={(element) => { buttons.current[index] = element; }}
          type="button" role="tab" id={`${id}-${tab.value}`} aria-selected={tab.value === value}
          aria-controls={`${id}-panel`} tabIndex={tab.value === value ? 0 : -1}
          className={cn("shrink-0 border-b-2 py-3 text-sm font-medium focus-visible:outline-primary",
            tab.value === value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          onClick={() => onChange(tab.value)} onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault(); onChange(tabs[next].value); buttons.current[next]?.focus();
          }}>{tab.label}</button>)}
      </div>
    </div>
    <section id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${value}`} className="min-w-0 py-5">
      {children}
    </section>
  </div>;
}
