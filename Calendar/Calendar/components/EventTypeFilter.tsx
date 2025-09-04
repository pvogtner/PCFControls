import * as React from "react";

export interface EventType {
  id: string;
  name: string;
}

export interface EventTypeFilterProps {
  eventTypes: EventType[];
  selectedEventType: string | null;
  onEventTypeChange: (eventTypeId: string | null) => void;
  calendarTextColor: string;
  calendarBorderColor: string;
}

export const EventTypeFilter: React.FC<EventTypeFilterProps> = ({
  eventTypes,
  selectedEventType,
  onEventTypeChange,
  calendarTextColor,
  calendarBorderColor,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onEventTypeChange(value === "" ? null : value);
  };

  // Don't render if no event types
  if (!eventTypes || eventTypes.length === 0) {
    return null;
  }

  const dropdownStyle: React.CSSProperties = {
    padding: "8px 12px",
    border: `1px solid ${calendarBorderColor}`,
    borderRadius: "4px",
    backgroundColor: "white",
    color: calendarTextColor,
    fontSize: "14px",
    fontFamily: "inherit",
    minWidth: "200px",
    cursor: "pointer",
    outline: "none",
    marginRight: "10px",
    transition: "border-color 0.2s ease-in-out",
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "8px",
    padding: "8px 0",
    borderBottom: `1px solid ${calendarBorderColor}`,
    paddingBottom: "12px",
  };

  const labelStyle: React.CSSProperties = {
    color: calendarTextColor,
    fontSize: "14px",
    fontWeight: "500",
    marginRight: "8px",
    whiteSpace: "nowrap",
  };

  const clearButtonStyle: React.CSSProperties = {
    background: "none",
    border: `1px solid ${calendarBorderColor}`,
    borderRadius: "4px",
    color: calendarTextColor,
    cursor: "pointer",
    fontSize: "12px",
    padding: "6px 12px",
    marginLeft: "8px",
    transition: "all 0.2s ease-in-out",
  };

  const handleClear = () => {
    onEventTypeChange(null);
  };

  return (
    <div style={containerStyle} className="event-type-filter-container">
      <label style={labelStyle}>Event Type:</label>
      <select
        value={selectedEventType || ""}
        onChange={handleChange}
        style={dropdownStyle}
        className="event-type-filter-dropdown"
        title="Select an event type to filter events"
      >
        <option value="">All Event Types ({eventTypes.length})</option>
        {eventTypes.map((eventType) => (
          <option key={eventType.id} value={eventType.id}>
            {eventType.name}
          </option>
        ))}
      </select>
      {selectedEventType && (
        <button
          onClick={handleClear}
          style={clearButtonStyle}
          className="event-type-filter-clear-btn"
          title="Clear filter and show all event types"
          type="button"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};
