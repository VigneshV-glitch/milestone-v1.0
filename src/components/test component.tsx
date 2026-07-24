import { useEffect } from 'react';
import { supabase } from './supabase/client'; // Adjust the path to your client file

export default function TestConnection() {
  useEffect(() => {
    async function loadVehicles() {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*');

      console.log('Vehicles:', data);
      console.log('Error:', error);
    }

    loadVehicles();
  }, []);

  return <h1>Supabase Connection Test</h1>;
}