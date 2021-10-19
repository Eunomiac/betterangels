/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 13 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

class XItem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Registry, Enumerables, Constants ░░░░░░░
  static get REGISTRY() { return (this._REGISTRY = this._REGISTRY ?? {}) }
  static get TYPES() { return { } }
  static get CLASSES() { return ["x-item"] }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static NameItem(item) {
    const nameTest = new RegExp(`${this._owner}_${this._type}_`);
    const itemNum = parseInt(Object.keys(this.REGISTRY)
      .filter((key) => nameTest.test(key)).pop()?.match(/_(\d+)$/)?.pop() ?? 0) + 1;
    item._name = `${item._owner}_${item._type}_${itemNum}`;
  }
  static Register(item) { this.REGISTRY[item.name] = item }
  static Unregister(item) { delete this.REGISTRY[item.name] }

  // ████████ CONSTRUCTOR ████████
  constructor({circle, type, ...options} = {}) {
    if (circle && !(circle instanceof XCircle)) { throw new Error(`[new XItem] '${circle.name}' is not a valid Circle.`) }
  
    this._type = this._checkType(type);
    this._owner = options?.owner ?? circle?.owner?.id ?? U.GMID;
    this.staticClass.NameItem(this);
  
    this.staticClass.Register(this);
    this._create(circle);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get staticClass() { return XItem }

  get x() { return gsap.getProperty(this.elem, "x") }
  get y() { return gsap.getProperty(this.elem, "y") }
  get rotation() { return gsap.getProperty(this.elem, "rotation") }

  get owner() { return game.users.get(this._owner) }
  get name() { return this._name }
  get id() { return `x-item-${this.name}` }
  get elem() { return this._elem }
  get $() { return $(this.elem) }
  get defaultClasses() { return this.staticClass.CLASSES }
  get classList() { return this.elem.classList }

  // ░░░░░░░ Writeable ░░░░░░░
  get classes() { return [...this.defaultClasses, U.formatAsClass(this.type)] }
  set classes(v) {
    v = [...this.classes, ...Array.from([v].flat())];
    this.classList.forEach((c) => { if (!v.includes(c)) { this.classList.remove(c) } });
    v.forEach((c) => this.classList.add(c));
  }

  get type() { return this._type }
  set type(v) { this._type = this._checkType(v); this.classes = [] }

  get parent() { return this._parent }
  set parent(v) {
    const [elem] = $(`#${v?.id ?? "noElemFound"}`);
    if (elem) {
      const {x, y} = MotionPathPlugin.convertCoordinates(
        this.parent?.elem ?? this.parent ?? this.elem,
        elem,
        {x: this.x, y: this.y}
      );
      this._parent = v;
      this.set({x, y});
      $(this.elem).appendTo(elem);
    } else {
      throw new Error(`[XItem.parent] No element found for '${v}'`);
    }
  }
  get circle() { return this.parent instanceof XCircle ? this.parent : undefined }
  set circle(v) {
    if (v instanceof XCircle) {
      this.parent = v;
    } else {
      throw new Error(`[XItem.parent] '${v}' is not an XCircle`);
    }
  }

  get closestCircle() { return (this._closestCircle = this.circle ?? this._closestCircle ?? XCircle.GetClosestTo(this)) }
  set closestCircle(v) { this._closestCircle = v }

  get pathWeight() { return (this._pathWeight = this._pathWeight ?? 1) }
  set pathWeight(v) { this._pathWeight = v }

  get isMoving() { return this._isMoving }
  set isMoving(v) { this._isMoving = Boolean(v) }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${this.classes}">X</div>`).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
    if (startCircle) {
      this.circle = startCircle;
    } else {
      this._parent = XCircle.CONTAINER;
    }
  }

  // ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░
  _getType(type) {
    type = this.staticClass.TYPES[type] ?? type;
    return Object.values(this.staticClass.TYPES).includes(type)
      ? type
      : false
  }
  _checkType(type) {
    if (this._getType(type)) { return this._getType(type) }
    throw new Error(`Invalid Item Type: ${type}`);
  }
  _checkClosestCircle({x, y}) {
    x = x ?? this.x;
    y = y ?? this.y;
    if (this.circle) {
      this.closestCircle?.unwatchItem(this);
      delete this._closestCircle;
    } else {      
      const closestCircle = XCircle.GetClosestTo({x, y});
      if (closestCircle.name !== this.closestCircle?.name) {
        this.closestCircle?.unwatchItem(this);
        this.closestCircle = closestCircle;
        this.closestCircle.watchItem(this);
      }
    }
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░
  straighten() { gsap.set(this.elem, {rotation: -1 * this.parent?.rotation ?? 0}) }

  // ████████ PUBLIC METHODS ████████
  set(params) { gsap.set(this.elem, params) }

  kill() {
    XItem.Unregister(this);
    $(`#${this.id}`).remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  get slot() { return this.circle 
    ? this.circle._}
  set slot(v) {
    if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }

  }
  set pathPos(v) {

  }

    async _redistributeDice(newSlots, duration = 1, isStartPosOK = false) {

      const oldSlots = [...this.slots];
      newSlots = Array.isArray(newSlots)
        ? newSlots
        : this._checkSnap(newSlots, this.slots);
      // const newSlotRecord = [...newSlots];
  
      const slotCompare = this._compareSlots(newSlots, oldSlots);
      if (slotCompare.isEqual) { return Promise.resolve() }
      if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
        newSlots = [
          oldSlots[oldSlots.length - 1],
          ...oldSlots.slice(1, -1),
          oldSlots[0]
        ];
      }
  
      this._slots = [...newSlots];
  
      const oldPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
      const newPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, this.slots)]));
  
      const circle = this;
  
      return Promise.allSettled(this.dice
        .map((item) => new Promise((resolve, reject) => {
          let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
          const newPathPos = newPositions[item.id].pathPos;
  
          // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
          // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
          if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
            if (oldPathPos > newPathPos) {
              oldPathPos--;
            } else {
              oldPathPos++;
            }
          }
          console.log(gsap.to(item.elem, {
            motionPath: {
              path: circle.snap.elem,
              alignOrigin: [0.5, 0.5],
              start: oldPathPos,
              end: newPathPos,
              fromCurrent: true // item.id in oldPositions
            },
            duration,
            ease: "power4.out",
            onComplete: resolve,
            onUpdate() {
              // const {onUpdate, ...theRest} = this;
              // item._pathPos = JSON.parse(JSON.stringify(theRest));
            },
            onInterrupt: reject
          }));
        })));
    }

  }
  straighten() {
    gsap.set(this.elem, {
      rotation: -1 * this.circle?.rotation ?? 0
    });
  }

}

