import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
}

const DAYS = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];

const WorkingHoursTab = () => {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkingHours();
  }, []);

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
    setLoading(false);
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

  if (loading) {
    return <p className="text-muted-foreground">Učitavanje...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Radno vrijeme</h2>
      
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
  );
};

export default WorkingHoursTab;
