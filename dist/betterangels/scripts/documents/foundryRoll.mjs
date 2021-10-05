/* ****▌███████████████████████████████████████████████████████████████████████████▐**** *\
|*     ▌███████░░░░░░░░░░░░░░ Better Angels for Foundry VTT ░░░░░░░░░░░░░░░░███████▐     *|
|*     ▌██████████████████░░░░░░░░░░░░░ by Eunomiac ░░░░░░░░░░░░░██████████████████▐     *|
|*     ▌███████████████ MIT License █ v0.0.1-prealpha █ Oct 05 2021 ███████████████▐     *|
|*     ▌████████░░░░░░░░ https://github.com/Eunomiac/betterangels ░░░░░░░░█████████▐     *|
\* ****▌███████████████████████████████████████████████████████████████████████████▐**** */

class Roll {
  constructor(formula, data={}, options={}) {

    this.data = this._prepareData(data);

    this.options = options;

    this.terms = this.constructor.parse(formula, this.data);

    this._dice = [];

    this._formula = this.constructor.getFormula(this.terms);

    this._evaluated = false;

    this._total = undefined;
  }

  static MATH_PROXY = new Proxy(Math, {has: () => true, get: (t, k) => k === Symbol.unscopables ? undefined : t[k]});

  static CHAT_TEMPLATE = "templates/dice/roll.html";

  static TOOLTIP_TEMPLATE = "templates/dice/tooltip.html";

  /* -------------------------------------------- */

  _prepareData(data) {
    return data;
  }

  /* -------------------------------------------- */
  /*  Roll Attributes                             */
  /* -------------------------------------------- */

  get dice() {
    return this._dice.concat(this.terms.reduce((dice, t) => {
      if ( t instanceof DiceTerm ) dice.push(t);
      else if ( t instanceof PoolTerm ) dice = dice.concat(t.dice);
      return dice;
    }, []));
  }

  /* -------------------------------------------- */

  get formula() {
    return this.constructor.getFormula(this.terms);
  }

  /* -------------------------------------------- */

  get result() {
    return this.terms.map(t => t.total).join("");
  }

  /* -------------------------------------------- */

  get total() {
    return this._total;
  }

  /* -------------------------------------------- */
  /*  Roll Instance Methods                       */
  /* -------------------------------------------- */

  alter(multiply, add, {multiplyNumeric=false}={}) {
    if ( this._evaluated ) throw new Error("You may not alter a Roll which has already been evaluated");

    // Alter dice and numeric terms
    this.terms = this.terms.map(term => {
      if ( term instanceof DiceTerm ) return term.alter(multiply, add);
      else if ( (term instanceof NumericTerm) && multiplyNumeric ) term.number *= multiply;
      return term;
    });

    // Update the altered formula and return the altered Roll
    this._formula = this.constructor.getFormula(this.terms);
    return this;
  }

  /* -------------------------------------------- */

  clone() {
    return new this.constructor(this._formula, this.data, this.options);
  }

  /* -------------------------------------------- */

  evaluate({minimize=false, maximize=false, async}={}) {
    if ( this._evaluated ) {
      throw new Error(`The ${this.constructor.name} has already been evaluated and is now immutable`);
    }
    this._evaluated = true;
    if ( CONFIG.debug.dice ) console.debug(`Evaluating roll with formula ${this.formula}`);

    // Migration path for async rolls
    if ( minimize || maximize ) async = false;
    if ( async === undefined ) {
      console.warn(`Roll#evaluate is becoming asynchronous. In the short term you may pass async=true or async=false to evaluation options to nominate your preferred behavior.`);
      async = false;
    }
    return async ? this._evaluate({minimize, maximize}) : this._evaluateSync({minimize, maximize});
  }

  /* -------------------------------------------- */