class XDie extends XItem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ░░░░░░░[Getters]░░░░ Enumerables, Constants ░░░░░░░
  static get TYPES() { return { ...super.TYPES, xDieBasic: "xDieBasic" } }
  static get CLASSES() { return [...super.CLASSES, "x-die"] }

  // ████████ CONSTRUCTOR ████████
  constructor(options = {}) {
    options.pathWeight = options.pathWeight ?? 1;
    options.type = XDie.TYPES[options.type] ?? options.type ?? XDie.TYPES.dieBasic;
    super(options);
  }

  // ████████ GETTERS & SETTERS ████████
  // ░░░░░░░ Read-Only ░░░░░░░
  get staticClass() { return XDie }

  get id() { return `die-${this.name}` }
  get classes() { return XDie.GetClasses(this) }

  // ░░░░░░░ Writeable ░░░░░░░
  set parent(v) {
    super.parent = v;
    this.straighten();
  }

  get type() { return this._type }
  set type(v) {
    $(this.elem)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░

  // ████████ PUBLIC METHODS ████████
  set(params) { gsap.set(this.elem, params) }

  kill() {
    XItem.Unregister(this);
    $(`#${this.id}`).remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  get slot() { return this.circle 
    ? this.circle._}
  set slot(v) {
    if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }

  }
  set pathPos(v) {

  }

    async _redistributeDice(newSlots, duration = 1, isStartPosOK = false) {

      const oldSlots = [...this.slots];
      newSlots = Array.isArray(newSlots)
        ? newSlots
        : this._checkSnap(newSlots, this.slots);
      // const newSlotRecord = [...newSlots];
  
      const slotCompare = this._compareSlots(newSlots, oldSlots);
      if (slotCompare.isEqual) { return Promise.resolve() }
      if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
        newSlots = [
          oldSlots[oldSlots.length - 1],
          ...oldSlots.slice(1, -1),
          oldSlots[0]
        ];
      }
  
      this._slots = [...newSlots];
  
      const oldPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
      const newPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, this.slots)]));
  
      const circle = this;
  
      return Promise.allSettled(this.dice
        .map((item) => new Promise((resolve, reject) => {
          let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
          const newPathPos = newPositions[item.id].pathPos;
  
          // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
          // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
          if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
            if (oldPathPos > newPathPos) {
              oldPathPos--;
            } else {
              oldPathPos++;
            }
          }
          console.log(gsap.to(item.elem, {
            motionPath: {
              path: circle.snap.elem,
              alignOrigin: [0.5, 0.5],
              start: oldPathPos,
              end: newPathPos,
              fromCurrent: true // item.id in oldPositions
            },
            duration,
            ease: "power4.out",
            onComplete: resolve,
            onUpdate() {
              // const {onUpdate, ...theRest} = this;
              // item._pathPos = JSON.parse(JSON.stringify(theRest));
            },
            onInterrupt: reject
          }));
        })));
    }

  }
  straighten() {
    gsap.set(this.elem, {
      rotation: -1 * this.circle?.rotation ?? 0
    });
  }

}

