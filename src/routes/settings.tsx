import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Badge, PageHeader } from "@/components/ui-kit";
import { pageMeta } from "@/lib/meta";
import { clearAllData, newId, restoreDemoData, useSettings } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => pageMeta("Settings", "Configure site details, risk thresholds, logbooks and demo data."),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useSettings();
  const [draft, setDraft] = useState({ siteName: settings.siteName, lowMax: settings.lowMax, mediumMax: settings.mediumMax, highMax: settings.highMax });
  const [cat, setCat] = useState({ name: "", type: "Statutory" as "Statutory" | "Non-statutory", fields: "" });
  const [msg, setMsg] = useState("");

  const saveGeneral = () => {
    const { lowMax, mediumMax, highMax } = draft;
    if (!(lowMax >= 1 && lowMax < mediumMax && mediumMax < highMax && highMax < 25)) return setMsg("Thresholds must increase: Low < Medium < High < 25.");
    setSettings({ ...settings, ...draft }); setMsg("Settings saved. New risk levels apply when hazards are next saved.");
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">General & risk thresholds</h2>
          <div><label className="label">Site / mine name</label><input className="input" value={draft.siteName} onChange={(e) => setDraft({ ...draft, siteName: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-2">
            {(["lowMax", "mediumMax", "highMax"] as const).map((k) => (
              <div key={k}><label className="label">{k.replace("Max", "")} up to</label>
                <input type="number" className="input" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })} /></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Risk score = Likelihood × Severity (1–25). Scores above "high" are Critical.</p>
          {msg && <p className="text-sm text-primary">{msg}</p>}
          <button className="btn-primary" onClick={saveGeneral}>Save settings</button>
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Logbook forms</h2>
          {settings.logCategories.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 border-b border-border pb-2 text-sm">
              <div><b>{c.name}</b> <Badge value={c.type} /><div className="text-xs text-muted-foreground">Fields: {c.fields.join(", ") || "—"}</div></div>
              <button className="btn-danger p-1" onClick={() => confirm(`Remove "${c.name}"? Existing entries stay saved but hidden.`) &&
                setSettings({ ...settings, logCategories: settings.logCategories.filter((x) => x.id !== c.id) })}><Trash2 size={14} /></button>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="input" placeholder="Logbook name" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
            <select className="input" value={cat.type} onChange={(e) => setCat({ ...cat, type: e.target.value as any })}><option>Statutory</option><option>Non-statutory</option></select>
            <input className="input sm:col-span-2" placeholder="Custom fields, comma separated (e.g. Location, Reading)" value={cat.fields} onChange={(e) => setCat({ ...cat, fields: e.target.value })} />
          </div>
          <button className="btn-outline" disabled={!cat.name.trim()} onClick={() => {
            setSettings({ ...settings, logCategories: [...settings.logCategories, { id: newId(), name: cat.name.trim(), type: cat.type, fields: cat.fields.split(",").map((f) => f.trim()).filter(Boolean) }] });
            setCat({ name: "", type: "Statutory", fields: "" });
          }}>Add logbook</button>
        </div>

        <div className="card space-y-3 lg:col-span-2">
          <h2 className="text-lg font-semibold">Data</h2>
          <p className="text-sm text-muted-foreground">
            All records are saved in this browser's local storage. They survive page refreshes but are not shared with other users or devices,
            and are not a secure multi-user store. Clearing browser data will erase them.
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline" onClick={() => confirm("Restore demonstration data? This REPLACES all current records and settings with the sample set.") && restoreDemoData()}>Restore demonstration data</button>
            <button className="btn-danger border border-destructive/40" onClick={() => confirm("Delete ALL records? Settings are reset. This cannot be undone.") && clearAllData()}>Clear all records</button>
          </div>
        </div>
      </div>
    </>
  );
}
