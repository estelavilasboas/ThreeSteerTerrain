/**
 * OTHER USEFUL FUNCTIONS
 */
function setRandomPosition(element) {
  element.position.set(Math.random() * (MAP_LIMIT - (-MAP_LIMIT)) + (-MAP_LIMIT) ,0,Math.random() * (MAP_LIMIT - (-MAP_LIMIT)) + (-MAP_LIMIT));
}