class XDragDie extends XDie {
  // ████████ GETTERS & SETTERS ████████
  get staticClass() { return XDragDie }

  set parent(v) {
    super.parent = v;
    this.dragger.update(false, this.isDragging);
  }

  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return super.isMoving || this.isDragging || this.isThrowing }

  // ░░░░░░░ Writeable ░░░░░░░
  get type() { return this._type }
  set type(v) {
    $(this.elem)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    super._create(startCircle);
    this._createDragger();
  }

  _createDragger() {
    const xDragDie = this;
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart() {
          this._isDragging = true;
          this._checkClosestCircle();
          this.circle?.pluckItem(this);
          this.parent = XCircle.CONTAINER;
        },
        onDrag() { this._checkClosestCircle() },
        snap: { get points() { return XCircle.SnapPoints } },
        onDragEnd() {
          this._isDragging = false;
          this._checkClosestCircle({x: this.dragger.endX, y: this.dragger.endY});
          this.closestCircle.catchItem(this);
        }
      }
    );
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${XItem.GetClasses(this)}">X</div>`).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
    if (startCircle) {
      this.circle = circle;
    } else {
      this.parent = XCircle.CONTAINER;
    }
  }

  // ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░
  _checkClosestCircle({x, y}) {
    x = x ?? this.x;
    y = y ?? this.y;
    if (this.circle) {
      this.closestCircle?.unwatchItem(this);
      delete this._closestCircle;
    } else {      
      const closestCircle = XCircle.GetClosestTo({x, y});
      if (closestCircle.name !== this.closestCircle?.name) {
        this.closestCircle?.unwatchItem(this);
        this.closestCircle = closestCircle;
        this.closestCircle.watchItem(this);
      }
    }
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░

  // ████████ PUBLIC METHODS ████████
  set(params) { gsap.set(this.elem, params) }

  kill() {
    XItem.Unregister(this);
    $(`#${this.id}`).remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  get slot() { return this.circle 
    ? this.circle._}
  set slot(v) {
    if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }

  }
  set pathPos(v) {

  }

    async _redistributeDice(newSlots, duration = 1, isStartPosOK = false) {

      const oldSlots = [...this.slots];
      newSlots = Array.isArray(newSlots)
        ? newSlots
        : this._checkSnap(newSlots, this.slots);
      // const newSlotRecord = [...newSlots];
  
      const slotCompare = this._compareSlots(newSlots, oldSlots);
      if (slotCompare.isEqual) { return Promise.resolve() }
      if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
        newSlots = [
          oldSlots[oldSlots.length - 1],
          ...oldSlots.slice(1, -1),
          oldSlots[0]
        ];
      }
  
      this._slots = [...newSlots];
  
      const oldPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
      const newPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, this.slots)]));
  
      const circle = this;
  
      return Promise.allSettled(this.dice
        .map((item) => new Promise((resolve, reject) => {
          let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
          const newPathPos = newPositions[item.id].pathPos;
  
          // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
          // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
          if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
            if (oldPathPos > newPathPos) {
              oldPathPos--;
            } else {
              oldPathPos++;
            }
          }
          console.log(gsap.to(item.elem, {
            motionPath: {
              path: circle.snap.elem,
              alignOrigin: [0.5, 0.5],
              start: oldPathPos,
              end: newPathPos,
              fromCurrent: true // item.id in oldPositions
            },
            duration,
            ease: "power4.out",
            onComplete: resolve,
            onUpdate() {
              // const {onUpdate, ...theRest} = this;
              // item._pathPos = JSON.parse(JSON.stringify(theRest));
            },
            onInterrupt: reject
          }));
        })));
    }

  }
  straighten() {
    gsap.set(this.elem, {
      rotation: -1 * this.circle?.rotation ?? 0
    });
  }

}

