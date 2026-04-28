import { IEvent, Keys } from "../types";
import { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { IInputs } from "../generated/ManifestTypes";

export function handleEventDrop(
  onEventDrop: (eventId: string, start: Date, end: Date, resourceId: string, isAllDay: boolean) => void,
  pcfContext: ComponentFramework.Context<IInputs>,
  keys?: Keys
) {
  return ({ event, start, end, resourceId, isAllDay }: EventInteractionArgs<IEvent>) => {
    const eventId = (event as IEvent).id || "";
    const newStart = new Date(start);
    const newEnd = new Date(end);

    onEventDrop(
      eventId,
      newStart,
      newEnd,
      resourceId ? String(resourceId) : "",
      isAllDay ?? false
    );

    // Persist change to Dataverse in model-driven apps
    if (pcfContext.mode.allocatedHeight === -1 && eventId && keys) {
      const entityName = pcfContext.parameters.calendarDataSet.getTargetEntityType();
      if (entityName) {
        const data: Record<string, unknown> = {};
        if (keys.start) data[keys.start] = newStart.toISOString();
        if (keys.end) data[keys.end] = newEnd.toISOString();

        pcfContext.webAPI.updateRecord(entityName, eventId, data).then(
          () => {
            try { pcfContext.parameters.calendarDataSet.refresh(); } catch { /* ignore */ }
            return undefined;
          },
          (error: Error) => {
            console.error("Calendar DnD: Failed to update record after drop", error);
            try { pcfContext.parameters.calendarDataSet.refresh(); } catch { /* ignore */ }
            return undefined;
          }
        ).catch(() => { /* handled above */ });
      }
    }
  };
}