  async _evaluate({minimize=false, maximize=false}={}) {

    // Step 1 - Replace intermediate terms with evaluated numbers
    const intermediate = [];
    for ( let term of this.terms ) {
      if ( !(term instanceof RollTerm) ) {
        throw new Error("Roll evaluation encountered an invalid term which was not a RollTerm instance");
      }
      if ( term.isIntermediate ) {
        await term.evaluate({minimize, maximize, async: true});
        this._dice = this._dice.concat(term.dice);
        term = new NumericTerm({number: term.total, options: term.options});
      }
      intermediate.push(term);
    }
    this.terms = intermediate;

    // Step 2 - Simplify remaining terms
    this.terms = this.constructor.simplifyTerms(this.terms);

    // Step 3 - Evaluate remaining terms
    for ( let term of this.terms ) {
      if ( !term._evaluated ) await term.evaluate({minimize, maximize, async: true});
    }

    // Step 4 - Evaluate the final expression
    this._total = this._evaluateTotal();
    return this;
  }

  /* -------------------------------------------- */

  _evaluateSync({minimize=false, maximize=false}={}) {

    // Step 1 - Replace intermediate terms with evaluated numbers
    this.terms = this.terms.map(term => {
      if ( !(term instanceof RollTerm) ) {
        throw new Error("Roll evaluation encountered an invalid term which was not a RollTerm instance");
      }
      if ( term.isIntermediate ) {
        term.evaluate({minimize, maximize, async: false});
        this._dice = this._dice.concat(term.dice);
        return new NumericTerm({number: term.total, options: term.options});
      }
      return term;
    });

    // Step 2 - Simplify remaining terms
    this.terms = this.constructor.simplifyTerms(this.terms);

    // Step 3 - Evaluate remaining terms
    for ( let term of this.terms ) {
      if ( !term._evaluated ) term.evaluate({minimize, maximize, async: false});
    }

    // Step 4 - Evaluate the final expression
    this._total = this._evaluateTotal();
    return this;
  }

  /* -------------------------------------------- */

  _evaluateTotal() {
    const expression = this.terms.map(t => t.total).join(" ");
    const total = Roll.safeEval(expression);
    if ( !Number.isNumeric(total) ) {
      throw new Error(game.i18n.format("DICE.ErrorNonNumeric", {formula: this.formula}));
    }
    return total;
  }

  /* -------------------------------------------- */

  roll(options={}) {
    return this.evaluate(options);
  }

  /* -------------------------------------------- */

  reroll(options={}) {
    const r = this.clone();
    return r.evaluate(options);
  }

  /* -------------------------------------------- */
  /*  Static Class Methods                        */
  /* -------------------------------------------- */

  static create(formula, data={}, options={}) {
    const cls = CONFIG.Dice.rolls[0];
    return new cls(formula, data, options);
  }

  /* -------------------------------------------- */

  static getFormula(terms) {
    return terms.map(t => t.formula).join("");
  }

  /* -------------------------------------------- */

  static safeEval(expression) {
    let result;
    try {
      const src = 'with (sandbox) { return ' + expression + '}';
      const evl = new Function('sandbox', src);
      result = evl(Roll.MATH_PROXY);
    } catch {
      result = undefined;
    }
    if ( !Number.isNumeric(result) ) {
      throw new Error(`Roll.safeEval produced a non-numeric result from expression "${expression}"`);
    }
    return result;
  };

  /* -------------------------------------------- */

