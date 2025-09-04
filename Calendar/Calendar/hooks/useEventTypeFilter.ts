import { useState, useEffect, useMemo } from "react";
import { IEvent } from "../types";
import { EventType } from "../components/EventTypeFilter";

interface FilteredCalendarData {
  events: IEvent[];
  eventTypes: EventType[];
  selectedEventType: string | null;
}

interface CalendarDataWithEvents {
  events: IEvent[];
  resources?: unknown[];
}

export function useEventTypeFilter(
  calendarData: CalendarDataWithEvents,
  eventTypeField: string | null
): [FilteredCalendarData, (eventTypeId: string | null) => void] {
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);

  // Extract unique event types from the events
  const eventTypes = useMemo(() => {
    if (!eventTypeField || !calendarData.events) {
      return [];
    }

    console.log('Event Type Field:', eventTypeField);
    console.log('Sample Event:', calendarData.events[0]);
    console.log('Event Keys:', calendarData.events[0] ? Object.keys(calendarData.events[0]) : 'No events');

    const typeMap = new Map<string, string>();
    
    calendarData.events.forEach(event => {
      const typeValue = event[eventTypeField];
      console.log(`Event ${event.id}: ${eventTypeField} =`, typeValue);
      if (typeValue) {
        // Handle both string values and objects (for lookups)
        const typeId = typeof typeValue === 'object' && typeValue && 'id' in typeValue 
          ? String((typeValue as { id: unknown }).id) 
          : String(typeValue);
        const typeName = typeof typeValue === 'object' && typeValue && 'name' in typeValue 
          ? String((typeValue as { name: unknown }).name) 
          : String(typeValue);
        
        if (!typeMap.has(typeId)) {
          typeMap.set(typeId, typeName);
        }
      }
    });

    return Array.from(typeMap.entries()).map(([id, name]) => ({
      id,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [calendarData.events, eventTypeField]);

  // Filter events based on selected event type
  const filteredEvents = useMemo(() => {
    if (!selectedEventType || !eventTypeField) {
      return calendarData.events;
    }

    return calendarData.events.filter(event => {
      const typeValue = event[eventTypeField];
      if (!typeValue) return false;
      
      // Handle both string values and objects (for lookups)
      const typeId = typeof typeValue === 'object' && typeValue && 'id' in typeValue 
        ? String((typeValue as { id: unknown }).id) 
        : String(typeValue);
      return typeId === selectedEventType;
    });
  }, [calendarData.events, selectedEventType, eventTypeField]);

  // Reset filter when data changes significantly
  useEffect(() => {
    if (selectedEventType && !eventTypes.find(et => et.id === selectedEventType)) {
      setSelectedEventType(null);
    }
  }, [eventTypes, selectedEventType]);

  const filteredCalendarData: FilteredCalendarData = {
    events: filteredEvents,
    eventTypes,
    selectedEventType,
  };

  return [filteredCalendarData, setSelectedEventType];
}
