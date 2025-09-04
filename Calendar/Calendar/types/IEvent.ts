import { Event } from "react-big-calendar";

//extend the event interface to include additional properties we wil use.
export interface IEvent extends Event {
  id?: string;
  color?: string;
  description?: string;
  eventTypeId?: string;
  eventTypeName?: string;
  // Allow for additional dynamic properties like event types, resources, etc.
  [key: string]: unknown;
}
