// Can EASILY modify the snapping to first check if it has been moved a minimum distance
// from its origin: If it has, exclude the origin from the list of circles to check for closest
// distance to.
//
// Set up a hash table grid (10x10 pixels?) and precalculate which circle it will presnap to
//
// Each step, can highlight/glow what it will snap to at its current position (not counting momentum)
// Can scale intensity of glow with "weight" of each circle's "pull"
// Have scale go UP for origin circle, as ball nears minimum distance, so that it 'snaps' into nothing
//   when it breaks free.
// Can use this for separating sets as well!
// Can have sets get pushed away from ball as it snaps free
// Can have sets FIRST start to glow, then magnetically move towards ball as it approaches

const NEARNESSTHRESHOLD = 100;
const COLORCLASSES = ["blue", "red", "green", "grey", "no-outline"];

const CONTAINER = $(".vtt.game.system-betterangels");
const CIRCLES = [];
const DICE = [];

const getCenterPoint = (elem) => {
  if (!$(elem).offset) { elem = $(elem.target) }
  return {
    left: $(elem).offset().left + 0.5 * $(elem).width(),
    top: $(elem).offset().top + 0.5 * $(elem).height()
  };
};

const wiggle = (midPoint, range, paddingMult = 0) => {
  const padding = paddingMult * range / 2;
  return midPoint + (Math.random() - 0.5) * (range - padding * 2);
};
const getDistanceToPoint = ({posX, posY}, elem) => {
  const {left, top} = getCenterPoint(elem);
  const dx = posX - left;
  const dy = posY - top;
  return Math.sqrt(dx * dx + dy * dy);
};
const getDistanceToElem = (elemA, elemB) => {
  const {left, top} = getCenterPoint(elemA);
  return getDistanceToPoint({
    posX: left,
    posY: top
  }, elemB);
};

const getClosestToPoint = ({posX, posY}, targetElems, startContainer = false) => {
  let closestDistance, closestTarget;
  targetElems.forEach((target) => {
    if (target !== startContainer) {
      const distance = getDistanceToPoint({posX, posY}, target);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
        closestTarget = target;
      }
    }
  });
  return closestTarget;
};
const getClosestToElem = (elem, targetElems, startContainer = false) => {
  const {left, top} = getCenterPoint(elem);
  return getClosestToPoint({
    posX: left,
    posY: top
  }, targetElems, startContainer);
};

const isInside = (dragElem, targetElem) => dragElem.hitTest(targetElem, "100%");
const isTouching = (dragElem, targetElem) => dragElem.hitTest(targetElem);
const isNear = (elem, targetElem) => getDistanceToElem(elem, targetElem) < (NEARNESSTHRESHOLD + ($(targetElem).width() * 0.5));

const changeCircleColor = (elem, className) => {
  if (elem && className) {
    [elem] = $("offset" in $(elem) ? elem : elem.target);
    elem.newColorClass = className;
    if (!elem.isChangingColor) {
      updateCircleColor(elem);
    }
  }
};

const updateCircleColor = (elem) => {
  if (elem) {
    [elem] = $("offset" in $(elem) ? elem : elem.target);
    const [curColorClass] = Array.from(elem.classList).filter((cls) => COLORCLASSES.includes(cls));
    elem.newColorClass = elem.newColorClass ?? "";
    if (curColorClass === elem.newColorClass) {
      elem.isChangingColor = false;
    } else {
      elem.isChangingColor = true;
      $(elem).switchClass(
        curColorClass,
        elem.newColorClass,
        {
          duration: 300,
          easing: "swing",
          complete: () => {
            elem.isChangingColor = false;
            updateCircleColor(elem);
          }
        }
      );
    }
  }
};

