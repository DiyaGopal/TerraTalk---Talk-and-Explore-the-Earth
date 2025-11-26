export function parseCommand(command) {
  command = command.toLowerCase();

  // Zoom
  if (command.includes("zoom in")) return { action: "zoomIn" };
  if (command.includes("zoom out")) return { action: "zoomOut" };

  // Pan directions
  if (command.includes("pan left")) return { action: "pan", direction: "left" };
  if (command.includes("pan right")) return { action: "pan", direction: "right" };
  if (command.includes("pan up")) return { action: "pan", direction: "up" };
  if (command.includes("pan down")) return { action: "pan", direction: "down" };

  // Navigate to place
  const match = command.match(/(?:go to|fly to|navigate to)\s+(.*)/);
  if (match) return { action: "flyTo", location: match[1].trim() };

  // Switch layers
  if (command.includes("satellite")) return { action: "switchLayer", layer: "satellite" };
  if (command.includes("terrain")) return { action: "switchLayer", layer: "terrain" };
  if (command.includes("night")) return { action: "switchLayer", layer: "night" };

  return { action: "unknown" };
}

