import { useState, useEffect } from 'react';
import CalendarComponent from '../../components/CalendarComponent';
import { getTutorSlots } from '../../services/calendarService';

export default function StudentCalendar({ tutorId }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchSlots();
  }, [tutorId]);

  const fetchSlots = async () => {
    try {
      const now = new Date();
      const from = now.toISOString();
      const to = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 dni do przodu

      const res = await getTutorSlots(tutorId, from, to);
      const formatted = res.data.map((slot, i) => ({
        id: i,
        start: slot.start,
        end: slot.end,
        title: 'Wolny slot',
        color: '#34d399', // zielony
      }));
      setEvents(formatted);
    } catch (e) {
      console.error('Błąd pobierania slotów:', e);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Kalendarz Studenta</h2>
      <CalendarComponent events={events} />
    </div>
  );
}