class XSnap extends XItem {
  // ████████ STATIC: Static Getters, Setters, Methods ████████
  // ========== Enumeration Objects ===========
  static get TYPES() { return {
    dieSnap: "dieSnap"
    ...super.TYPES
  } }

  // ░░░░░░░[Methods]░░░░ Static Methods ░░░░░░░
  static GetClasses(snap) {
    return [
      ...super.GetClasses(snap),
      "x-snap",
      ...{
        dieSnap: ["x-die"]
      }[snap.type]
    ];
  }

  // ████████ CONSTRUCTOR ████████
  constructor(options = {}) {
    options.pathWeight = options.pathWeight ?? 2;
    options.type = XSnap.TYPES[options.type] ?? options.type ?? XSnap.TYPES.dieSnap;
    super(options);
  }

  // ████████ GETTERS & SETTERS ████████
  get staticClass() { return XDragDie }

  set parent(v) {
    super.parent = v;
    this.dragger.update(false, this.isDragging);
  }

  get dragger() { return this._dragger }
  get isThrowing() { return this.dragger?.isThrowing }
  get isDragging() { return this._isDragging && !this.isThrowing }
  get isMoving() { return super.isMoving || this.isDragging || this.isThrowing }

  // ░░░░░░░ Writeable ░░░░░░░
  get type() { return this._type }
  set type(v) {
    $(this.elem)
      .removeClass(`ore-${this.type}`)
      .addClass(`ore-${v}`);
    this._type = v;
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    super._create(startCircle);
    this._createDragger();
  }

  _createDragger() {
    const xDragDie = this;
    [this._dragger] = Dragger.create(
      this.elem,
      {
        type: "x,y",
        inertia: true,
        callbackScope: this,
        minDuration: 2,
        throwResistance: 100,
        onDragStart() {
          this._isDragging = true;
          this._checkClosestCircle();
          this.circle?.pluckItem(this);
          this.parent = XCircle.CONTAINER;
        },
        onDrag() { this._checkClosestCircle() },
        snap: { get points() { return XCircle.SnapPoints } },
        onDragEnd() {
          this._isDragging = false;
          this._checkClosestCircle({x: this.dragger.endX, y: this.dragger.endY});
          this.closestCircle.catchItem(this);
        }
      }
    );
  }

