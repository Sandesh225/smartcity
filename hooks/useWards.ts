'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';

export type Ward = {
  id: string;
  ward_number: number;
  ward_name: string;
  ward_name_nepali: string | null;
};

export function useWards() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from('wards')
        .select('id, ward_number, ward_name, ward_name_nepali')
        .eq('is_active', true)
        .order('ward_number');

      if (!error && data) setWards(data as Ward[]);
      setLoading(false);
    })();
  }, []);

  return { wards, loading };
}
