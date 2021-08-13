/**
 * OTHER USEFUL FUNCTIONS
 */
function setRandomPosition(element) {
  element.position.set(
    Math.random() * (MAP_LIMIT - -MAP_LIMIT) + -MAP_LIMIT,
    0,
    Math.random() * (MAP_LIMIT - -MAP_LIMIT) + -MAP_LIMIT
  );
}

function setPositionInsideHeightMapLimits(position, limit) {
  if (position < 0) {
    return 0;
  }
  if (position >= limit) {
    return limit - 1;
  }
  return position;
}

function createCsv(heightMap, numEntities, maxIterations, type) {
  const heightMapToCsv = heightMap.map((line) =>
    line[0] === "," ? line.slice(1) + "\n" : line + "\n"
  );

  let file = document.createElement("a");
  file.id = "download-csv";
  file.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(heightMapToCsv)
  );
  file.setAttribute(
    "download",
    `${type}_${numEntities}_Interations_${maxIterations}.csv`
  );
  document.body.appendChild(file);
  document.querySelector("#download-csv").click();
}