  // ████████ PRIVATE METHODS ████████
  // ░░░░░░░[Initializing]░░░░ Creating DOM Elements ░░░░░░░
  _create(startCircle) {
    [this._elem] = $(`<div id="${this.id}" class="${XItem.GetClasses(this)}">X</div>`).appendTo(XCircle.CONTAINER);
    this.set({xPercent: -50, yPercent: -50});
    if (startCircle) {
      this.circle = circle;
    } else {
      this.parent = XCircle.CONTAINER;
    }
  }

  // ░░░░░░░[Elements]░░░░ Managing Item Element ░░░░░░░
  _checkClosestCircle({x, y}) {
    x = x ?? this.x;
    y = y ?? this.y;
    if (this.circle) {
      this.closestCircle?.unwatchItem(this);
      delete this._closestCircle;
    } else {      
      const closestCircle = XCircle.GetClosestTo({x, y});
      if (closestCircle.name !== this.closestCircle?.name) {
        this.closestCircle?.unwatchItem(this);
        this.closestCircle = closestCircle;
        this.closestCircle.watchItem(this);
      }
    }
  }

  // ░░░░░░░[Animation]░░░░ Animation Effects, Tweens, Timelines ░░░░░░░

  // ████████ PUBLIC METHODS ████████
  set(params) { gsap.set(this.elem, params) }

  kill() {
    XItem.Unregister(this);
    $(`#${this.id}`).remove();
  }
  // ░░░░░░░ Animation ░░░░░░░
  get slot() { return this.circle 
    ? this.circle._}
  set slot(v) {
    if (!this.circle) { throw new Error(`[XItem.slot] '${this.name}' is not parented to a circle.`) }

  }
  set pathPos(v) {

  }

    async _redistributeDice(newSlots, duration = 1, isStartPosOK = false) {

      const oldSlots = [...this.slots];
      newSlots = Array.isArray(newSlots)
        ? newSlots
        : this._checkSnap(newSlots, this.slots);
      // const newSlotRecord = [...newSlots];
  
      const slotCompare = this._compareSlots(newSlots, oldSlots);
      if (slotCompare.isEqual) { return Promise.resolve() }
      if (slotCompare.isSameOrder && "cycleSlot" in slotCompare) {
        newSlots = [
          oldSlots[oldSlots.length - 1],
          ...oldSlots.slice(1, -1),
          oldSlots[0]
        ];
      }
  
      this._slots = [...newSlots];
  
      const oldPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, oldSlots)]));
      const newPositions = Object.fromEntries(this.dice.map((item) => [item.id, this._getItemPos(item, this.slots)]));
  
      const circle = this;
  
      return Promise.allSettled(this.dice
        .map((item) => new Promise((resolve, reject) => {
          let oldPathPos = oldPositions[item.id]?.pathPos ?? 0;
          const newPathPos = newPositions[item.id].pathPos;
  
          // OLD: 0.9 to NEW: 0.1   --> startAt OLD--
          // OLD: 0.1 to NEW: 0.9   --> startAt OLD++
          if (circle._checkSlots(item, oldSlots) && Math.abs(oldPathPos - newPathPos) > 0.6) {
            if (oldPathPos > newPathPos) {
              oldPathPos--;
            } else {
              oldPathPos++;
            }
          }
          console.log(gsap.to(item.elem, {
            motionPath: {
              path: circle.snap.elem,
              alignOrigin: [0.5, 0.5],
              start: oldPathPos,
              end: newPathPos,
              fromCurrent: true // item.id in oldPositions
            },
            duration,
            ease: "power4.out",
            onComplete: resolve,
            onUpdate() {
              // const {onUpdate, ...theRest} = this;
              // item._pathPos = JSON.parse(JSON.stringify(theRest));
            },
            onInterrupt: reject
          }));
        })));
    }

  }

}