  static simplifyTerms(terms) {

    // Simplify terms by combining with pending strings
    let simplified = terms.reduce((terms, term) => {
      const prior = terms[terms.length - 1];
      const isOperator = term instanceof OperatorTerm;

      // Combine a non-operator term with prior StringTerm
      if ( !isOperator && (prior instanceof StringTerm) ) {
        prior.term += term.total;
        foundry.utils.mergeObject(prior.options, term.options);
        return terms;
      }

      // Combine StringTerm with a prior non-operator term
      const priorOperator = prior instanceof OperatorTerm;
      if ( prior && !priorOperator && (term instanceof StringTerm) ) {
        term.term = String(prior.total) + term.term;
        foundry.utils.mergeObject(term.options, prior.options);
        terms[terms.length - 1] = term;
        return terms;
      }

      // Otherwise continue
      terms.push(term);
      return terms;
    }, []);

    // Convert remaining String terms to a RollTerm which can be evaluated
    simplified = simplified.map(term => {
      if ( !(term instanceof StringTerm) ) return term;
      const t = this._classifyStringTerm(term.formula, {intermediate: false});
      t.options = foundry.utils.mergeObject(term.options, t.options, {inplace: false});
      return t;
    });

    // Eliminate leading or trailing arithmetic
    if ( (simplified[0] instanceof OperatorTerm) && (simplified[0].operator !== "-") ) simplified.shift();
    if ( simplified[terms.length-1] instanceof OperatorTerm) simplified.pop();
    return simplified;
  }

  /* -------------------------------------------- */

  static simulate(formula, n=10000) {
    const results = [...Array(n)].map(i => {
      let r = new this(formula);
      return r.evaluate().total;
    }, []);
    const summary = results.reduce((sum, v) => {
      sum.total = sum.total + v;
      if ( (sum.min === null) || (v < sum.min) ) sum.min = v;
      if ( (sum.max === null) || (v > sum.max) ) sum.max = v;
      return sum;
    }, {total: 0, min: null, max: null});
    summary.mean = summary.total / n;
    console.log(`Formula: ${formula} | Iterations: ${n} | Mean: ${summary.mean} | Min: ${summary.min} | Max: ${summary.max}`);
    return results;
  }

  /* -------------------------------------------- */
  /*  Roll Formula Parsing                        */
  /* -------------------------------------------- */

  static parse(formula, data) {
    if ( !formula ) return [];

    // Step 1: Replace formula data and remove all spaces
    let replaced = this.replaceFormulaData(formula, data, {missing: "0"});

    // Step 2: Split outer-most outer-most parenthetical groups
    let terms = this._splitParentheses(replaced);

    // Step 3: Split additional dice pool groups which may contain inner rolls
    terms = terms.flatMap(term => {
      return typeof term === "string" ? this._splitPools(term) : term;
    });

    // Step 4: Further split string terms on arithmetic operators
    terms = terms.flatMap(term => {
      return typeof term === "string" ? this._splitOperators(term) : term;
    });

    // Step 5: Classify all remaining strings
    terms = terms.map((t, i) => this._classifyStringTerm(t, {
      intermediate: true,
      prior: terms[i-1],
      next: terms[i+1]
    }));
    return terms;
  }

  /* -------------------------------------------- */

  static replaceFormulaData(formula, data, {missing, warn=false}={}) {
    let dataRgx = new RegExp(/@([a-z.0-9_\-]+)/gi);
    return formula.replace(dataRgx, (match, term) => {
      let value = foundry.utils.getProperty(data, term);
      if ( value == null ) {
        if ( warn && ui.notifications ) ui.notifications.warn(game.i18n.format("DICE.WarnMissingData", {match}));
        return (missing !== undefined) ? String(missing) : match;
      }
      return String(value).trim();
    });
  }

  /* -------------------------------------------- */

  static validate(formula) {

    // Replace all data references with an arbitrary number
    formula = formula.replace(/@([a-z.0-9_\-]+)/gi, "1");

    // Attempt to evaluate the roll
    try {
      const r = new this(formula);
      r.evaluate({async: false});
      return true;
    }

    // If we weren't able to evaluate, the formula is invalid
    catch(err) {
      return false;
    }
  }

  /* -------------------------------------------- */

