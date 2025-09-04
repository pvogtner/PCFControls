import { useState, useEffect, useMemo } from "react";
import { Resource, IEvent, Keys } from "../types";

export interface FilteredCalendarData {
  resources: Resource[] | undefined;
  events: IEvent[];
  selectedResourceId: string | null;
}

export function useResourceFilter(
  calendarData: {
    resources: Resource[] | undefined;
    events: IEvent[];
    keys: Keys | undefined;
  },
  resourceField: string | null
): [
  FilteredCalendarData,
  (resourceId: string | null) => void
] {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  // Reset filter when calendar data changes
  useEffect(() => {
    setSelectedResourceId(null);
  }, [calendarData.resources, calendarData.events]);

  const filteredData = useMemo((): FilteredCalendarData => {
    if (!selectedResourceId || !resourceField || !calendarData.resources) {
      // Return all data if no filter is selected or no resources available
      return {
        resources: calendarData.resources,
        events: calendarData.events,
        selectedResourceId,
      };
    }

    // Filter events based on selected resource
    const filteredEvents = calendarData.events.filter((event) => {
      // Check if the event has a resource property that matches
      return event.resource === selectedResourceId;
    });

    // When filtering, we still want to show all resources in the resource view 
    // but only show events for the selected resource
    return {
      resources: calendarData.resources,
      events: filteredEvents,
      selectedResourceId,
    };
  }, [calendarData, selectedResourceId, resourceField]);

  return [filteredData, setSelectedResourceId];
}
