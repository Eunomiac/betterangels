gsap.registerPlugin(InertiaPlugin);

const CONTAINER = $("#circle-container");
const [CIRCLES, DICE] = [[], []];

// ████████ UTILITY FUNCTIONS ████████
// ▮▮▮▮▮▮▮▮ Calculating Closest Element to Target ▮▮▮▮▮▮▮▮
const getCenter = (elem) => {
  /* Returns the center point of an element. */
  return {
    x: gsap.getProperty(elem, "x"),
    y: gsap.getProperty(elem, "y")
  };
};
const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => {
  /* Returns the distance between two points. */
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
const getDistanceBetween = (elemA, elemB) => {
  /* Returns the distance between the centers of two elements. */
  return getDistance(getCenter(elemA), getCenter(elemB));
};
const getClosestToPoint = ({x, y}, targetElems, excludeTargets = []) => {
  /* Given a point and an array of possible targets, returns the target closest 
     to the point. Can optionally provide a subset of targets to exclude. */
  let closestDistance, closestTarget;
  targetElems
    .filter((target) => !excludeTargets.includes(target))
    .forEach((target) => {
      const distance = getDistance({x, y}, getCenter(target));
      if (distance < (closestDistance ?? Infinity)) {
        closestDistance = distance;
        closestTarget = target;
      }
    });
  return closestTarget;
};
const getClosestToElem = (elem, targetElems, excludeElems = []) => {
  // Given an element and an array of possible targets, returns the target closest 
  // to the element's center. Can optionally provide a subset of targets to exclude.
  return getClosestToPoint(getCenter(elem), targetElems, excludeElems);
};

// ████████ INITIALIZATION: EFFECTS & DOM ELEMENTS ████████
// ▮▮▮▮▮▮▮▮ Effect: Constant Rotation ▮▮▮▮▮▮▮▮
gsap.registerEffect({
  name: "constantRotate",
  defaults: { duration: 300 },
  effect: (targets, config) => gsap.to(targets, {rotation: "+=360", duration: config.duration, ease: "circ", repeat: -1});
});

// ▮▮▮▮▮▮▮▮ Creation: Draggable Dice Elements ▮▮▮▮▮▮▮▮
const createDie = () => {
  /* Creates a Draggable die element */
  const dieNum = DICE.length + 1;  
  const [die] = Draggable.create(
    $(`<div id="die-${dieNum}" class="roll-die" />`).appendTo("#container"),
    {
      type: "x,y",
      inertia: true,       
      snap: {
        points(point) {
          /* To keep this demo concise, I've only included the basic snapping logic.
             (The actual version animates various visual feedback effects, and excludes the die's starting
             circle from its possible targets) */
          const closestCircle = getClosestToPoint(point, CIRCLES);
          return getCenter(closestCircle);
        }
      }
    }
  );
  DICE.push(die);
  return die;
};

// ▮▮▮▮▮▮▮▮ Creation: Roll Circles ▮▮▮▮▮▮▮▮
const createCircle = (numDice, color, {left, top}) => {
  /* Creates the target circles the Draggable dice snap to, as well as the dice that start in that circle. */
  
  // Create the circle element
  const circleNum = CIRCLES.length + 1;
  const circleID = `rollCircle${CIRCLES.length + 1}`;
  const rollCircle = $(`<div id="rollCircle-${circleNum}" class="roll-circle ${color}" />`).appendTo("#container");
  
  // Set the circle's position and apply the rotation effect
  gsap.set(rollCircle, {left, top});
  gsap.effects.rotate(rollCircle);
  CIRCLES.push(rollCircle);
  
  // Create the dice in each circle
  const circleDice = new Array(numDice).fill(createDie());
  
  // Use a distributor to position the dice around a smaller ring inside the circle.
  const circleRadius = 0.5 * gsap.getProperty(startCircle, "width");
  const ringRadius = 0.7 * circleRadius;
  const {x: centerX, y: centerY} = getCenter(circle);
  const angleDistributor = gsap.utils.distribute({
    base: 0,
    amount: 360,
    from: "start"
  });
  dice.forEach((die, i, a) => {
    const angle = angleDistributor(i, die, a);
    gsap.set(die, {
      x: ringRadius * Math.cos(angle * (Math.PI / 180)) + centerX,
      y: ringRadius * Math.sin(angle * (Math.PI / 180)) + centerY
    });
  });
};

const testGrid = {
  x: gsap.utils.distribute({
    base: CONTAINERPADDING.left,
    amount: CONTAINER.width() - $("#sidebar").width() - CONTAINERPADDING.left - CONTAINERPADDING.right,
    from: "start",
    grid: [2, 3],
    axis: "x"
  }),
  y: gsap.utils.distribute({
    base: CONTAINERPADDING.top,
    amount: CONTAINER.height() - CONTAINERPADDING.top - CONTAINERPADDING.bottom,
    from: "start",
    grid: [2, 3],
    axis: "y"
  })
};

export default () => {
  [
    [3, {r: 255, g: 0, b: 255}],
    [5, {r: 0, g: 255, b: 255}],
    [7, {r: 255, g: 0, b: 0}],
    [9, {r: 255, g: 255, b: 0}],
    [11, {r: 0, g: 0, b: 255}],
    [13, {r: 0, g: 255, b: 0}]
  ]
    .map((circParams, i, a) => [...circParams, {
      left: testGrid.x(i, circParams, a),
      top: testGrid.y(i, circParams, a),
      height: 200,
      width: 200
    }])
    .forEach((params) => createCircle(...params));
};gsap.registerPlugin(InertiaPlugin);

const CONTAINER = $("#circle-container");
const [CIRCLES, DICE] = [[], []];

/* ████████ UTILITY FUNCTIONS ████████ */
/* ▮▮▮▮▮▮▮▮ Calculating Closest Element to Target ▮▮▮▮▮▮▮▮ */
const getCenter = (elem) => {
  /* Returns the center point of an element. */
  return {
    x: gsap.getProperty(elem, "x"),
    y: gsap.getProperty(elem, "y")
  };
};
const getDistance = ({x: x1, y: y1}, {x: x2, y: y2}) => {
  /* Returns the distance between two points. */
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};
const getDistanceBetween = (elemA, elemB) => {
  /* Returns the distance between the centers of two elements. */
  return getDistance(getCenter(elemA), getCenter(elemB));
};
const getClosestToPoint = ({x, y}, targetElems, excludeTargets = []) => {
  /* Given a point and an array of possible targets, returns the target closest 
     to the point. Can optionally provide a subset of targets to exclude. */
  let closestDistance, closestTarget;
  targetElems
    .filter((target) => !excludeTargets.includes(target))
    .forEach((target) => {
      const distance = getDistance({x, y}, getCenter(target));
      if (distance < (closestDistance ?? Infinity)) {
        closestDistance = distance;
        closestTarget = target;
      }
    });
  return closestTarget;
};
const getClosestToElem = (elem, targetElems, excludeElems = []) => {
  /* Given an element and an array of possible targets, returns the target closest 
     to the element's center. Can optionally provide a subset of targets to exclude. */
  return getClosestToPoint(getCenter(elem), targetElems, excludeElems);
};

/* ▮▮▮▮▮▮▮▮ Initializing Dice Positions ▮▮▮▮▮▮▮▮ */


/* ████████ INITIALIZATION: EFFECTS & DOM ELEMENTS ████████ */
/* ▮▮▮▮▮▮▮▮ Effect: Constant Rotation ▮▮▮▮▮▮▮▮ */
gsap.registerEffect({
  name: "constantRotate",
  defaults: { duration: 300 },
  effect: (targets, config) => gsap.to(targets, {rotation: "+=360", duration: config.duration, ease: "circ", repeat: -1});
});

/* ▮▮▮▮▮▮▮▮ Creation: Draggable Dice Elements ▮▮▮▮▮▮▮▮ */
const createDie = () => {
  /* Creates a Draggable die element */
  const dieNum = DICE.length + 1;  
  const [die] = Draggable.create(
    $(`<div id="die-${dieNum}" class="roll-die" />`).appendTo("#container"),
    {
      type: "x,y",
      inertia: true,       
      snap: {
        points(point) {
          /* To keep this demo concise, I've only included the basic snapping logic.
             (The actual version animates various visual feedback effects, and excludes the die's starting
             circle from its possible targets) */
          const closestCircle = getClosestToPoint(point, CIRCLES);
          return getCenter(closestCircle);
        }
      }
    }
  );
  DICE.push(die);
  return die;
};

/* ▮▮▮▮▮▮▮▮ Creation: Roll Circles ▮▮▮▮▮▮▮▮ */
const createCircle = (numDice, color, {left, top}) => {
  /* Creates the target circles the Draggable dice snap to, as well as the dice that start in that circle. */
  
  // Create the circle element
  const circleNum = CIRCLES.length + 1;
  const circleID = `rollCircle${CIRCLES.length + 1}`;
  const rollCircle = $(`<div id="rollCircle-${circleNum}" class="roll-circle ${color}" />`).appendTo("#container");
  
  // Set the circle's position and apply the rotation effect
  gsap.set(rollCircle, {left, top});
  gsap.effects.rotate(rollCircle);
  CIRCLES.push(rollCircle);
  
  // Create the dice in each circle
  const circleDice = new Array(numDice).fill(createDie());
  
  // Use a distributor to position the dice around a smaller ring inside the circle.
  const circleRadius = 0.5 * gsap.getProperty(startCircle, "width");
  const ringRadius = 0.7 * circleRadius;
  const {x: centerX, y: centerY} = getCenter(circle);
  const angleDistributor = gsap.utils.distribute({
    base: 0,
    amount: 360,
    from: "start"
  });
  dice.forEach((die, i, a) => {
    const angle = angleDistributor(i, die, a);
    gsap.set(die, {
      x: ringRadius * Math.cos(angle * (Math.PI / 180)) + centerX,
      y: ringRadius * Math.sin(angle * (Math.PI / 180)) + centerY
    });
  });
};

// Initialize three roll circles with six dice each:
createCircle(6, "magenta", {
  left: 40,
  top: 40
});
createCircle(6, "yellow", {
  left: CONTAINER.width() - 200 - 40,
  top: 40
});
createCircle(6, "cyan", {
  left: 0.5 * (CONTAINER.width() - 200),
  top: CONTAINER.height() - 200 - 40
});