  static _splitParentheses(_formula) {
    return this._splitGroup(_formula, {
      openRegexp: ParentheticalTerm.OPEN_REGEXP,
      closeRegexp: ParentheticalTerm.CLOSE_REGEXP,
      openSymbol: "(",
      closeSymbol: ")",
      onClose: group => {

        // Extract group arguments
        const fn = group.open.slice(0, -1);
        const expression = group.terms.join("");
        const options = { flavor: group.flavor ? group.flavor.slice(1, -1) : undefined };

        // Classify the resulting terms
        const terms = [];
        if ( fn in Math ) {
          const args = this._splitMathArgs(expression);
          terms.push(new MathTerm({fn, terms: args, options}));
        }
        else {
          if ( fn ) terms.push(fn);
          terms.push(new ParentheticalTerm({term: expression, options}));
        }
        return terms;
      }
    });
  }

  /* -------------------------------------------- */

  static _splitMathArgs(expression) {
    return expression.split(",").reduce((args, t) => {
      t = t.trim();
      if ( !t ) return args;  // Blank args
      if ( !args.length ) {   // First arg
        args.push(t);
        return args;
      }
      const p = args[args.length-1];  // Prior arg
      const priorValid = Roll.validate(p);
      if ( priorValid ) args.push(t);
      else args[args.length-1] = [p, t].join(","); // Collect inner parentheses or pools
      return args;
    }, []);
  }

  /* -------------------------------------------- */

  static _splitPools(_formula) {
    return this._splitGroup(_formula, {
      openRegexp: PoolTerm.OPEN_REGEXP,
      closeRegexp: PoolTerm.CLOSE_REGEXP,
      openSymbol: "{",
      closeSymbol: "}",
      onClose: group => {
        const terms = this._splitMathArgs(group.terms.join(""));
        const modifiers = Array.from(group.close.slice(1).matchAll(DiceTerm.MODIFIER_REGEXP)).map(m => m[0]);
        const options = { flavor: group.flavor ? group.flavor.slice(1, -1) : undefined };
        return [new PoolTerm({terms, modifiers, options})];
      }
    })
  }

  /* -------------------------------------------- */

  static _splitGroup(_formula, {openRegexp, closeRegexp, openSymbol, closeSymbol, onClose}={}) {
    let {formula, flavors} = this._extractFlavors(_formula);

    // Split the formula on parentheses
    const parts = formula.replace(openRegexp, ";$&;").replace(closeRegexp, ";$&;").split(";");
    let terms = [];
    let nOpen = 0;
    let group = {openIndex: undefined, open: "", terms: [], close: "", closeIndex: undefined, flavor: undefined};

    // Handle closing a group
    const closeGroup = t => {

      // Identify closing flavor text (and remove it)
      const flavor = t.match(/%F[0-9]+%/);
      if ( flavor ) {
        group.flavor = this._restoreFlavor(flavor[0], flavors);
        t = t.slice(0, flavor.index);
      }

      // Treat the remainder as the closing symbol
      group.close = t;

      // Restore flavor to member terms
      group.terms = group.terms.map(t => this._restoreFlavor(t, flavors));
      terms = terms.concat(onClose(group));
    }

    // Map parts to parenthetical groups
    for ( let t of parts ) {
      t = t.trim();
      if ( !t ) continue;

      // New open group
      if ( t.endsWith(openSymbol) ) {
        nOpen++;

        // Open a new group
        if ( nOpen === 1 ) {
          group = {open: t, terms: [], close: "", flavor: undefined};
          continue;
        }
      }

      // Continue an opened group
      if ( nOpen > 0 ) {
        if ( t.startsWith(closeSymbol) ) {
          nOpen--;

          // Close the group
          if ( nOpen === 0 ) {
            closeGroup(t);
            continue;
          }
        }
        group.terms.push(t);
        continue;
      }

      // Regular remaining terms
      terms.push(t);
    }

    // If the group was not completely closed, continue closing it
    if ( nOpen !== 0 ) {
      throw new Error(`Unbalanced group missing opening ${openSymbol} or closing ${closeSymbol}`);
    }

    // Restore withheld flavor text and re-combine strings
    terms = terms.reduce((terms, t) => {
      if ( typeof t === "string" ) { // Re-combine string terms
        t = this._restoreFlavor(t, flavors);
        if ( typeof terms[terms.length-1] === "string" ) terms[terms.length-1] = terms[terms.length-1] + t;
        else terms.push(t);
      }
      else terms.push(t); // Intermediate terms
      return terms;
    }, []);
    return terms;
  }

