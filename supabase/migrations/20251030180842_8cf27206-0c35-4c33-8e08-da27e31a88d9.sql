-- Create working hours presets table
CREATE TABLE public.working_hours_presets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  schedule jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.working_hours_presets ENABLE ROW LEVEL SECURITY;

-- Admins can manage presets
CREATE POLICY "Admins can manage presets"
ON public.working_hours_presets
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view presets
CREATE POLICY "Anyone can view presets"
ON public.working_hours_presets
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_working_hours_presets_updated_at
BEFORE UPDATE ON public.working_hours_presets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default presets
INSERT INTO public.working_hours_presets (name, schedule) VALUES
  ('Jutarnja smjena (8:00-16:00)', '[
    {"day_of_week": 1, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 2, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 3, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 4, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 5, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 6, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": false},
    {"day_of_week": 0, "start_time": "08:00:00", "end_time": "16:00:00", "is_closed": true}
  ]'),
  ('Popodnevna smjena (14:00-22:00)', '[
    {"day_of_week": 1, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 2, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 3, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 4, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 5, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 6, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": false},
    {"day_of_week": 0, "start_time": "14:00:00", "end_time": "22:00:00", "is_closed": true}
  ]'),
  ('Standardno (9:00-20:00)', '[
    {"day_of_week": 1, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 2, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 3, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 4, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 5, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 6, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": false},
    {"day_of_week": 0, "start_time": "09:00:00", "end_time": "20:00:00", "is_closed": true}
  ]');