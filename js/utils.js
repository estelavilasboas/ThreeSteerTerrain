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

function downloadCsv(heightMap, type) {
  const heightMapToCsv = heightMap.map.map((line) =>
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
    `${type}_${NUM_ENTITIES}_Interations_${MAX_ITERATIONS}_heightIterator_${MAX_HEIGHT_MAP_ITERATOR ?? heightMap.heightIterator}${MIN_HEIGHT_MAP_ITERATOR !== 0 ? `_${MIN_HEIGHT_MAP_ITERATOR}` : ''}.csv`
  );
  document.body.appendChild(file);
  document.querySelector("#download-csv").click();
}

function downloadScreenshot(type) {
  renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var image = document.createElement('a');
      var url = URL.createObjectURL(blob);
      image.href = url;
      image.download = `${type}_${NUM_ENTITIES}_Interations_${MAX_ITERATIONS}_heightIterator_${MAX_HEIGHT_MAP_ITERATOR ?? heightMap.heightIterator}${MIN_HEIGHT_MAP_ITERATOR  !== 0 ? `_${MIN_HEIGHT_MAP_ITERATOR}` : ''}.png`;
      image.click();
    }, 'image/png', 1.0);
}