  /* -------------------------------------------- */

  static _splitOperators(_formula) {
    let {formula, flavors} = this._extractFlavors(_formula);
    const parts = formula.replace(OperatorTerm.REGEXP, ";$&;").split(";");
    return parts.reduce((terms, t) => {
      t = t.trim();
      if ( !t ) return terms;
      const isOperator = OperatorTerm.OPERATORS.includes(t)
      terms.push(isOperator ? new OperatorTerm({operator: t}) : this._restoreFlavor(t, flavors));
      return terms;
    },[]);
  }

  /* -------------------------------------------- */

  static _extractFlavors(formula) {
    const flavors = {};
    let fn = 0;
    formula = formula.replace(RollTerm.FLAVOR_REGEXP, flavor => {
      let key = `%F${fn++}%`;
      flavors[key] = flavor;
      return key;
    });
    return {formula, flavors};
  }

  /* -------------------------------------------- */

  static _restoreFlavor(term, flavors) {
    for ( let [key, flavor] of Object.entries(flavors) ) {
      if ( term.indexOf(key) !== -1 ) {
        delete flavors[key];
        term = term.replace(key, flavor);
      }
    }
    return term;
  }

  /* -------------------------------------------- */

  static _classifyStringTerm(term, {intermediate=true, prior, next}={}) {

    // Terms already classified
    if ( term instanceof RollTerm ) return term;

    // Numeric terms
    const numericMatch = NumericTerm.matchTerm(term);
    if ( numericMatch ) return NumericTerm.fromMatch(numericMatch);

    // Dice terms
    const diceMatch = DiceTerm.matchTerm(term, {imputeNumber: !intermediate});
    if ( diceMatch ) {
      if ( intermediate && (prior?.isIntermediate || next?.isIntermediate) ) return new StringTerm({term});
      return DiceTerm.fromMatch(diceMatch);
    }

    // Remaining strings
    return new StringTerm({term});
  }

  /* -------------------------------------------- */
  /*  Chat Messages                               */
  /* -------------------------------------------- */

