import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Save, Plus, Trash2 } from "lucide-react";

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

interface Preset {
  id: string;
  name: string;
  schedule: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_closed: boolean;
  }>;
}

const DAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];

const WorkingHoursTab = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPresetOpen, setCreatePresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadWorkingHours(), loadPresets()]);
    setLoading(false);
  };

  const loadWorkingHours = async () => {
    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .order("day_of_week");

    if (error) {
      toast.error("Greška pri učitavanju radnog vremena");
      return;
    }

    setWorkingHours(data || []);
  };

  const loadPresets = async () => {
    const { data, error } = await supabase
      .from("working_hours_presets")
      .select("*")
      .order("created_at");

    if (error) {
      toast.error("Greška pri učitavanju predložaka");
      return;
    }

    setPresets((data || []) as unknown as Preset[]);
  };

  const updateWorkingHour = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from("working_hours")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      toast.error("Greška pri ažuriranju");
      return;
    }

    toast.success("Radno vrijeme ažurirano");
    loadWorkingHours();
  };

  const applyPreset = async (preset: Preset) => {
    const updates = preset.schedule.map((schedule) => {
      const existing = workingHours.find((wh) => wh.day_of_week === schedule.day_of_week);
      if (!existing) return null;

      return supabase
        .from("working_hours")
        .update({
          start_time: schedule.start_time,
          end_time: schedule.end_time,
          is_closed: schedule.is_closed,
        })
        .eq("id", existing.id);
    });

    const results = await Promise.all(updates.filter(Boolean));
    const hasError = results.some((r) => r?.error);

    if (hasError) {
      toast.error("Greška pri primjeni predloška");
      return;
    }

    toast.success(`Predložak "${preset.name}" primijenjen`);
    loadWorkingHours();
  };

  const createPreset = async () => {
    if (!newPresetName.trim()) {
      toast.error("Unesite naziv predloška");
      return;
    }

    const schedule = workingHours.map((wh) => ({
      day_of_week: wh.day_of_week,
      start_time: wh.start_time,
      end_time: wh.end_time,
      is_closed: wh.is_closed,
    }));

    const { error } = await supabase
      .from("working_hours_presets")
      .insert({ name: newPresetName, schedule });

    if (error) {
      toast.error("Greška pri spremanju predloška");
      return;
    }

    toast.success("Predložak spremljen");
    setNewPresetName("");
    setCreatePresetOpen(false);
    loadPresets();
  };

  const deletePreset = async (id: string, name: string) => {
    if (!confirm(`Jeste li sigurni da želite obrisati predložak "${name}"?`)) {
      return;
    }

    const { error } = await supabase
      .from("working_hours_presets")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Greška pri brisanju predloška");
      return;
    }

    toast.success("Predložak obrisan");
    loadPresets();
  };

  if (loading) {
    return <p className="text-muted-foreground">Učitavanje...</p>;
  }

  return (
    <div className="space-y-8">
      {/* Presets Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Predlošci radnog vremena</h2>
          <Dialog open={createPresetOpen} onOpenChange={setCreatePresetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2" size={16} />
                Spremi trenutno kao predložak
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novi predložak</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="preset-name">Naziv predloška</Label>
                  <Input
                    id="preset-name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="npr. Jutarnja smjena"
                  />
                </div>
                <Button onClick={createPreset} className="w-full">
                  <Save className="mr-2" size={16} />
                  Spremi predložak
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <Card key={preset.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold">{preset.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePreset(preset.id, preset.name)}
                >
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 mb-3">
                {preset.schedule.slice(1, 6).map((s) => (
                  <div key={s.day_of_week}>
                    {DAYS[s.day_of_week]}: {s.is_closed ? "Zatvoreno" : `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => applyPreset(preset)}
              >
                Primijeni
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Manual Working Hours Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Trenutno radno vrijeme</h2>
        
        <div className="grid gap-4">
          {workingHours.map((hour) => (
            <Card key={hour.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{DAYS[hour.day_of_week]}</h3>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`closed-${hour.id}`}>Zatvoreno</Label>
                  <Switch
                    id={`closed-${hour.id}`}
                    checked={hour.is_closed}
                    onCheckedChange={(checked) => updateWorkingHour(hour.id, "is_closed", checked)}
                  />
                </div>
              </div>

              {!hour.is_closed && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`start-${hour.id}`}>Početak</Label>
                    <Input
                      id={`start-${hour.id}`}
                      type="time"
                      value={hour.start_time}
                      onChange={(e) => updateWorkingHour(hour.id, "start_time", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`end-${hour.id}`}>Kraj</Label>
                    <Input
                      id={`end-${hour.id}`}
                      type="time"
                      value={hour.end_time}
                      onChange={(e) => updateWorkingHour(hour.id, "end_time", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursTab;
