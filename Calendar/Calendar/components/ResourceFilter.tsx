import * as React from "react";
import { Resource } from "../types";

export interface ResourceFilterProps {
  resources: Resource[];
  selectedResourceId: string | null;
  onResourceChange: (resourceId: string | null) => void;
  calendarTextColor: string;
  calendarBorderColor: string;
}

export const ResourceFilter: React.FC<ResourceFilterProps> = ({
  resources,
  selectedResourceId,
  onResourceChange,
  calendarTextColor,
  calendarBorderColor,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onResourceChange(value === "" ? null : value);
  };

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
    onResourceChange(null);
  };

  return (
    <div style={containerStyle} className="resource-filter-container">
      <label style={labelStyle}>Filter by Resource:</label>
      <select
        value={selectedResourceId || ""}
        onChange={handleChange}
        style={dropdownStyle}
        className="resource-filter-dropdown"
        title="Select a resource to filter events"
      >
        <option value="">All Resources ({resources.length})</option>
        {resources.map((resource) => (
          <option key={resource.id} value={resource.id}>
            {resource.title}
          </option>
        ))}
      </select>
      {selectedResourceId && (
        <button
          onClick={handleClear}
          style={clearButtonStyle}
          className="resource-filter-clear-btn"
          title="Clear filter and show all resources"
          type="button"
        >
          Clear Filter
        </button>
      )}
    </div>
  );
};
