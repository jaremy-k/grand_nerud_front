import { NavLink } from "react-router-dom";

export default function FunnelNavigation() {
  return <nav aria-label="Воронки" className="flex gap-1 border-b py-3">
    {[{ to: "/admin/lead-stages", label: "Этапы лидов" }, { to: "/admin/stages", label: "Этапы сделок" }].map((item) => (
      <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
        {item.label}
      </NavLink>
    ))}
  </nav>;
}