const createDie = ({circle, color}) => {
  const dieID = `die${DICE.length + 1}`;
  const [die] = Draggable.create(
    $(`<div id="${dieID}" />`)
      .appendTo(".vtt.game.system-betterangels")
      .css({
        "position": "absolute",
        "background": `radial-gradient(ellipse, #FFFFFF, ${color} 90%)`,
        "height": 20,
        "width": 20,
        "border-radius": 10,
        "border": `3px solid ${color}`
      }),
    {
      dragResistance: 0,
      type: "x,y",
      inertia: true,
      snap: {
        points(point) {
          let closestCircle = getClosestToPoint({
            posX: point.x,
            posY: point.y
          }, CIRCLES);
          if (closestCircle === this.startCircle && !isInside(this, this.startCircle)) {
            closestCircle = getClosestToPoint({
              posX: point.x,
              posY: point.y
            }, CIRCLES, this.startCircle);
          }
          const {left, top} = getCenterPoint(closestCircle);
          return {
            x: wiggle(left - (0.5 * $(this.target).width()), $(closestCircle).width(), 0.6),
            y: wiggle(top - (0.5 * $(this.target).height()), $(closestCircle).height(), 0.6)
          };
        }
      },
      onDragStart() {
        const closestCircle = getClosestToElem(this.target, CIRCLES);
        if (isInside(this, closestCircle)) {
          this.startCircle = closestCircle;
          changeCircleColor(this.startCircle, "green");
        }
      },
      onDrag() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
          }
          changeCircleColor(this.startCircle, "green");
        } else {
          changeCircleColor(this.startCircle, "red");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
            this.closestCircle = closestCircle;
          }
          if (this.closestCircle !== this.startCircle) {
            if (isNear(this.target, this.closestCircle)) {
              changeCircleColor(this.closestCircle, "green");
            } else {
              changeCircleColor(this.closestCircle, "blue");
            }
          }
        }
      },
      onThrowUpdate() {
        if (isInside(this, this.startCircle)) {
          if (this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
          }
          changeCircleColor(this.startCircle, "green");
        } else {
          changeCircleColor(this.startCircle, "red");
          const closestCircle = getClosestToElem(this.target, CIRCLES, this.startCircle);
          if (closestCircle !== this.closestCircle) {
            changeCircleColor(this.closestCircle, "no-outline");
            this.closestCircle = closestCircle;
          }
          if (this.closestCircle !== this.startCircle) {
            if (isNear(this.target, this.closestCircle)) {
              changeCircleColor(this.closestCircle, "green");
            } else {
              changeCircleColor(this.closestCircle, "blue");
            }
          }
        }
      },
      onThrowComplete() {
        changeCircleColor(this.startCircle, "no-outline");
        changeCircleColor(this.closestCircle, "no-outline");
        this.startCircle = null;
        this.closestCircle = null;
      }
    }
  );
  const {left, top} = getCenterPoint($(circle));
  gsap.set(`#${dieID}`, {
    x: wiggle(left - (0.5 * $(die.target).width()), $(circle).width(), 0.6),
    y: wiggle(top - (0.5 * $(die.target).height()), $(circle).height(), 0.6)
  });
  DICE.push(die);
};

const createCircle = (numDice, color, css = {}) => {
  const styles = {
    "height": 200,
    "width": 200,
    "position": "absolute",
    "pointer-events": "none",
    "background": `radial-gradient(ellipse, transparent, ${color} 70%)`,
    "border-radius": "50%",
    ...css
  };
  const circleID = `rollCircle${CIRCLES.length + 1}`;
  const rollCircle = $(`<div id="${circleID}"/>`)
    .appendTo(".vtt.game.system-betterangels")
    .css(styles);
  CIRCLES.push(rollCircle);
  changeCircleColor(rollCircle, "no-outline");
  for (let i = 0; i < numDice; i++) {
    createDie({circle: rollCircle, color: "#00FF00"});
  }
};

[
  [6, "#FF00FF", {top: 40, left: 40}],
  [6, "#FFFF00", {top: 40, left: CONTAINER.width() - 200 - 40}],
  [6, "#00FFFF", {top: CONTAINER.height() - 200 - 40, left: (CONTAINER.width() - 200) / 2}]
].forEach((params) => createCircle(...params));
