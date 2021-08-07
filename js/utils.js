/**
 * OTHER USEFUL FUNCTIONS
 */
function setRandomPosition(element) {
  element.position.set(Math.random() * (MAP_LIMIT - (-MAP_LIMIT)) + (-MAP_LIMIT) ,0,Math.random() * (MAP_LIMIT - (-MAP_LIMIT)) + (-MAP_LIMIT));
}

function setPositionInsideHeightMapLimits(position, limit) {
  if (position < 0){
    return 0;
  }
  if (position >= limit) {
    return limit - 1;
  }
  return position;
}