  async getTooltip() {
    const parts = this.dice.map(d => d.getTooltipData());
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { parts });
  }

  /* -------------------------------------------- */

  async render(chatOptions={}) {
    chatOptions = foundry.utils.mergeObject({
      user: game.user.id,
      flavor: null,
      template: this.constructor.CHAT_TEMPLATE,
      blind: false
    }, chatOptions);
    const isPrivate = chatOptions.isPrivate;

    // Execute the roll, if needed
    if (!this._evaluated) this.evaluate();

    // Define chat data
    const chatData = {
      formula: isPrivate ? "???" : this._formula,
      flavor: isPrivate ? null : chatOptions.flavor,
      user: chatOptions.user,
      tooltip: isPrivate ? "" : await this.getTooltip(),
      total: isPrivate ? "?" : Math.round(this.total * 100) / 100
    };

    // Render the roll display template
    return renderTemplate(chatOptions.template, chatData);
  }

  /* -------------------------------------------- */

  async toMessage(messageData={}, {rollMode, create=true}={}) {

    // Perform the roll, if it has not yet been rolled
    if (!this._evaluated) await this.evaluate({async: true});

    // Prepare chat data
    messageData = foundry.utils.mergeObject({
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      content: this.total,
      sound: CONFIG.sounds.dice,
    }, messageData);
    messageData.roll = this;

    // Either create the message or just return the chat data
    const cls = getDocumentClass("ChatMessage");
    const msg = new cls(messageData);
    if ( rollMode ) msg.applyRollMode(rollMode);

    // Either create or return the data
    if ( create ) return cls.create(msg.data, { rollMode });
    else return msg.data;
  }

  /* -------------------------------------------- */
  /*  Interface Helpers                           */
  /* -------------------------------------------- */

  static async expandInlineResult(a) {
    if ( !a.classList.contains("inline-roll") ) return;
    if ( a.classList.contains("expanded") ) return;

    // Create a new tooltip
    const roll = Roll.fromJSON(unescape(a.dataset.roll));
    const tip = document.createElement("div");
    tip.innerHTML = await roll.getTooltip();

    // Add the tooltip
    const tooltip = tip.children[0];
    a.appendChild(tooltip);
    a.classList.add("expanded");

    // Set the position
    const pa = a.getBoundingClientRect();
    const pt = tooltip.getBoundingClientRect();
    tooltip.style.left = `${Math.min(pa.x, window.innerWidth - (pt.width + 3))}px`;
    tooltip.style.top = `${Math.min(pa.y + pa.height + 3, window.innerHeight - (pt.height + 3))}px`;
    const zi = getComputedStyle(a).zIndex;
    tooltip.style.zIndex = Number.isNumeric(zi) ? zi + 1 : 100;
  }

  /* -------------------------------------------- */

  static collapseInlineResult(a) {
    if ( !a.classList.contains("inline-roll") ) return;
    if ( !a.classList.contains("expanded") ) return;
    const tooltip = a.querySelector(".dice-tooltip");
    if ( tooltip ) tooltip.remove();
    return a.classList.remove("expanded");
  }

  /* -------------------------------------------- */
  /*  Serialization and Loading                   */
  /* -------------------------------------------- */

  toJSON() {
    return {
      class: this.constructor.name,
      options: this.options,
      dice: this._dice,
      formula: this._formula,
      terms: this.terms,
      total: this._total,
      evaluated: this._evaluated
    }
  }

  /* -------------------------------------------- */

  static fromData(data) {

    // Create the Roll instance
    const roll = new this(data.formula, data.data, data.options);

    // Expand terms
    roll.terms = data.terms.map(t => {
      if ( t.class ) {
        if ( t.class === "DicePool" ) t.class = "PoolTerm"; // backwards compatibility
        return RollTerm.fromData(t);
      }
      return t;
    });

    // Repopulate evaluated state
    if ( data.evaluated ?? true ) {
      roll._total = data.total;
      roll._dice = (data.dice || []).map(t => DiceTerm.fromData(t));
      roll._evaluated = true;
    }
    return roll;
  }

  /* -------------------------------------------- */

  static fromJSON(json) {
    const data = JSON.parse(json);
    const cls = CONFIG.Dice.rolls.find(cls => cls.name === data.class);
    if ( !cls ) throw new Error(`Unable to recreate ${data.class} instance from provided data`);
    return cls.fromData(data);
  }

  /* -------------------------------------------- */

  static fromTerms(terms, options={}) {

    // Validate provided terms
    if ( !terms.every(t => t instanceof RollTerm ) ) {
      throw new Error("All provided terms must be RollTerm instances");
    }
    const allEvaluated = terms.every(t => t._evaluated);
    const noneEvaluated = !terms.some(t => t._evaluated);
    if ( !(allEvaluated || noneEvaluated) ) {
      throw new Error("You can only call Roll.fromTerms with an array of terms which are either all evaluated, or none evaluated");
    }

    // Construct the roll
    const formula = this.getFormula(terms);
    const roll = this.create(formula, {}, options);
    roll.terms = terms;
    roll._evaluated = allEvaluated;
    if ( roll._evaluated ) roll._total = roll._evaluateTotal();
    return roll;
  }

  /* -------------------------------------------- */
  /*  Deprecations                                */
  /* -------------------------------------------- */

  get _rolled() {
    console.warn("You are referencing Roll#_rolled which is deprecated in favor of Roll#_evaluated")
    return this._evaluated;
  }
};