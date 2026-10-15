(function() {
  "use strict";
  const SELECTORS = {
    observationsInput: 'textarea[data-testid="form-custom-field-cf_obs-input"]',
    additionalBirthDatesInput: '[data-testid="form-custom-field-cf_GuestBithday-input"]',
    additionalGuestTaxNumberInput: 'form#modal-additional-guest-form input[data-testid="guest-form-tax-number-input"][name="taxIdNumber"]',
    holderTaxNumberInput: 'input[data-testid="guest-form-tax-number-input"][name="taxIdNumber"]',
    cpfInput: 'input[data-testid="form-custom-field-cf_p176878i174377078310-input"]',
    languageInput: 'input[data-testid="form-custom-field-cf_idioma-input"]',
    birthDateInput: 'input[data-testid="form-custom-field-cf_p176878i174377093000-input"], input[data-testid="form-custom-field-cf_p176878i174377093-input"]',
    documentTypeInput: "#cf_p176878i174377087477-input",
    routeInput: 'input[data-testid="form-custom-field-cf_roteiro-input"], textarea[data-testid="form-custom-field-cf_roteiro-input"]',
    firstName: '[data-testid="guest-form-first-name-input"]',
    lastName: '[data-testid="guest-form-last-name-input"]',
    detailsButton: 'button[data-testid="shopping-cart-summary-toggle-details-button"]',
    adultsInput: 'input[data-testid="form-custom-field-cf_adultospagantes-input"]',
    childrenInput: 'input[data-testid="form-custom-field-cf_Criancas-input"]',
    emergencyContactInput: 'textarea[data-testid="form-custom-field-cf_emergencia-input"]',
    transferInInput: 'textarea[data-testid="form-custom-field-cf_transferin-input"]',
    transferOutInput: 'textarea[data-testid="form-custom-field-cf_transferout-input"]',
    channelInput: 'input[data-testid="form-custom-field-cf_Canal-input"]'
  };
  const PATTERNS = {
    cpf: /^\d{11}$/,
    cpfFormatted: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    passport: /^[A-Za-z0-9]{6,11}$/,
    invalidTerms: /\b(passaporte|passport|doc|documento|id|identidade)\b/i,
    nightsText: /(\d+)\s+(noites?|nights?)/i
  };
  function detectPageLanguage() {
    var _a, _b;
    const detailsButton = document.querySelector(SELECTORS.detailsButton);
    if (detailsButton) {
      const buttonText = (_a = detailsButton.textContent) == null ? void 0 : _a.trim();
      if (buttonText === "View details")
        return true;
      if (buttonText === "Visualizar Detalhes")
        return false;
    }
    const subtotalElement = document.querySelector('[data-testid="shopping-cart-summary-total"]');
    if (subtotalElement == null ? void 0 : subtotalElement.parentElement) {
      const parentText = subtotalElement.parentElement.textContent || "";
      if (parentText.includes("Subtotal"))
        return true;
      if (parentText.includes("Total parcial"))
        return false;
    }
    const taxesElement = document.querySelector('[data-testid="shopping-cart-summary-taxes-and-fees"]');
    if (taxesElement == null ? void 0 : taxesElement.parentElement) {
      const parentText = taxesElement.parentElement.textContent || "";
      if (parentText.includes("Taxes and fees"))
        return true;
      if (parentText.includes("Impostos e taxas"))
        return false;
    }
    const htmlLang = document.documentElement.lang || document.documentElement.getAttribute("lang");
    if (htmlLang) {
      if (htmlLang.startsWith("en"))
        return true;
      if (htmlLang.startsWith("pt"))
        return false;
    }
    const nightsElement = Array.from(document.querySelectorAll("p,span,div")).find((el) => {
      const text = el.textContent || "";
      return PATTERNS.nightsText.test(text);
    });
    if (nightsElement) {
      const text = ((_b = nightsElement.textContent) == null ? void 0 : _b.trim()) ?? "";
      return /nights?/i.test(text);
    }
    const bodyText = document.body.textContent || "";
    const englishIndicators = [/Subtotal/i, /Taxes and fees/i, /View details/i, /nights?/i, /guest information/i];
    const portugueseIndicators = [/Total parcial/i, /Impostos e taxas/i, /Visualizar Detalhes/i, /noites?/i, /informações do hóspede/i];
    const englishMatches = englishIndicators.filter((pattern) => pattern.test(bodyText)).length;
    const portugueseMatches = portugueseIndicators.filter((pattern) => pattern.test(bodyText)).length;
    if (englishMatches > portugueseMatches)
      return true;
    if (portugueseMatches > englishMatches)
      return false;
    return false;
  }
  function initializeObservationsField() {
    const input = document.querySelector(SELECTORS.observationsInput);
    if (!input) return;
    const placeholder = detectPageLanguage() ? "E.g. My birthday is on November 5; we’re celebrating our engagement; I’d like to visit an Indigenous village." : "Ex.: Faço aniversário no dia 5 de novembro; estamos comemorando nosso noivado; gostaria de visitar uma aldeia indígena.";
    if (input.placeholder !== placeholder) input.placeholder = placeholder;
  }
  const BASE_STYLES = {
    error: "color:red;font-size:0.9em;margin-top:4px;display:none",
    select: "width:100%;padding:8px;border-radius:4px;border:1px solid #ccc;font-size:1rem"
  };
  function triggerReactInput(input, value) {
    var _a;
    if (!input || input.value === value)
      return;
    const prototype = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = (_a = Object.getOwnPropertyDescriptor(prototype, "value")) == null ? void 0 : _a.set;
    if (setter)
      setter.call(input, value);
    else
      input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function createErrorElement(id, parentElement) {
    let errorElement = document.getElementById(id);
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.id = id;
      errorElement.style.cssText = BASE_STYLES.error;
      parentElement.appendChild(errorElement);
    }
    return errorElement;
  }
  function createSelect(options = []) {
    const select = document.createElement("select");
    select.style.cssText = BASE_STYLES.select;
    options.forEach(({ text, value }) => {
      select.appendChild(new Option(text, value));
    });
    return select;
  }
  function showError(element, message) {
    element.innerText = message;
    element.style.display = "block";
  }
  function hideError(element) {
    element.style.display = "none";
  }
  function debounce$1(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  function isInitialized(element, flag2) {
    return !!element && element.dataset[flag2] === "true";
  }
  function markAsInitialized(element, flag2) {
    if (element)
      element.dataset[flag2] = "true";
  }
  var HOOKS = [
    "onChange",
    "onClose",
    "onDayCreate",
    "onDestroy",
    "onKeyDown",
    "onMonthChange",
    "onOpen",
    "onParseConfig",
    "onReady",
    "onValueUpdate",
    "onYearChange",
    "onPreCalendarPosition"
  ];
  var defaults = {
    _disable: [],
    allowInput: false,
    allowInvalidPreload: false,
    altFormat: "F j, Y",
    altInput: false,
    altInputClass: "form-control input",
    animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
    ariaDateFormat: "F j, Y",
    autoFillDefaultTime: true,
    clickOpens: true,
    closeOnSelect: true,
    conjunction: ", ",
    dateFormat: "Y-m-d",
    defaultHour: 12,
    defaultMinute: 0,
    defaultSeconds: 0,
    disable: [],
    disableMobile: false,
    enableSeconds: false,
    enableTime: false,
    errorHandler: function(err) {
      return typeof console !== "undefined" && console.warn(err);
    },
    getWeek: function(givenDate) {
      var date = new Date(givenDate.getTime());
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      var week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 864e5 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    hourIncrement: 1,
    ignoredFocusElements: [],
    inline: false,
    locale: "default",
    minuteIncrement: 5,
    mode: "single",
    monthSelectorType: "dropdown",
    nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
    noCalendar: false,
    now: /* @__PURE__ */ new Date(),
    onChange: [],
    onClose: [],
    onDayCreate: [],
    onDestroy: [],
    onKeyDown: [],
    onMonthChange: [],
    onOpen: [],
    onParseConfig: [],
    onReady: [],
    onValueUpdate: [],
    onYearChange: [],
    onPreCalendarPosition: [],
    plugins: [],
    position: "auto",
    positionElement: void 0,
    prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
    shorthandCurrentMonth: false,
    showMonths: 1,
    static: false,
    time_24hr: false,
    weekNumbers: false,
    wrap: false
  };
  var english = {
    weekdays: {
      shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      longhand: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ]
    },
    months: {
      shorthand: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      longhand: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ]
    },
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    firstDayOfWeek: 0,
    ordinal: function(nth) {
      var s = nth % 100;
      if (s > 3 && s < 21)
        return "th";
      switch (s % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    },
    rangeSeparator: " to ",
    weekAbbreviation: "Wk",
    scrollTitle: "Scroll to increment",
    toggleTitle: "Click to toggle",
    amPM: ["AM", "PM"],
    yearAriaLabel: "Year",
    monthAriaLabel: "Month",
    hourAriaLabel: "Hour",
    minuteAriaLabel: "Minute",
    time_24hr: false
  };
  var pad = function(number, length) {
    if (length === void 0) {
      length = 2;
    }
    return ("000" + number).slice(length * -1);
  };
  var int = function(bool) {
    return bool === true ? 1 : 0;
  };
  function debounce(fn, wait) {
    var t;
    return function() {
      var _this = this;
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function() {
        return fn.apply(_this, args);
      }, wait);
    };
  }
  var arrayify = function(obj) {
    return obj instanceof Array ? obj : [obj];
  };
  function toggleClass(elem, className, bool) {
    if (bool === true)
      return elem.classList.add(className);
    elem.classList.remove(className);
  }
  function createElement(tag, className, content) {
    var e = window.document.createElement(tag);
    className = className || "";
    content = content || "";
    e.className = className;
    if (content !== void 0)
      e.textContent = content;
    return e;
  }
  function clearNode(node) {
    while (node.firstChild)
      node.removeChild(node.firstChild);
  }
  function findParent(node, condition) {
    if (condition(node))
      return node;
    else if (node.parentNode)
      return findParent(node.parentNode, condition);
    return void 0;
  }
  function createNumberInput(inputClassName, opts) {
    var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
    if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
      numInput.type = "number";
    } else {
      numInput.type = "text";
      numInput.pattern = "\\d*";
    }
    if (opts !== void 0)
      for (var key in opts)
        numInput.setAttribute(key, opts[key]);
    wrapper.appendChild(numInput);
    wrapper.appendChild(arrowUp);
    wrapper.appendChild(arrowDown);
    return wrapper;
  }
  function getEventTarget(event) {
    try {
      if (typeof event.composedPath === "function") {
        var path = event.composedPath();
        return path[0];
      }
      return event.target;
    } catch (error) {
      return event.target;
    }
  }
  var doNothing = function() {
    return void 0;
  };
  var monthToStr = function(monthNumber, shorthand, locale) {
    return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
  };
  var revFormat = {
    D: doNothing,
    F: function(dateObj, monthName, locale) {
      dateObj.setMonth(locale.months.longhand.indexOf(monthName));
    },
    G: function(dateObj, hour) {
      dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
    },
    H: function(dateObj, hour) {
      dateObj.setHours(parseFloat(hour));
    },
    J: function(dateObj, day) {
      dateObj.setDate(parseFloat(day));
    },
    K: function(dateObj, amPM, locale) {
      dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
    },
    M: function(dateObj, shortMonth, locale) {
      dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
    },
    S: function(dateObj, seconds) {
      dateObj.setSeconds(parseFloat(seconds));
    },
    U: function(_, unixSeconds) {
      return new Date(parseFloat(unixSeconds) * 1e3);
    },
    W: function(dateObj, weekNum, locale) {
      var weekNumber = parseInt(weekNum);
      var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
      date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
      return date;
    },
    Y: function(dateObj, year) {
      dateObj.setFullYear(parseFloat(year));
    },
    Z: function(_, ISODate) {
      return new Date(ISODate);
    },
    d: function(dateObj, day) {
      dateObj.setDate(parseFloat(day));
    },
    h: function(dateObj, hour) {
      dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
    },
    i: function(dateObj, minutes) {
      dateObj.setMinutes(parseFloat(minutes));
    },
    j: function(dateObj, day) {
      dateObj.setDate(parseFloat(day));
    },
    l: doNothing,
    m: function(dateObj, month) {
      dateObj.setMonth(parseFloat(month) - 1);
    },
    n: function(dateObj, month) {
      dateObj.setMonth(parseFloat(month) - 1);
    },
    s: function(dateObj, seconds) {
      dateObj.setSeconds(parseFloat(seconds));
    },
    u: function(_, unixMillSeconds) {
      return new Date(parseFloat(unixMillSeconds));
    },
    w: doNothing,
    y: function(dateObj, year) {
      dateObj.setFullYear(2e3 + parseFloat(year));
    }
  };
  var tokenRegex = {
    D: "",
    F: "",
    G: "(\\d\\d|\\d)",
    H: "(\\d\\d|\\d)",
    J: "(\\d\\d|\\d)\\w+",
    K: "",
    M: "",
    S: "(\\d\\d|\\d)",
    U: "(.+)",
    W: "(\\d\\d|\\d)",
    Y: "(\\d{4})",
    Z: "(.+)",
    d: "(\\d\\d|\\d)",
    h: "(\\d\\d|\\d)",
    i: "(\\d\\d|\\d)",
    j: "(\\d\\d|\\d)",
    l: "",
    m: "(\\d\\d|\\d)",
    n: "(\\d\\d|\\d)",
    s: "(\\d\\d|\\d)",
    u: "(.+)",
    w: "(\\d\\d|\\d)",
    y: "(\\d{2})"
  };
  var formats = {
    Z: function(date) {
      return date.toISOString();
    },
    D: function(date, locale, options) {
      return locale.weekdays.shorthand[formats.w(date, locale, options)];
    },
    F: function(date, locale, options) {
      return monthToStr(formats.n(date, locale, options) - 1, false, locale);
    },
    G: function(date, locale, options) {
      return pad(formats.h(date, locale, options));
    },
    H: function(date) {
      return pad(date.getHours());
    },
    J: function(date, locale) {
      return locale.ordinal !== void 0 ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
    },
    K: function(date, locale) {
      return locale.amPM[int(date.getHours() > 11)];
    },
    M: function(date, locale) {
      return monthToStr(date.getMonth(), true, locale);
    },
    S: function(date) {
      return pad(date.getSeconds());
    },
    U: function(date) {
      return date.getTime() / 1e3;
    },
    W: function(date, _, options) {
      return options.getWeek(date);
    },
    Y: function(date) {
      return pad(date.getFullYear(), 4);
    },
    d: function(date) {
      return pad(date.getDate());
    },
    h: function(date) {
      return date.getHours() % 12 ? date.getHours() % 12 : 12;
    },
    i: function(date) {
      return pad(date.getMinutes());
    },
    j: function(date) {
      return date.getDate();
    },
    l: function(date, locale) {
      return locale.weekdays.longhand[date.getDay()];
    },
    m: function(date) {
      return pad(date.getMonth() + 1);
    },
    n: function(date) {
      return date.getMonth() + 1;
    },
    s: function(date) {
      return date.getSeconds();
    },
    u: function(date) {
      return date.getTime();
    },
    w: function(date) {
      return date.getDay();
    },
    y: function(date) {
      return String(date.getFullYear()).substring(2);
    }
  };
  var createDateFormatter = function(_a) {
    var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
    return function(dateObj, frmt, overrideLocale) {
      var locale = overrideLocale || l10n;
      if (config.formatDate !== void 0 && !isMobile) {
        return config.formatDate(dateObj, frmt, locale);
      }
      return frmt.split("").map(function(c, i, arr) {
        return formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "";
      }).join("");
    };
  };
  var createDateParser = function(_a) {
    var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
    return function(date, givenFormat, timeless, customLocale) {
      if (date !== 0 && !date)
        return void 0;
      var locale = customLocale || l10n;
      var parsedDate;
      var dateOrig = date;
      if (date instanceof Date)
        parsedDate = new Date(date.getTime());
      else if (typeof date !== "string" && date.toFixed !== void 0)
        parsedDate = new Date(date);
      else if (typeof date === "string") {
        var format = givenFormat || (config || defaults).dateFormat;
        var datestr = String(date).trim();
        if (datestr === "today") {
          parsedDate = /* @__PURE__ */ new Date();
          timeless = true;
        } else if (config && config.parseDate) {
          parsedDate = config.parseDate(date, format);
        } else if (/Z$/.test(datestr) || /GMT$/.test(datestr)) {
          parsedDate = new Date(date);
        } else {
          var matched = void 0, ops = [];
          for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
            var token = format[i];
            var isBackSlash = token === "\\";
            var escaped = format[i - 1] === "\\" || isBackSlash;
            if (tokenRegex[token] && !escaped) {
              regexStr += tokenRegex[token];
              var match = new RegExp(regexStr).exec(date);
              if (match && (matched = true)) {
                ops[token !== "Y" ? "push" : "unshift"]({
                  fn: revFormat[token],
                  val: match[++matchIndex]
                });
              }
            } else if (!isBackSlash)
              regexStr += ".";
          }
          parsedDate = !config || !config.noCalendar ? new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1, 0, 0, 0, 0) : new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
          ops.forEach(function(_a2) {
            var fn = _a2.fn, val = _a2.val;
            return parsedDate = fn(parsedDate, val, locale) || parsedDate;
          });
          parsedDate = matched ? parsedDate : void 0;
        }
      }
      if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
        config.errorHandler(new Error("Invalid date provided: " + dateOrig));
        return void 0;
      }
      if (timeless === true)
        parsedDate.setHours(0, 0, 0, 0);
      return parsedDate;
    };
  };
  function compareDates(date1, date2, timeless) {
    if (timeless === void 0) {
      timeless = true;
    }
    if (timeless !== false) {
      return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
    }
    return date1.getTime() - date2.getTime();
  }
  var isBetween = function(ts, ts1, ts2) {
    return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
  };
  var calculateSecondsSinceMidnight = function(hours, minutes, seconds) {
    return hours * 3600 + minutes * 60 + seconds;
  };
  var parseSeconds = function(secondsSinceMidnight) {
    var hours = Math.floor(secondsSinceMidnight / 3600), minutes = (secondsSinceMidnight - hours * 3600) / 60;
    return [hours, minutes, secondsSinceMidnight - hours * 3600 - minutes * 60];
  };
  var duration = {
    DAY: 864e5
  };
  function getDefaultHours(config) {
    var hours = config.defaultHour;
    var minutes = config.defaultMinute;
    var seconds = config.defaultSeconds;
    if (config.minDate !== void 0) {
      var minHour = config.minDate.getHours();
      var minMinutes = config.minDate.getMinutes();
      var minSeconds = config.minDate.getSeconds();
      if (hours < minHour) {
        hours = minHour;
      }
      if (hours === minHour && minutes < minMinutes) {
        minutes = minMinutes;
      }
      if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
        seconds = config.minDate.getSeconds();
    }
    if (config.maxDate !== void 0) {
      var maxHr = config.maxDate.getHours();
      var maxMinutes = config.maxDate.getMinutes();
      hours = Math.min(hours, maxHr);
      if (hours === maxHr)
        minutes = Math.min(maxMinutes, minutes);
      if (hours === maxHr && minutes === maxMinutes)
        seconds = config.maxDate.getSeconds();
    }
    return { hours, minutes, seconds };
  }
  if (typeof Object.assign !== "function") {
    Object.assign = function(target) {
      var args = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
      }
      if (!target) {
        throw TypeError("Cannot convert undefined or null to object");
      }
      var _loop_1 = function(source2) {
        if (source2) {
          Object.keys(source2).forEach(function(key) {
            return target[key] = source2[key];
          });
        }
      };
      for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
        var source = args_1[_a];
        _loop_1(source);
      }
      return target;
    };
  }
  var __assign = function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var __spreadArrays = function() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  };
  var DEBOUNCED_CHANGE_MS = 300;
  function FlatpickrInstance(element, instanceConfig) {
    var self = {
      config: __assign(__assign({}, defaults), flatpickr.defaultConfig),
      l10n: english
    };
    self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
    self._handlers = [];
    self.pluginElements = [];
    self.loadedPlugins = [];
    self._bind = bind;
    self._setHoursFromDate = setHoursFromDate;
    self._positionCalendar = positionCalendar;
    self.changeMonth = changeMonth;
    self.changeYear = changeYear;
    self.clear = clear;
    self.close = close;
    self.onMouseOver = onMouseOver;
    self._createElement = createElement;
    self.createDay = createDay;
    self.destroy = destroy;
    self.isEnabled = isEnabled;
    self.jumpToDate = jumpToDate;
    self.updateValue = updateValue;
    self.open = open;
    self.redraw = redraw;
    self.set = set;
    self.setDate = setDate;
    self.toggle = toggle;
    function setupHelperFunctions() {
      self.utils = {
        getDaysInMonth: function(month, yr) {
          if (month === void 0) {
            month = self.currentMonth;
          }
          if (yr === void 0) {
            yr = self.currentYear;
          }
          if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0))
            return 29;
          return self.l10n.daysInMonth[month];
        }
      };
    }
    function init2() {
      self.element = self.input = element;
      self.isOpen = false;
      parseConfig();
      setupLocale();
      setupInputs();
      setupDates();
      setupHelperFunctions();
      if (!self.isMobile)
        build();
      bindEvents();
      if (self.selectedDates.length || self.config.noCalendar) {
        if (self.config.enableTime) {
          setHoursFromDate(self.config.noCalendar ? self.latestSelectedDateObj : void 0);
        }
        updateValue(false);
      }
      setCalendarWidth();
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (!self.isMobile && isSafari) {
        positionCalendar();
      }
      triggerEvent("onReady");
    }
    function getClosestActiveElement() {
      var _a;
      return ((_a = self.calendarContainer) === null || _a === void 0 ? void 0 : _a.getRootNode()).activeElement || document.activeElement;
    }
    function bindToInstance(fn) {
      return fn.bind(self);
    }
    function setCalendarWidth() {
      var config = self.config;
      if (config.weekNumbers === false && config.showMonths === 1) {
        return;
      } else if (config.noCalendar !== true) {
        window.requestAnimationFrame(function() {
          if (self.calendarContainer !== void 0) {
            self.calendarContainer.style.visibility = "hidden";
            self.calendarContainer.style.display = "block";
          }
          if (self.daysContainer !== void 0) {
            var daysWidth = (self.days.offsetWidth + 1) * config.showMonths;
            self.daysContainer.style.width = daysWidth + "px";
            self.calendarContainer.style.width = daysWidth + (self.weekWrapper !== void 0 ? self.weekWrapper.offsetWidth : 0) + "px";
            self.calendarContainer.style.removeProperty("visibility");
            self.calendarContainer.style.removeProperty("display");
          }
        });
      }
    }
    function updateTime(e) {
      if (self.selectedDates.length === 0) {
        var defaultDate = self.config.minDate === void 0 || compareDates(/* @__PURE__ */ new Date(), self.config.minDate) >= 0 ? /* @__PURE__ */ new Date() : new Date(self.config.minDate.getTime());
        var defaults2 = getDefaultHours(self.config);
        defaultDate.setHours(defaults2.hours, defaults2.minutes, defaults2.seconds, defaultDate.getMilliseconds());
        self.selectedDates = [defaultDate];
        self.latestSelectedDateObj = defaultDate;
      }
      if (e !== void 0 && e.type !== "blur") {
        timeWrapper(e);
      }
      var prevValue = self._input.value;
      setHoursFromInputs();
      updateValue();
      if (self._input.value !== prevValue) {
        self._debouncedChange();
      }
    }
    function ampm2military(hour, amPM) {
      return hour % 12 + 12 * int(amPM === self.l10n.amPM[1]);
    }
    function military2ampm(hour) {
      switch (hour % 24) {
        case 0:
        case 12:
          return 12;
        default:
          return hour % 12;
      }
    }
    function setHoursFromInputs() {
      if (self.hourElement === void 0 || self.minuteElement === void 0)
        return;
      var hours = (parseInt(self.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self.minuteElement.value, 10) || 0) % 60, seconds = self.secondElement !== void 0 ? (parseInt(self.secondElement.value, 10) || 0) % 60 : 0;
      if (self.amPM !== void 0) {
        hours = ampm2military(hours, self.amPM.textContent);
      }
      var limitMinHours = self.config.minTime !== void 0 || self.config.minDate && self.minDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.minDate, true) === 0;
      var limitMaxHours = self.config.maxTime !== void 0 || self.config.maxDate && self.maxDateHasTime && self.latestSelectedDateObj && compareDates(self.latestSelectedDateObj, self.config.maxDate, true) === 0;
      if (self.config.maxTime !== void 0 && self.config.minTime !== void 0 && self.config.minTime > self.config.maxTime) {
        var minBound = calculateSecondsSinceMidnight(self.config.minTime.getHours(), self.config.minTime.getMinutes(), self.config.minTime.getSeconds());
        var maxBound = calculateSecondsSinceMidnight(self.config.maxTime.getHours(), self.config.maxTime.getMinutes(), self.config.maxTime.getSeconds());
        var currentTime = calculateSecondsSinceMidnight(hours, minutes, seconds);
        if (currentTime > maxBound && currentTime < minBound) {
          var result2 = parseSeconds(minBound);
          hours = result2[0];
          minutes = result2[1];
          seconds = result2[2];
        }
      } else {
        if (limitMaxHours) {
          var maxTime = self.config.maxTime !== void 0 ? self.config.maxTime : self.config.maxDate;
          hours = Math.min(hours, maxTime.getHours());
          if (hours === maxTime.getHours())
            minutes = Math.min(minutes, maxTime.getMinutes());
          if (minutes === maxTime.getMinutes())
            seconds = Math.min(seconds, maxTime.getSeconds());
        }
        if (limitMinHours) {
          var minTime = self.config.minTime !== void 0 ? self.config.minTime : self.config.minDate;
          hours = Math.max(hours, minTime.getHours());
          if (hours === minTime.getHours() && minutes < minTime.getMinutes())
            minutes = minTime.getMinutes();
          if (minutes === minTime.getMinutes())
            seconds = Math.max(seconds, minTime.getSeconds());
        }
      }
      setHours(hours, minutes, seconds);
    }
    function setHoursFromDate(dateObj) {
      var date = dateObj || self.latestSelectedDateObj;
      if (date && date instanceof Date) {
        setHours(date.getHours(), date.getMinutes(), date.getSeconds());
      }
    }
    function setHours(hours, minutes, seconds) {
      if (self.latestSelectedDateObj !== void 0) {
        self.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
      }
      if (!self.hourElement || !self.minuteElement || self.isMobile)
        return;
      self.hourElement.value = pad(!self.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
      self.minuteElement.value = pad(minutes);
      if (self.amPM !== void 0)
        self.amPM.textContent = self.l10n.amPM[int(hours >= 12)];
      if (self.secondElement !== void 0)
        self.secondElement.value = pad(seconds);
    }
    function onYearInput(event) {
      var eventTarget = getEventTarget(event);
      var year = parseInt(eventTarget.value) + (event.delta || 0);
      if (year / 1e3 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
        changeYear(year);
      }
    }
    function bind(element2, event, handler, options) {
      if (event instanceof Array)
        return event.forEach(function(ev) {
          return bind(element2, ev, handler, options);
        });
      if (element2 instanceof Array)
        return element2.forEach(function(el) {
          return bind(el, event, handler, options);
        });
      element2.addEventListener(event, handler, options);
      self._handlers.push({
        remove: function() {
          return element2.removeEventListener(event, handler, options);
        }
      });
    }
    function triggerChange() {
      triggerEvent("onChange");
    }
    function bindEvents() {
      if (self.config.wrap) {
        ["open", "close", "toggle", "clear"].forEach(function(evt) {
          Array.prototype.forEach.call(self.element.querySelectorAll("[data-" + evt + "]"), function(el) {
            return bind(el, "click", self[evt]);
          });
        });
      }
      if (self.isMobile) {
        setupMobile();
        return;
      }
      var debouncedResize = debounce(onResize, 50);
      self._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
      if (self.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
        bind(self.daysContainer, "mouseover", function(e) {
          if (self.config.mode === "range")
            onMouseOver(getEventTarget(e));
        });
      bind(self._input, "keydown", onKeyDown);
      if (self.calendarContainer !== void 0) {
        bind(self.calendarContainer, "keydown", onKeyDown);
      }
      if (!self.config.inline && !self.config.static)
        bind(window, "resize", debouncedResize);
      if (window.ontouchstart !== void 0)
        bind(window.document, "touchstart", documentClick);
      else
        bind(window.document, "mousedown", documentClick);
      bind(window.document, "focus", documentClick, { capture: true });
      if (self.config.clickOpens === true) {
        bind(self._input, "focus", self.open);
        bind(self._input, "click", self.open);
      }
      if (self.daysContainer !== void 0) {
        bind(self.monthNav, "click", onMonthNavClick);
        bind(self.monthNav, ["keyup", "increment"], onYearInput);
        bind(self.daysContainer, "click", selectDate);
      }
      if (self.timeContainer !== void 0 && self.minuteElement !== void 0 && self.hourElement !== void 0) {
        var selText = function(e) {
          return getEventTarget(e).select();
        };
        bind(self.timeContainer, ["increment"], updateTime);
        bind(self.timeContainer, "blur", updateTime, { capture: true });
        bind(self.timeContainer, "click", timeIncrement);
        bind([self.hourElement, self.minuteElement], ["focus", "click"], selText);
        if (self.secondElement !== void 0)
          bind(self.secondElement, "focus", function() {
            return self.secondElement && self.secondElement.select();
          });
        if (self.amPM !== void 0) {
          bind(self.amPM, "click", function(e) {
            updateTime(e);
          });
        }
      }
      if (self.config.allowInput) {
        bind(self._input, "blur", onBlur);
      }
    }
    function jumpToDate(jumpDate, triggerChange2) {
      var jumpTo = jumpDate !== void 0 ? self.parseDate(jumpDate) : self.latestSelectedDateObj || (self.config.minDate && self.config.minDate > self.now ? self.config.minDate : self.config.maxDate && self.config.maxDate < self.now ? self.config.maxDate : self.now);
      var oldYear = self.currentYear;
      var oldMonth = self.currentMonth;
      try {
        if (jumpTo !== void 0) {
          self.currentYear = jumpTo.getFullYear();
          self.currentMonth = jumpTo.getMonth();
        }
      } catch (e) {
        e.message = "Invalid date supplied: " + jumpTo;
        self.config.errorHandler(e);
      }
      if (triggerChange2 && self.currentYear !== oldYear) {
        triggerEvent("onYearChange");
        buildMonthSwitch();
      }
      if (triggerChange2 && (self.currentYear !== oldYear || self.currentMonth !== oldMonth)) {
        triggerEvent("onMonthChange");
      }
      self.redraw();
    }
    function timeIncrement(e) {
      var eventTarget = getEventTarget(e);
      if (~eventTarget.className.indexOf("arrow"))
        incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
    }
    function incrementNumInput(e, delta, inputElem) {
      var target = e && getEventTarget(e);
      var input = inputElem || target && target.parentNode && target.parentNode.firstChild;
      var event = createEvent("increment");
      event.delta = delta;
      input && input.dispatchEvent(event);
    }
    function build() {
      var fragment = window.document.createDocumentFragment();
      self.calendarContainer = createElement("div", "flatpickr-calendar");
      self.calendarContainer.tabIndex = -1;
      if (!self.config.noCalendar) {
        fragment.appendChild(buildMonthNav());
        self.innerContainer = createElement("div", "flatpickr-innerContainer");
        if (self.config.weekNumbers) {
          var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
          self.innerContainer.appendChild(weekWrapper);
          self.weekNumbers = weekNumbers;
          self.weekWrapper = weekWrapper;
        }
        self.rContainer = createElement("div", "flatpickr-rContainer");
        self.rContainer.appendChild(buildWeekdays());
        if (!self.daysContainer) {
          self.daysContainer = createElement("div", "flatpickr-days");
          self.daysContainer.tabIndex = -1;
        }
        buildDays();
        self.rContainer.appendChild(self.daysContainer);
        self.innerContainer.appendChild(self.rContainer);
        fragment.appendChild(self.innerContainer);
      }
      if (self.config.enableTime) {
        fragment.appendChild(buildTime());
      }
      toggleClass(self.calendarContainer, "rangeMode", self.config.mode === "range");
      toggleClass(self.calendarContainer, "animate", self.config.animate === true);
      toggleClass(self.calendarContainer, "multiMonth", self.config.showMonths > 1);
      self.calendarContainer.appendChild(fragment);
      var customAppend = self.config.appendTo !== void 0 && self.config.appendTo.nodeType !== void 0;
      if (self.config.inline || self.config.static) {
        self.calendarContainer.classList.add(self.config.inline ? "inline" : "static");
        if (self.config.inline) {
          if (!customAppend && self.element.parentNode)
            self.element.parentNode.insertBefore(self.calendarContainer, self._input.nextSibling);
          else if (self.config.appendTo !== void 0)
            self.config.appendTo.appendChild(self.calendarContainer);
        }
        if (self.config.static) {
          var wrapper = createElement("div", "flatpickr-wrapper");
          if (self.element.parentNode)
            self.element.parentNode.insertBefore(wrapper, self.element);
          wrapper.appendChild(self.element);
          if (self.altInput)
            wrapper.appendChild(self.altInput);
          wrapper.appendChild(self.calendarContainer);
        }
      }
      if (!self.config.static && !self.config.inline)
        (self.config.appendTo !== void 0 ? self.config.appendTo : window.document.body).appendChild(self.calendarContainer);
    }
    function createDay(className, date, _dayNumber, i) {
      var dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", className, date.getDate().toString());
      dayElement.dateObj = date;
      dayElement.$i = i;
      dayElement.setAttribute("aria-label", self.formatDate(date, self.config.ariaDateFormat));
      if (className.indexOf("hidden") === -1 && compareDates(date, self.now) === 0) {
        self.todayDateElem = dayElement;
        dayElement.classList.add("today");
        dayElement.setAttribute("aria-current", "date");
      }
      if (dateIsEnabled) {
        dayElement.tabIndex = -1;
        if (isDateSelected(date)) {
          dayElement.classList.add("selected");
          self.selectedDateElem = dayElement;
          if (self.config.mode === "range") {
            toggleClass(dayElement, "startRange", self.selectedDates[0] && compareDates(date, self.selectedDates[0], true) === 0);
            toggleClass(dayElement, "endRange", self.selectedDates[1] && compareDates(date, self.selectedDates[1], true) === 0);
            if (className === "nextMonthDay")
              dayElement.classList.add("inRange");
          }
        }
      } else {
        dayElement.classList.add("flatpickr-disabled");
      }
      if (self.config.mode === "range") {
        if (isDateInRange(date) && !isDateSelected(date))
          dayElement.classList.add("inRange");
      }
      if (self.weekNumbers && self.config.showMonths === 1 && className !== "prevMonthDay" && i % 7 === 6) {
        self.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self.config.getWeek(date) + "</span>");
      }
      triggerEvent("onDayCreate", dayElement);
      return dayElement;
    }
    function focusOnDayElem(targetNode) {
      targetNode.focus();
      if (self.config.mode === "range")
        onMouseOver(targetNode);
    }
    function getFirstAvailableDay(delta) {
      var startMonth = delta > 0 ? 0 : self.config.showMonths - 1;
      var endMonth = delta > 0 ? self.config.showMonths : -1;
      for (var m = startMonth; m != endMonth; m += delta) {
        var month = self.daysContainer.children[m];
        var startIndex = delta > 0 ? 0 : month.children.length - 1;
        var endIndex = delta > 0 ? month.children.length : -1;
        for (var i = startIndex; i != endIndex; i += delta) {
          var c = month.children[i];
          if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
            return c;
        }
      }
      return void 0;
    }
    function getNextAvailableDay(current, delta) {
      var givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self.currentMonth;
      var endMonth = delta > 0 ? self.config.showMonths : -1;
      var loopDelta = delta > 0 ? 1 : -1;
      for (var m = givenMonth - self.currentMonth; m != endMonth; m += loopDelta) {
        var month = self.daysContainer.children[m];
        var startIndex = givenMonth - self.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
        var numMonthDays = month.children.length;
        for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
          var c = month.children[i];
          if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta))
            return focusOnDayElem(c);
        }
      }
      self.changeMonth(loopDelta);
      focusOnDay(getFirstAvailableDay(loopDelta), 0);
      return void 0;
    }
    function focusOnDay(current, offset) {
      var activeElement = getClosestActiveElement();
      var dayFocused = isInView(activeElement || document.body);
      var startElem = current !== void 0 ? current : dayFocused ? activeElement : self.selectedDateElem !== void 0 && isInView(self.selectedDateElem) ? self.selectedDateElem : self.todayDateElem !== void 0 && isInView(self.todayDateElem) ? self.todayDateElem : getFirstAvailableDay(offset > 0 ? 1 : -1);
      if (startElem === void 0) {
        self._input.focus();
      } else if (!dayFocused) {
        focusOnDayElem(startElem);
      } else {
        getNextAvailableDay(startElem, offset);
      }
    }
    function buildMonthDays(year, month) {
      var firstOfMonth = (new Date(year, month, 1).getDay() - self.l10n.firstDayOfWeek + 7) % 7;
      var prevMonthDays = self.utils.getDaysInMonth((month - 1 + 12) % 12, year);
      var daysInMonth = self.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
      var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
      for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
        days.appendChild(createDay("flatpickr-day " + prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
      }
      for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
        days.appendChild(createDay("flatpickr-day", new Date(year, month, dayNumber), dayNumber, dayIndex));
      }
      for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
        days.appendChild(createDay("flatpickr-day " + nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
      }
      var dayContainer = createElement("div", "dayContainer");
      dayContainer.appendChild(days);
      return dayContainer;
    }
    function buildDays() {
      if (self.daysContainer === void 0) {
        return;
      }
      clearNode(self.daysContainer);
      if (self.weekNumbers)
        clearNode(self.weekNumbers);
      var frag = document.createDocumentFragment();
      for (var i = 0; i < self.config.showMonths; i++) {
        var d = new Date(self.currentYear, self.currentMonth, 1);
        d.setMonth(self.currentMonth + i);
        frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
      }
      self.daysContainer.appendChild(frag);
      self.days = self.daysContainer.firstChild;
      if (self.config.mode === "range" && self.selectedDates.length === 1) {
        onMouseOver();
      }
    }
    function buildMonthSwitch() {
      if (self.config.showMonths > 1 || self.config.monthSelectorType !== "dropdown")
        return;
      var shouldBuildMonth = function(month2) {
        if (self.config.minDate !== void 0 && self.currentYear === self.config.minDate.getFullYear() && month2 < self.config.minDate.getMonth()) {
          return false;
        }
        return !(self.config.maxDate !== void 0 && self.currentYear === self.config.maxDate.getFullYear() && month2 > self.config.maxDate.getMonth());
      };
      self.monthsDropdownContainer.tabIndex = -1;
      self.monthsDropdownContainer.innerHTML = "";
      for (var i = 0; i < 12; i++) {
        if (!shouldBuildMonth(i))
          continue;
        var month = createElement("option", "flatpickr-monthDropdown-month");
        month.value = new Date(self.currentYear, i).getMonth().toString();
        month.textContent = monthToStr(i, self.config.shorthandCurrentMonth, self.l10n);
        month.tabIndex = -1;
        if (self.currentMonth === i) {
          month.selected = true;
        }
        self.monthsDropdownContainer.appendChild(month);
      }
    }
    function buildMonth() {
      var container = createElement("div", "flatpickr-month");
      var monthNavFragment = window.document.createDocumentFragment();
      var monthElement;
      if (self.config.showMonths > 1 || self.config.monthSelectorType === "static") {
        monthElement = createElement("span", "cur-month");
      } else {
        self.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
        self.monthsDropdownContainer.setAttribute("aria-label", self.l10n.monthAriaLabel);
        bind(self.monthsDropdownContainer, "change", function(e) {
          var target = getEventTarget(e);
          var selectedMonth = parseInt(target.value, 10);
          self.changeMonth(selectedMonth - self.currentMonth);
          triggerEvent("onMonthChange");
        });
        buildMonthSwitch();
        monthElement = self.monthsDropdownContainer;
      }
      var yearInput = createNumberInput("cur-year", { tabindex: "-1" });
      var yearElement = yearInput.getElementsByTagName("input")[0];
      yearElement.setAttribute("aria-label", self.l10n.yearAriaLabel);
      if (self.config.minDate) {
        yearElement.setAttribute("min", self.config.minDate.getFullYear().toString());
      }
      if (self.config.maxDate) {
        yearElement.setAttribute("max", self.config.maxDate.getFullYear().toString());
        yearElement.disabled = !!self.config.minDate && self.config.minDate.getFullYear() === self.config.maxDate.getFullYear();
      }
      var currentMonth = createElement("div", "flatpickr-current-month");
      currentMonth.appendChild(monthElement);
      currentMonth.appendChild(yearInput);
      monthNavFragment.appendChild(currentMonth);
      container.appendChild(monthNavFragment);
      return {
        container,
        yearElement,
        monthElement
      };
    }
    function buildMonths() {
      clearNode(self.monthNav);
      self.monthNav.appendChild(self.prevMonthNav);
      if (self.config.showMonths) {
        self.yearElements = [];
        self.monthElements = [];
      }
      for (var m = self.config.showMonths; m--; ) {
        var month = buildMonth();
        self.yearElements.push(month.yearElement);
        self.monthElements.push(month.monthElement);
        self.monthNav.appendChild(month.container);
      }
      self.monthNav.appendChild(self.nextMonthNav);
    }
    function buildMonthNav() {
      self.monthNav = createElement("div", "flatpickr-months");
      self.yearElements = [];
      self.monthElements = [];
      self.prevMonthNav = createElement("span", "flatpickr-prev-month");
      self.prevMonthNav.innerHTML = self.config.prevArrow;
      self.nextMonthNav = createElement("span", "flatpickr-next-month");
      self.nextMonthNav.innerHTML = self.config.nextArrow;
      buildMonths();
      Object.defineProperty(self, "_hidePrevMonthArrow", {
        get: function() {
          return self.__hidePrevMonthArrow;
        },
        set: function(bool) {
          if (self.__hidePrevMonthArrow !== bool) {
            toggleClass(self.prevMonthNav, "flatpickr-disabled", bool);
            self.__hidePrevMonthArrow = bool;
          }
        }
      });
      Object.defineProperty(self, "_hideNextMonthArrow", {
        get: function() {
          return self.__hideNextMonthArrow;
        },
        set: function(bool) {
          if (self.__hideNextMonthArrow !== bool) {
            toggleClass(self.nextMonthNav, "flatpickr-disabled", bool);
            self.__hideNextMonthArrow = bool;
          }
        }
      });
      self.currentYearElement = self.yearElements[0];
      updateNavigationCurrentMonth();
      return self.monthNav;
    }
    function buildTime() {
      self.calendarContainer.classList.add("hasTime");
      if (self.config.noCalendar)
        self.calendarContainer.classList.add("noCalendar");
      var defaults2 = getDefaultHours(self.config);
      self.timeContainer = createElement("div", "flatpickr-time");
      self.timeContainer.tabIndex = -1;
      var separator = createElement("span", "flatpickr-time-separator", ":");
      var hourInput = createNumberInput("flatpickr-hour", {
        "aria-label": self.l10n.hourAriaLabel
      });
      self.hourElement = hourInput.getElementsByTagName("input")[0];
      var minuteInput = createNumberInput("flatpickr-minute", {
        "aria-label": self.l10n.minuteAriaLabel
      });
      self.minuteElement = minuteInput.getElementsByTagName("input")[0];
      self.hourElement.tabIndex = self.minuteElement.tabIndex = -1;
      self.hourElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getHours() : self.config.time_24hr ? defaults2.hours : military2ampm(defaults2.hours));
      self.minuteElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getMinutes() : defaults2.minutes);
      self.hourElement.setAttribute("step", self.config.hourIncrement.toString());
      self.minuteElement.setAttribute("step", self.config.minuteIncrement.toString());
      self.hourElement.setAttribute("min", self.config.time_24hr ? "0" : "1");
      self.hourElement.setAttribute("max", self.config.time_24hr ? "23" : "12");
      self.hourElement.setAttribute("maxlength", "2");
      self.minuteElement.setAttribute("min", "0");
      self.minuteElement.setAttribute("max", "59");
      self.minuteElement.setAttribute("maxlength", "2");
      self.timeContainer.appendChild(hourInput);
      self.timeContainer.appendChild(separator);
      self.timeContainer.appendChild(minuteInput);
      if (self.config.time_24hr)
        self.timeContainer.classList.add("time24hr");
      if (self.config.enableSeconds) {
        self.timeContainer.classList.add("hasSeconds");
        var secondInput = createNumberInput("flatpickr-second");
        self.secondElement = secondInput.getElementsByTagName("input")[0];
        self.secondElement.value = pad(self.latestSelectedDateObj ? self.latestSelectedDateObj.getSeconds() : defaults2.seconds);
        self.secondElement.setAttribute("step", self.minuteElement.getAttribute("step"));
        self.secondElement.setAttribute("min", "0");
        self.secondElement.setAttribute("max", "59");
        self.secondElement.setAttribute("maxlength", "2");
        self.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
        self.timeContainer.appendChild(secondInput);
      }
      if (!self.config.time_24hr) {
        self.amPM = createElement("span", "flatpickr-am-pm", self.l10n.amPM[int((self.latestSelectedDateObj ? self.hourElement.value : self.config.defaultHour) > 11)]);
        self.amPM.title = self.l10n.toggleTitle;
        self.amPM.tabIndex = -1;
        self.timeContainer.appendChild(self.amPM);
      }
      return self.timeContainer;
    }
    function buildWeekdays() {
      if (!self.weekdayContainer)
        self.weekdayContainer = createElement("div", "flatpickr-weekdays");
      else
        clearNode(self.weekdayContainer);
      for (var i = self.config.showMonths; i--; ) {
        var container = createElement("div", "flatpickr-weekdaycontainer");
        self.weekdayContainer.appendChild(container);
      }
      updateWeekdays();
      return self.weekdayContainer;
    }
    function updateWeekdays() {
      if (!self.weekdayContainer) {
        return;
      }
      var firstDayOfWeek = self.l10n.firstDayOfWeek;
      var weekdays = __spreadArrays(self.l10n.weekdays.shorthand);
      if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
        weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
      }
      for (var i = self.config.showMonths; i--; ) {
        self.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
      }
    }
    function buildWeeks() {
      self.calendarContainer.classList.add("hasWeeks");
      var weekWrapper = createElement("div", "flatpickr-weekwrapper");
      weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self.l10n.weekAbbreviation));
      var weekNumbers = createElement("div", "flatpickr-weeks");
      weekWrapper.appendChild(weekNumbers);
      return {
        weekWrapper,
        weekNumbers
      };
    }
    function changeMonth(value, isOffset) {
      if (isOffset === void 0) {
        isOffset = true;
      }
      var delta = isOffset ? value : value - self.currentMonth;
      if (delta < 0 && self._hidePrevMonthArrow === true || delta > 0 && self._hideNextMonthArrow === true)
        return;
      self.currentMonth += delta;
      if (self.currentMonth < 0 || self.currentMonth > 11) {
        self.currentYear += self.currentMonth > 11 ? 1 : -1;
        self.currentMonth = (self.currentMonth + 12) % 12;
        triggerEvent("onYearChange");
        buildMonthSwitch();
      }
      buildDays();
      triggerEvent("onMonthChange");
      updateNavigationCurrentMonth();
    }
    function clear(triggerChangeEvent, toInitial) {
      if (triggerChangeEvent === void 0) {
        triggerChangeEvent = true;
      }
      if (toInitial === void 0) {
        toInitial = true;
      }
      self.input.value = "";
      if (self.altInput !== void 0)
        self.altInput.value = "";
      if (self.mobileInput !== void 0)
        self.mobileInput.value = "";
      self.selectedDates = [];
      self.latestSelectedDateObj = void 0;
      if (toInitial === true) {
        self.currentYear = self._initialDate.getFullYear();
        self.currentMonth = self._initialDate.getMonth();
      }
      if (self.config.enableTime === true) {
        var _a = getDefaultHours(self.config), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
        setHours(hours, minutes, seconds);
      }
      self.redraw();
      if (triggerChangeEvent)
        triggerEvent("onChange");
    }
    function close() {
      self.isOpen = false;
      if (!self.isMobile) {
        if (self.calendarContainer !== void 0) {
          self.calendarContainer.classList.remove("open");
        }
        if (self._input !== void 0) {
          self._input.classList.remove("active");
        }
      }
      triggerEvent("onClose");
    }
    function destroy() {
      if (self.config !== void 0)
        triggerEvent("onDestroy");
      for (var i = self._handlers.length; i--; ) {
        self._handlers[i].remove();
      }
      self._handlers = [];
      if (self.mobileInput) {
        if (self.mobileInput.parentNode)
          self.mobileInput.parentNode.removeChild(self.mobileInput);
        self.mobileInput = void 0;
      } else if (self.calendarContainer && self.calendarContainer.parentNode) {
        if (self.config.static && self.calendarContainer.parentNode) {
          var wrapper = self.calendarContainer.parentNode;
          wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
          if (wrapper.parentNode) {
            while (wrapper.firstChild)
              wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            wrapper.parentNode.removeChild(wrapper);
          }
        } else
          self.calendarContainer.parentNode.removeChild(self.calendarContainer);
      }
      if (self.altInput) {
        self.input.type = "text";
        if (self.altInput.parentNode)
          self.altInput.parentNode.removeChild(self.altInput);
        delete self.altInput;
      }
      if (self.input) {
        self.input.type = self.input._type;
        self.input.classList.remove("flatpickr-input");
        self.input.removeAttribute("readonly");
      }
      [
        "_showTimeInput",
        "latestSelectedDateObj",
        "_hideNextMonthArrow",
        "_hidePrevMonthArrow",
        "__hideNextMonthArrow",
        "__hidePrevMonthArrow",
        "isMobile",
        "isOpen",
        "selectedDateElem",
        "minDateHasTime",
        "maxDateHasTime",
        "days",
        "daysContainer",
        "_input",
        "_positionElement",
        "innerContainer",
        "rContainer",
        "monthNav",
        "todayDateElem",
        "calendarContainer",
        "weekdayContainer",
        "prevMonthNav",
        "nextMonthNav",
        "monthsDropdownContainer",
        "currentMonthElement",
        "currentYearElement",
        "navigationCurrentMonth",
        "selectedDateElem",
        "config"
      ].forEach(function(k) {
        try {
          delete self[k];
        } catch (_) {
        }
      });
    }
    function isCalendarElem(elem) {
      return self.calendarContainer.contains(elem);
    }
    function documentClick(e) {
      if (self.isOpen && !self.config.inline) {
        var eventTarget_1 = getEventTarget(e);
        var isCalendarElement = isCalendarElem(eventTarget_1);
        var isInput = eventTarget_1 === self.input || eventTarget_1 === self.altInput || self.element.contains(eventTarget_1) || e.path && e.path.indexOf && (~e.path.indexOf(self.input) || ~e.path.indexOf(self.altInput));
        var lostFocus = !isInput && !isCalendarElement && !isCalendarElem(e.relatedTarget);
        var isIgnored = !self.config.ignoredFocusElements.some(function(elem) {
          return elem.contains(eventTarget_1);
        });
        if (lostFocus && isIgnored) {
          if (self.config.allowInput) {
            self.setDate(self._input.value, false, self.config.altInput ? self.config.altFormat : self.config.dateFormat);
          }
          if (self.timeContainer !== void 0 && self.minuteElement !== void 0 && self.hourElement !== void 0 && self.input.value !== "" && self.input.value !== void 0) {
            updateTime();
          }
          self.close();
          if (self.config && self.config.mode === "range" && self.selectedDates.length === 1)
            self.clear(false);
        }
      }
    }
    function changeYear(newYear) {
      if (!newYear || self.config.minDate && newYear < self.config.minDate.getFullYear() || self.config.maxDate && newYear > self.config.maxDate.getFullYear())
        return;
      var newYearNum = newYear, isNewYear = self.currentYear !== newYearNum;
      self.currentYear = newYearNum || self.currentYear;
      if (self.config.maxDate && self.currentYear === self.config.maxDate.getFullYear()) {
        self.currentMonth = Math.min(self.config.maxDate.getMonth(), self.currentMonth);
      } else if (self.config.minDate && self.currentYear === self.config.minDate.getFullYear()) {
        self.currentMonth = Math.max(self.config.minDate.getMonth(), self.currentMonth);
      }
      if (isNewYear) {
        self.redraw();
        triggerEvent("onYearChange");
        buildMonthSwitch();
      }
    }
    function isEnabled(date, timeless) {
      var _a;
      if (timeless === void 0) {
        timeless = true;
      }
      var dateToCheck = self.parseDate(date, void 0, timeless);
      if (self.config.minDate && dateToCheck && compareDates(dateToCheck, self.config.minDate, timeless !== void 0 ? timeless : !self.minDateHasTime) < 0 || self.config.maxDate && dateToCheck && compareDates(dateToCheck, self.config.maxDate, timeless !== void 0 ? timeless : !self.maxDateHasTime) > 0)
        return false;
      if (!self.config.enable && self.config.disable.length === 0)
        return true;
      if (dateToCheck === void 0)
        return false;
      var bool = !!self.config.enable, array = (_a = self.config.enable) !== null && _a !== void 0 ? _a : self.config.disable;
      for (var i = 0, d = void 0; i < array.length; i++) {
        d = array[i];
        if (typeof d === "function" && d(dateToCheck))
          return bool;
        else if (d instanceof Date && dateToCheck !== void 0 && d.getTime() === dateToCheck.getTime())
          return bool;
        else if (typeof d === "string") {
          var parsed = self.parseDate(d, void 0, true);
          return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
        } else if (typeof d === "object" && dateToCheck !== void 0 && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime())
          return bool;
      }
      return !bool;
    }
    function isInView(elem) {
      if (self.daysContainer !== void 0)
        return elem.className.indexOf("hidden") === -1 && elem.className.indexOf("flatpickr-disabled") === -1 && self.daysContainer.contains(elem);
      return false;
    }
    function onBlur(e) {
      var isInput = e.target === self._input;
      var valueChanged = self._input.value.trimEnd() !== getDateStr();
      if (isInput && valueChanged && !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
        self.setDate(self._input.value, true, e.target === self.altInput ? self.config.altFormat : self.config.dateFormat);
      }
    }
    function onKeyDown(e) {
      var eventTarget = getEventTarget(e);
      var isInput = self.config.wrap ? element.contains(eventTarget) : eventTarget === self._input;
      var allowInput = self.config.allowInput;
      var allowKeydown = self.isOpen && (!allowInput || !isInput);
      var allowInlineKeydown = self.config.inline && isInput && !allowInput;
      if (e.keyCode === 13 && isInput) {
        if (allowInput) {
          self.setDate(self._input.value, true, eventTarget === self.altInput ? self.config.altFormat : self.config.dateFormat);
          self.close();
          return eventTarget.blur();
        } else {
          self.open();
        }
      } else if (isCalendarElem(eventTarget) || allowKeydown || allowInlineKeydown) {
        var isTimeObj = !!self.timeContainer && self.timeContainer.contains(eventTarget);
        switch (e.keyCode) {
          case 13:
            if (isTimeObj) {
              e.preventDefault();
              updateTime();
              focusAndClose();
            } else
              selectDate(e);
            break;
          case 27:
            e.preventDefault();
            focusAndClose();
            break;
          case 8:
          case 46:
            if (isInput && !self.config.allowInput) {
              e.preventDefault();
              self.clear();
            }
            break;
          case 37:
          case 39:
            if (!isTimeObj && !isInput) {
              e.preventDefault();
              var activeElement = getClosestActiveElement();
              if (self.daysContainer !== void 0 && (allowInput === false || activeElement && isInView(activeElement))) {
                var delta_1 = e.keyCode === 39 ? 1 : -1;
                if (!e.ctrlKey)
                  focusOnDay(void 0, delta_1);
                else {
                  e.stopPropagation();
                  changeMonth(delta_1);
                  focusOnDay(getFirstAvailableDay(1), 0);
                }
              }
            } else if (self.hourElement)
              self.hourElement.focus();
            break;
          case 38:
          case 40:
            e.preventDefault();
            var delta = e.keyCode === 40 ? 1 : -1;
            if (self.daysContainer && eventTarget.$i !== void 0 || eventTarget === self.input || eventTarget === self.altInput) {
              if (e.ctrlKey) {
                e.stopPropagation();
                changeYear(self.currentYear - delta);
                focusOnDay(getFirstAvailableDay(1), 0);
              } else if (!isTimeObj)
                focusOnDay(void 0, delta * 7);
            } else if (eventTarget === self.currentYearElement) {
              changeYear(self.currentYear - delta);
            } else if (self.config.enableTime) {
              if (!isTimeObj && self.hourElement)
                self.hourElement.focus();
              updateTime(e);
              self._debouncedChange();
            }
            break;
          case 9:
            if (isTimeObj) {
              var elems = [
                self.hourElement,
                self.minuteElement,
                self.secondElement,
                self.amPM
              ].concat(self.pluginElements).filter(function(x) {
                return x;
              });
              var i = elems.indexOf(eventTarget);
              if (i !== -1) {
                var target = elems[i + (e.shiftKey ? -1 : 1)];
                e.preventDefault();
                (target || self._input).focus();
              }
            } else if (!self.config.noCalendar && self.daysContainer && self.daysContainer.contains(eventTarget) && e.shiftKey) {
              e.preventDefault();
              self._input.focus();
            }
            break;
        }
      }
      if (self.amPM !== void 0 && eventTarget === self.amPM) {
        switch (e.key) {
          case self.l10n.amPM[0].charAt(0):
          case self.l10n.amPM[0].charAt(0).toLowerCase():
            self.amPM.textContent = self.l10n.amPM[0];
            setHoursFromInputs();
            updateValue();
            break;
          case self.l10n.amPM[1].charAt(0):
          case self.l10n.amPM[1].charAt(0).toLowerCase():
            self.amPM.textContent = self.l10n.amPM[1];
            setHoursFromInputs();
            updateValue();
            break;
        }
      }
      if (isInput || isCalendarElem(eventTarget)) {
        triggerEvent("onKeyDown", e);
      }
    }
    function onMouseOver(elem, cellClass) {
      if (cellClass === void 0) {
        cellClass = "flatpickr-day";
      }
      if (self.selectedDates.length !== 1 || elem && (!elem.classList.contains(cellClass) || elem.classList.contains("flatpickr-disabled")))
        return;
      var hoverDate = elem ? elem.dateObj.getTime() : self.days.firstElementChild.dateObj.getTime(), initialDate = self.parseDate(self.selectedDates[0], void 0, true).getTime(), rangeStartDate = Math.min(hoverDate, self.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self.selectedDates[0].getTime());
      var containsDisabled = false;
      var minRange = 0, maxRange = 0;
      for (var t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
        if (!isEnabled(new Date(t), true)) {
          containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
          if (t < initialDate && (!minRange || t > minRange))
            minRange = t;
          else if (t > initialDate && (!maxRange || t < maxRange))
            maxRange = t;
        }
      }
      var hoverableCells = Array.from(self.rContainer.querySelectorAll("*:nth-child(-n+" + self.config.showMonths + ") > ." + cellClass));
      hoverableCells.forEach(function(dayElem) {
        var date = dayElem.dateObj;
        var timestamp = date.getTime();
        var outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;
        if (outOfRange) {
          dayElem.classList.add("notAllowed");
          ["inRange", "startRange", "endRange"].forEach(function(c) {
            dayElem.classList.remove(c);
          });
          return;
        } else if (containsDisabled && !outOfRange)
          return;
        ["startRange", "inRange", "endRange", "notAllowed"].forEach(function(c) {
          dayElem.classList.remove(c);
        });
        if (elem !== void 0) {
          elem.classList.add(hoverDate <= self.selectedDates[0].getTime() ? "startRange" : "endRange");
          if (initialDate < hoverDate && timestamp === initialDate)
            dayElem.classList.add("startRange");
          else if (initialDate > hoverDate && timestamp === initialDate)
            dayElem.classList.add("endRange");
          if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate))
            dayElem.classList.add("inRange");
        }
      });
    }
    function onResize() {
      if (self.isOpen && !self.config.static && !self.config.inline)
        positionCalendar();
    }
    function open(e, positionElement) {
      if (positionElement === void 0) {
        positionElement = self._positionElement;
      }
      if (self.isMobile === true) {
        if (e) {
          e.preventDefault();
          var eventTarget = getEventTarget(e);
          if (eventTarget) {
            eventTarget.blur();
          }
        }
        if (self.mobileInput !== void 0) {
          self.mobileInput.focus();
          self.mobileInput.click();
        }
        triggerEvent("onOpen");
        return;
      } else if (self._input.disabled || self.config.inline) {
        return;
      }
      var wasOpen = self.isOpen;
      self.isOpen = true;
      if (!wasOpen) {
        self.calendarContainer.classList.add("open");
        self._input.classList.add("active");
        triggerEvent("onOpen");
        positionCalendar(positionElement);
      }
      if (self.config.enableTime === true && self.config.noCalendar === true) {
        if (self.config.allowInput === false && (e === void 0 || !self.timeContainer.contains(e.relatedTarget))) {
          setTimeout(function() {
            return self.hourElement.select();
          }, 50);
        }
      }
    }
    function minMaxDateSetter(type) {
      return function(date) {
        var dateObj = self.config["_" + type + "Date"] = self.parseDate(date, self.config.dateFormat);
        var inverseDateObj = self.config["_" + (type === "min" ? "max" : "min") + "Date"];
        if (dateObj !== void 0) {
          self[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
        }
        if (self.selectedDates) {
          self.selectedDates = self.selectedDates.filter(function(d) {
            return isEnabled(d);
          });
          if (!self.selectedDates.length && type === "min")
            setHoursFromDate(dateObj);
          updateValue();
        }
        if (self.daysContainer) {
          redraw();
          if (dateObj !== void 0)
            self.currentYearElement[type] = dateObj.getFullYear().toString();
          else
            self.currentYearElement.removeAttribute(type);
          self.currentYearElement.disabled = !!inverseDateObj && dateObj !== void 0 && inverseDateObj.getFullYear() === dateObj.getFullYear();
        }
      };
    }
    function parseConfig() {
      var boolOpts = [
        "wrap",
        "weekNumbers",
        "allowInput",
        "allowInvalidPreload",
        "clickOpens",
        "time_24hr",
        "enableTime",
        "noCalendar",
        "altInput",
        "shorthandCurrentMonth",
        "inline",
        "static",
        "enableSeconds",
        "disableMobile"
      ];
      var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
      var formats2 = {};
      self.config.parseDate = userConfig.parseDate;
      self.config.formatDate = userConfig.formatDate;
      Object.defineProperty(self.config, "enable", {
        get: function() {
          return self.config._enable;
        },
        set: function(dates) {
          self.config._enable = parseDateRules(dates);
        }
      });
      Object.defineProperty(self.config, "disable", {
        get: function() {
          return self.config._disable;
        },
        set: function(dates) {
          self.config._disable = parseDateRules(dates);
        }
      });
      var timeMode = userConfig.mode === "time";
      if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
        var defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults.dateFormat;
        formats2.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
      }
      if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
        var defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults.altFormat;
        formats2.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
      }
      Object.defineProperty(self.config, "minDate", {
        get: function() {
          return self.config._minDate;
        },
        set: minMaxDateSetter("min")
      });
      Object.defineProperty(self.config, "maxDate", {
        get: function() {
          return self.config._maxDate;
        },
        set: minMaxDateSetter("max")
      });
      var minMaxTimeSetter = function(type) {
        return function(val) {
          self.config[type === "min" ? "_minTime" : "_maxTime"] = self.parseDate(val, "H:i:S");
        };
      };
      Object.defineProperty(self.config, "minTime", {
        get: function() {
          return self.config._minTime;
        },
        set: minMaxTimeSetter("min")
      });
      Object.defineProperty(self.config, "maxTime", {
        get: function() {
          return self.config._maxTime;
        },
        set: minMaxTimeSetter("max")
      });
      if (userConfig.mode === "time") {
        self.config.noCalendar = true;
        self.config.enableTime = true;
      }
      Object.assign(self.config, formats2, userConfig);
      for (var i = 0; i < boolOpts.length; i++)
        self.config[boolOpts[i]] = self.config[boolOpts[i]] === true || self.config[boolOpts[i]] === "true";
      HOOKS.filter(function(hook) {
        return self.config[hook] !== void 0;
      }).forEach(function(hook) {
        self.config[hook] = arrayify(self.config[hook] || []).map(bindToInstance);
      });
      self.isMobile = !self.config.disableMobile && !self.config.inline && self.config.mode === "single" && !self.config.disable.length && !self.config.enable && !self.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      for (var i = 0; i < self.config.plugins.length; i++) {
        var pluginConf = self.config.plugins[i](self) || {};
        for (var key in pluginConf) {
          if (HOOKS.indexOf(key) > -1) {
            self.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self.config[key]);
          } else if (typeof userConfig[key] === "undefined")
            self.config[key] = pluginConf[key];
        }
      }
      if (!userConfig.altInputClass) {
        self.config.altInputClass = getInputElem().className + " " + self.config.altInputClass;
      }
      triggerEvent("onParseConfig");
    }
    function getInputElem() {
      return self.config.wrap ? element.querySelector("[data-input]") : element;
    }
    function setupLocale() {
      if (typeof self.config.locale !== "object" && typeof flatpickr.l10ns[self.config.locale] === "undefined")
        self.config.errorHandler(new Error("flatpickr: invalid locale " + self.config.locale));
      self.l10n = __assign(__assign({}, flatpickr.l10ns.default), typeof self.config.locale === "object" ? self.config.locale : self.config.locale !== "default" ? flatpickr.l10ns[self.config.locale] : void 0);
      tokenRegex.D = "(" + self.l10n.weekdays.shorthand.join("|") + ")";
      tokenRegex.l = "(" + self.l10n.weekdays.longhand.join("|") + ")";
      tokenRegex.M = "(" + self.l10n.months.shorthand.join("|") + ")";
      tokenRegex.F = "(" + self.l10n.months.longhand.join("|") + ")";
      tokenRegex.K = "(" + self.l10n.amPM[0] + "|" + self.l10n.amPM[1] + "|" + self.l10n.amPM[0].toLowerCase() + "|" + self.l10n.amPM[1].toLowerCase() + ")";
      var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
      if (userConfig.time_24hr === void 0 && flatpickr.defaultConfig.time_24hr === void 0) {
        self.config.time_24hr = self.l10n.time_24hr;
      }
      self.formatDate = createDateFormatter(self);
      self.parseDate = createDateParser({ config: self.config, l10n: self.l10n });
    }
    function positionCalendar(customPositionElement) {
      if (typeof self.config.position === "function") {
        return void self.config.position(self, customPositionElement);
      }
      if (self.calendarContainer === void 0)
        return;
      triggerEvent("onPreCalendarPosition");
      var positionElement = customPositionElement || self._positionElement;
      var calendarHeight = Array.prototype.reduce.call(self.calendarContainer.children, (function(acc, child) {
        return acc + child.offsetHeight;
      }), 0), calendarWidth = self.calendarContainer.offsetWidth, configPos = self.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
      var top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
      toggleClass(self.calendarContainer, "arrowTop", !showOnTop);
      toggleClass(self.calendarContainer, "arrowBottom", showOnTop);
      if (self.config.inline)
        return;
      var left = window.pageXOffset + inputBounds.left;
      var isCenter = false;
      var isRight = false;
      if (configPosHorizontal === "center") {
        left -= (calendarWidth - inputBounds.width) / 2;
        isCenter = true;
      } else if (configPosHorizontal === "right") {
        left -= calendarWidth - inputBounds.width;
        isRight = true;
      }
      toggleClass(self.calendarContainer, "arrowLeft", !isCenter && !isRight);
      toggleClass(self.calendarContainer, "arrowCenter", isCenter);
      toggleClass(self.calendarContainer, "arrowRight", isRight);
      var right = window.document.body.offsetWidth - (window.pageXOffset + inputBounds.right);
      var rightMost = left + calendarWidth > window.document.body.offsetWidth;
      var centerMost = right + calendarWidth > window.document.body.offsetWidth;
      toggleClass(self.calendarContainer, "rightMost", rightMost);
      if (self.config.static)
        return;
      self.calendarContainer.style.top = top + "px";
      if (!rightMost) {
        self.calendarContainer.style.left = left + "px";
        self.calendarContainer.style.right = "auto";
      } else if (!centerMost) {
        self.calendarContainer.style.left = "auto";
        self.calendarContainer.style.right = right + "px";
      } else {
        var doc = getDocumentStyleSheet();
        if (doc === void 0)
          return;
        var bodyWidth = window.document.body.offsetWidth;
        var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
        var centerBefore = ".flatpickr-calendar.centerMost:before";
        var centerAfter = ".flatpickr-calendar.centerMost:after";
        var centerIndex = doc.cssRules.length;
        var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
        toggleClass(self.calendarContainer, "rightMost", false);
        toggleClass(self.calendarContainer, "centerMost", true);
        doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
        self.calendarContainer.style.left = centerLeft + "px";
        self.calendarContainer.style.right = "auto";
      }
    }
    function getDocumentStyleSheet() {
      var editableSheet = null;
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if (!sheet.cssRules)
          continue;
        try {
          sheet.cssRules;
        } catch (err) {
          continue;
        }
        editableSheet = sheet;
        break;
      }
      return editableSheet != null ? editableSheet : createStyleSheet();
    }
    function createStyleSheet() {
      var style = document.createElement("style");
      document.head.appendChild(style);
      return style.sheet;
    }
    function redraw() {
      if (self.config.noCalendar || self.isMobile)
        return;
      buildMonthSwitch();
      updateNavigationCurrentMonth();
      buildDays();
    }
    function focusAndClose() {
      self._input.focus();
      if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== void 0) {
        setTimeout(self.close, 0);
      } else {
        self.close();
      }
    }
    function selectDate(e) {
      e.preventDefault();
      e.stopPropagation();
      var isSelectable = function(day) {
        return day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("flatpickr-disabled") && !day.classList.contains("notAllowed");
      };
      var t = findParent(getEventTarget(e), isSelectable);
      if (t === void 0)
        return;
      var target = t;
      var selectedDate = self.latestSelectedDateObj = new Date(target.dateObj.getTime());
      var shouldChangeMonth = (selectedDate.getMonth() < self.currentMonth || selectedDate.getMonth() > self.currentMonth + self.config.showMonths - 1) && self.config.mode !== "range";
      self.selectedDateElem = target;
      if (self.config.mode === "single")
        self.selectedDates = [selectedDate];
      else if (self.config.mode === "multiple") {
        var selectedIndex = isDateSelected(selectedDate);
        if (selectedIndex)
          self.selectedDates.splice(parseInt(selectedIndex), 1);
        else
          self.selectedDates.push(selectedDate);
      } else if (self.config.mode === "range") {
        if (self.selectedDates.length === 2) {
          self.clear(false, false);
        }
        self.latestSelectedDateObj = selectedDate;
        self.selectedDates.push(selectedDate);
        if (compareDates(selectedDate, self.selectedDates[0], true) !== 0)
          self.selectedDates.sort(function(a, b) {
            return a.getTime() - b.getTime();
          });
      }
      setHoursFromInputs();
      if (shouldChangeMonth) {
        var isNewYear = self.currentYear !== selectedDate.getFullYear();
        self.currentYear = selectedDate.getFullYear();
        self.currentMonth = selectedDate.getMonth();
        if (isNewYear) {
          triggerEvent("onYearChange");
          buildMonthSwitch();
        }
        triggerEvent("onMonthChange");
      }
      updateNavigationCurrentMonth();
      buildDays();
      updateValue();
      if (!shouldChangeMonth && self.config.mode !== "range" && self.config.showMonths === 1)
        focusOnDayElem(target);
      else if (self.selectedDateElem !== void 0 && self.hourElement === void 0) {
        self.selectedDateElem && self.selectedDateElem.focus();
      }
      if (self.hourElement !== void 0)
        self.hourElement !== void 0 && self.hourElement.focus();
      if (self.config.closeOnSelect) {
        var single = self.config.mode === "single" && !self.config.enableTime;
        var range = self.config.mode === "range" && self.selectedDates.length === 2 && !self.config.enableTime;
        if (single || range) {
          focusAndClose();
        }
      }
      triggerChange();
    }
    var CALLBACKS = {
      locale: [setupLocale, updateWeekdays],
      showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
      minDate: [jumpToDate],
      maxDate: [jumpToDate],
      positionElement: [updatePositionElement],
      clickOpens: [
        function() {
          if (self.config.clickOpens === true) {
            bind(self._input, "focus", self.open);
            bind(self._input, "click", self.open);
          } else {
            self._input.removeEventListener("focus", self.open);
            self._input.removeEventListener("click", self.open);
          }
        }
      ]
    };
    function set(option, value) {
      if (option !== null && typeof option === "object") {
        Object.assign(self.config, option);
        for (var key in option) {
          if (CALLBACKS[key] !== void 0)
            CALLBACKS[key].forEach(function(x) {
              return x();
            });
        }
      } else {
        self.config[option] = value;
        if (CALLBACKS[option] !== void 0)
          CALLBACKS[option].forEach(function(x) {
            return x();
          });
        else if (HOOKS.indexOf(option) > -1)
          self.config[option] = arrayify(value);
      }
      self.redraw();
      updateValue(true);
    }
    function setSelectedDate(inputDate, format) {
      var dates = [];
      if (inputDate instanceof Array)
        dates = inputDate.map(function(d) {
          return self.parseDate(d, format);
        });
      else if (inputDate instanceof Date || typeof inputDate === "number")
        dates = [self.parseDate(inputDate, format)];
      else if (typeof inputDate === "string") {
        switch (self.config.mode) {
          case "single":
          case "time":
            dates = [self.parseDate(inputDate, format)];
            break;
          case "multiple":
            dates = inputDate.split(self.config.conjunction).map(function(date) {
              return self.parseDate(date, format);
            });
            break;
          case "range":
            dates = inputDate.split(self.l10n.rangeSeparator).map(function(date) {
              return self.parseDate(date, format);
            });
            break;
        }
      } else
        self.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
      self.selectedDates = self.config.allowInvalidPreload ? dates : dates.filter(function(d) {
        return d instanceof Date && isEnabled(d, false);
      });
      if (self.config.mode === "range")
        self.selectedDates.sort(function(a, b) {
          return a.getTime() - b.getTime();
        });
    }
    function setDate(date, triggerChange2, format) {
      if (triggerChange2 === void 0) {
        triggerChange2 = false;
      }
      if (format === void 0) {
        format = self.config.dateFormat;
      }
      if (date !== 0 && !date || date instanceof Array && date.length === 0)
        return self.clear(triggerChange2);
      setSelectedDate(date, format);
      self.latestSelectedDateObj = self.selectedDates[self.selectedDates.length - 1];
      self.redraw();
      jumpToDate(void 0, triggerChange2);
      setHoursFromDate();
      if (self.selectedDates.length === 0) {
        self.clear(false);
      }
      updateValue(triggerChange2);
      if (triggerChange2)
        triggerEvent("onChange");
    }
    function parseDateRules(arr) {
      return arr.slice().map(function(rule) {
        if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
          return self.parseDate(rule, void 0, true);
        } else if (rule && typeof rule === "object" && rule.from && rule.to)
          return {
            from: self.parseDate(rule.from, void 0),
            to: self.parseDate(rule.to, void 0)
          };
        return rule;
      }).filter(function(x) {
        return x;
      });
    }
    function setupDates() {
      self.selectedDates = [];
      self.now = self.parseDate(self.config.now) || /* @__PURE__ */ new Date();
      var preloadedDate = self.config.defaultDate || ((self.input.nodeName === "INPUT" || self.input.nodeName === "TEXTAREA") && self.input.placeholder && self.input.value === self.input.placeholder ? null : self.input.value);
      if (preloadedDate)
        setSelectedDate(preloadedDate, self.config.dateFormat);
      self._initialDate = self.selectedDates.length > 0 ? self.selectedDates[0] : self.config.minDate && self.config.minDate.getTime() > self.now.getTime() ? self.config.minDate : self.config.maxDate && self.config.maxDate.getTime() < self.now.getTime() ? self.config.maxDate : self.now;
      self.currentYear = self._initialDate.getFullYear();
      self.currentMonth = self._initialDate.getMonth();
      if (self.selectedDates.length > 0)
        self.latestSelectedDateObj = self.selectedDates[0];
      if (self.config.minTime !== void 0)
        self.config.minTime = self.parseDate(self.config.minTime, "H:i");
      if (self.config.maxTime !== void 0)
        self.config.maxTime = self.parseDate(self.config.maxTime, "H:i");
      self.minDateHasTime = !!self.config.minDate && (self.config.minDate.getHours() > 0 || self.config.minDate.getMinutes() > 0 || self.config.minDate.getSeconds() > 0);
      self.maxDateHasTime = !!self.config.maxDate && (self.config.maxDate.getHours() > 0 || self.config.maxDate.getMinutes() > 0 || self.config.maxDate.getSeconds() > 0);
    }
    function setupInputs() {
      self.input = getInputElem();
      if (!self.input) {
        self.config.errorHandler(new Error("Invalid input element specified"));
        return;
      }
      self.input._type = self.input.type;
      self.input.type = "text";
      self.input.classList.add("flatpickr-input");
      self._input = self.input;
      if (self.config.altInput) {
        self.altInput = createElement(self.input.nodeName, self.config.altInputClass);
        self._input = self.altInput;
        self.altInput.placeholder = self.input.placeholder;
        self.altInput.disabled = self.input.disabled;
        self.altInput.required = self.input.required;
        self.altInput.tabIndex = self.input.tabIndex;
        self.altInput.type = "text";
        self.input.setAttribute("type", "hidden");
        if (!self.config.static && self.input.parentNode)
          self.input.parentNode.insertBefore(self.altInput, self.input.nextSibling);
      }
      if (!self.config.allowInput)
        self._input.setAttribute("readonly", "readonly");
      updatePositionElement();
    }
    function updatePositionElement() {
      self._positionElement = self.config.positionElement || self._input;
    }
    function setupMobile() {
      var inputType = self.config.enableTime ? self.config.noCalendar ? "time" : "datetime-local" : "date";
      self.mobileInput = createElement("input", self.input.className + " flatpickr-mobile");
      self.mobileInput.tabIndex = 1;
      self.mobileInput.type = inputType;
      self.mobileInput.disabled = self.input.disabled;
      self.mobileInput.required = self.input.required;
      self.mobileInput.placeholder = self.input.placeholder;
      self.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";
      if (self.selectedDates.length > 0) {
        self.mobileInput.defaultValue = self.mobileInput.value = self.formatDate(self.selectedDates[0], self.mobileFormatStr);
      }
      if (self.config.minDate)
        self.mobileInput.min = self.formatDate(self.config.minDate, "Y-m-d");
      if (self.config.maxDate)
        self.mobileInput.max = self.formatDate(self.config.maxDate, "Y-m-d");
      if (self.input.getAttribute("step"))
        self.mobileInput.step = String(self.input.getAttribute("step"));
      self.input.type = "hidden";
      if (self.altInput !== void 0)
        self.altInput.type = "hidden";
      try {
        if (self.input.parentNode)
          self.input.parentNode.insertBefore(self.mobileInput, self.input.nextSibling);
      } catch (_a) {
      }
      bind(self.mobileInput, "change", function(e) {
        self.setDate(getEventTarget(e).value, false, self.mobileFormatStr);
        triggerEvent("onChange");
        triggerEvent("onClose");
      });
    }
    function toggle(e) {
      if (self.isOpen === true)
        return self.close();
      self.open(e);
    }
    function triggerEvent(event, data) {
      if (self.config === void 0)
        return;
      var hooks = self.config[event];
      if (hooks !== void 0 && hooks.length > 0) {
        for (var i = 0; hooks[i] && i < hooks.length; i++)
          hooks[i](self.selectedDates, self.input.value, self, data);
      }
      if (event === "onChange") {
        self.input.dispatchEvent(createEvent("change"));
        self.input.dispatchEvent(createEvent("input"));
      }
    }
    function createEvent(name) {
      var e = document.createEvent("Event");
      e.initEvent(name, true, true);
      return e;
    }
    function isDateSelected(date) {
      for (var i = 0; i < self.selectedDates.length; i++) {
        var selectedDate = self.selectedDates[i];
        if (selectedDate instanceof Date && compareDates(selectedDate, date) === 0)
          return "" + i;
      }
      return false;
    }
    function isDateInRange(date) {
      if (self.config.mode !== "range" || self.selectedDates.length < 2)
        return false;
      return compareDates(date, self.selectedDates[0]) >= 0 && compareDates(date, self.selectedDates[1]) <= 0;
    }
    function updateNavigationCurrentMonth() {
      if (self.config.noCalendar || self.isMobile || !self.monthNav)
        return;
      self.yearElements.forEach(function(yearElement, i) {
        var d = new Date(self.currentYear, self.currentMonth, 1);
        d.setMonth(self.currentMonth + i);
        if (self.config.showMonths > 1 || self.config.monthSelectorType === "static") {
          self.monthElements[i].textContent = monthToStr(d.getMonth(), self.config.shorthandCurrentMonth, self.l10n) + " ";
        } else {
          self.monthsDropdownContainer.value = d.getMonth().toString();
        }
        yearElement.value = d.getFullYear().toString();
      });
      self._hidePrevMonthArrow = self.config.minDate !== void 0 && (self.currentYear === self.config.minDate.getFullYear() ? self.currentMonth <= self.config.minDate.getMonth() : self.currentYear < self.config.minDate.getFullYear());
      self._hideNextMonthArrow = self.config.maxDate !== void 0 && (self.currentYear === self.config.maxDate.getFullYear() ? self.currentMonth + 1 > self.config.maxDate.getMonth() : self.currentYear > self.config.maxDate.getFullYear());
    }
    function getDateStr(specificFormat) {
      var format = specificFormat || (self.config.altInput ? self.config.altFormat : self.config.dateFormat);
      return self.selectedDates.map(function(dObj) {
        return self.formatDate(dObj, format);
      }).filter(function(d, i, arr) {
        return self.config.mode !== "range" || self.config.enableTime || arr.indexOf(d) === i;
      }).join(self.config.mode !== "range" ? self.config.conjunction : self.l10n.rangeSeparator);
    }
    function updateValue(triggerChange2) {
      if (triggerChange2 === void 0) {
        triggerChange2 = true;
      }
      if (self.mobileInput !== void 0 && self.mobileFormatStr) {
        self.mobileInput.value = self.latestSelectedDateObj !== void 0 ? self.formatDate(self.latestSelectedDateObj, self.mobileFormatStr) : "";
      }
      self.input.value = getDateStr(self.config.dateFormat);
      if (self.altInput !== void 0) {
        self.altInput.value = getDateStr(self.config.altFormat);
      }
      if (triggerChange2 !== false)
        triggerEvent("onValueUpdate");
    }
    function onMonthNavClick(e) {
      var eventTarget = getEventTarget(e);
      var isPrevMonth = self.prevMonthNav.contains(eventTarget);
      var isNextMonth = self.nextMonthNav.contains(eventTarget);
      if (isPrevMonth || isNextMonth) {
        changeMonth(isPrevMonth ? -1 : 1);
      } else if (self.yearElements.indexOf(eventTarget) >= 0) {
        eventTarget.select();
      } else if (eventTarget.classList.contains("arrowUp")) {
        self.changeYear(self.currentYear + 1);
      } else if (eventTarget.classList.contains("arrowDown")) {
        self.changeYear(self.currentYear - 1);
      }
    }
    function timeWrapper(e) {
      e.preventDefault();
      var isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
      if (self.amPM !== void 0 && eventTarget === self.amPM) {
        self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
      }
      var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
      var newValue = curValue + step * delta;
      if (typeof input.value !== "undefined" && input.value.length === 2) {
        var isHourElem = input === self.hourElement, isMinuteElem = input === self.minuteElement;
        if (newValue < min) {
          newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self.amPM));
          if (isMinuteElem)
            incrementNumInput(void 0, -1, self.hourElement);
        } else if (newValue > max) {
          newValue = input === self.hourElement ? newValue - max - int(!self.amPM) : min;
          if (isMinuteElem)
            incrementNumInput(void 0, 1, self.hourElement);
        }
        if (self.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
          self.amPM.textContent = self.l10n.amPM[int(self.amPM.textContent === self.l10n.amPM[0])];
        }
        input.value = pad(newValue);
      }
    }
    init2();
    return self;
  }
  function _flatpickr(nodeList, config) {
    var nodes = Array.prototype.slice.call(nodeList).filter(function(x) {
      return x instanceof HTMLElement;
    });
    var instances = [];
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      try {
        if (node.getAttribute("data-fp-omit") !== null)
          continue;
        if (node._flatpickr !== void 0) {
          node._flatpickr.destroy();
          node._flatpickr = void 0;
        }
        node._flatpickr = FlatpickrInstance(node, config || {});
        instances.push(node._flatpickr);
      } catch (e) {
        console.error(e);
      }
    }
    return instances.length === 1 ? instances[0] : instances;
  }
  if (typeof HTMLElement !== "undefined" && typeof HTMLCollection !== "undefined" && typeof NodeList !== "undefined") {
    HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function(config) {
      return _flatpickr(this, config);
    };
    HTMLElement.prototype.flatpickr = function(config) {
      return _flatpickr([this], config);
    };
  }
  var flatpickr = function(selector, config) {
    if (typeof selector === "string") {
      return _flatpickr(window.document.querySelectorAll(selector), config);
    } else if (selector instanceof Node) {
      return _flatpickr([selector], config);
    } else {
      return _flatpickr(selector, config);
    }
  };
  flatpickr.defaultConfig = {};
  flatpickr.l10ns = {
    en: __assign({}, english),
    default: __assign({}, english)
  };
  flatpickr.localize = function(l10n) {
    flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
  };
  flatpickr.setDefaults = function(config) {
    flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
  };
  flatpickr.parseDate = createDateParser({});
  flatpickr.formatDate = createDateFormatter({});
  flatpickr.compareDates = compareDates;
  if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
    jQuery.fn.flatpickr = function(config) {
      return _flatpickr(this, config);
    };
  }
  Date.prototype.fp_incr = function(days) {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
  };
  if (typeof window !== "undefined") {
    window.flatpickr = flatpickr;
  }
  var pt$1 = { exports: {} };
  var pt = pt$1.exports;
  var hasRequiredPt;
  function requirePt() {
    if (hasRequiredPt) return pt$1.exports;
    hasRequiredPt = 1;
    (function(module, exports) {
      (function(global, factory) {
        factory(exports);
      })(pt, (function(exports2) {
        var fp = typeof window !== "undefined" && window.flatpickr !== void 0 ? window.flatpickr : {
          l10ns: {}
        };
        var Portuguese = {
          weekdays: {
            shorthand: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
            longhand: [
              "Domingo",
              "Segunda-feira",
              "Terça-feira",
              "Quarta-feira",
              "Quinta-feira",
              "Sexta-feira",
              "Sábado"
            ]
          },
          months: {
            shorthand: [
              "Jan",
              "Fev",
              "Mar",
              "Abr",
              "Mai",
              "Jun",
              "Jul",
              "Ago",
              "Set",
              "Out",
              "Nov",
              "Dez"
            ],
            longhand: [
              "Janeiro",
              "Fevereiro",
              "Março",
              "Abril",
              "Maio",
              "Junho",
              "Julho",
              "Agosto",
              "Setembro",
              "Outubro",
              "Novembro",
              "Dezembro"
            ]
          },
          rangeSeparator: " até ",
          time_24hr: true
        };
        fp.l10ns.pt = Portuguese;
        var pt2 = fp.l10ns;
        exports2.Portuguese = Portuguese;
        exports2.default = pt2;
        Object.defineProperty(exports2, "__esModule", { value: true });
      }));
    })(pt$1, pt$1.exports);
    return pt$1.exports;
  }
  var ptExports = requirePt();
  const calendarCSS = `.flatpickr-calendar{background:transparent;opacity:0;display:none;text-align:center;visibility:hidden;padding:0;-webkit-animation:none;animation:none;direction:ltr;border:0;font-size:14px;line-height:24px;border-radius:5px;position:absolute;width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;-ms-touch-action:manipulation;touch-action:manipulation;background:#fff;-webkit-box-shadow:1px 0 0 #e6e6e6,-1px 0 0 #e6e6e6,0 1px 0 #e6e6e6,0 -1px 0 #e6e6e6,0 3px 13px rgba(0,0,0,0.08);box-shadow:1px 0 0 #e6e6e6,-1px 0 0 #e6e6e6,0 1px 0 #e6e6e6,0 -1px 0 #e6e6e6,0 3px 13px rgba(0,0,0,0.08)}.flatpickr-calendar.open,.flatpickr-calendar.inline{opacity:1;max-height:640px;visibility:visible}.flatpickr-calendar.open{display:inline-block;z-index:99999}.flatpickr-calendar.animate.open{-webkit-animation:fpFadeInDown 300ms cubic-bezier(.23,1,.32,1);animation:fpFadeInDown 300ms cubic-bezier(.23,1,.32,1)}.flatpickr-calendar.inline{display:block;position:relative;top:2px}.flatpickr-calendar.static{position:absolute;top:calc(100% + 2px)}.flatpickr-calendar.static.open{z-index:999;display:block}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+1) .flatpickr-day.inRange:nth-child(7n+7){-webkit-box-shadow:none !important;box-shadow:none !important}.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+2) .flatpickr-day.inRange:nth-child(7n+1){-webkit-box-shadow:-2px 0 0 #e6e6e6,5px 0 0 #e6e6e6;box-shadow:-2px 0 0 #e6e6e6,5px 0 0 #e6e6e6}.flatpickr-calendar .hasWeeks .dayContainer,.flatpickr-calendar .hasTime .dayContainer{border-bottom:0;border-bottom-right-radius:0;border-bottom-left-radius:0}.flatpickr-calendar .hasWeeks .dayContainer{border-left:0}.flatpickr-calendar.hasTime .flatpickr-time{height:40px;border-top:1px solid #e6e6e6}.flatpickr-calendar.noCalendar.hasTime .flatpickr-time{height:auto}.flatpickr-calendar:before,.flatpickr-calendar:after{position:absolute;display:block;pointer-events:none;border:solid transparent;content:'';height:0;width:0;left:22px}.flatpickr-calendar.rightMost:before,.flatpickr-calendar.arrowRight:before,.flatpickr-calendar.rightMost:after,.flatpickr-calendar.arrowRight:after{left:auto;right:22px}.flatpickr-calendar.arrowCenter:before,.flatpickr-calendar.arrowCenter:after{left:50%;right:50%}.flatpickr-calendar:before{border-width:5px;margin:0 -5px}.flatpickr-calendar:after{border-width:4px;margin:0 -4px}.flatpickr-calendar.arrowTop:before,.flatpickr-calendar.arrowTop:after{bottom:100%}.flatpickr-calendar.arrowTop:before{border-bottom-color:#e6e6e6}.flatpickr-calendar.arrowTop:after{border-bottom-color:#fff}.flatpickr-calendar.arrowBottom:before,.flatpickr-calendar.arrowBottom:after{top:100%}.flatpickr-calendar.arrowBottom:before{border-top-color:#e6e6e6}.flatpickr-calendar.arrowBottom:after{border-top-color:#fff}.flatpickr-calendar:focus{outline:0}.flatpickr-wrapper{position:relative;display:inline-block}.flatpickr-months{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-months .flatpickr-month{background:transparent;color:rgba(0,0,0,0.9);fill:rgba(0,0,0,0.9);height:34px;line-height:1;text-align:center;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;overflow:hidden;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}.flatpickr-months .flatpickr-prev-month,.flatpickr-months .flatpickr-next-month{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;text-decoration:none;cursor:pointer;position:absolute;top:0;height:34px;padding:10px;z-index:3;color:rgba(0,0,0,0.9);fill:rgba(0,0,0,0.9)}.flatpickr-months .flatpickr-prev-month.flatpickr-disabled,.flatpickr-months .flatpickr-next-month.flatpickr-disabled{display:none}.flatpickr-months .flatpickr-prev-month i,.flatpickr-months .flatpickr-next-month i{position:relative}.flatpickr-months .flatpickr-prev-month.flatpickr-prev-month,.flatpickr-months .flatpickr-next-month.flatpickr-prev-month{/*
      /*rtl:begin:ignore*/left:0/*
      /*rtl:end:ignore*/}/*
      /*rtl:begin:ignore*/
/*
      /*rtl:end:ignore*/
.flatpickr-months .flatpickr-prev-month.flatpickr-next-month,.flatpickr-months .flatpickr-next-month.flatpickr-next-month{/*
      /*rtl:begin:ignore*/right:0/*
      /*rtl:end:ignore*/}/*
      /*rtl:begin:ignore*/
/*
      /*rtl:end:ignore*/
.flatpickr-months .flatpickr-prev-month:hover,.flatpickr-months .flatpickr-next-month:hover{color:#959ea9}.flatpickr-months .flatpickr-prev-month:hover svg,.flatpickr-months .flatpickr-next-month:hover svg{fill:#f64747}.flatpickr-months .flatpickr-prev-month svg,.flatpickr-months .flatpickr-next-month svg{width:14px;height:14px}.flatpickr-months .flatpickr-prev-month svg path,.flatpickr-months .flatpickr-next-month svg path{-webkit-transition:fill .1s;transition:fill .1s;fill:inherit}.numInputWrapper{position:relative;height:auto}.numInputWrapper input,.numInputWrapper span{display:inline-block}.numInputWrapper input{width:100%}.numInputWrapper input::-ms-clear{display:none}.numInputWrapper input::-webkit-outer-spin-button,.numInputWrapper input::-webkit-inner-spin-button{margin:0;-webkit-appearance:none}.numInputWrapper span{position:absolute;right:0;width:14px;padding:0 4px 0 2px;height:50%;line-height:50%;opacity:0;cursor:pointer;border:1px solid rgba(57,57,57,0.15);-webkit-box-sizing:border-box;box-sizing:border-box}.numInputWrapper span:hover{background:rgba(0,0,0,0.1)}.numInputWrapper span:active{background:rgba(0,0,0,0.2)}.numInputWrapper span:after{display:block;content:"";position:absolute}.numInputWrapper span.arrowUp{top:0;border-bottom:0}.numInputWrapper span.arrowUp:after{border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:4px solid rgba(57,57,57,0.6);top:26%}.numInputWrapper span.arrowDown{top:50%}.numInputWrapper span.arrowDown:after{border-left:4px solid transparent;border-right:4px solid transparent;border-top:4px solid rgba(57,57,57,0.6);top:40%}.numInputWrapper span svg{width:inherit;height:auto}.numInputWrapper span svg path{fill:rgba(0,0,0,0.5)}.numInputWrapper:hover{background:rgba(0,0,0,0.05)}.numInputWrapper:hover span{opacity:1}.flatpickr-current-month{font-size:135%;line-height:inherit;font-weight:300;color:inherit;position:absolute;width:75%;left:12.5%;padding:7.48px 0 0 0;line-height:1;height:34px;display:inline-block;text-align:center;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}.flatpickr-current-month span.cur-month{font-family:inherit;font-weight:700;color:inherit;display:inline-block;margin-left:.5ch;padding:0}.flatpickr-current-month span.cur-month:hover{background:rgba(0,0,0,0.05)}.flatpickr-current-month .numInputWrapper{width:6ch;width:7ch\\0;display:inline-block}.flatpickr-current-month .numInputWrapper span.arrowUp:after{border-bottom-color:rgba(0,0,0,0.9)}.flatpickr-current-month .numInputWrapper span.arrowDown:after{border-top-color:rgba(0,0,0,0.9)}.flatpickr-current-month input.cur-year{background:transparent;-webkit-box-sizing:border-box;box-sizing:border-box;color:inherit;cursor:text;padding:0 0 0 .5ch;margin:0;display:inline-block;font-size:inherit;font-family:inherit;font-weight:300;line-height:inherit;height:auto;border:0;border-radius:0;vertical-align:initial;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-current-month input.cur-year:focus{outline:0}.flatpickr-current-month input.cur-year[disabled],.flatpickr-current-month input.cur-year[disabled]:hover{font-size:100%;color:rgba(0,0,0,0.5);background:transparent;pointer-events:none}.flatpickr-current-month .flatpickr-monthDropdown-months{appearance:menulist;background:transparent;border:none;border-radius:0;box-sizing:border-box;color:inherit;cursor:pointer;font-size:inherit;font-family:inherit;font-weight:300;height:auto;line-height:inherit;margin:-1px 0 0 0;outline:none;padding:0 0 0 .5ch;position:relative;vertical-align:initial;-webkit-box-sizing:border-box;-webkit-appearance:menulist;-moz-appearance:menulist;width:auto}.flatpickr-current-month .flatpickr-monthDropdown-months:focus,.flatpickr-current-month .flatpickr-monthDropdown-months:active{outline:none}.flatpickr-current-month .flatpickr-monthDropdown-months:hover{background:rgba(0,0,0,0.05)}.flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month{background-color:transparent;outline:none;padding:0}.flatpickr-weekdays{background:transparent;text-align:center;overflow:hidden;width:100%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;height:28px}.flatpickr-weekdays .flatpickr-weekdaycontainer{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1}span.flatpickr-weekday{cursor:default;font-size:90%;background:transparent;color:rgba(0,0,0,0.54);line-height:1;margin:0;text-align:center;display:block;-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;font-weight:bolder}.dayContainer,.flatpickr-weeks{padding:1px 0 0 0}.flatpickr-days{position:relative;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-align:start;-webkit-align-items:flex-start;-ms-flex-align:start;align-items:flex-start;width:307.875px}.flatpickr-days:focus{outline:0}.dayContainer{padding:0;outline:0;text-align:left;width:307.875px;min-width:307.875px;max-width:307.875px;-webkit-box-sizing:border-box;box-sizing:border-box;display:inline-block;display:-ms-flexbox;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;-ms-flex-wrap:wrap;-ms-flex-pack:justify;-webkit-justify-content:space-around;justify-content:space-around;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0);opacity:1}.dayContainer + .dayContainer{-webkit-box-shadow:-1px 0 0 #e6e6e6;box-shadow:-1px 0 0 #e6e6e6}.flatpickr-day{background:none;border:1px solid transparent;border-radius:150px;-webkit-box-sizing:border-box;box-sizing:border-box;color:#393939;cursor:pointer;font-weight:400;width:14.2857143%;-webkit-flex-basis:14.2857143%;-ms-flex-preferred-size:14.2857143%;flex-basis:14.2857143%;max-width:39px;height:39px;line-height:39px;margin:0;display:inline-block;position:relative;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;text-align:center}.flatpickr-day.inRange,.flatpickr-day.prevMonthDay.inRange,.flatpickr-day.nextMonthDay.inRange,.flatpickr-day.today.inRange,.flatpickr-day.prevMonthDay.today.inRange,.flatpickr-day.nextMonthDay.today.inRange,.flatpickr-day:hover,.flatpickr-day.prevMonthDay:hover,.flatpickr-day.nextMonthDay:hover,.flatpickr-day:focus,.flatpickr-day.prevMonthDay:focus,.flatpickr-day.nextMonthDay:focus{cursor:pointer;outline:0;background:#e6e6e6;border-color:#e6e6e6}.flatpickr-day.today{border-color:#959ea9}.flatpickr-day.today:hover,.flatpickr-day.today:focus{border-color:#959ea9;background:#959ea9;color:#fff}.flatpickr-day.selected,.flatpickr-day.startRange,.flatpickr-day.endRange,.flatpickr-day.selected.inRange,.flatpickr-day.startRange.inRange,.flatpickr-day.endRange.inRange,.flatpickr-day.selected:focus,.flatpickr-day.startRange:focus,.flatpickr-day.endRange:focus,.flatpickr-day.selected:hover,.flatpickr-day.startRange:hover,.flatpickr-day.endRange:hover,.flatpickr-day.selected.prevMonthDay,.flatpickr-day.startRange.prevMonthDay,.flatpickr-day.endRange.prevMonthDay,.flatpickr-day.selected.nextMonthDay,.flatpickr-day.startRange.nextMonthDay,.flatpickr-day.endRange.nextMonthDay{background:#569ff7;-webkit-box-shadow:none;box-shadow:none;color:#fff;border-color:#569ff7}.flatpickr-day.selected.startRange,.flatpickr-day.startRange.startRange,.flatpickr-day.endRange.startRange{border-radius:50px 0 0 50px}.flatpickr-day.selected.endRange,.flatpickr-day.startRange.endRange,.flatpickr-day.endRange.endRange{border-radius:0 50px 50px 0}.flatpickr-day.selected.startRange + .endRange:not(:nth-child(7n+1)),.flatpickr-day.startRange.startRange + .endRange:not(:nth-child(7n+1)),.flatpickr-day.endRange.startRange + .endRange:not(:nth-child(7n+1)){-webkit-box-shadow:-10px 0 0 #569ff7;box-shadow:-10px 0 0 #569ff7}.flatpickr-day.selected.startRange.endRange,.flatpickr-day.startRange.startRange.endRange,.flatpickr-day.endRange.startRange.endRange{border-radius:50px}.flatpickr-day.inRange{border-radius:0;-webkit-box-shadow:-5px 0 0 #e6e6e6,5px 0 0 #e6e6e6;box-shadow:-5px 0 0 #e6e6e6,5px 0 0 #e6e6e6}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover,.flatpickr-day.prevMonthDay,.flatpickr-day.nextMonthDay,.flatpickr-day.notAllowed,.flatpickr-day.notAllowed.prevMonthDay,.flatpickr-day.notAllowed.nextMonthDay{color:rgba(57,57,57,0.3);background:transparent;border-color:transparent;cursor:default}.flatpickr-day.flatpickr-disabled,.flatpickr-day.flatpickr-disabled:hover{cursor:not-allowed;color:rgba(57,57,57,0.1)}.flatpickr-day.week.selected{border-radius:0;-webkit-box-shadow:-5px 0 0 #569ff7,5px 0 0 #569ff7;box-shadow:-5px 0 0 #569ff7,5px 0 0 #569ff7}.flatpickr-day.hidden{visibility:hidden}.rangeMode .flatpickr-day{margin-top:1px}.flatpickr-weekwrapper{float:left}.flatpickr-weekwrapper .flatpickr-weeks{padding:0 12px;-webkit-box-shadow:1px 0 0 #e6e6e6;box-shadow:1px 0 0 #e6e6e6}.flatpickr-weekwrapper .flatpickr-weekday{float:none;width:100%;line-height:28px}.flatpickr-weekwrapper span.flatpickr-day,.flatpickr-weekwrapper span.flatpickr-day:hover{display:block;width:100%;max-width:none;color:rgba(57,57,57,0.3);background:transparent;cursor:default;border:none}.flatpickr-innerContainer{display:block;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden}.flatpickr-rContainer{display:inline-block;padding:0;-webkit-box-sizing:border-box;box-sizing:border-box}.flatpickr-time{text-align:center;outline:0;display:block;height:0;line-height:40px;max-height:40px;-webkit-box-sizing:border-box;box-sizing:border-box;overflow:hidden;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex}.flatpickr-time:after{content:"";display:table;clear:both}.flatpickr-time .numInputWrapper{-webkit-box-flex:1;-webkit-flex:1;-ms-flex:1;flex:1;width:40%;height:40px;float:left}.flatpickr-time .numInputWrapper span.arrowUp:after{border-bottom-color:#393939}.flatpickr-time .numInputWrapper span.arrowDown:after{border-top-color:#393939}.flatpickr-time.hasSeconds .numInputWrapper{width:26%}.flatpickr-time.time24hr .numInputWrapper{width:49%}.flatpickr-time input{background:transparent;-webkit-box-shadow:none;box-shadow:none;border:0;border-radius:0;text-align:center;margin:0;padding:0;height:inherit;line-height:inherit;color:#393939;font-size:14px;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield}.flatpickr-time input.flatpickr-hour{font-weight:bold}.flatpickr-time input.flatpickr-minute,.flatpickr-time input.flatpickr-second{font-weight:400}.flatpickr-time input:focus{outline:0;border:0}.flatpickr-time .flatpickr-time-separator,.flatpickr-time .flatpickr-am-pm{height:inherit;float:left;line-height:inherit;color:#393939;font-weight:bold;width:2%;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-align-self:center;-ms-flex-item-align:center;align-self:center}.flatpickr-time .flatpickr-am-pm{outline:0;width:18%;cursor:pointer;text-align:center;font-weight:400}.flatpickr-time input:hover,.flatpickr-time .flatpickr-am-pm:hover,.flatpickr-time input:focus,.flatpickr-time .flatpickr-am-pm:focus{background:#eee}.flatpickr-input[readonly]{cursor:pointer}@-webkit-keyframes fpFadeInDown{from{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}@keyframes fpFadeInDown{from{opacity:0;-webkit-transform:translate3d(0,-20px,0);transform:translate3d(0,-20px,0)}to{opacity:1;-webkit-transform:translate3d(0,0,0);transform:translate3d(0,0,0)}}`;
  function hasInvalidTerms(text) {
    const trimmed = text.trim();
    const { cpf, cpfFormatted, passport, invalidTerms } = PATTERNS;
    return invalidTerms.test(trimmed) || !(cpf.test(trimmed) || cpfFormatted.test(trimmed) || passport.test(trimmed));
  }
  function isValidCPF(cpf) {
    const cleanCPF = cpf.replace(/\D/g, "");
    if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF))
      return false;
    let sum = 0;
    for (let i = 0; i < 9; i++)
      sum += Number(cleanCPF[i]) * (10 - i);
    let remainder = sum * 10 % 11;
    if (remainder === 10)
      remainder = 0;
    if (remainder !== Number(cleanCPF[9]))
      return false;
    sum = 0;
    for (let i = 0; i < 10; i++)
      sum += Number(cleanCPF[i]) * (11 - i);
    remainder = sum * 10 % 11;
    if (remainder === 10)
      remainder = 0;
    return remainder === Number(cleanCPF[10]);
  }
  function isValidBirthDate(dateString) {
    const [day, month, year] = dateString.split("/").map(Number);
    if (!day || !month || !year || dateString.length !== 10 || year < 1920)
      return false;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
      return false;
    const today = /* @__PURE__ */ new Date();
    let age = today.getFullYear() - year;
    const hadBirthdayThisYear = today.getMonth() > month - 1 || today.getMonth() === month - 1 && today.getDate() >= day;
    if (!hadBirthdayThisYear)
      age--;
    return age >= 18 && age <= 100;
  }
  const calendars = /* @__PURE__ */ new Map();
  function parseBirthDate(value) {
    const parts = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!parts) return /* @__PURE__ */ new Date(NaN);
    const day = Number(parts[1]);
    const month = Number(parts[2]);
    const year = Number(parts[3]);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : /* @__PURE__ */ new Date(NaN);
  }
  function initializeBirthDateField() {
    for (const [original, calendar] of calendars) {
      if (!original.isConnected) {
        calendar.destroy();
        calendars.delete(original);
      }
    }
    const input = document.querySelector(SELECTORS.birthDateInput);
    if (input) attachBirthDateCalendar(input);
  }
  function attachBirthDateCalendar(input, additional = false) {
    var _a;
    if (calendars.has(input)) return;
    const isEnglish = detectPageLanguage();
    const error = createErrorElement(additional ? "additional-birth-date-error" : "birth-date-error", input.parentElement);
    const picker = document.createElement("input");
    picker.type = "text";
    picker.id = `${input.id}-calendar`;
    picker.className = input.className;
    picker.classList.add("engine-birth-calendar");
    picker.value = input.value;
    picker.placeholder = isEnglish ? "DD/MM/YYYY" : "DD/MM/AAAA";
    picker.maxLength = 10;
    picker.inputMode = "numeric";
    picker.required = input.required || input.getAttribute("aria-required") === "true";
    picker.setAttribute("autocomplete", "bday");
    picker.setAttribute("aria-describedby", error.id);
    picker.setAttribute("aria-label", isEnglish ? "Date of birth" : "Data de nascimento");
    const today = /* @__PURE__ */ new Date();
    const latest = new Date(today.getFullYear() - (additional ? 0 : 18), today.getMonth(), today.getDate());
    if (latest.getMonth() !== today.getMonth()) latest.setDate(0);
    const earliest = new Date(today.getFullYear() - (additional ? 121 : 101), today.getMonth(), today.getDate() + 1);
    let updating = false;
    const save = (value, showIncomplete = true) => {
      const parsed = parseBirthDate(value);
      const valid = additional ? parsed >= earliest && parsed <= latest : isValidBirthDate(value);
      const invalid = Boolean(value) && !valid;
      const message = additional ? isEnglish ? "Enter a valid date of birth, not in the future (up to age 120)." : "Informe uma data válida, sem datas futuras (até 120 anos)." : isEnglish ? "Enter a valid date of birth (age 18–100)." : "Informe uma data válida (idade entre 18 e 100 anos).";
      picker.setCustomValidity(invalid ? message : "");
      picker.setAttribute("aria-invalid", String(invalid));
      if (invalid && (showIncomplete || value.length === 10)) showError(error, message);
      else hideError(error);
      updating = true;
      triggerReactInput(input, valid ? value : "");
      updating = false;
    };
    picker.addEventListener("input", () => save(picker.value, false));
    picker.addEventListener("blur", () => save(picker.value));
    input.style.display = "none";
    input.before(picker);
    const label = (_a = input.closest(".chakra-stack")) == null ? void 0 : _a.querySelector("label");
    if (label) label.htmlFor = picker.id;
    if (!document.getElementById("engine-birth-calendar-style")) {
      const style = document.createElement("style");
      style.id = "engine-birth-calendar-style";
      style.textContent = calendarCSS + `
.engine-additional-birth .flatpickr-wrapper{display:block;width:100%}
.engine-additional-birth .engine-birth-popup{z-index:1600;max-width:calc(100vw - 64px)}
.engine-birth-popup{font-family:var(--booking-engine-fonts-body,"Poppins",sans-serif);font-size:13px}
.engine-birth-popup .flatpickr-day.selected,.engine-birth-popup .flatpickr-day.selected:hover{background:var(--booking-engine-colors-primary-500,#32c0a0);border-color:var(--booking-engine-colors-primary-500,#32c0a0);color:var(--booking-engine-colors-primaryContrast-500,black)}
.engine-birth-popup .flatpickr-months .flatpickr-month{height:48px}
.engine-birth-popup .flatpickr-current-month{font-size:16px;height:48px;padding:2px 0;display:flex;align-items:center;justify-content:center;gap:4px}
.engine-birth-popup .flatpickr-current-month .numInputWrapper{display:none}
.engine-birth-popup .flatpickr-current-month .engine-birth-year{appearance:auto;font:inherit;font-weight:500;color:inherit;background:transparent;border:0;border-radius:4px;min-height:44px;width:82px;padding:4px;cursor:pointer}
.engine-birth-popup .flatpickr-current-month .flatpickr-monthDropdown-months{min-height:44px;font-size:16px;min-width:0;max-width:135px;margin:0}
.engine-birth-popup .flatpickr-months .flatpickr-prev-month,.engine-birth-popup .flatpickr-months .flatpickr-next-month{height:44px;padding-top:15px}
.engine-birth-popup .engine-birth-year:focus-visible{outline:2px solid var(--booking-engine-colors-primary-500,#32c0a0)}
.engine-birth-popup .flatpickr-months .flatpickr-prev-month:hover svg,.engine-birth-popup .flatpickr-months .flatpickr-next-month:hover svg{fill:var(--booking-engine-colors-primary-500,#32c0a0)}
.engine-birth-popup .flatpickr-day:focus-visible{outline:2px solid var(--booking-engine-colors-primary-500,#32c0a0);outline-offset:-2px}
`;
      document.head.append(style);
    }
    let yearSelect;
    const syncYear = (_dates, _value, instance) => {
      if (yearSelect) yearSelect.value = String(instance.currentYear);
    };
    const calendar = flatpickr(picker, {
      ...additional ? { appendTo: input.parentElement, static: true } : {},
      locale: isEnglish ? "default" : ptExports.Portuguese,
      dateFormat: "d/m/Y",
      ariaDateFormat: isEnglish ? "F j, Y" : "j F Y",
      allowInput: true,
      disableMobile: true,
      minDate: earliest,
      maxDate: latest,
      parseDate: parseBirthDate,
      errorHandler: () => {
      },
      onReady: (_dates, _value, instance) => {
        instance.calendarContainer.classList.add("engine-birth-popup");
        yearSelect = document.createElement("select");
        yearSelect.className = "engine-birth-year";
        yearSelect.setAttribute("aria-label", isEnglish ? "Year of birth" : "Ano de nascimento");
        for (let year = latest.getFullYear(); year >= earliest.getFullYear(); year--)
          yearSelect.add(new Option(String(year), String(year)));
        yearSelect.value = String(instance.currentYear);
        yearSelect.addEventListener("change", () => instance.changeYear(Number(yearSelect.value)));
        instance.currentYearElement.parentElement.after(yearSelect);
        instance.currentYearElement.tabIndex = -1;
      },
      onYearChange: syncYear,
      onMonthChange: syncYear,
      onOpen: syncYear,
      onValueUpdate: syncYear,
      onChange: (_dates, value) => save(value)
    });
    calendars.set(input, calendar);
    input.addEventListener("input", () => {
      if (!updating) calendar.setDate(input.value, false, "d/m/Y");
    });
  }
  let entries;
  let editIndex = null;
  let deletion = null;
  let pending;
  let activeForm;
  let installed = false;
  let reservation = "";
  const STORAGE_KEY = "engine-additional-birth-dates:176878";
  function reservationScope$1() {
    var _a;
    try {
      const session = JSON.parse(sessionStorage.getItem("176878") || "{}");
      const cart = JSON.parse(session.cart || "{}");
      return JSON.stringify([session._searchParams, (_a = cart.totals) == null ? void 0 : _a.cart_token]);
    } catch {
      return location.search;
    }
  }
  const attachedForms = /* @__PURE__ */ new WeakSet();
  const nameOf = (guest) => `${guest.firstName || ""} ${guest.lastName || ""}`.replace(/\s+/g, " ").trim();
  const keyOf = (guest) => JSON.stringify(["firstName", "lastName", "taxIdNumber", "email"].map((key) => String(guest[key] || "").trim()));
  const ghost = () => document.querySelector(`#guest-form ${SELECTORS.additionalBirthDatesInput}`);
  const serialize = (rows) => rows.length ? rows.map((row, i) => `${i + 1}. ${row.name}: ${row.date || "Não informada"}`).join("\n") : "Nenhum hóspede adicional";
  function readGuests() {
    try {
      const session = JSON.parse(sessionStorage.getItem("176878") || "null");
      const saved = new URLSearchParams(session == null ? void 0 : session._searchParams);
      const current = new URLSearchParams(location.search);
      if (!session || Number(session._expiration) <= Date.now() || ["checkin", "checkout"].some((key) => saved.get(key) !== current.get(key))) return null;
      const guests = JSON.parse(session.guests).additional;
      return Array.isArray(guests) ? guests : null;
    } catch {
      return null;
    }
  }
  function refresh() {
    var _a, _b, _c;
    const field = ghost();
    const guests = readGuests();
    if (!field || !guests) return;
    const identity = reservationScope$1();
    if (reservation !== identity) {
      reservation = identity;
      entries = void 0;
      pending = void 0;
    }
    if (!entries) {
      let stored = [];
      let original = field.value;
      try {
        const session = JSON.parse(sessionStorage.getItem("176878") || "{}");
        original || (original = ((_a = JSON.parse(session.guests || "{}").main) == null ? void 0 : _a.cf_GuestBithday) || "");
        const cache = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
        if ((cache == null ? void 0 : cache.scope) === identity && cache.expires > Date.now() && Array.isArray(cache.entries)) stored = cache.entries;
      } catch {
      }
      const lines = original.split("\n");
      entries = guests.map((guest, i) => {
        var _a2, _b2, _c2;
        const prefix = `${i + 1}. ${nameOf(guest)}: `;
        const nativeDate = ((_a2 = lines.find((line) => line.startsWith(prefix))) == null ? void 0 : _a2.slice(prefix.length)) || "";
        const date = /^\d{2}\/\d{2}\/\d{4}$/.test(nativeDate) ? nativeDate : (((_b2 = stored[i]) == null ? void 0 : _b2.key) === keyOf(guest) ? (_c2 = stored[i]) == null ? void 0 : _c2.date : "") || "";
        return { key: keyOf(guest), name: nameOf(guest), date: /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? date : "" };
      });
    }
    let pool = [...entries];
    if (deletion !== null && guests.length === entries.length - 1) {
      pool.splice(deletion, 1);
      deletion = null;
    }
    const modalClosed = activeForm && !activeForm.isConnected;
    const confirmed = modalClosed && pending && guests[pending.index] && keyOf(guests[pending.index]) === pending.key;
    entries = guests.map((guest, i) => {
      const key = keyOf(guest);
      const match = pool.findIndex((entry) => entry.key === key);
      const previous = match >= 0 ? pool.splice(match, 1)[0] : void 0;
      return { key, name: nameOf(guest), date: confirmed && pending.index === i ? pending.date : (previous == null ? void 0 : previous.date) || "" };
    });
    if (modalClosed) {
      activeForm = void 0;
      pending = void 0;
      editIndex = null;
    }
    try {
      const session = JSON.parse(sessionStorage.getItem("176878") || "{}");
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ scope: identity, expires: Number(session._expiration), entries }));
    } catch {
    }
    const value = serialize(entries);
    const overLimit = field.maxLength > 0 && value.length > field.maxLength;
    const missing = entries.some((entry) => !entry.date);
    let notice = document.getElementById("additional-birth-notice");
    if (!notice) {
      notice = document.createElement("p");
      notice.id = "additional-birth-notice";
      notice.setAttribute("role", "status");
      notice.style.cssText = "font:inherit;font-size:13px;color:#a12424;margin:8px 0";
      (_c = (_b = field.closest(".chakra-stack")) == null ? void 0 : _b.parentElement) == null ? void 0 : _c.before(notice);
    }
    const message = overLimit ? "A lista de datas excede o limite do campo. Entre em contato para informar o grupo." : missing ? "Informe a data de nascimento de cada hóspede adicional usando o botão de editar." : "";
    if (notice.textContent !== message) notice.textContent = message;
    notice.hidden = !message;
    if (!overLimit) triggerReactInput(field, value);
    const group = field.closest(".chakra-stack");
    const cell = group == null ? void 0 : group.parentElement;
    const hide = (cell == null ? void 0 : cell.classList.contains("chakra-stack")) && cell.children.length === 1 ? cell : group;
    if (hide) hide.style.display = "none";
  }
  function initializeAdditionalBirthDates() {
    var _a, _b, _c;
    if (!ghost()) return;
    if (!installed) {
      installed = true;
      document.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        if (/^(cancelar|cancel|fechar|close)$/i.test((button.textContent || "").trim()) || /close|fechar/i.test(button.getAttribute("aria-label") || "")) pending = void 0;
        if (button.matches('[data-testid="add-additional-guest-button"]')) {
          editIndex = null;
          pending = void 0;
        }
        if (button.matches('[aria-label="edit"], [aria-label="delete"]')) {
          const guests = readGuests() || [];
          const rows = [...document.querySelectorAll('button[aria-label="edit"]')].filter((b) => guests.some((g) => {
            var _a2, _b2, _c2;
            return ((_c2 = (_b2 = (_a2 = b.parentElement) == null ? void 0 : _a2.querySelector("p")) == null ? void 0 : _b2.textContent) == null ? void 0 : _c2.trim()) === nameOf(g);
          }));
          const index = rows.findIndex((b) => b.parentElement === button.parentElement);
          if (index >= 0) {
            if (button.getAttribute("aria-label") === "edit") {
              editIndex = index;
              pending = void 0;
            } else deletion = index;
          }
        }
      }, true);
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") pending = void 0;
      }, true);
      setInterval(() => {
        if (ghost()) refresh();
      }, 500);
      document.addEventListener("submit", (event) => {
        var _a2;
        if (!(event.target instanceof HTMLFormElement) || event.target.id !== "guest-form") return;
        refresh();
        const field = ghost();
        if ((entries == null ? void 0 : entries.some((entry) => !entry.date)) || field && field.maxLength > 0 && serialize(entries || []).length > field.maxLength) {
          event.preventDefault();
          event.stopImmediatePropagation();
          (_a2 = document.getElementById("additional-birth-notice")) == null ? void 0 : _a2.scrollIntoView({ block: "center" });
        }
      }, true);
    }
    refresh();
    const form = document.querySelector("#modal-additional-guest-form");
    if (!form || attachedForms.has(form)) return;
    attachedForms.add(form);
    activeForm = form;
    const en = detectPageLanguage();
    const anchor = (_b = (_a = form.querySelector('[name="taxIdNumber"]')) == null ? void 0 : _a.closest(".chakra-stack")) == null ? void 0 : _b.parentElement;
    if (!anchor) return;
    const container = document.createElement("div");
    container.className = "engine-additional-birth";
    container.style.cssText = "width:100%;margin:12px 0";
    const label = document.createElement("label");
    label.htmlFor = "additional-birth-date";
    label.textContent = en ? "Date of birth *" : "Data de nascimento *";
    label.style.cssText = "display:block;font:inherit;font-size:14px;margin-bottom:6px";
    const input = document.createElement("input");
    input.id = "additional-birth-date";
    input.type = "text";
    input.required = true;
    input.className = form.querySelector("input").className;
    input.value = editIndex !== null ? ((_c = entries == null ? void 0 : entries[editIndex]) == null ? void 0 : _c.date) || "" : "";
    container.append(label, input);
    anchor.after(container);
    attachBirthDateCalendar(input, true);
    input.required = false;
    const picker = container.querySelector(".engine-birth-calendar");
    picker.style.cssText = "box-sizing:border-box;width:100%;min-height:48px;padding:12px 14px;border:1px solid #dce0e7;border-radius:8px;font:inherit;font-size:16px;color:inherit;background:white";
    label.htmlFor = picker.id;
    const error = document.createElement("p");
    error.setAttribute("role", "alert");
    error.style.cssText = "color:#a12424;font-size:13px;margin-top:6px";
    container.append(error);
    form.addEventListener("submit", (event) => {
      var _a2, _b2, _c2;
      pending = void 0;
      const draft = {};
      for (const key of ["firstName", "lastName", "taxIdNumber", "email", "phone"])
        draft[key] = ((_a2 = form.querySelector(`[name="${key}"]`)) == null ? void 0 : _a2.value) || "";
      const index = editIndex ?? (((_b2 = readGuests()) == null ? void 0 : _b2.length) || 0);
      const projected = [...entries || []];
      projected[index] = { key: keyOf(draft), name: nameOf(draft), date: input.value };
      const limit = ((_c2 = ghost()) == null ? void 0 : _c2.maxLength) || 0;
      if (!input.value || !picker.checkValidity() || limit > 0 && serialize(projected).length > limit) {
        event.preventDefault();
        event.stopImmediatePropagation();
        error.textContent = !input.value || !picker.checkValidity() ? en ? "Enter a valid date of birth." : "Informe uma data de nascimento válida." : en ? "The guest list exceeds the reservation field limit." : "A lista de hóspedes excede o limite do campo da reserva.";
        picker.focus();
        return;
      }
      pending = { index, date: input.value, key: keyOf(draft) };
    }, true);
  }
  function prepareResponsiveDialog(dialog) {
    dialog.classList.add("engine-responsive-dialog");
    if (document.getElementById("engine-responsive-dialog-style")) return;
    const style = document.createElement("style");
    style.id = "engine-responsive-dialog-style";
    style.textContent = `
html:has(dialog.engine-responsive-dialog[open]){overflow:hidden}
dialog.engine-responsive-dialog{position:fixed;inset:0;margin:auto;max-height:90dvh;overscroll-behavior:contain;scrollbar-gutter:stable}
dialog.engine-responsive-dialog [data-close]{min-width:44px;min-height:44px;flex-shrink:0}
@media(max-width:639px){
 dialog.engine-responsive-dialog{inset:auto 0 0;margin:0;width:100%;max-width:100%;max-height:92dvh;border-radius:20px 20px 0 0;border-bottom:0;padding:24px 20px calc(20px + env(safe-area-inset-bottom,0px));scrollbar-gutter:auto;box-shadow:0 -12px 48px #17192326}
 dialog.engine-responsive-dialog[open]{animation:engine-sheet-enter .18s ease-out}
 dialog.engine-responsive-dialog header{align-items:center;padding-bottom:14px}
 dialog.engine-responsive-dialog h2{font-size:18px}
 dialog.engine-responsive-dialog footer button{flex:1;min-height:44px}
 dialog.engine-responsive-dialog textarea{font-size:16px}
}
@keyframes engine-sheet-enter{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(prefers-reduced-motion:reduce){dialog.engine-responsive-dialog[open]{animation:none}}
`;
    document.head.append(style);
  }
  async function normalizeRestrictions(text) {
    const endpoint = window.engineRestrictionsEndpoint || "https://api.caboclos.me/api/booking-engine/restrictions/normalize";
    if (new URL(endpoint).protocol !== "https:") {
      throw new Error("Normalization endpoint is not configured");
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15e3);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
        cache: "no-store",
        redirect: "error"
      });
      if (!response.ok) throw new Error("Normalization unavailable");
      const data = await response.json();
      if (!data || typeof data !== "object" || !("text" in data) || typeof data.text !== "string" || data.text.length > 500) {
        throw new Error("Invalid normalization response");
      }
      return data.text;
    } finally {
      clearTimeout(timer);
    }
  }
  const RESTRICTIONS_STYLES = `
.engine-restrictions-field,.engine-restrictions{
 --restrictions-brand:var(--booking-engine-colors-primary-500,#32c0a0);
 --restrictions-ink:var(--booking-engine-colors-primary-700,#196050);
 --restrictions-line:var(--booking-engine-colors-gray-200,#e2e8f0);
 --restrictions-muted:var(--booking-engine-colors-gray-600,#4a5568);
 font-family:var(--booking-engine-fonts-body,"Poppins",sans-serif);
}
.engine-restrictions-field{transition:border-color .15s,box-shadow .15s}
.engine-restrictions-field:focus-within{border-color:var(--restrictions-brand);box-shadow:0 0 0 2px color-mix(in srgb,var(--restrictions-brand) 16%,transparent)}
.engine-restrictions-field .engine-restrictions-trigger{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;margin:0;padding:6px 0 9px;border:0;border-radius:0;background:transparent;box-shadow:none;text-align:left;color:inherit;font:inherit;font-size:13px;cursor:pointer}
.engine-restrictions-trigger .restrictions-status{display:grid;place-items:center;width:30px;height:30px;flex-shrink:0;border-radius:50%;background:color-mix(in srgb,var(--restrictions-brand) 10%,white);color:var(--restrictions-ink)}
.engine-restrictions-trigger .restrictions-summary{flex:1;min-width:0;color:var(--restrictions-muted);line-height:1.6;white-space:pre-line;overflow-wrap:anywhere}
.engine-restrictions-trigger .restrictions-action{color:var(--restrictions-ink);font-weight:600;flex-shrink:0}
.engine-restrictions-trigger>svg{flex-shrink:0;color:var(--restrictions-ink)}
.engine-restrictions-trigger:hover .restrictions-action{text-decoration:underline;text-underline-offset:4px}
.engine-restrictions-trigger:focus-visible{outline:2px solid var(--restrictions-brand);outline-offset:2px;border-radius:5px}
.engine-restrictions{box-sizing:border-box;border:1px solid var(--restrictions-line);border-radius:16px;padding:28px;width:min(600px,calc(100vw - 32px));max-height:90dvh;overflow:auto;color:var(--booking-engine-colors-gray-800,#1a202c);background:white;font-size:13px;line-height:1.7;box-shadow:0 24px 80px #0f3a3026}
.engine-restrictions::backdrop{background:#17192380;backdrop-filter:blur(3px)}
.engine-restrictions header{display:flex;gap:16px;justify-content:space-between;align-items:start;padding-bottom:18px;border-bottom:1px solid var(--restrictions-line)}
.engine-restrictions h2{font-family:var(--booking-engine-fonts-heading,"Poppins",sans-serif);font-size:20px;line-height:1.4;font-weight:600;margin:0;letter-spacing:-.4px}
.engine-restrictions p{margin:16px 0;color:var(--restrictions-muted)}
.engine-restrictions p strong{display:block;color:var(--restrictions-ink);font-weight:600;margin-bottom:5px}
.engine-restrictions .choice{display:flex;gap:10px;align-items:start;margin:12px 0;cursor:pointer}
.engine-restrictions fieldset>div{padding:2px 14px;border:1px solid var(--restrictions-line);border-radius:9px;margin:8px 0;transition:background .15s,border-color .15s}
.engine-restrictions fieldset>div:has(input:checked){background:color-mix(in srgb,var(--restrictions-brand) 5%,white);border-color:var(--restrictions-brand)}
.engine-restrictions input[type=checkbox]{appearance:auto;width:17px;height:17px;flex-shrink:0;margin-top:3px;accent-color:var(--restrictions-brand);cursor:pointer}
.engine-restrictions textarea{box-sizing:border-box;display:block;width:100%;border:1px solid var(--restrictions-line);border-radius:7px;background:white;padding:10px 12px;font:inherit;color:inherit;margin:6px 0 14px;resize:vertical}
.engine-restrictions textarea::placeholder{color:var(--booking-engine-colors-gray-500,#718096)}
.engine-restrictions [hidden]{display:none!important}
.engine-restrictions textarea[readonly]{background:var(--booking-engine-colors-gray-50,#f7fafc);color:inherit}
.engine-restrictions fieldset{border:0;padding:0;margin:22px 0 0;min-width:0}
.engine-restrictions legend{font-weight:600;font-size:14px}
.engine-restrictions button{font:inherit;font-weight:500;cursor:pointer;border:1px solid var(--restrictions-line);border-radius:7px;padding:10px 16px;background:white;color:var(--restrictions-ink);transition:background .15s}
.engine-restrictions button:hover{background:color-mix(in srgb,var(--restrictions-brand) 10%,white)}
.engine-restrictions [data-close]{display:grid;place-items:center;border:0;padding:0;min-width:30px;height:30px;margin:-3px -8px 0 0;font-size:24px;color:var(--restrictions-muted)}
.engine-restrictions [data-prepare],.engine-restrictions button[type=submit]{background:var(--restrictions-brand);border-color:var(--restrictions-brand);color:var(--booking-engine-colors-primaryContrast-500,black)}
.engine-restrictions [data-prepare]:hover,.engine-restrictions button[type=submit]:hover{background:var(--booking-engine-colors-primary-400,#3bccab)}
.engine-restrictions button:disabled{opacity:.5;cursor:wait}
.engine-restrictions footer{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;border-top:1px solid var(--restrictions-line);padding-top:18px;margin-top:20px}
.engine-restrictions [data-review]{border-top:1px solid var(--restrictions-line);padding-top:18px}
.engine-restrictions [hidden]{display:none!important}
.engine-restrictions [data-error]{color:#a12424}
.engine-restrictions [data-error]:empty{display:none}
.engine-restrictions :focus-visible{outline:2px solid var(--restrictions-brand);outline-offset:3px}
@media(max-width:480px){.engine-restrictions{padding:20px;max-height:92dvh}.engine-restrictions h2{font-size:18px}.engine-restrictions-field .engine-restrictions-trigger{gap:8px;font-size:12px}.engine-restrictions-trigger .restrictions-status{width:26px;height:26px}.engine-restrictions footer button{flex:1}}

/* Keep the title and actions visible while long restriction details scroll. */
dialog.engine-responsive-dialog.engine-restrictions-editor{padding:0;overflow:hidden;scrollbar-gutter:auto;max-height:min(90dvh,calc(100dvh - 48px))}
.engine-restrictions-editor>form{display:flex;flex-direction:column;max-height:min(90dvh,calc(100dvh - 48px));min-height:0;margin:0}
.engine-restrictions-editor>form>header{flex-shrink:0;padding:20px 24px;align-items:center;background:white}
.engine-restrictions-editor .restrictions-editor-body{min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:0 24px 16px;scrollbar-gutter:stable}
.engine-restrictions-editor>form>footer{flex-shrink:0;margin:0;padding:16px 24px;background:white;border-top:1px solid var(--restrictions-line);display:flex;flex-wrap:wrap;gap:10px}
@media(max-width:639px){
 dialog.engine-responsive-dialog.engine-restrictions-editor{max-height:92dvh}
 .engine-restrictions-editor>form{max-height:92dvh}
 .engine-restrictions-editor>form>header{padding:18px 20px}
 .engine-restrictions-editor .restrictions-editor-body{padding:0 20px 12px;scrollbar-gutter:auto}
 .engine-restrictions-editor>form>footer{padding:14px 20px calc(14px + env(safe-area-inset-bottom,0px))}
}
`;
  const SELECTOR = '[data-testid="form-custom-field-cf_restricoes-input"]';
  const categories = ["Alimentar", "Física", "Doença"];
  const NONE = "Alimentar: Nenhuma. Física: Nenhuma. Doença: Nenhuma informada.";
  const ORIGINAL_KEY = "engine-restrictions-original:176878";
  function reservationScope() {
    var _a;
    try {
      const session = JSON.parse(sessionStorage.getItem("176878") || "{}");
      return JSON.stringify([session._searchParams, (_a = JSON.parse(session.cart || "{}").totals) == null ? void 0 : _a.cart_token]);
    } catch {
      return location.search;
    }
  }
  function initializeRestrictionsField() {
    const input = document.querySelector(SELECTOR);
    if (!input || input.dataset.restrictionsApplied) return;
    input.dataset.restrictionsApplied = "true";
    const en = detectPageLanguage();
    const t = (pt2, english2) => en ? english2 : pt2;
    const container = input.closest(".chakra-stack");
    container == null ? void 0 : container.classList.add("engine-restrictions-field");
    const label = container == null ? void 0 : container.querySelector("label");
    if (label) label.textContent = t("Restrições alimentares e físicas *", "Dietary and physical restrictions *");
    input.readOnly = true;
    input.hidden = true;
    input.style.display = "none";
    const button = document.createElement("button");
    button.type = "button";
    button.id = `${input.id}-editor`;
    button.className = "engine-restrictions-trigger";
    button.setAttribute("aria-haspopup", "dialog");
    button.innerHTML = `<span class="restrictions-status" aria-hidden="true"></span><span class="restrictions-summary"></span><span class="restrictions-action"></span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>`;
    const summary = button.querySelector(".restrictions-summary");
    const action = button.querySelector(".restrictions-action");
    const status = button.querySelector(".restrictions-status");
    const updateSummary = () => {
      const value = input.value.trim();
      const none = value === NONE;
      summary.textContent = none ? t("Nenhuma restrição informada", "No restrictions reported") : value || t("Informe as necessidades dos hóspedes", "Tell us about your guests’ needs");
      action.textContent = value ? t("Editar", "Edit") : t("Informar", "Add");
      status.innerHTML = value ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12 4 4L19 6"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="M12 8v5m0 3v.1"/></svg>';
      button.dataset.filled = String(Boolean(value));
      button.setAttribute("aria-label", `${value ? t("Editar", "Edit") : t("Informar", "Add")} ${t("restrições alimentares e físicas", "dietary and physical restrictions")}. ${summary.textContent}`);
    };
    updateSummary();
    input.addEventListener("input", updateSummary);
    input.after(button);
    if (label) label.htmlFor = button.id;
    let saved = {};
    let noneSaved = input.value.trim() === NONE;
    let accepted = false;
    let active;
    const open = () => {
      if (active == null ? void 0 : active.open) return;
      try {
        const original = JSON.parse(sessionStorage.getItem(ORIGINAL_KEY) || "null");
        if ((original == null ? void 0 : original.scope) === reservationScope() && original.normalized === input.value.trim() && original.saved && typeof original.saved === "object") {
          saved = Object.fromEntries(categories.filter((c) => typeof original.saved[c] === "string").map((c) => [c, original.saved[c]]));
          noneSaved = original.none === true;
          accepted = true;
        }
      } catch {
      }
      const dialog = document.createElement("dialog");
      active = dialog;
      dialog.className = "engine-restrictions engine-restrictions-editor";
      prepareResponsiveDialog(dialog);
      dialog.setAttribute("aria-labelledby", "restrictions-title");
      dialog.innerHTML = `<form method="dialog">
   <header><h2 id="restrictions-title">${t("Restrições alimentares e físicas", "Dietary and physical restrictions")}</h2><button type="button" data-close aria-label="${t("Fechar", "Close")}">×</button></header>
   <div class="restrictions-editor-body">
   <p><strong>${t("Sua segurança começa com esta informação.", "Your safety starts with this information.")}</strong> ${t("Estamos em uma região isolada, onde o atendimento médico de emergência não é imediato. Omitir alergias ou limitações pode colocar sua vida em risco e exigir uma remoção de alto custo.", "We are in a remote area where emergency medical care is not immediate. Not reporting allergies or limitations can put your life at risk and require a costly evacuation.")}</p>
   <p>${t("Informe as restrições de todos os hóspedes da reserva, identificando a quem se referem. Inclua alergias, intolerâncias, alimentação vegetariana ou vegana, limitações físicas e condições de saúde relevantes para a estadia.", "Report restrictions for all guests in the reservation, identifying each person. Include allergies, intolerances, vegetarian or vegan diets, physical limitations and health conditions relevant to the stay.")}</p>
   <p>${t("Este espaço é para restrições, não para gostos ou preferências, como “não gosto de arroz”. Se uma seletividade alimentar estiver ligada a uma condição de saúde, informe essa necessidade.", "This section is for restrictions, not tastes or preferences such as “I don’t like rice”. If selective eating is related to a health condition, please explain that need.")}</p>
   <label class="choice"><input type="checkbox" data-ack> ${t("Confirmo que entendi a importância de informar corretamente as restrições de todos os hóspedes.", "I understand the importance of accurately reporting all guests’ restrictions.")}</label>
   <fieldset><legend>${t("O que precisamos saber?", "What do we need to know?")}</legend></fieldset>
   <label class="choice" data-none-choice><input type="checkbox" data-none> ${t("Nenhum hóspede possui essas restrições ou condições de saúde.", "None of the guests has these restrictions or health conditions.")}</label>
   <p data-error role="alert"></p>
   <section data-review hidden><label>${t("Confira suas informações originais", "Review your original information")}<textarea data-result rows="4" readonly></textarea></label><label class="choice"><input type="checkbox" data-reviewed> ${t("Confirmo que as informações estão corretas e completas.", "I confirm that the information is correct and complete.")}</label><p>${t("Ao salvar, a IA organizará o texto para a ficha da reserva. Seu relato original será mantido para revisão.", "When you save, AI will organize the text in Portuguese for the reservation record. Your original text will be kept for review.")}</p></section>
   </div>
   <footer><button type="button" data-prepare>${t("Revisar informações", "Review information")}</button><button type="submit" data-save hidden>${t("Confirmar e salvar", "Confirm and save")}</button></footer>
  </form>`;
      const form = dialog.querySelector("form");
      const ack = dialog.querySelector("[data-ack]");
      const none = dialog.querySelector("[data-none]");
      const error = dialog.querySelector("[data-error]");
      const review = dialog.querySelector("[data-review]");
      const result2 = dialog.querySelector("[data-result]");
      const reviewed = dialog.querySelector("[data-reviewed]");
      const prepare = dialog.querySelector("[data-prepare]");
      const save = dialog.querySelector("[data-save]");
      const fields = categories.map((category, index) => {
        const wrapper = document.createElement("div");
        const titles = [t("Tenho restrições alimentares", "I have dietary restrictions"), t("Tenho restrições físicas", "I have physical restrictions"), t("Tenho uma condição de saúde relevante", "I have a relevant health condition")];
        const placeholders = [t("Ex.: Ana — alergia a alho; João — vegano.", "E.g. Ana — garlic allergy; John — vegan."), t("Ex.: Ana — não pode caminhar longas distâncias.", "E.g. Ana — cannot walk long distances."), t("Ex.: João — trombose.", "E.g. John — thrombosis.")];
        wrapper.innerHTML = `<label class="choice"><input type="checkbox"> ${titles[index]}</label><label hidden>${t("Descreva e identifique o hóspede", "Describe the restriction and identify the guest")}<textarea rows="2"></textarea></label>`;
        const check = wrapper.querySelector("input");
        const details = wrapper.querySelectorAll("label")[1];
        const text = wrapper.querySelector("textarea");
        text.placeholder = placeholders[index];
        text.maxLength = 2e3;
        text.value = saved[category] || "";
        check.checked = Boolean(text.value);
        details.hidden = !check.checked;
        check.onchange = () => {
          details.hidden = !check.checked;
          if (check.checked) none.checked = false;
          updateSelection();
        };
        dialog.querySelector("fieldset").append(wrapper);
        return { category, check, text, details };
      });
      if (!Object.keys(saved).length && input.value && !noneSaved) {
        const first = fields[0];
        first.text.value = input.value;
        first.check.checked = true;
        first.details.hidden = false;
      }
      ack.checked = accepted;
      none.checked = noneSaved;
      function updateSelection() {
        const selected = fields.some((f) => f.check.checked);
        dialog.querySelector("[data-none-choice]").hidden = selected;
        dialog.querySelector("fieldset").hidden = none.checked;
      }
      none.onchange = () => {
        if (none.checked) fields.forEach((f) => {
          f.check.checked = false;
          f.details.hidden = true;
        });
        updateSelection();
      };
      updateSelection();
      let revision = 0;
      form.addEventListener("input", (event) => {
        if (event.target === reviewed) return;
        reviewed.checked = false;
        if (event.target === result2) return;
        revision++;
        review.hidden = true;
        save.hidden = true;
      });
      let reviewedDraft = "";
      const draftText = () => none.checked ? NONE : fields.map((f) => `${f.category}: ${f.check.checked ? f.text.value.trim() : "Nenhuma informada"}`).join("\n");
      prepare.onclick = () => {
        error.textContent = "";
        if (!ack.checked) {
          error.textContent = t("Confirme a leitura do aviso de segurança.", "Confirm that you have read the safety notice.");
          ack.focus();
          return;
        }
        const selected = fields.filter((f) => f.check.checked);
        if (!none.checked && !selected.length) {
          error.textContent = t("Selecione as restrições ou marque a opção “nenhum”.", "Select the restrictions or choose “none”.");
          return;
        }
        const empty = selected.find((f) => !f.text.value.trim());
        if (empty) {
          error.textContent = t("Descreva cada restrição selecionada.", "Describe each selected restriction.");
          empty.text.focus();
          return;
        }
        result2.value = none.checked ? t("Nenhum hóspede possui essas restrições ou condições de saúde.", "None of the guests has these restrictions or health conditions.") : fields.filter((f) => f.check.checked).map((f) => `${en ? { Alimentar: "Dietary", Física: "Physical", Doença: "Health conditions" }[f.category] : f.category}: ${f.text.value}`).join("\n");
        reviewedDraft = draftText();
        review.hidden = false;
        save.hidden = false;
        reviewed.checked = false;
        result2.focus({ preventScroll: true });
        review.scrollIntoView({ block: "nearest" });
      };
      let saving = false;
      form.onsubmit = async (event) => {
        event.preventDefault();
        if (saving) return;
        if (review.hidden || !reviewed.checked || !ack.checked || reviewedDraft !== draftText()) {
          error.textContent = t("Revise as informações originais e confirme que estão corretas.", "Review your original information and confirm it is correct.");
          return;
        }
        const version = revision;
        const original = Object.fromEntries(fields.filter((f) => f.check.checked).map((f) => [f.category, f.text.value]));
        const isNone = none.checked;
        const draft = draftText();
        saving = true;
        save.disabled = true;
        prepare.disabled = true;
        save.textContent = t("Salvando…", "Saving…");
        form.setAttribute("aria-busy", "true");
        error.textContent = "";
        try {
          const normalized = isNone ? NONE : (await normalizeRestrictions(draft)).trim();
          if (!dialog.isConnected || !dialog.open || revision !== version || !reviewed.checked || !ack.checked) return;
          if (!normalized || !categories.every((c) => normalized.includes(`${c}:`))) throw new Error("Invalid summary");
          if (input.maxLength > 0 && normalized.length > input.maxLength) {
            error.textContent = en ? `The summary exceeds ${input.maxLength} characters. Adjust the text without omitting restrictions and review it again.` : `O resumo excedeu ${input.maxLength} caracteres. Ajuste o relato sem omitir restrições e revise novamente.`;
            return;
          }
          saved = original;
          noneSaved = isNone;
          accepted = true;
          triggerReactInput(input, normalized);
          try {
            sessionStorage.setItem(ORIGINAL_KEY, JSON.stringify({ scope: reservationScope(), normalized, saved, none: noneSaved }));
          } catch {
          }
          updateSummary();
          dialog.close();
        } catch {
          if (dialog.isConnected && dialog.open && revision === version) error.textContent = t("Não foi possível salvar. Seu texto original foi mantido; tente novamente.", "Unable to save. Your original text was kept; please try again.");
        } finally {
          saving = false;
          save.disabled = false;
          prepare.disabled = false;
          save.textContent = t("Confirmar e salvar", "Confirm and save");
          form.removeAttribute("aria-busy");
        }
      };
      dialog.querySelector("[data-close]").onclick = () => dialog.close();
      dialog.addEventListener("close", () => {
        dialog.remove();
        active = void 0;
        button.focus();
      });
      document.body.append(dialog);
      dialog.showModal();
    };
    button.onclick = open;
    input.onclick = open;
    input.onkeydown = (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    };
    if (!document.getElementById("engine-restrictions-style")) {
      const style = document.createElement("style");
      style.id = "engine-restrictions-style";
      style.textContent = RESTRICTIONS_STYLES;
      document.head.append(style);
    }
  }
  const observedForms = /* @__PURE__ */ new WeakSet();
  function initializeTaxNumberField() {
    const form = document.querySelector('form#guest-form[data-testid="guest-form"]');
    if (!form)
      return;
    const sync = () => {
      const source = form.querySelector(SELECTORS.cpfInput);
      const target = form.querySelector(SELECTORS.holderTaxNumberInput);
      if (!source || !target)
        return;
      triggerReactInput(target, source.value);
      const field = target.closest(".chakra-stack");
      const cell = field == null ? void 0 : field.parentElement;
      const wrapper = (cell == null ? void 0 : cell.classList.contains("chakra-stack")) && cell.children.length === 1 ? cell : field;
      if (wrapper)
        wrapper.style.display = "none";
    };
    sync();
    if (observedForms.has(form))
      return;
    observedForms.add(form);
    const onEdit = (event) => {
      if (event.target instanceof HTMLInputElement && event.target.matches(SELECTORS.cpfInput))
        setTimeout(sync, 0);
    };
    form.addEventListener("input", onEdit);
    form.addEventListener("change", onEdit);
    form.addEventListener("submit", sync, true);
  }
  let errorId = 0;
  function initializeCPFField() {
    applyCPFValidator(document.querySelector(SELECTORS.cpfInput));
    document.querySelectorAll(SELECTORS.additionalGuestTaxNumberInput).forEach((input) => {
      var _a, _b;
      const label = (_a = input.closest(".chakra-stack")) == null ? void 0 : _a.querySelector("label");
      const title = `CPF/Passport${input.required || ((_b = label == null ? void 0 : label.textContent) == null ? void 0 : _b.includes("*")) ? " *" : ""}`;
      if (label && label.textContent !== title) label.textContent = title;
      applyCPFValidator(input);
    });
  }
  function applyCPFValidator(input) {
    if (!input || isInitialized(input, "validatorApplied"))
      return;
    markAsInitialized(input, "validatorApplied");
    const isEnglish = detectPageLanguage();
    const errorElement = createErrorElement(`cpf-passport-error-${++errorId}`, input.parentElement);
    input.addEventListener("input", (e) => {
      const target = e.target;
      const value = target.value;
      if (hasInvalidTerms(value)) {
        showError(errorElement, isEnglish ? "Invalid" : "Invalido");
        triggerReactInput(target, value);
        return;
      }
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 11 && /^[\d.\s-]+$/.test(value)) {
        const formatted = numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
        if (isValidCPF(numbers))
          hideError(errorElement);
        else
          showError(errorElement, isEnglish ? "Invalid CPF." : "CPF inválido.");
        triggerReactInput(target, formatted);
        return;
      }
      hideError(errorElement);
      triggerReactInput(target, value);
    });
  }
  const COMPACT_DROPDOWN_STYLES$1 = {
    button: "box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:6px 0 9px;border:0;background:transparent;box-shadow:none;font:inherit;font-size:13px;text-align:left;cursor:pointer;color:var(--booking-engine-colors-gray-700,#2d3748);",
    buttonActive: "background:transparent;",
    buttonHover: "background:transparent;",
    buttonContent: "display:flex;align-items:center;justify-content:space-between;flex:1;min-width:0;gap:10px;",
    buttonLeft: "display:flex;align-items:center;flex:1;min-width:0;line-height:1.5;",
    dropdown: "box-sizing:border-box;position:absolute;top:calc(100% + 4px);left:0;right:0;background:white;border:1px solid var(--booking-engine-colors-gray-200,#e2e8f0);border-radius:10px;box-shadow:0 8px 24px #17192314;z-index:1000;max-height:260px;overflow-y:auto;overscroll-behavior:contain;display:none;opacity:0;transform:translateY(-4px);transition:opacity .15s,transform .15s;",
    option: "box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:44px;padding:10px 14px;font:inherit;font-size:13px;line-height:1.5;color:var(--booking-engine-colors-gray-700,#2d3748);cursor:pointer;border-bottom:1px solid var(--booking-engine-colors-gray-100,#edf2f7);",
    optionHover: "background:var(--booking-engine-colors-gray-50,#f7fafc);color:var(--booking-engine-colors-primary-700,#196050);",
    optionSelected: "background:var(--booking-engine-colors-gray-100,#edf2f7);color:var(--booking-engine-colors-primary-700,#196050);font-weight:500;",
    icon: "display:flex;align-items:center;width:18px;height:18px;color:var(--booking-engine-colors-gray-600,#4a5568);flex-shrink:0;transition:transform .15s;",
    iconOpen: "transform:rotate(180deg);"
  };
  function decorateCompactDropdown(dropdown, kind) {
    var _a, _b;
    dropdown.classList.add("engine-compact-dropdown");
    const icon = document.createElement("span");
    icon.className = "engine-compact-dropdown-icon";
    icon.setAttribute("aria-hidden", "true");
    const paths = kind === "language" ? '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z"/>' : '<path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z"/><path d="M7 10h8m-8 4h5"/>';
    icon.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    (_b = (_a = dropdown.firstElementChild) == null ? void 0 : _a.firstElementChild) == null ? void 0 : _b.prepend(icon);
    if (document.getElementById("engine-compact-dropdown-style")) return;
    const style = document.createElement("style");
    style.id = "engine-compact-dropdown-style";
    style.textContent = `.engine-compact-dropdown{font-family:var(--booking-engine-fonts-body,"Poppins",sans-serif)}.engine-compact-dropdown-icon{display:grid;place-items:center;width:28px;height:28px;flex-shrink:0;border-radius:50%;background:color-mix(in srgb,var(--booking-engine-colors-primary-500,#32c0a0) 10%,white);color:var(--booking-engine-colors-primary-700,#196050)}.engine-compact-dropdown [data-value]:last-child{border-bottom:0!important}`;
    document.head.append(style);
  }
  const DropdownMappers = {
    language: {
      getOptions(isEnglish = false) {
        return isEnglish ? [
          { text: "Select guide language", value: "" },
          { text: "Portuguese", value: "Português" },
          { text: "English", value: "Inglês" }
        ] : [
          { text: "Selecione o idioma do guia", value: "" },
          { text: "Português", value: "Português" },
          { text: "Inglês", value: "Inglês" }
        ];
      },
      getErrorMessage(isEnglish = false) {
        return isEnglish ? "Please select the guide language." : "Selecione o idioma do guia.";
      }
    },
    documentType: {
      // NOTE: option text is stored as "pt|en" in the original script but is
      // rendered verbatim (never split on "|") — the raw select currently
      // shows both languages joined by the pipe. Preserved as-is.
      getOptions() {
        return [
          { text: "Selecione:CPF ou Passaporte|Brazilian ID or Passport", value: "" },
          { text: "CPF|Brazilian ID", value: "CPF" },
          { text: "Passaporte|Passport", value: "Passaporte" }
        ];
      },
      errorMessage: "Selecione CPF ou Passaporte.|Please Select CPF or Passport"
    }
  };
  const DEFAULT_STYLES = {
    wrapper: "position:relative;width:100%;",
    button: "padding:14px 16px;font-size:0.9375rem;border:1.5px solid #e5e7eb;border-radius:10px;background:#ffffff;width:100%;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);color:#111827;font-weight:400;box-shadow:0 1px 2px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between;min-height:48px;cursor:pointer;",
    buttonPlaceholder: "color:#9ca3af;",
    buttonActive: "border-color:#32c0a0;box-shadow:0 0 0 4px rgba(50,192,160,0.1),0 2px 4px rgba(0,0,0,0.1);",
    buttonHover: "border-color:#d1d5db;",
    buttonError: "border-color:#ef4444;background:#fef2f2;",
    buttonContent: "display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;",
    buttonLeft: "display:flex;align-items:center;flex:1;min-width:0;",
    badge: "background:#e8f4f8;color:#1a9d7f;padding:6px 12px;border-radius:20px;font-size:0.8125rem;font-weight:600;white-space:nowrap;border:1px solid #b8e6d6;",
    dropdown: "position:absolute;top:calc(100%+4px);left:0;right:0;background:#ffffff;border:1.5px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:1000;max-height:240px;overflow-y:auto;display:none;opacity:0;transform:translateY(-8px);transition:all 0.2s cubic-bezier(0.4,0,0.2,1);",
    dropdownOpen: "display:block;opacity:1;transform:translateY(0);",
    option: "padding:12px 16px;font-size:0.9375rem;color:#111827;cursor:pointer;transition:all 0.15s ease;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:12px;",
    optionLeft: "display:flex;align-items:center;flex:1;min-width:0;",
    optionBadge: "background:#e8f4f8;color:#1a9d7f;padding:4px 10px;border-radius:16px;font-size:0.75rem;font-weight:600;white-space:nowrap;border:1px solid #b8e6d6;",
    optionHover: "background:#f9fafb;color:#32c0a0;",
    optionSelected: "background:#e8f4f8;color:#32c0a0;font-weight:500;",
    icon: "width:20px;height:20px;color:#6b7280;transition:transform 0.2s ease;flex-shrink:0;",
    iconOpen: "transform:rotate(180deg);color:#32c0a0;"
  };
  const CHEVRON_ICON_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  function CustomDropdown({
    placeholder = "Select an option",
    options = [],
    value = "",
    onChange = () => {
    },
    id = `dropdown-${Date.now()}`,
    styles = {}
  }) {
    const finalStyles = { ...DEFAULT_STYLES, ...styles };
    const wrapper = document.createElement("div");
    wrapper.style.cssText = finalStyles.wrapper;
    wrapper.id = id;
    const container = document.createElement("div");
    container.style.cssText = "position:relative;width:100%;";
    const button = document.createElement("div");
    button.style.cssText = finalStyles.button;
    if (!value)
      button.style.cssText += `;${finalStyles.buttonPlaceholder}`;
    const buttonContent = document.createElement("div");
    buttonContent.style.cssText = finalStyles.buttonContent;
    const buttonLeft = document.createElement("div");
    buttonLeft.style.cssText = finalStyles.buttonLeft;
    const buttonText = document.createElement("span");
    const selectedOption = options.find((opt) => opt.value === value);
    buttonText.textContent = selectedOption ? selectedOption.label || selectedOption.text : placeholder;
    if (!value)
      buttonText.style.color = "#9ca3af";
    buttonLeft.appendChild(buttonText);
    buttonContent.appendChild(buttonLeft);
    let badgeElement = null;
    if (value && (selectedOption == null ? void 0 : selectedOption.badge)) {
      badgeElement = document.createElement("span");
      badgeElement.style.cssText = finalStyles.badge;
      badgeElement.textContent = selectedOption.badge;
      buttonContent.appendChild(badgeElement);
    }
    const icon = document.createElement("div");
    icon.innerHTML = CHEVRON_ICON_SVG;
    icon.style.cssText = finalStyles.icon;
    buttonContent.appendChild(icon);
    button.appendChild(buttonContent);
    const dropdown = document.createElement("div");
    dropdown.style.cssText = finalStyles.dropdown;
    function syncBadge(option) {
      if (option.badge) {
        if (!badgeElement) {
          badgeElement = document.createElement("span");
          badgeElement.style.cssText = finalStyles.badge;
          buttonContent.insertBefore(badgeElement, icon);
        }
        badgeElement.textContent = option.badge;
        badgeElement.style.display = "";
      } else if (badgeElement) {
        badgeElement.style.display = "none";
      }
    }
    function syncOptionSelection(selectedValue) {
      dropdown.querySelectorAll("[data-value]").forEach((opt) => {
        opt.style.cssText = opt.dataset.value === selectedValue ? `${finalStyles.option};${finalStyles.optionSelected}` : finalStyles.option;
      });
    }
    options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.style.cssText = value === option.value ? `${finalStyles.option};${finalStyles.optionSelected}` : finalStyles.option;
      optionElement.dataset.value = option.value;
      const optionLeft = document.createElement("div");
      optionLeft.style.cssText = finalStyles.optionLeft;
      const optionText = document.createElement("span");
      optionText.textContent = option.label || option.text;
      optionLeft.appendChild(optionText);
      optionElement.appendChild(optionLeft);
      if (option.badge) {
        const optionBadge = document.createElement("span");
        optionBadge.style.cssText = finalStyles.optionBadge;
        optionBadge.textContent = option.badge;
        optionElement.appendChild(optionBadge);
      }
      optionElement.addEventListener("mouseenter", () => {
        if (value !== option.value)
          optionElement.style.cssText = `${finalStyles.option};${finalStyles.optionHover}`;
      });
      optionElement.addEventListener("mouseleave", () => {
        optionElement.style.cssText = value === option.value ? `${finalStyles.option};${finalStyles.optionSelected}` : finalStyles.option;
      });
      optionElement.addEventListener("click", () => {
        buttonText.textContent = option.label || option.text;
        buttonText.style.color = "#111827";
        button.style.cssText = finalStyles.button;
        syncBadge(option);
        syncOptionSelection(option.value);
        closeDropdown();
        onChange(option.value, option);
      });
      dropdown.appendChild(optionElement);
    });
    let isOpen = false;
    let isDisabled = false;
    function closeOnOutsideClick(e) {
      if (!container.contains(e.target))
        closeDropdown();
    }
    function openDropdown() {
      isOpen = true;
      dropdown.style.cssText = `${finalStyles.dropdown};${finalStyles.dropdownOpen}`;
      icon.style.cssText = `${finalStyles.icon};${finalStyles.iconOpen}`;
      button.style.cssText = `${finalStyles.button};${finalStyles.buttonActive}`;
      setTimeout(() => document.addEventListener("click", closeOnOutsideClick), 0);
    }
    function closeDropdown() {
      isOpen = false;
      dropdown.style.cssText = finalStyles.dropdown;
      icon.style.cssText = finalStyles.icon;
      button.style.cssText = finalStyles.button;
      document.removeEventListener("click", closeOnOutsideClick);
    }
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isDisabled)
        return;
      isOpen ? closeDropdown() : openDropdown();
    });
    button.addEventListener("mouseenter", () => {
      if (!isOpen && !isDisabled)
        button.style.cssText = `${finalStyles.button};${finalStyles.buttonHover}`;
    });
    button.addEventListener("mouseleave", () => {
      if (!isOpen && !isDisabled)
        button.style.cssText = finalStyles.button;
    });
    container.appendChild(button);
    container.appendChild(dropdown);
    wrapper.appendChild(container);
    wrapper.setValue = (newValue) => {
      const option = options.find((opt) => opt.value === newValue);
      if (!option)
        return;
      buttonText.textContent = option.label || option.text;
      buttonText.style.color = "#111827";
      button.style.cssText = finalStyles.button;
      if (!newValue) {
        button.style.cssText += `;${finalStyles.buttonPlaceholder}`;
        buttonText.style.color = "#9ca3af";
      }
      syncBadge(option);
      syncOptionSelection(newValue);
    };
    wrapper.getValue = () => value;
    wrapper.setError = (hasError) => {
      button.style.borderColor = hasError ? "#ef4444" : "#e5e7eb";
      button.style.background = hasError ? "#fef2f2" : "#ffffff";
    };
    wrapper.setDisabled = (disabled) => {
      isDisabled = disabled;
      if (disabled) {
        button.style.cursor = "not-allowed";
        button.style.opacity = "0.6";
        button.style.background = "#f3f4f6";
        button.style.color = "#9ca3af";
        if (isOpen)
          closeDropdown();
      } else {
        button.style.cursor = "pointer";
        button.style.opacity = "1";
        button.style.background = "#ffffff";
        button.style.color = "#111827";
      }
    };
    wrapper.close = closeDropdown;
    return wrapper;
  }
  function initializeLanguageDropdown() {
    var _a;
    const input = document.querySelector(SELECTORS.languageInput);
    if (!input || isInitialized(input, "dropdownApplied"))
      return;
    markAsInitialized(input, "dropdownApplied");
    const isEnglish = detectPageLanguage();
    const mapper = DropdownMappers.language;
    const options = mapper.getOptions(isEnglish);
    const dropdownOptions = options.filter((opt) => opt.value !== "").map((opt) => ({
      value: opt.value,
      text: opt.text,
      badge: opt.value === "Português" ? isEnglish ? "Included" : "Incluso" : isEnglish ? "+R$ 200/night" : "+R$ 200/noite"
    }));
    const label = (_a = input.closest(".chakra-stack")) == null ? void 0 : _a.querySelector("label");
    if (label) label.textContent = isEnglish ? "Guide language *" : "Idioma do guia *";
    const badgeStyle = "display:inline-flex;align-items:center;flex-shrink:0;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:500;white-space:nowrap;background:var(--booking-engine-colors-gray-100,#edf2f7);color:var(--booking-engine-colors-primary-700,#196050);border:1px solid var(--booking-engine-colors-gray-200,#e2e8f0);";
    const errorElement = createErrorElement("guide-language-error", input.parentElement);
    input.style.display = "none";
    const dropdown = CustomDropdown({
      styles: { ...COMPACT_DROPDOWN_STYLES$1, badge: badgeStyle, optionBadge: badgeStyle },
      placeholder: options[0].text,
      options: dropdownOptions,
      value: input.value || "",
      id: `language-dropdown-${Date.now()}`,
      onChange: (value) => {
        if (value === "Português" || value === "Inglês") {
          hideError(errorElement);
          triggerReactInput(input, value);
          dropdown.setError(false);
        } else {
          showError(errorElement, mapper.getErrorMessage(isEnglish));
          dropdown.setError(true);
        }
      }
    });
    decorateCompactDropdown(dropdown, "language");
    if (input.value)
      dropdown.setValue(input.value);
    input.parentElement.insertBefore(dropdown, input);
  }
  function initializeDocumentTypeDropdown() {
    const input = document.querySelector(SELECTORS.documentTypeInput);
    if (!input || isInitialized(input, "dropdownApplied"))
      return;
    markAsInitialized(input, "dropdownApplied");
    const mapper = DropdownMappers.documentType;
    const select = createSelect(mapper.getOptions());
    const errorElement = createErrorElement("document-type-error", input.parentElement);
    input.style.display = "none";
    input.parentElement.insertBefore(select, input);
    select.addEventListener("change", (e) => {
      const value = e.target.value;
      if (value === "CPF" || value === "Passaporte") {
        hideError(errorElement);
        triggerReactInput(input, value);
      } else {
        showError(errorElement, mapper.errorMessage);
      }
    });
  }
  function nightsBetween(checkin, checkout) {
    const diffTime = checkout.getTime() - checkin.getTime();
    return Math.max(0, Math.round(diffTime / (1e3 * 60 * 60 * 24)));
  }
  function calculateNightsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const checkinParam = urlParams.get("checkin");
    const checkoutParam = urlParams.get("checkout");
    if (!checkinParam || !checkoutParam)
      return null;
    const checkinDate = new Date(checkinParam);
    const checkoutDate = new Date(checkoutParam);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime()))
      return null;
    return nightsBetween(checkinDate, checkoutDate);
  }
  function initializeRouteSelect() {
    const input = document.querySelector(SELECTORS.routeInput);
    if (!input)
      return;
    const totalNights = calculateNightsFromURL();
    if (totalNights === null || totalNights < 1)
      return;
    const days = totalNights + 1;
    const value = `Roteiro - ${days} Dias e ${totalNights} ${totalNights === 1 ? "Noite" : "Noites"}`;
    triggerReactInput(input, value);
    const field = input.closest(".chakra-stack");
    const cell = field == null ? void 0 : field.parentElement;
    const wrapper = (cell == null ? void 0 : cell.classList.contains("chakra-stack")) && cell.children.length === 1 ? cell : field;
    if (wrapper)
      wrapper.style.display = "none";
    else
      input.style.display = "none";
  }
  const MAX_CHILD_AGE = 12;
  function readReservationOccupancy() {
    try {
      const session = JSON.parse(sessionStorage.getItem("176878") || "null");
      const current = new URLSearchParams(location.search);
      const saved = new URLSearchParams(session == null ? void 0 : session._searchParams);
      if (!session || Number(session._expiration) <= Date.now() || !Number.isFinite(Number(session._expiration)) || ["checkin", "checkout"].some((key) => !current.get(key) || current.get(key) !== saved.get(key)))
        return null;
      const cart = JSON.parse(session.cart);
      if (cart.isLoadingTotals || !Array.isArray(cart.items))
        return null;
      const rooms = cart.items.filter((item) => {
        var _a;
        return ((_a = item.model) == null ? void 0 : _a.type) === "accommodation";
      });
      if (!rooms.length)
        return null;
      let total = 0;
      let children = 0;
      for (const { model } of rooms) {
        if (!Number.isSafeInteger(model.adults) || model.adults < 1 || !Number.isSafeInteger(model.kids) || model.kids < 0 || !Number.isSafeInteger(model.amount) || model.amount < 1)
          return null;
        total += model.adults * model.amount;
        children += model.kids * model.amount;
      }
      return Number.isSafeInteger(total + children) ? { adults: total, children, total: total + children, key: JSON.stringify([saved.get("checkin"), saved.get("checkout"), rooms.map((room) => [room.id, room.model.adults, room.model.kids, room.model.amount])]) } : null;
    } catch {
      return null;
    }
  }
  function initializeGuestsField() {
    var _a, _b;
    const adults = document.querySelector(SELECTORS.adultsInput);
    const children = document.querySelector(SELECTORS.childrenInput);
    const wrapper = document.getElementById("children-field-wrapper");
    const adultField = adults == null ? void 0 : adults.closest(".chakra-stack");
    const field = children == null ? void 0 : children.closest(".chakra-stack");
    const label = field == null ? void 0 : field.querySelector("label");
    if (!adults || !children || !wrapper || !adultField || !field || !label) return;
    const en = detectPageLanguage();
    const t = (pt2, english2) => en ? english2 : pt2;
    const occupancy = readReservationOccupancy();
    const cell = adultField.parentElement;
    const adultCell = (cell == null ? void 0 : cell.classList.contains("chakra-stack")) && cell.children.length === 1 ? cell : adultField;
    if (occupancy !== null) {
      if (wrapper.dataset.occupancyKey !== occupancy.key) {
        let count3 = occupancy.children;
        let ages = [];
        try {
          const saved = JSON.parse(sessionStorage.getItem("engine-guest-composition") || "null");
          if ((saved == null ? void 0 : saved.key) === occupancy.key && Number.isInteger(saved.count) && saved.count >= 0 && saved.count < occupancy.total && Array.isArray(saved.ages) && saved.ages.length === saved.count && saved.ages.every((age) => typeof age === "string" && /^\d+$/.test(age) && Number(age) <= MAX_CHILD_AGE)) {
            count3 = saved.count;
            ages = saved.ages;
          }
        } catch {
        }
        wrapper.dataset.occupancyKey = occupancy.key;
        wrapper.dispatchEvent(new CustomEvent("engine:set-children", { detail: { count: count3, ages } }));
      }
      const count2 = Number(((_a = wrapper.querySelector(".stepper-count")) == null ? void 0 : _a.textContent) || 0);
      triggerReactInput(adults, String(occupancy.total - count2));
      adultCell.style.display = "none";
    } else adultCell.style.removeProperty("display");
    const guestCell = field.parentElement;
    const section = guestCell == null ? void 0 : guestCell.parentElement;
    const firstField = section && Array.from(section.children).find((element) => element !== guestCell && element.querySelector("input, textarea, select"));
    if (guestCell && section && firstField && guestCell.compareDocumentPosition(firstField) & Node.DOCUMENT_POSITION_PRECEDING)
      section.insertBefore(guestCell, firstField);
    field.classList.add("engine-restrictions-field");
    wrapper.style.display = "none";
    const title = t("Hóspedes", "Guests");
    if (label.textContent !== `${title} *`) label.textContent = `${title} *`;
    let trigger = field.querySelector("#guests-trigger");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.id = "guests-trigger";
      trigger.className = "engine-restrictions-trigger";
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.innerHTML = `<span class="restrictions-status" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/></svg></span><span class="restrictions-summary"></span><span class="restrictions-action">${t("Editar", "Edit")}</span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>`;
      wrapper.before(trigger);
      label.htmlFor = trigger.id;
      if (!document.getElementById("engine-restrictions-style")) {
        const style = document.createElement("style");
        style.id = "engine-restrictions-style";
        style.textContent = RESTRICTIONS_STYLES;
        document.head.append(style);
      }
      if (!document.getElementById("engine-guests-style")) {
        const style = document.createElement("style");
        style.id = "engine-guests-style";
        style.textContent = `
.engine-guests-editor .guests-intro{margin:16px 0 20px;line-height:1.6}
.engine-guests-editor .guests-total{display:inline-block;font-weight:600;color:var(--restrictions-ink)}
.engine-guests-editor .guests-counter-card{border:1px solid var(--restrictions-line);border-radius:14px;padding:0 18px;background:color-mix(in srgb,var(--restrictions-brand) 2%,white)}
.engine-guests-editor .guests-editor-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 0}
.engine-guests-editor .guests-editor-row+.guests-editor-row{border-top:1px solid var(--restrictions-line)}
.engine-guests-editor .guests-editor-row strong{font-size:15px;font-weight:500}
.engine-guests-editor .guests-editor-row small{display:block;font-size:12px;color:var(--restrictions-muted);margin-top:3px}
.engine-guests-editor .guests-stepper{display:flex;align-items:center;gap:4px;border:1px solid var(--restrictions-line);border-radius:12px;background:white;padding:3px;flex-shrink:0}
.engine-guests-editor .guests-stepper button{display:grid;place-items:center;width:40px;height:40px;padding:0;border:0;border-radius:9px;font-size:22px;line-height:1;background:transparent;color:var(--restrictions-ink)}
.engine-guests-editor .guests-stepper button:hover:not(:disabled){background:color-mix(in srgb,var(--restrictions-brand) 8%,white)}
.engine-guests-editor .guests-stepper button:disabled{opacity:.25;cursor:default}
.engine-guests-editor .guests-stepper output{min-width:28px;text-align:center;font-size:17px;font-weight:600;font-variant-numeric:tabular-nums}
.engine-guests-editor .guests-ages{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:20px}
.engine-guests-editor .guests-ages label{display:flex;flex-direction:column;gap:7px;font-size:12px;color:var(--restrictions-muted)}
.engine-guests-editor .guests-ages select{box-sizing:border-box;width:100%;min-height:48px;padding:10px 12px;border:1px solid var(--restrictions-line);border-radius:10px;background:white;font:inherit;font-size:16px;color:var(--restrictions-ink)}
.engine-guests-editor .guests-ages select:focus-visible,.engine-guests-editor .guests-stepper button:focus-visible{outline:2px solid var(--restrictions-brand);outline-offset:2px}
.engine-guests-editor .guests-ages:empty{display:none}
@media(max-width:639px){.engine-guests-editor .guests-counter-card{padding:0 12px}.engine-guests-editor .guests-editor-row{gap:8px}.engine-guests-editor .guests-ages{grid-template-columns:1fr}}
`;
        document.head.append(style);
      }
      trigger.onclick = () => {
        var _a2;
        const dialog = document.createElement("dialog");
        dialog.className = "engine-restrictions engine-guests-editor";
        prepareResponsiveDialog(dialog);
        dialog.setAttribute("aria-labelledby", "guests-editor-title");
        const booked = readReservationOccupancy();
        if (!booked) return;
        let count2 = Number(((_a2 = wrapper.querySelector(".stepper-count")) == null ? void 0 : _a2.textContent) || 0);
        let ages = [...children.value.matchAll(/(\d+) (?:anos?|years?)/g)].map((match) => match[1] || "");
        const stepper = (kind, caption) => `<div class="guests-stepper"><button type="button" data-${kind}-minus aria-label="${t("Diminuir", "Decrease")} ${caption}">−</button><output data-${kind}-count aria-live="polite"></output><button type="button" data-${kind}-plus aria-label="${t("Aumentar", "Increase")} ${caption}">+</button></div>`;
        dialog.innerHTML = `<form><header><h2 id="guests-editor-title">${title}</h2><button type="button" data-close aria-label="${t("Fechar", "Close")}">×</button></header><p class="guests-intro"><span class="guests-total">${booked.total} ${t(booked.total === 1 ? "hóspede na reserva" : "hóspedes na reserva", booked.total === 1 ? "guest in your reservation" : "guests in your reservation")}</span><br>${t("Ajuste a divisão entre adultos e crianças. O total permanece o mesmo.", "Adjust the adults and children. The total stays the same.")}</p><div class="guests-counter-card"><div class="guests-editor-row"><div><strong>${t("Adultos", "Adults")}</strong><small>${t("Pelo menos 1 responsável", "At least 1 adult")}</small></div>${stepper("adult", t("adultos", "adults"))}</div><div class="guests-editor-row"><div><strong>${t("Crianças", "Children")}</strong><small>${t("Informe as idades abaixo", "Enter ages below")}</small></div>${stepper("child", t("crianças", "children"))}</div></div><div class="guests-ages"></div><p data-error role="alert"></p><footer><button type="button" data-cancel>${t("Cancelar", "Cancel")}</button><button type="submit">${t("Salvar", "Save")}</button></footer></form>`;
        const render = () => {
          ages = Array.from({ length: count2 }, (_, i) => ages[i] ?? "");
          dialog.querySelector("[data-child-count]").textContent = String(count2);
          dialog.querySelector("[data-adult-count]").textContent = String(booked.total - count2);
          for (const key of ["child-minus", "adult-plus"]) dialog.querySelector(`[data-${key}]`).disabled = count2 === 0;
          for (const key of ["child-plus", "adult-minus"]) dialog.querySelector(`[data-${key}]`).disabled = count2 >= booked.total - 1;
          const container = dialog.querySelector(".guests-ages");
          container.replaceChildren();
          ages.forEach((age, i) => {
            const ageLabel = document.createElement("label");
            ageLabel.textContent = `${t("Criança", "Child")} ${i + 1}`;
            const select = document.createElement("select");
            select.required = true;
            select.add(new Option(t("Idade", "Age"), ""));
            for (let n = 0; n <= MAX_CHILD_AGE; n++) select.add(new Option(`${n} ${t(n === 1 ? "ano" : "anos", n === 1 ? "year" : "years")}`, String(n)));
            select.value = age;
            select.onchange = () => {
              ages[i] = select.value;
            };
            ageLabel.append(select);
            container.append(ageLabel);
          });
        };
        const changeChildren = (delta) => {
          count2 = Math.min(booked.total - 1, Math.max(0, count2 + delta));
          render();
        };
        for (const key of ["child-minus", "adult-plus"]) dialog.querySelector(`[data-${key}]`).onclick = () => changeChildren(-1);
        for (const key of ["child-plus", "adult-minus"]) dialog.querySelector(`[data-${key}]`).onclick = () => changeChildren(1);
        dialog.querySelector("form").onsubmit = (event) => {
          var _a3;
          event.preventDefault();
          if (ages.some((age) => age === "")) return;
          if (((_a3 = readReservationOccupancy()) == null ? void 0 : _a3.key) !== booked.key) {
            dialog.querySelector("[data-error]").textContent = t("A reserva mudou. Feche e abra novamente para revisar os hóspedes.", "Your reservation changed. Close and reopen to review guests.");
            return;
          }
          const value = count2 === 0 ? "None" : `${count2} | ${ages.map((age) => `${age} ${t(age === "1" ? "ano" : "anos", age === "1" ? "year old" : "years old")}`).join(", ")}`;
          if (children.maxLength > 0 && value.length > children.maxLength) {
            dialog.querySelector("[data-error]").textContent = t("A quantidade excede o limite deste campo. Entre em contato para informar o grupo.", "This group exceeds the field limit. Please contact us.");
            return;
          }
          try {
            sessionStorage.setItem("engine-guest-composition", JSON.stringify({ key: booked.key, count: count2, ages }));
          } catch {
          }
          wrapper.dispatchEvent(new CustomEvent("engine:set-children", { detail: { count: count2, ages } }));
          initializeGuestsField();
          dialog.close();
        };
        dialog.querySelector("[data-close]").onclick = () => dialog.close();
        dialog.querySelector("[data-cancel]").onclick = () => dialog.close();
        dialog.addEventListener("close", () => {
          dialog.remove();
          trigger == null ? void 0 : trigger.focus();
        });
        render();
        document.body.append(dialog);
        dialog.showModal();
      };
    }
    const count = Number(((_b = wrapper.querySelector(".stepper-count")) == null ? void 0 : _b.textContent) || 0);
    const adultCount = adults.value || "—";
    const summary = `${adultCount} ${t(adultCount === "1" ? "adulto" : "adultos", adultCount === "1" ? "adult" : "adults")} · ${count === 0 ? t("Sem crianças", "No children") : `${count} ${t(count === 1 ? "criança" : "crianças", count === 1 ? "child" : "children")}`}`;
    const text = trigger.querySelector(".restrictions-summary");
    if (text.textContent !== summary) text.textContent = summary;
  }
  const FIELD_STYLE_SHEET = `
#children-field-wrapper{--spacing-xs:4px;--spacing-sm:8px;--spacing-md:12px;--border-radius:6px;--border-color:#e5e7eb;--border-color-focus:#32c0a0;--border-color-error:#ef4444;--text-color:#111827;--bg-color:#ffffff;--bg-color-error:#fef2f2;--accent:#32c0a0;--accent-hover:#28a085;}
#children-field-wrapper .children-layout{display:flex;flex-direction:column;gap:var(--spacing-md);align-items:stretch;width:100%;}
@media(min-width:640px){#children-field-wrapper .children-layout{flex-direction:row;align-items:center;gap:var(--spacing-md);}}
#children-field-wrapper .stepper{display:flex;align-items:center;gap:var(--spacing-sm);background:var(--bg-color);border:1.5px solid var(--border-color);border-radius:50px;padding:4px;transition:all 0.2s ease;box-shadow:0 1px 3px rgba(0,0,0,0.08);min-height:36px;width:100%;justify-content:space-between;}
@media(min-width:640px){#children-field-wrapper .stepper{width:auto;justify-content:center;}}
#children-field-wrapper .stepper-btn{width:28px;height:28px;border:none;background:var(--accent);color:white;font-size:1.1rem;font-weight:400;line-height:1;border-radius:50%;cursor:pointer;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);display:flex;align-items:center;justify-content:center;user-select:none;box-shadow:0 2px 4px rgba(50,192,160,0.2);flex-shrink:0;}
#children-field-wrapper .stepper-btn:hover:not(:disabled){background:var(--accent-hover);transform:scale(1.1);box-shadow:0 4px 12px rgba(50,192,160,0.4);}
#children-field-wrapper .stepper-btn:active:not(:disabled){transform:scale(0.95);box-shadow:0 1px 2px rgba(50,192,160,0.3);}
#children-field-wrapper .stepper-btn:disabled{background:#f3f4f6;color:#d1d5db;cursor:not-allowed;transform:none;box-shadow:none;}
#children-field-wrapper .stepper-count{min-width:32px;text-align:center;font-weight:600;font-size:0.875rem;color:var(--text-color);padding:0 6px;}
#children-field-wrapper .ages-container{display:grid;gap:var(--spacing-sm);flex:1;min-width:0;width:100%;grid-template-columns:1fr;}
#children-field-wrapper .ages-container.cols-2{grid-template-columns:repeat(2,1fr);}
#children-field-wrapper .ages-container.cols-3{grid-template-columns:repeat(3,1fr);}
#children-field-wrapper .ages-container.cols-4{grid-template-columns:repeat(4,1fr);}
@media(max-width:640px){#children-field-wrapper .ages-container{width:100%;}#children-field-wrapper .ages-container.cols-2,#children-field-wrapper .ages-container.cols-3,#children-field-wrapper .ages-container.cols-4{grid-template-columns:1fr;}}
#children-field-wrapper .error-text{color:#dc2626;font-size:0.7rem;margin-top:var(--spacing-xs);font-weight:500;display:none;}
#children-field-wrapper .error-text.show{display:block;}
#children-field-wrapper.has-error{border:1.5px solid var(--border-color-error);border-radius:8px;padding:var(--spacing-md);background:var(--bg-color-error);}
`;
  const COMPACT_DROPDOWN_STYLES = {
    button: "padding:8px 10px;font-size:0.8125rem;border:1.5px solid #e5e7eb;border-radius:6px;background:#ffffff;width:100%;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);color:#111827;font-weight:400;box-shadow:0 1px 2px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between;min-height:36px;cursor:pointer;",
    buttonPlaceholder: "color:#9ca3af;",
    buttonActive: "border-color:#32c0a0;box-shadow:0 0 0 3px rgba(50,192,160,0.1),0 2px 4px rgba(0,0,0,0.1);",
    buttonHover: "border-color:#d1d5db;",
    dropdown: "position:absolute;top:calc(100%+4px);left:0;right:0;background:#ffffff;border:1.5px solid #e5e7eb;border-radius:6px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:1000;max-height:180px;overflow-y:auto;display:none;opacity:0;transform:translateY(-8px);transition:all 0.2s cubic-bezier(0.4,0,0.2,1);",
    option: "padding:8px 10px;font-size:0.8125rem;color:#111827;cursor:pointer;transition:all 0.15s ease;border-bottom:1px solid #f3f4f6;"
  };
  const POPUP_SELECTORS = ['[role="dialog"]', '[data-testid*="modal"]', '[data-testid*="drawer"]', ".chakra-modal", '[class*="modal"][style*="block"]', '[aria-modal="true"]'];
  function initializeChildrenField() {
    const input = document.querySelector(SELECTORS.childrenInput);
    if (!input || isInitialized(input, "childrenApplied"))
      return;
    markAsInitialized(input, "childrenApplied");
    const isEnglish = detectPageLanguage();
    input.style.display = "none";
    function getChildrenCountFromCheckout() {
      var _a;
      const allContainers = document.querySelectorAll('[class*="d-"]');
      for (const container of allContainers) {
        const svg = container.querySelector("svg");
        if (!svg)
          continue;
        const svgPath = svg.querySelector("path");
        if (!svgPath)
          continue;
        const pathD = svgPath.getAttribute("d") || "";
        if (!pathD.includes("M15.1133") && !pathD.includes("5.51172"))
          continue;
        const countElement = container.querySelector('[data-be-text="true"]');
        if (!countElement)
          continue;
        const countText = ((_a = countElement.textContent) == null ? void 0 : _a.trim()) ?? "";
        const count2 = Number.parseInt(countText, 10);
        if (!Number.isNaN(count2) && count2 >= 0 && count2 <= 12) {
          const svgParent = svg.closest('[class*="d-"]');
          const countParent = countElement.closest('[class*="d-"]');
          if (svgParent === countParent || (svgParent == null ? void 0 : svgParent.contains(countElement)) || (countParent == null ? void 0 : countParent.contains(svg)))
            return count2;
        }
      }
      return null;
    }
    function updateChildrenFromCheckout() {
      const checkoutCount = getChildrenCountFromCheckout();
      if (checkoutCount !== null && checkoutCount >= 0 && checkoutCount <= 12 && count !== checkoutCount) {
        count = checkoutCount;
        countDisplay.textContent = String(count);
        updateMinusButton();
        renderAgeSelectors();
        return true;
      }
      return false;
    }
    const wrapper = document.createElement("div");
    wrapper.id = "children-field-wrapper";
    wrapper.style.cssText = "width:100%;font-family:inherit;";
    const styleTag = document.createElement("style");
    styleTag.textContent = FIELD_STYLE_SHEET;
    document.head.appendChild(styleTag);
    const layout = document.createElement("div");
    layout.className = "children-layout";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "stepper-btn";
    minus.textContent = "−";
    minus.setAttribute("aria-label", isEnglish ? "Decrease" : "Diminuir");
    const countDisplay = document.createElement("span");
    countDisplay.className = "stepper-count";
    countDisplay.textContent = "0";
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "stepper-btn";
    plus.textContent = "+";
    plus.setAttribute("aria-label", isEnglish ? "Increase" : "Aumentar");
    const stepper = document.createElement("div");
    stepper.className = "stepper";
    stepper.append(minus, countDisplay, plus);
    const agesContainer = document.createElement("div");
    agesContainer.className = "ages-container";
    const errorText = document.createElement("div");
    errorText.className = "error-text";
    layout.append(stepper, agesContainer);
    wrapper.append(layout, errorText);
    input.parentElement.insertBefore(wrapper, input);
    let count = 0;
    let ages = [];
    let hasFoundCheckoutValue = false;
    function tryUpdateFromCheckout() {
      if (hasFoundCheckoutValue)
        return;
      if (updateChildrenFromCheckout())
        hasFoundCheckoutValue = true;
    }
    tryUpdateFromCheckout();
    function clickDetailsButton() {
      if (hasFoundCheckoutValue)
        return false;
      const detailsButton = document.querySelector(SELECTORS.detailsButton);
      if (detailsButton) {
        const rect = detailsButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0 && window.getComputedStyle(detailsButton).display !== "none";
        if (isVisible) {
          detailsButton.click();
          return true;
        }
      }
      return false;
    }
    function isPopupOpen() {
      for (const selector of POPUP_SELECTORS) {
        for (const el of document.querySelectorAll(selector)) {
          const style = window.getComputedStyle(el);
          if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0")
            return true;
        }
      }
      return false;
    }
    let popupWasOpen = false;
    let hasTriedClicking = false;
    let clickTimeout = null;
    function checkPopupContent() {
      if (hasFoundCheckoutValue)
        return;
      setTimeout(() => tryUpdateFromCheckout(), 500);
    }
    const observer = new MutationObserver(() => {
      if (hasFoundCheckoutValue) {
        observer.disconnect();
        return;
      }
      const popupIsOpen = isPopupOpen();
      if (popupWasOpen && !popupIsOpen && !hasTriedClicking) {
        hasTriedClicking = true;
        if (clickTimeout)
          clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          if (clickDetailsButton())
            setTimeout(() => checkPopupContent(), 600);
        }, 300);
      }
      if (popupIsOpen && !hasFoundCheckoutValue)
        checkPopupContent();
      popupWasOpen = popupIsOpen;
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class", "aria-hidden", "aria-modal"] });
    const MAX_SYNC_ATTEMPTS = 50;
    let attempts = 0;
    const checkForCheckoutValue = setInterval(() => {
      attempts++;
      const popupIsOpen = isPopupOpen();
      if (!popupIsOpen)
        tryUpdateFromCheckout();
      if (popupIsOpen && !hasFoundCheckoutValue)
        checkPopupContent();
      if (hasFoundCheckoutValue || attempts >= MAX_SYNC_ATTEMPTS) {
        clearInterval(checkForCheckoutValue);
        observer.disconnect();
        if (clickTimeout)
          clearTimeout(clickTimeout);
        if (count === 0)
          triggerReactInput(input, `None`);
      }
    }, 100);
    function renderAgeSelectors() {
      agesContainer.innerHTML = "";
      agesContainer.classList.remove("cols-2", "cols-3", "cols-4");
      if (count === 2)
        agesContainer.classList.add("cols-2");
      else if (count === 3)
        agesContainer.classList.add("cols-3");
      else if (count >= 4)
        agesContainer.classList.add("cols-4");
      if (ages.length < count)
        ages = [...ages, ...Array.from({ length: count - ages.length }, () => "")];
      else if (ages.length > count)
        ages = ages.slice(0, count);
      for (let i = 0; i < count; i++) {
        const placeholder = isEnglish ? `Child ${i + 1}` : `Criança ${i + 1}`;
        const dropdownOptions = [];
        for (let n = 0; n <= MAX_CHILD_AGE; n++) {
          const optionText = isEnglish ? `${n} ${n === 1 ? "year" : "years"}` : `${n} ${n === 1 ? "ano" : "anos"}`;
          dropdownOptions.push({ value: String(n), text: optionText });
        }
        const dropdown = CustomDropdown({
          placeholder,
          options: dropdownOptions,
          value: ages[i] || "",
          id: `child-age-${i}-${Date.now()}`,
          styles: COMPACT_DROPDOWN_STYLES,
          onChange: (newValue) => {
            ages[i] = newValue;
            updateHiddenInput();
          }
        });
        dropdown.dataset.childIndex = String(i);
        agesContainer.appendChild(dropdown);
      }
      updateHiddenInput();
    }
    function updateHiddenInput() {
      const filled = ages.filter((age) => age !== "");
      const formatted = count === 0 ? `None` : isEnglish ? `${count} | ${filled.map((a) => `${a} ${a === "1" ? "year" : "years"} old`).join(", ")}` : `${count} | ${filled.map((a) => `${a} ${a === "1" ? "ano" : "anos"}`).join(", ")}`;
      triggerReactInput(input, formatted);
      validateAlert();
    }
    function validateAlert() {
      const missing = ages.some((age) => age === "");
      const dropdowns = agesContainer.querySelectorAll('[id^="child-age-"]');
      if (count > 0 && missing) {
        wrapper.classList.add("has-error");
        errorText.textContent = isEnglish ? "Select age for all children" : "Selecione a idade de todas as crianças";
        errorText.classList.add("show");
        dropdowns.forEach((dropdown, index) => {
          if (ages[index] === "")
            dropdown.setError(true);
        });
      } else {
        wrapper.classList.remove("has-error");
        errorText.classList.remove("show");
        dropdowns.forEach((dropdown) => dropdown.setError(false));
      }
    }
    function updateMinusButton() {
      minus.disabled = count === 0;
      if (count === 0)
        minus.setAttribute("disabled", "disabled");
      else
        minus.removeAttribute("disabled");
    }
    plus.addEventListener("click", (e) => {
      e.preventDefault();
      count++;
      countDisplay.textContent = String(count);
      updateMinusButton();
      renderAgeSelectors();
    });
    minus.addEventListener("click", (e) => {
      e.preventDefault();
      if (count > 0) {
        count--;
        countDisplay.textContent = String(count);
        updateMinusButton();
        renderAgeSelectors();
      }
    });
    wrapper.addEventListener("engine:set-children", (event) => {
      const detail = event.detail;
      hasFoundCheckoutValue = true;
      count = detail.count;
      ages = [...detail.ages];
      countDisplay.textContent = String(count);
      updateMinusButton();
      renderAgeSelectors();
    });
    updateMinusButton();
    if (count > 0)
      renderAgeSelectors();
    else
      triggerReactInput(input, `None`);
  }
  const FIELDS_GRID_ID = "custom-fields-grid";
  const FIELDS_GRID_STYLE_ID = "custom-fields-grid-style";
  const RESERVATION_HOLDER_HEADING_ID = "reservation-holder-heading";
  function ensureGridStyle() {
    if (document.getElementById(FIELDS_GRID_STYLE_ID))
      return;
    const style = document.createElement("style");
    style.id = FIELDS_GRID_STYLE_ID;
    style.textContent = `#${FIELDS_GRID_ID}{display:grid;grid-template-columns:1fr;gap:16px;width:100%}@media(min-width:640px){#${FIELDS_GRID_ID}{grid-template-columns:1fr 1fr}}`;
    document.head.appendChild(style);
  }
  function findFieldCells() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const cells = [
      (_b = (_a = document.querySelector(SELECTORS.firstName)) == null ? void 0 : _a.closest(".chakra-stack")) == null ? void 0 : _b.parentElement,
      (_d = (_c = document.querySelector(SELECTORS.lastName)) == null ? void 0 : _c.closest(".chakra-stack")) == null ? void 0 : _d.parentElement,
      (_f = (_e = document.querySelector(SELECTORS.cpfInput)) == null ? void 0 : _e.closest(".chakra-stack")) == null ? void 0 : _f.parentElement,
      (_h = (_g = document.querySelector(SELECTORS.birthDateInput)) == null ? void 0 : _g.closest(".chakra-stack")) == null ? void 0 : _h.parentElement
    ].filter((el) => !!el);
    return cells.length === 4 ? cells : null;
  }
  function ensureReservationHolderHeading(grid) {
    const gridRow = grid.parentElement;
    if (!gridRow)
      return;
    const stack = gridRow.parentElement;
    if (!stack)
      return;
    const existing = document.getElementById(RESERVATION_HOLDER_HEADING_ID);
    if (existing && existing.parentElement === stack && existing.nextElementSibling === gridRow)
      return;
    const heading = existing ?? document.createElement("h4");
    if (!existing) {
      heading.id = RESERVATION_HOLDER_HEADING_ID;
      heading.textContent = detectPageLanguage() ? "Reservation holder" : "Responsável da reserva";
      const nativeHeading = document.querySelector("h4.chakra-heading");
      if (nativeHeading)
        heading.className = nativeHeading.className;
      else
        heading.style.cssText = "font-size:1rem;font-weight:600;margin:0;";
    }
    stack.insertBefore(heading, gridRow);
  }
  function initializeFieldsLayout() {
    const cells = findFieldCells();
    if (!cells)
      return;
    const existingGrid = document.getElementById(FIELDS_GRID_ID);
    const gridHealthy = !!existingGrid && cells.every((c) => c.parentElement === existingGrid);
    let grid = existingGrid;
    if (!gridHealthy) {
      ensureGridStyle();
      const newGrid = existingGrid ?? document.createElement("div");
      newGrid.id = FIELDS_GRID_ID;
      const anchor = cells[0];
      const parent = anchor.parentElement;
      if (!parent)
        return;
      parent.insertBefore(newGrid, anchor);
      cells.forEach((cell) => newGrid.appendChild(cell));
      grid = newGrid;
    }
    if (grid)
      ensureReservationHolderHeading(grid);
  }
  function adjustCPFLabel() {
    var _a, _b;
    const cpfLabel = (_b = (_a = document.querySelector(SELECTORS.cpfInput)) == null ? void 0 : _a.closest(".chakra-stack")) == null ? void 0 : _b.querySelector("label");
    if (!cpfLabel || cpfLabel.dataset.labelAdjusted)
      return;
    const isEnglish = detectPageLanguage();
    cpfLabel.innerText = "CPF/Passport*";
    cpfLabel.setAttribute("title", isEnglish ? "CPF number(or Passport for foreigners)*" : "Número do CPF(ou Passaporte p/Estrangeiros)*");
    cpfLabel.dataset.labelAdjusted = "true";
  }
  const metadata = { "version": 4, "country_calling_codes": { "1": ["US", "AG", "AI", "AS", "BB", "BM", "BS", "CA", "DM", "DO", "GD", "GU", "JM", "KN", "KY", "LC", "MP", "MS", "PR", "SX", "TC", "TT", "VC", "VG", "VI"], "7": ["RU", "KZ"], "20": ["EG"], "27": ["ZA"], "30": ["GR"], "31": ["NL"], "32": ["BE"], "33": ["FR"], "34": ["ES"], "36": ["HU"], "39": ["IT", "VA"], "40": ["RO"], "41": ["CH"], "43": ["AT"], "44": ["GB", "GG", "IM", "JE"], "45": ["DK"], "46": ["SE"], "47": ["NO", "SJ"], "48": ["PL"], "49": ["DE"], "51": ["PE"], "52": ["MX"], "53": ["CU"], "54": ["AR"], "55": ["BR"], "56": ["CL"], "57": ["CO"], "58": ["VE"], "60": ["MY"], "61": ["AU", "CC", "CX"], "62": ["ID"], "63": ["PH"], "64": ["NZ"], "65": ["SG"], "66": ["TH"], "81": ["JP"], "82": ["KR"], "84": ["VN"], "86": ["CN"], "90": ["TR"], "91": ["IN"], "92": ["PK"], "93": ["AF"], "94": ["LK"], "95": ["MM"], "98": ["IR"], "211": ["SS"], "212": ["MA", "EH"], "213": ["DZ"], "216": ["TN"], "218": ["LY"], "220": ["GM"], "221": ["SN"], "222": ["MR"], "223": ["ML"], "224": ["GN"], "225": ["CI"], "226": ["BF"], "227": ["NE"], "228": ["TG"], "229": ["BJ"], "230": ["MU"], "231": ["LR"], "232": ["SL"], "233": ["GH"], "234": ["NG"], "235": ["TD"], "236": ["CF"], "237": ["CM"], "238": ["CV"], "239": ["ST"], "240": ["GQ"], "241": ["GA"], "242": ["CG"], "243": ["CD"], "244": ["AO"], "245": ["GW"], "246": ["IO"], "247": ["AC"], "248": ["SC"], "249": ["SD"], "250": ["RW"], "251": ["ET"], "252": ["SO"], "253": ["DJ"], "254": ["KE"], "255": ["TZ"], "256": ["UG"], "257": ["BI"], "258": ["MZ"], "260": ["ZM"], "261": ["MG"], "262": ["RE", "YT"], "263": ["ZW"], "264": ["NA"], "265": ["MW"], "266": ["LS"], "267": ["BW"], "268": ["SZ"], "269": ["KM"], "290": ["SH", "TA"], "291": ["ER"], "297": ["AW"], "298": ["FO"], "299": ["GL"], "350": ["GI"], "351": ["PT"], "352": ["LU"], "353": ["IE"], "354": ["IS"], "355": ["AL"], "356": ["MT"], "357": ["CY"], "358": ["FI", "AX"], "359": ["BG"], "370": ["LT"], "371": ["LV"], "372": ["EE"], "373": ["MD"], "374": ["AM"], "375": ["BY"], "376": ["AD"], "377": ["MC"], "378": ["SM"], "380": ["UA"], "381": ["RS"], "382": ["ME"], "383": ["XK"], "385": ["HR"], "386": ["SI"], "387": ["BA"], "389": ["MK"], "420": ["CZ"], "421": ["SK"], "423": ["LI"], "500": ["FK"], "501": ["BZ"], "502": ["GT"], "503": ["SV"], "504": ["HN"], "505": ["NI"], "506": ["CR"], "507": ["PA"], "508": ["PM"], "509": ["HT"], "590": ["GP", "BL", "MF"], "591": ["BO"], "592": ["GY"], "593": ["EC"], "594": ["GF"], "595": ["PY"], "596": ["MQ"], "597": ["SR"], "598": ["UY"], "599": ["CW", "BQ"], "670": ["TL"], "672": ["NF"], "673": ["BN"], "674": ["NR"], "675": ["PG"], "676": ["TO"], "677": ["SB"], "678": ["VU"], "679": ["FJ"], "680": ["PW"], "681": ["WF"], "682": ["CK"], "683": ["NU"], "685": ["WS"], "686": ["KI"], "687": ["NC"], "688": ["TV"], "689": ["PF"], "690": ["TK"], "691": ["FM"], "692": ["MH"], "850": ["KP"], "852": ["HK"], "853": ["MO"], "855": ["KH"], "856": ["LA"], "880": ["BD"], "886": ["TW"], "960": ["MV"], "961": ["LB"], "962": ["JO"], "963": ["SY"], "964": ["IQ"], "965": ["KW"], "966": ["SA"], "967": ["YE"], "968": ["OM"], "970": ["PS"], "971": ["AE"], "972": ["IL"], "973": ["BH"], "974": ["QA"], "975": ["BT"], "976": ["MN"], "977": ["NP"], "992": ["TJ"], "993": ["TM"], "994": ["AZ"], "995": ["GE"], "996": ["KG"], "998": ["UZ"] }, "countries": { "AC": ["247", "00", "(?:[01589]\\d|[2-467])\\d{4}", [5, 6], 0, 0, 0, 0, 0, 0, 0, [["6\\d{4}", [5]], ["[2-47]\\d{4}", [5]], 0, 0, 0, 0, ["(?:0[1-9]|[1589]\\d)\\d{4}", [6]]]], "AD": ["376", "00", "(?:1|6\\d)\\d{7}|[135-9]\\d{5}", [6, 8, 9], [["(\\d{3})(\\d{3})", "$1 $2", ["[135-9]"]], ["(\\d{4})(\\d{4})", "$1 $2", ["1"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["6"]]], 0, 0, 0, 0, 0, 0, [["[78]\\d{5}", [6]], ["690\\d{6}|[356]\\d{5}", [6, 9]], ["180[02]\\d{4}", [8]], ["[19]\\d{5}", [6]]]], "AE": ["971", "00", "(?:[4-7]\\d|9[0-689])\\d{7}|800\\d{2,9}|[2-4679]\\d{7}", [5, 6, 7, 8, 9, 10, 11, 12], [["(\\d{3})(\\d{2,9})", "$1 $2", ["60|8"]], ["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["[236]|[479][2-8]"], "0$1"], ["(\\d{3})(\\d)(\\d{5})", "$1 $2 $3", ["[479]"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["5"], "0$1"]], "0", 0, 0, 0, 0, 0, [["[2-4679][2-8]\\d{6}", [8]], ["5[02-68]\\d{7}", [9]], ["400\\d{6}|800\\d{2,9}"], ["900[02]\\d{5}", [9]], 0, 0, ["600[25]\\d{5}", [9]], 0, 0, ["700[05]\\d{5}", [9]]]], "AF": ["93", "00", "[2-7]\\d{8}", [9], [["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[2-7]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:[25][0-8]|[34][0-4]|6[0-5])[2-9]\\d{6}"], ["7\\d{8}"]]], "AG": ["1", "011", "(?:268|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([457]\\d{6})$|1", "268$1", 0, "268", [["268(?:4(?:6[0-38]|84)|56[0-2])\\d{4}"], ["268(?:464|7(?:1[3-9]|[28]\\d|3[0246]|64|7[0-689]))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, 0, ["26840[69]\\d{4}"], ["26848[01]\\d{4}"]]], "AI": ["1", "011", "(?:264|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2457]\\d{6})$|1", "264$1", 0, "264", [["264(?:292|4(?:6[12]|9[78]))\\d{4}"], ["264(?:235|4(?:69|7[67])|5(?:3[6-9]|8[1-4])|7(?:29|72))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, 0, ["264724\\d{4}"]]], "AL": ["355", "00", "(?:700\\d\\d|900)\\d{3}|8\\d{5,7}|(?:[2-5]|6\\d)\\d{7}", [6, 7, 8, 9], [["(\\d{3})(\\d{3,4})", "$1 $2", ["80|9"], "0$1"], ["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["4[2-6]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2358][2-5]|4"], "0$1"], ["(\\d{3})(\\d{5})", "$1 $2", ["[23578]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["6"], "0$1"]], "0", 0, 0, 0, 0, 0, [["4505[0-2]\\d{3}|(?:[2358][16-9]\\d[2-9]|4410)\\d{4}|(?:[2358][2-5][2-9]|4(?:[2-57-9][2-9]|6\\d))\\d{5}", [8]], ["6(?:[78][2-9]|9\\d)\\d{6}", [9]], ["800\\d{4}", [7]], ["900[1-9]\\d\\d", [6]], ["700[2-9]\\d{4}", [8]], 0, 0, 0, 0, ["808[1-9]\\d\\d", [6]]]], "AM": ["374", "00", "(?:[1-489]\\d|55|60|77)\\d{6}", [8], [["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["[89]0"], "0 $1"], ["(\\d{3})(\\d{5})", "$1 $2", ["2|3[12]"], "(0$1)"], ["(\\d{2})(\\d{6})", "$1 $2", ["1|47"], "(0$1)"], ["(\\d{2})(\\d{6})", "$1 $2", ["[3-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:1[0-25]|47)\\d|2(?:2[2-46]|3[1-8]|4[2-69]|5[2-7]|6[1-9]|8[1-7])|3[12]2)\\d{5}"], ["(?:33|4[1349]|55|77|88|9[13-9])\\d{6}"], ["800\\d{5}"], ["90[016]\\d{5}"], 0, 0, 0, 0, ["60(?:2[78]|3[5-9]|4[02-9]|5[0-46-9]|[6-8]\\d|9[0-2])\\d{4}"], ["80[1-4]\\d{5}"]]], "AO": ["244", "00", "[29]\\d{8}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[29]"]]], 0, 0, 0, 0, 0, 0, [["2\\d(?:[0134][25-9]|[25-9]\\d)\\d{5}"], ["9[1-79]\\d{7}"]]], "AR": ["54", "00", "(?:11|[89]\\d\\d)\\d{8}|[2368]\\d{9}", [10, 11], [["(\\d{4})(\\d{2})(\\d{4})", "$1 $2-$3", ["2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9])", "2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8]))|2(?:2[24-9]|3[1-59]|47)", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5[56][46]|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|58|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|54(?:4|5[13-7]|6[89])|86[3-6]))|2(?:2[24-9]|3[1-59]|47)|38(?:[58][78]|7[378])|3(?:454|85[56])[46]|3(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"], "0$1", 1], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", ["1"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", ["[68]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2-$3", ["[23]"], "0$1", 1], ["(\\d)(\\d{4})(\\d{2})(\\d{4})", "$2 15-$3-$4", ["9(?:2[2-469]|3[3-578])", "9(?:2(?:2[024-9]|3[0-59]|47|6[245]|9[02-8])|3(?:3[28]|4[03-9]|5[2-46-8]|7[1-578]|8[2-9]))", "9(?:2(?:[23]02|6(?:[25]|4[6-8])|9(?:[02356]|4[02568]|72|8[23]))|3(?:3[28]|4(?:[04679]|3[5-8]|5[4-68]|8[2379])|5(?:[2467]|3[237]|8[2-5])|7[1-578]|8(?:[2469]|3[2578]|5[4-8]|7[36-8]|8[5-8])))|92(?:2[24-9]|3[1-59]|47)", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3[78]|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8[23])|7[1-578]|8(?:[2469]|3[278]|5(?:[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4[35][56]|58[45]|8(?:[38]5|54|76))[4-6]", "9(?:2(?:[23]02|6(?:[25]|4(?:64|[78]))|9(?:[02356]|4(?:[0268]|5[2-6])|72|8[23]))|3(?:3[28]|4(?:[04679]|3(?:5(?:4[0-25689]|[56])|[78])|5(?:4[46]|8)|8[2379])|5(?:[2467]|3[237]|8(?:[23]|4(?:[45]|60)|5(?:4[0-39]|5|64)))|7[1-578]|8(?:[2469]|3[278]|5(?:4(?:4|5[13-7]|6[89])|[56][46]|[78])|7[378]|8(?:6[3-6]|[78]))))|92(?:2[24-9]|3[1-59]|47)|93(?:4(?:36|5[56])|8(?:[38]5|76))[4-6]"], "0$1", 0, "$1 $2 $3-$4"], ["(\\d)(\\d{2})(\\d{4})(\\d{4})", "$2 15-$3-$4", ["91"], "0$1", 0, "$1 $2 $3-$4"], ["(\\d{3})(\\d{3})(\\d{5})", "$1-$2-$3", ["8"], "0$1"], ["(\\d)(\\d{3})(\\d{3})(\\d{4})", "$2 15-$3-$4", ["9"], "0$1", 0, "$1 $2 $3-$4"]], "0", 0, "0?(?:(11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1267])|3(?:02?|1[467]|2[03-6]|3[13-8]|[49][2-6]|5[2-8]|[67])|4(?:7[3-578]|9)|6(?:[0136]|2[24-6]|4[6-8]?|5[15-8])|80|9(?:0[1-3]|[19]|2\\d|3[1-6]|4[02568]?|5[2-4]|6[2-46]|72?|8[23]?))|3(?:3(?:2[79]|6|8[2578])|4(?:0[0-24-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6[02-9]|7[126]|8[2379]?|9[1-36-8])|5(?:1|2[1245]|3[237]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|6[24]|7(?:[069]|1[1568]|2[15]|3[145]|4[13]|5[14-8]|7[2-57]|8[126])|8(?:[01]|2[15-7]|3[2578]?|4[13-6]|5[4-8]?|6[1-357-9]|7[36-8]?|8[5-8]?|9[124])))15)?", "9$1", 0, 0, [["3(?:7(?:1[15]|81)|8(?:21|4[16]|69|9[12]))[46]\\d{5}|(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|47[35]|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|(?:2(?:657|9(?:54|66))|3(?:48[27]|7(?:55|77)|8(?:65|78)))[2-8]\\d{5}|(?:2(?:284|3(?:02|23)|477|622|920)|3(?:4(?:46|89|92)|541))[2-7]\\d{5}|(?:(?:11[0-8]|670)\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-8]|[25][4-6]|3[3-6]|84)|5(?:1[2-9]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:0[45]|1[2-7]|3[4-6]|5[3-6]|7[2-6]|8[3-68])))\\d{6}|(?:2(?:2(?:62|81)|320|9(?:42|83))|3(?:329|4(?:62|7[16])|5(?:43|64)|7(?:18|5[17])))[2-6]\\d{5}|2(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|(?:2(?:257|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|64)|5(?:25|37|4[47]|71)|7(?:35|72)|825))[3-6]\\d{5}|(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[035-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[14]|4[13]|5[468]|7[3-5]|8[26])|8(?:2[67]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}", [10]], ["93(?:7(?:1[15]|81)|8(?:21|4[16]|69|9[12]))[46]\\d{5}|9(?:2(?:2(?:2[59]|44|52)|3(?:26|44)|47[35]|9(?:[07]2|2[26]|34|46))|3327)[45]\\d{5}|9(?:2(?:657|9(?:54|66))|3(?:48[27]|7(?:55|77)|8(?:65|78)))[2-8]\\d{5}|9(?:2(?:284|3(?:02|23)|477|622|920)|3(?:4(?:46|89|92)|541))[2-7]\\d{5}|(?:675\\d|9(?:11[0-8]\\d|2(?:2(?:0[45]|1[2-6]|3[3-6])|3(?:[06]4|7[45])|494|6(?:04|1[2-8]|[36][45]|4[3-6])|80[45]|9(?:[17][4-6]|[48][45]|9[3-6]))|3(?:364|4(?:1[2-8]|[25][4-6]|3[3-6]|84)|5(?:1[2-9]|[38][4-6])|6(?:2[45]|44)|7[069][45]|8(?:0[45]|1[2-7]|3[4-6]|5[3-6]|7[2-6]|8[3-68]))))\\d{6}|9(?:2(?:2(?:62|81)|320|9(?:42|83))|3(?:329|4(?:62|7[16])|5(?:43|64)|7(?:18|5[17])))[2-6]\\d{5}|92(?:2(?:21|4[23]|6[145]|7[1-4]|8[356]|9[267])|3(?:16|3[13-8]|43|5[346-8]|9[3-5])|6(?:2[46]|4[78]|5[1568])|9(?:03|2[1457-9]|3[1356]|4[08]|[56][23]|82))4\\d{5}|9(?:2(?:257|3(?:24|46|92)|9(?:01|23|64))|3(?:4(?:42|64)|5(?:25|37|4[47]|71)|7(?:35|72)|825))[3-6]\\d{5}|9(?:2(?:2(?:02|2[3467]|4[156]|5[45]|6[6-8]|91)|3(?:1[47]|25|[45][25]|96)|47[48]|625|932)|3(?:38[2578]|4(?:0[0-24-9]|3[78]|4[457]|58|6[035-9]|72|83|9[136-8])|5(?:2[124]|[368][23]|4[2689]|7[2-6])|7(?:16|2[15]|3[14]|4[13]|5[468]|7[3-5]|8[26])|8(?:2[67]|3[278]|4[3-5]|5[78]|6[1-378]|[78]7|94)))[4-6]\\d{5}"], ["800\\d{7,8}"], ["60[04579]\\d{7}", [10]], 0, 0, ["810\\d{7}", [10]]]], "AS": ["1", "011", "(?:[58]\\d\\d|684|900)\\d{7}", [10], 0, "1", 0, "([267]\\d{6})$|1", "684$1", 0, "684", [["684(?:274|6(?:22|33|44|55|77|88|9[19]))\\d{4}"], ["684(?:2(?:48|5[2468]|7[246])|7(?:3[13]|70|82))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "AT": ["43", "00", "1\\d{3,12}|2\\d{6,12}|43(?:(?:0\\d|5[02-9])\\d{3,9}|2\\d{4,5}|[3467]\\d{4}|8\\d{4,6}|9\\d{4,7})|5\\d{4,12}|8\\d{7,12}|9\\d{8,12}|(?:[367]\\d|4[0-24-9])\\d{4,11}", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [["(\\d)(\\d{3,12})", "$1 $2", ["1(?:11|[2-9])"], "0$1"], ["(\\d{3})(\\d{2})", "$1 $2", ["517"], "0$1"], ["(\\d{2})(\\d{3,5})", "$1 $2", ["5[079]"], "0$1"], ["(\\d{3})(\\d{3,10})", "$1 $2", ["(?:31|4)6|51|6(?:48|5[0-3579]|[6-9])|7(?:20|32|8)|[89]", "(?:31|4)6|51|6(?:485|5[0-3579]|[6-9])|7(?:20|32|8)|[89]"], "0$1"], ["(\\d{4})(\\d{3,9})", "$1 $2", ["[2-467]|5[2-6]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["5"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4,7})", "$1 $2 $3", ["5"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1(?:11\\d|[2-9]\\d{3,11})|(?:316|463)\\d{3,10}|648[34]\\d{3,9}|(?:51|66|73)2\\d{3,10}|(?:2(?:1[467]|2[13-8]|5[2357]|6[1-46-8]|7[1-8]|8[124-7]|9[1458])|3(?:1[1-578]|3[23568]|4[5-7]|5[1378]|6[1-38]|8[3-68])|4(?:2[1-8]|35|7[1368]|8[2457])|5(?:2[1-8]|3[357]|4[147]|5[12578]|6[37])|6(?:13|2[1-47]|4[135-7]|5[468])|7(?:2[1-8]|35|4[13478]|5[68]|6[16-8]|7[1-6]|9[45]))\\d{4,10}"], ["6(?:485|(?:5[0-3579]|6[013-9]|[7-9]\\d)\\d)\\d{3,9}", [7, 8, 9, 10, 11, 12, 13]], ["800\\d{6,10}", [9, 10, 11, 12, 13]], ["(?:8[69][2-68]|9(?:0[01]|3[019]))\\d{6,10}", [9, 10, 11, 12, 13]], 0, 0, 0, 0, ["5(?:0[1-9]|17|[79]\\d)\\d{2,10}|7[28]0\\d{6,10}", [5, 6, 7, 8, 9, 10, 11, 12, 13]], ["8(?:10|2[018])\\d{6,10}|828\\d{5}", [8, 9, 10, 11, 12, 13]]]], "AU": ["61", "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "1(?:[0-79]\\d{7}(?:\\d(?:\\d{2})?)?|8[0-24-9]\\d{7})|[2-478]\\d{8}|1\\d{4,7}", [5, 6, 7, 8, 9, 10, 12], [["(\\d{2})(\\d{3,4})", "$1 $2", ["16"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2,4})", "$1 $2 $3", ["16"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["14|4"], "0$1"], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["[2378]"], "(0$1)"], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1(?:30|[89])"]]], "0", 0, "(183[12])|0", 0, 0, 0, [["(?:(?:241|349)0\\d\\d|8(?:51(?:0(?:0[03-9]|[12479]\\d|3[2-9]|5[0-8]|6[1-9]|8[0-7])|1(?:[0235689]\\d|1[0-69]|4[0-589]|7[0-47-9])|2(?:0[0-79]|[18][13579]|2[14-9]|3[0-46-9]|[4-6]\\d|7[89]|9[0-4])|[34]\\d\\d)|91(?:(?:[0-58]\\d|6[0135-9])\\d|7(?:0[0-24-9]|[1-9]\\d)|9(?:[0-46-9]\\d|5[0-79]))))\\d{3}|(?:2(?:[0-26-9]\\d|3[0-8]|4[02-9]|5[0135-9])|3(?:[0-3589]\\d|4[0-578]|6[1-9]|7[0-35-9])|7(?:[013-57-9]\\d|2[0-8])|8(?:55|6[0-8]|[78]\\d|9[02-9]))\\d{6}", [9]], ["4(?:79[01]|83[0-36-9]|95[0-3])\\d{5}|4(?:[0-36]\\d|4[047-9]|[58][0-24-9]|7[02-8]|9[0-47-9])\\d{6}", [9]], ["180(?:0\\d{3}|2)\\d{3}", [7, 10]], ["190[0-26]\\d{6}", [10]], 0, 0, 0, ["163\\d{2,6}", [5, 6, 7, 8, 9]], ["14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", [9]], ["13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", [6, 8, 10, 12]]], "0011"], "AW": ["297", "00", "(?:[25-79]\\d\\d|800)\\d{4}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[25-9]"]]], 0, 0, 0, 0, 0, 0, [["5(?:2\\d|8[1-9])\\d{4}"], ["(?:290|5[69]\\d|6(?:[03]0|22|4[0-2]|[69]\\d)|7(?:[34]\\d|7[07])|9(?:6[45]|9[4-8]))\\d{4}"], ["800\\d{4}"], ["900\\d{4}"], 0, 0, 0, 0, ["(?:28\\d|501)\\d{4}"]]], "AX": ["358", "00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))", "2\\d{4,9}|35\\d{4,5}|(?:60\\d\\d|800)\\d{4,6}|7\\d{5,11}|(?:[14]\\d|3[0-46-9]|50)\\d{4,8}", [5, 6, 7, 8, 9, 10, 11, 12], 0, "0", 0, 0, 0, 0, "18", [["18[1-8]\\d{3,6}", [6, 7, 8, 9]], ["4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}", [6, 7, 8, 9, 10]], ["800\\d{4,6}", [7, 8, 9]], ["[67]00\\d{5,6}", [8, 9]], 0, 0, ["20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}"]], "00"], "AZ": ["994", "00", "365\\d{6}|(?:[124579]\\d|60|88)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["90"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["1[28]|2|365|46", "1[28]|2|365[45]|46", "1[28]|2|365(?:4|5[02])|46"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[13-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2[12]428|3655[02])\\d{4}|(?:2(?:22[0-79]|63[0-28])|3654)\\d{5}|(?:(?:1[28]|46)\\d|2(?:[014-6]2|[23]3))\\d{6}"], ["36554\\d{4}|(?:[16]0|4[04]|5[015]|7[07]|99)\\d{7}"], ["88\\d{7}"], ["900200\\d{3}"]]], "BA": ["387", "00", "6\\d{8}|(?:[35689]\\d|49|70)\\d{6}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["6[1-3]|[7-9]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2-$3", ["[3-5]|6[56]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", ["6"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:3(?:[05-79][2-9]|1[4579]|[23][24-9]|4[2-4689]|8[2457-9])|49[2-579]|5(?:0[2-49]|[13][2-9]|[268][2-4679]|4[4689]|5[2-79]|7[2-69]|9[2-4689]))\\d{5}", [8]], ["6040\\d{5}|6(?:03|[1-356]|44|7\\d)\\d{6}"], ["8[08]\\d{6}", [8]], ["9[0246]\\d{6}", [8]], 0, 0, ["703[235]0\\d{3}|70(?:2[0-5]|3[0146]|[56]0)\\d{4}", [8]], 0, 0, ["8[12]\\d{6}", [8]]]], "BB": ["1", "011", "(?:246|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "246$1", 0, "246", [["246521[0369]\\d{3}|246(?:2(?:2[78]|7[0-4])|4(?:1[024-6]|2\\d|3[2-9])|5(?:20|[34]\\d|54|7[1-3])|6(?:2\\d|38)|7[35]7|9(?:1[89]|63))\\d{4}"], ["246(?:(?:2(?:[3568]\\d|4[0-57-9])|3(?:5[2-9]|6[0-6])|4(?:46|5\\d)|69[5-7]|8(?:[2-5]\\d|83))\\d|52(?:1[147]|20))\\d{3}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["(?:246976|900[2-9]\\d\\d)\\d{4}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, ["246(?:292|367|4(?:1[7-9]|3[01]|4[47-9]|67)|7(?:1[2-9]|2\\d|3[016]|53))\\d{4}"], 0, ["24631\\d{5}"]]], "BD": ["880", "00", "[1-469]\\d{9}|8[0-79]\\d{7,8}|[2-79]\\d{8}|[2-9]\\d{7}|[3-9]\\d{6}|[57-9]\\d{5}", [6, 7, 8, 9, 10], [["(\\d{2})(\\d{4,6})", "$1-$2", ["31[5-8]|[459]1"], "0$1"], ["(\\d{3})(\\d{3,7})", "$1-$2", ["3(?:[67]|8[013-9])|4(?:6[168]|7|[89][18])|5(?:6[128]|9)|6(?:[15]|28)|7[2-589]|8(?:0[014-9]|[12])|9[358]|(?:3[2-5]|4[235]|5[2-578]|6[0389]|76|8[3-7]|9[24])1|(?:44|66)[01346-9]"], "0$1"], ["(\\d{4})(\\d{3,6})", "$1-$2", ["[13-9]|2[23]"], "0$1"], ["(\\d)(\\d{7,8})", "$1-$2", ["2"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:4(?:31\\d\\d|423)|5222)\\d{3}(?:\\d{2})?|8332[6-9]\\d\\d|(?:3(?:03[56]|224)|4(?:22[25]|653))\\d{3,4}|(?:3(?:42[47]|529|823)|4(?:027|525|65(?:28|8))|562|6257|7(?:1(?:5[3-5]|6[12]|7[156]|89)|22[589]56|32|42675|52(?:[25689](?:56|8)|[347]8)|71(?:6[1267]|75|89)|92374)|82(?:2[59]|32)56|9(?:03[23]56|23(?:256|373)|31|5(?:1|2[4589]56)))\\d{3}|(?:3(?:02[348]|22[35]|324|422)|4(?:22[67]|32[236-9]|6(?:2[46]|5[57])|953)|5526|6(?:024|6655)|81)\\d{4,5}|(?:2(?:7(?:1[0-267]|2[0-289]|3[0-29]|4[01]|5[1-3]|6[013]|7[0178]|91)|8(?:0[125]|1[1-6]|2[0157-9]|3[1-69]|41|6[1-35]|7[1-5]|8[1-8]|9[0-6])|9(?:0[0-2]|1[0-4]|2[568]|3[3-6]|5[5-7]|6[0136-9]|7[0-7]|8[014-9]))|3(?:0(?:2[025-79]|3[2-4])|181|22[12]|32[2356]|824)|4(?:02[09]|22[348]|32[045]|523|6(?:27|54))|666(?:22|53)|7(?:22[57-9]|42[56]|82[35])8|8(?:0[124-9]|2(?:181|2[02-4679]8)|4[12]|[5-7]2)|9(?:[04]2|2(?:2|328)|81))\\d{4}|(?:2(?:[23]\\d|[45])\\d\\d|3(?:1(?:2[5-7]|[5-7])|425|822)|4(?:033|1\\d|[257]1|332|4(?:2[246]|5[25])|6(?:2[35]|56|62)|8(?:23|54)|92[2-5])|5(?:02[03489]|22[457]|32[35-79]|42[46]|6(?:[18]|53)|724|826)|6(?:023|2(?:2[2-5]|5[3-5]|8)|32[3478]|42[34]|52[47]|6(?:[18]|6(?:2[34]|5[24]))|[78]2[2-5]|92[2-6])|7(?:02|21\\d|[3-589]1|6[12]|72[24])|8(?:217|3[12]|[5-7]1)|9[24]1)\\d{5}|(?:(?:3[2-8]|5[2-57-9]|6[03-589])1|4[4689][18])\\d{5}|[59]1\\d{5}"], ["(?:1[13-9]|64)\\d{8}|(?:3[78]|44|66)[02-9]\\d{7}", [10]], ["80[03]\\d{7}", [10]], 0, 0, 0, 0, 0, ["96(?:0[1-69]|1[0-479]|2[278]|3[13-9]|4[0-47-9]|54|6[69]|7[78]|88)\\d{6}", [10]]]], "BE": ["32", "00", "4\\d{8}|[1-9]\\d{7}", [8, 9], [["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["(?:80|9)0"], "0$1"], ["(\\d)(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[239]|4[23]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[15-8]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["4"], "0$1"]], "0", 0, 0, 0, 0, 0, [["80[2-8]\\d{5}|(?:1[0-69]|[23][2-8]|4[23]|5\\d|6[013-57-9]|71|8[1-79]|9[2-4])\\d{6}", [8]], ["4[5-9]\\d{7}", [9]], ["800[1-9]\\d{4}", [8]], ["(?:70(?:2[0-57]|3[04-7]|44|6[04-69]|7[0579])|90\\d\\d)\\d{4}", [8]], 0, 0, ["78(?:0[578]|1[014-8]|2[25]|3[15-8]|48|5[05]|60|7[06-8]|9\\d)\\d{4}", [8]], 0, 0, ["7879\\d{4}", [8]]]], "BF": ["226", "00", "[024-7]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[024-7]"]]], 0, 0, 0, 0, 0, 0, [["2(?:0(?:49|5[23]|6[5-7]|9[016-9])|4(?:4[569]|5[4-6]|6[5-7]|7[0179])|5(?:[34]\\d|50|6[5-8]))\\d{4}"], ["(?:0[1-7]|4[4-6]|5[0-8]|[67]\\d)\\d{6}"]]], "BG": ["359", "00", "00800\\d{7}|[2-7]\\d{6,7}|[89]\\d{6,8}|2\\d{5}", [6, 7, 8, 9, 12], [["(\\d)(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["2"], "0$1"], ["(\\d{3})(\\d{4})", "$1 $2", ["43[1-6]|70[1-9]"], "0$1"], ["(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", ["[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["(?:70|8)0"], "0$1"], ["(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3", ["43[1-7]|7"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[48]|9[08]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["9"], "0$1"]], "0", 0, 0, 0, 0, 0, [["2\\d{5,7}|(?:43[1-6]|70[1-9])\\d{4,5}|(?:[36]\\d|4[124-7]|[57][1-9]|8[1-6]|9[1-7])\\d{5,6}", [6, 7, 8]], ["(?:43[07-9]|99[69]\\d)\\d{5}|(?:8[7-9]|98)\\d{7}", [8, 9]], ["(?:00800\\d\\d|800)\\d{5}", [8, 12]], ["90\\d{6}", [8]], 0, 0, 0, 0, 0, ["700\\d{5}", [8]]]], "BH": ["973", "00", "[136-9]\\d{7}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["[13679]|8[02-4679]"]]], 0, 0, 0, 0, 0, 0, [["(?:1(?:3[1356]|6[0156]|7\\d)\\d|6(?:1[16]\\d|500|6(?:0\\d|3[12]|44|55|7[7-9]|88)|9[69][69])|7(?:[07]\\d\\d|1(?:11|78)))\\d{4}"], ["(?:3(?:[0-79]\\d|8[0-57-9])\\d|6(?:3(?:00|33|6[16])|441|6(?:3[03-9]|[69]\\d|7[0-689])))\\d{4}"], ["8[02369]\\d{6}"], ["(?:87|9[0-8])\\d{6}"], 0, 0, 0, 0, 0, ["84\\d{6}"]]], "BI": ["257", "00", "(?:[267]\\d|31)\\d{6}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2367]"]]], 0, 0, 0, 0, 0, 0, [["(?:22|31)\\d{6}"], ["(?:29|6[1-9]|7[125-9])\\d{6}"]]], "BJ": ["229", "00", "(?:01\\d|8)\\d{7}", [8, 10], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["0"]]], 0, 0, 0, 0, 0, 0, [["012\\d{7}", [10]], ["01(?:2[5-9]|[4-69]\\d)\\d{6}", [10]], 0, 0, 0, 0, ["81\\d{6}", [8]], 0, ["857[58]\\d{4}", [8]]]], "BL": ["590", "00", "7090\\d{5}|(?:[56]9|[89]\\d)\\d{7}", [9], 0, "0", 0, 0, 0, 0, 0, [["(?:59(?:0(?:2[7-9]|3[3-7]|5[12]|87)|87\\d)|80[6-9]\\d\\d)\\d{4}"], ["(?:69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))|7090[0-4])\\d{4}"], ["80[0-5]\\d{6}"], ["8[129]\\d{7}"], 0, 0, 0, 0, ["9(?:(?:39[5-7]|76[018])\\d|475[0-6])\\d{4}"]]], "BM": ["1", "011", "(?:441|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "441$1", 0, "441", [["441(?:[46]\\d\\d|5(?:4\\d|60|89))\\d{4}"], ["441(?:[2378]\\d|5[0-39]|9[02])\\d{5}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "BN": ["673", "00", "[2-578]\\d{6}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[2-578]"]]], 0, 0, 0, 0, 0, 0, [["22[0-7]\\d{4}|(?:2[013-9]|[34]\\d|5[0-25-9])\\d{5}"], ["(?:22[89]|[78]\\d\\d)\\d{4}"], 0, 0, 0, 0, 0, 0, ["5[34]\\d{5}"]]], "BO": ["591", "00(?:1\\d)?", "(?:[2-7]\\d\\d|8001)\\d{5}", [8, 9], [["(\\d)(\\d{7})", "$1 $2", ["[23]|4[46]|50"]], ["(\\d{8})", "$1", ["[5-7]"]], ["(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", ["8"]]], "0", 0, "0(1\\d)?", 0, 0, 0, [["(?:2(?:2\\d\\d|5(?:11|[258]\\d|9[67])|6(?:12|2\\d|9[34])|8(?:2[34]|39|62))|3(?:3\\d\\d|4(?:6\\d|8[24])|8(?:25|42|5[257]|86|9[25])|9(?:[27]\\d|3[2-4]|4[248]|5[24]|6[2-6]))|4(?:4\\d\\d|6(?:11|[24689]\\d|72)))\\d{4}", [8]], ["(?:57|[67]\\d)\\d{6}", [8]], ["8001[07]\\d{4}", [9]], 0, 0, 0, 0, 0, ["50\\d{6}", [8]]]], "BQ": ["599", "00", "(?:[34]1|7\\d)\\d{5}", [7], 0, 0, 0, 0, 0, 0, "[347]", [["(?:318[023]|41(?:6[023]|70)|7(?:1[578]|2[05]|50)\\d)\\d{3}"], ["(?:31(?:8[14-8]|9[14578])|416[14-9]|7(?:0[01]|7[07]|8\\d|9[056])\\d)\\d{3}"]]], "BR": ["55", "00(?:1[245]|2[1-35]|31|4[13]|[56]5|99)", "[1-467]\\d{9,10}|55[0-46-9]\\d{8}|[34]\\d{7}|55\\d{7,8}|(?:5[0-46-9]|[89]\\d)\\d{7,9}", [8, 9, 10, 11], [["(\\d{4})(\\d{4})", "$1-$2", ["300|4(?:0[02]|37|86)", "300|4(?:0(?:0|20)|370|864)"]], ["(\\d{3})(\\d{2,3})(\\d{4})", "$1 $2 $3", ["(?:[358]|90)0"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2-$3", ["(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-57]"], "($1)"], ["(\\d{2})(\\d{5})(\\d{4})", "$1 $2-$3", ["[16][1-9]|[2-57-9]"], "($1)"]], "0", 0, "(?:0|90)(?:(1[245]|2[1-35]|31|4[13]|[56]5|99)(\\d{10,11}))?", "$2", 0, 0, [["(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])[2-5]\\d{7}", [10]], ["(?:[14689][1-9]|2[12478]|3[1-578]|5[13-5]|7[13-579])(?:7|9\\d)\\d{7}", [10, 11]], ["800\\d{6,7}", [9, 10]], ["[59]00\\d{6,7}", [9, 10]], 0, 0, 0, 0, 0, ["(?:30[03]\\d{3}|4(?:0(?:0\\d|20)|370|864))\\d{4}|300\\d{5}", [8, 10]]]], "BS": ["1", "011", "(?:242|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([3-8]\\d{6})$|1", "242$1", 0, "242", [["242(?:3(?:02|[236][1-9]|4[0-24-9]|5[0-68]|7[347]|8[0-4]|9[2-467])|461|502|6(?:0[1-5]|12|2[013]|[45]0|7[67]|8[78]|9[89])|7(?:02|88))\\d{4}"], ["242(?:3(?:5[79]|7[56]|95)|4(?:[23][1-9]|4[1-35-9]|5[1-8]|6[2-8]|7\\d|81)|5(?:2[45]|3[35]|44|5[1-46-9]|65|77)|6[34]6|7(?:27|38)|8(?:0[1-9]|1[02-9]|2\\d|3[0-4]|[89]9))\\d{4}"], ["242300\\d{4}|8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, ["242225\\d{4}"]]], "BT": ["975", "00", "[178]\\d{7}|[2-8]\\d{6}", [7, 8], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["[2-6]|7[246]|8[2-4]"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["1[67]|[78]"]]], 0, 0, 0, 0, 0, 0, [["(?:2[3-6]|[34][5-7]|5[236]|6[2-46]|7[246]|8[2-4])\\d{5}", [7]], ["(?:1[67]|[78]7)\\d{6}", [8]]]], "BW": ["267", "00", "(?:0800|(?:[37]|800)\\d)\\d{6}|(?:[2-6]\\d|90)\\d{5}", [7, 8, 10], [["(\\d{2})(\\d{5})", "$1 $2", ["90"]], ["(\\d{3})(\\d{4})", "$1 $2", ["[24-6]|3[15-9]"]], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[37]"]], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["0"]], ["(\\d{3})(\\d{4})(\\d{3})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:4[0-48]|6[0-24]|9[0578])|3(?:1[0-35-9]|55|[69]\\d|7[013]|81)|4(?:6[03]|7[1267]|9[0-5])|5(?:3[03489]|4[0489]|7[1-47]|88|9[0-49])|6(?:2[1-35]|5[149]|8[013467]))\\d{4}", [7]], ["(?:321|7(?:[1-8]\\d|9[03]))\\d{5}", [8]], ["(?:0800|800\\d)\\d{6}", [10]], ["90\\d{5}", [7]], 0, 0, 0, 0, ["79(?:1(?:[0-2]\\d|3[0-8])|2[0-7]\\d)\\d{3}", [8]]]], "BY": ["375", "810", "(?:[12]\\d|33|44|902)\\d{7}|8(?:0[0-79]\\d{5,7}|[1-7]\\d{9})|8(?:1[0-489]|[5-79]\\d)\\d{7}|8[1-79]\\d{6,7}|8[0-79]\\d{5}|8\\d{5}", [6, 7, 8, 9, 10, 11], [["(\\d{3})(\\d{3})", "$1 $2", ["800"], "8 $1"], ["(\\d{3})(\\d{2})(\\d{2,4})", "$1 $2 $3", ["800"], "8 $1"], ["(\\d{4})(\\d{2})(\\d{3})", "$1 $2-$3", ["1(?:5[169]|6[3-5]|7[179])|2(?:1[35]|2[34]|3[3-5])", "1(?:5[169]|6(?:3[1-3]|4|5[125])|7(?:1[3-9]|7[0-24-6]|9[2-7]))|2(?:1[35]|2[34]|3[3-5])"], "8 0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2-$3-$4", ["1(?:[56]|7[467])|2[1-3]"], "8 0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2-$3-$4", ["[1-4]"], "8 0$1"], ["(\\d{3})(\\d{3,4})(\\d{4})", "$1 $2 $3", ["[89]"], "8 $1"]], "8", 0, "0|80?", 0, 0, 0, [["(?:1(?:5(?:1[1-5]|[24]\\d|6[2-4]|9[1-7])|6(?:[235]\\d|4[1-7])|7\\d\\d)|2(?:1(?:[246]\\d|3[0-35-9]|5[1-9])|2(?:[235]\\d|4[0-8])|3(?:[26]\\d|3[02-79]|4[024-7]|5[03-7])))\\d{5}", [9]], ["(?:2(?:5[5-79]|9[1-9])|(?:33|44)\\d)\\d{6}", [9]], ["800\\d{3,7}|8(?:0[13]|20\\d)\\d{7}"], ["(?:810|902)\\d{7}", [10]], 0, 0, 0, 0, ["249\\d{6}", [9]]], "8~10"], "BZ": ["501", "00", "(?:0800\\d|[2-8])\\d{6}", [7, 11], [["(\\d{3})(\\d{4})", "$1-$2", ["[2-8]"]], ["(\\d)(\\d{3})(\\d{4})(\\d{3})", "$1-$2-$3-$4", ["0"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:[02]\\d|36|[68]0)|[3-58](?:[02]\\d|[68]0)|7(?:[02]\\d|32|[68]0))\\d{4}", [7]], ["6[0-35-7]\\d{5}", [7]], ["0800\\d{7}", [11]]]], "CA": ["1", "011", "[2-9]\\d{9}|3\\d{6}", [7, 10], 0, "1", 0, 0, 0, 0, 0, [["(?:2(?:04|[23]6|[48]9|5[07]|[67]3)|3(?:06|43|54|6[578]|82)|4(?:03|1[68]|[26]8|3[178]|50|74)|5(?:06|1[49]|48|79|8[147])|6(?:04|[18]3|39|47|72)|7(?:0[59]|42|53|78|8[02])|8(?:[06]7|19|25|7[39])|9(?:0[25]|42))[2-9]\\d{6}", [10]], ["", [10]], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}", [10]], ["900[2-9]\\d{6}", [10]], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|(?:5(?:2[125-9]|3[23]|44|66|77|88)|6(?:22|33))[2-9]\\d{6}", [10]], 0, ["310\\d{4}", [7]], 0, ["600[2-9]\\d{6}", [10]]]], "CC": ["61", "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}", [6, 7, 8, 9, 10, 12], 0, "0", 0, "([59]\\d{7})$|0", "8$1", 0, 0, [["8(?:51(?:0(?:02|31|60|89)|1(?:18|76)|223)|91(?:0(?:1[0-2]|29)|1(?:[28]2|50|79)|2(?:10|64)|3(?:[06]8|22)|4[29]8|62\\d|70[23]|959))\\d{3}", [9]], ["4(?:79[01]|83[0-36-9]|95[0-3])\\d{5}|4(?:[0-36]\\d|4[047-9]|[58][0-24-9]|7[02-8]|9[0-47-9])\\d{6}", [9]], ["180(?:0\\d{3}|2)\\d{3}", [7, 10]], ["190[0-26]\\d{6}", [10]], 0, 0, 0, 0, ["14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", [9]], ["13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", [6, 8, 10, 12]]], "0011"], "CD": ["243", "00", "(?:(?:[189]|5\\d)\\d|2)\\d{7}|[1-68]\\d{6}", [7, 8, 9, 10], [["(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", ["88"], "0$1"], ["(\\d{2})(\\d{5})", "$1 $2", ["[1-6]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[89]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["5"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:12|573)\\d\\d|276)\\d{5}|[1-6]\\d{6}"], ["88\\d{5}|(?:8[0-79]|9[016-9])\\d{7}", [7, 9]]]], "CF": ["236", "00", "8776\\d{4}|(?:[27]\\d|61)\\d{6}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[26-8]"]]], 0, 0, 0, 0, 0, 0, [["(?:2[12]|61)\\d{6}"], ["7[02-7]\\d{6}"], 0, ["8776\\d{4}"]]], "CG": ["242", "00", "222\\d{6}|(?:0\\d|80)\\d{7}", [9], [["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["8"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[02]"]]], 0, 0, 0, 0, 0, 0, [["222[1-589]\\d{5}"], ["026(?:1[0-5]|6[6-9])\\d{4}|0(?:[14-6]\\d\\d|2(?:40|5[5-8]|6[07-9]))\\d{5}"], 0, ["80[0-2]\\d{6}"]]], "CH": ["41", "00", "8\\d{11}|[2-9]\\d{8}", [9, 12], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["8[047]|90"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2-79]|81"], "0$1"], ["(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2[12467]|3[1-4]|4[134]|5[256]|6[12]|[7-9]1)\\d{7}", [9]], ["(?:6[89]|7[235-9])\\d{7}", [9]], ["800\\d{6}", [9]], ["90[016]\\d{6}", [9]], ["878\\d{6}", [9]], ["860\\d{9}", [12]], ["5[18]\\d{7}", [9]], ["74[0248]\\d{6}", [9]], 0, ["84[0248]\\d{6}", [9]]]], "CI": ["225", "00", "[02]\\d{9}", [10], [["(\\d{2})(\\d{2})(\\d)(\\d{5})", "$1 $2 $3 $4", ["2"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3 $4", ["0"]]], 0, 0, 0, 0, 0, 0, [["2(?:[15]\\d{3}|7(?:2(?:0[23]|1[2357]|2[245]|3[45]|4[3-5])|3(?:06|1[69]|[2-6]7)))\\d{5}"], ["0[157]\\d{8}"]]], "CK": ["682", "00", "[2-578]\\d{4}", [5], [["(\\d{2})(\\d{3})", "$1 $2", ["[2-578]"]]], 0, 0, 0, 0, 0, 0, [["(?:2\\d|3[13-7]|4[1-5])\\d{3}"], ["[578]\\d{4}"]]], "CL": ["56", "(?:0|1(?:1[0-69]|2[02-5]|5[13-58]|69|7[0167]|8[018]))0", "12300\\d{6}|6\\d{9,10}|[2-9]\\d{8}", [9, 10, 11], [["(\\d{5})(\\d{4})", "$1 $2", ["219", "2196"], "($1)"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["60|809"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["44"]], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["2[1-36]"], "($1)"], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["9(?:10|[2-9])"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["3[2-5]|[47]|5[1-3578]|6[13-57]|8(?:0[1-8]|[1-9])"], "($1)"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["60|8"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"]], ["(\\d{3})(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3 $4", ["60"]]], 0, 0, 0, 0, 0, 0, [["2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:(?:[24]\\d|50)\\d|3(?:[0346-9]\\d|1[0-35-9]|2[1-9]|5[0-24-9])|600)|646[59])|(?:600|80[1-9])\\d\\d|9(?:(?:10[0-2]|7[1-9]\\d)\\d|3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}", [9]], ["2(?:1982[0-6]|3314[05-9])\\d{3}|(?:2(?:1(?:160|962)|3(?:(?:[24]\\d|50)\\d|3(?:[0346-9]\\d|1[0-35-9]|2[1-9]|5[0-24-9])|600)|646[59])|80[1-8]\\d\\d|9(?:(?:10[0-2]|7[1-9]\\d)\\d|3(?:[0-57-9]\\d\\d|6(?:0[02-9]|[1-9]\\d))|6(?:[0-8]\\d\\d|9(?:[02-79]\\d|1[05-9]))|9(?:[03-9]\\d\\d|1(?:[0235-9]\\d|4[0-24-9])|2(?:[0-79]\\d|8[0-46-9]))))\\d{4}|(?:22|3[2-5]|[47][1-35]|5[1-3578]|6[13-57]|8[1-9]|9[2458])\\d{7}", [9]], ["(?:123|8)00\\d{6}", [9, 11]], 0, 0, 0, 0, 0, ["44\\d{7}", [9]], ["600\\d{7,8}", [10, 11]]]], "CM": ["237", "00", "[26]\\d{8}|88\\d{6,7}", [8, 9], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["88"]], ["(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["[26]|88"]]], 0, 0, 0, 0, 0, 0, [["2(?:22|33)\\d{6}", [9]], ["(?:24[23]|6(?:[25-9]\\d|4[0-2]))\\d{6}", [9]], ["88\\d{6,7}"]]], "CN": ["86", "00|1(?:[12]\\d|79)\\d\\d00", "(?:(?:1[03-689]|2\\d)\\d\\d|6)\\d{8}|1\\d{10}|[126]\\d{6}(?:\\d(?:\\d{2})?)?|86\\d{5,6}|(?:[3-579]\\d|8[0-57-9])\\d{5,9}", [7, 8, 9, 10, 11, 12], [["(\\d{2})(\\d{5,6})", "$1 $2", ["(?:10|2[0-57-9])[19]|3(?:[157]|35|49|9[1-68])|4(?:1[124-9]|2[179]|6[47-9]|7|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:07|1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|3|4[13]|5[1-5]|7[0-79]|9[0-35-9])|(?:4[35]|59|85)[1-9]", "(?:10|2[0-57-9])(?:1[02]|9[56])|8078|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:1[124-9]|2[179]|[35][1-9]|6[47-9]|7\\d|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|3\\d|4[13]|5[1-5]|7[0-79]|9[0-35-9]))1", "10(?:1(?:0|23)|9[56])|2[0-57-9](?:1(?:00|23)|9[56])|80781|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:1[124-9]|2[179]|[35][1-9]|6[47-9]|7\\d|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|3\\d|4[13]|5[1-5]|7[0-79]|9[0-35-9]))12", "10(?:1(?:0|23)|9[56])|2[0-57-9](?:1(?:00|23)|9[56])|807812|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:1[124-9]|2[179]|[35][1-9]|6[47-9]|7\\d|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|3\\d|4[13]|5[1-5]|7[0-79]|9[0-35-9]))123", "10(?:1(?:0|23)|9[56])|2[0-57-9](?:1(?:00|23)|9[56])|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:1[124-9]|2[179]|[35][1-9]|6[47-9]|7\\d|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:078|1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|3\\d|4[13]|5[1-5]|7[0-79]|9[0-35-9]))123"], "0$1"], ["(\\d{3})(\\d{5,6})", "$1 $2", ["3(?:[157]|35|49|9[1-68])|4(?:[17]|2[179]|6[47-9]|8[23])|5(?:[1357]|2[37]|4[36]|6[1-46]|80)|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])|(?:4[35]|59|85)[1-9]", "(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[1-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))[19]", "85[23](?:10|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:10|9[56])", "85[23](?:100|95)|(?:3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))(?:100|9[56])"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["(?:4|80)0"]], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["10|2(?:[02-57-9]|1[1-9])", "10|2(?:[02-57-9]|1[1-9])", "10[0-79]|2(?:[02-57-9]|1[1-79])|(?:10|21)8(?:0[1-9]|[1-9])"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["3(?:[3-59]|7[02-68])|4(?:[26-8]|3[3-9]|5[2-9])|5(?:3[03-9]|[468]|7[028]|9[2-46-9])|6|7(?:[0-247]|3[04-9]|5[0-4689]|6[2368])|8(?:[1-358]|9[1-7])|9(?:[013479]|5[1-5])|(?:[34]1|55|79|87)[02-9]"], "0$1", 1], ["(\\d{3})(\\d{7,8})", "$1 $2", ["9"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["80"], "0$1", 1], ["(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", ["[3-578]"], "0$1", 1], ["(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", ["1[3-9]"]], ["(\\d{2})(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3 $4", ["[12]"], "0$1", 1]], "0", 0, "(1(?:[12]\\d|79)\\d\\d)|0", 0, 0, 0, [["(?:10(?:[02-79]\\d\\d|[18](?:0[1-9]|[1-9]\\d))|2(?:[02-57-9]\\d{3}|1(?:[18](?:0[1-9]|[1-9]\\d)|[2-79]\\d\\d))|(?:41[03]|8078|9(?:78|94))\\d\\d)\\d{5}|(?:10|2[0-57-9])(?:1(?:00|23)\\d\\d|95\\d{3,4})|(?:41[03]|9(?:78|94))(?:100\\d\\d|95\\d{3,4})|8078123|(?:43[35]|754|851)\\d{7,8}|(?:43[35]|754|851)(?:1(?:00\\d|23)\\d|95\\d{3,4})|(?:3(?:11|7[179])|4(?:[15]1|3[12])|5(?:1\\d|2[37]|3[12]|51|7[13-79]|9[15])|7(?:[39]1|5[57]|6[09])|8(?:71|98))(?:[02-8]\\d{7}|1(?:0(?:0\\d\\d(?:\\d{3})?|[1-9]\\d{5})|[13-9]\\d{6}|2(?:[0-24-9]\\d{5}|3\\d(?:\\d{4})?))|9(?:[0-46-9]\\d{6}|5\\d{3}(?:\\d(?:\\d{2})?)?))|(?:3(?:1[02-9]|35|49|5\\d|7[02-68]|9[1-68])|4(?:1[24-9]|2[179]|3[46-9]|5[2-9]|6[47-9]|7\\d|8[23])|5(?:3[03-9]|4[36]|5[02-9]|6[1-46]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[17]\\d|2[248]|3[04-9]|4[3-6]|5[0-3689]|6[2368]|9[02-9])|8(?:1[236-8]|2[5-7]|3\\d|5[2-9]|7[02-9]|8[36-8]|9[1-7])|9(?:0[1-3689]|1[1-79]|3\\d|4[13]|5[1-5]|7[0-79]|9[0-35-9]))(?:[02-8]\\d{6}|1(?:0(?:0\\d\\d(?:\\d{2})?|[1-9]\\d{4})|[13-9]\\d{5}|2(?:[0-24-9]\\d{4}|3\\d(?:\\d{3})?))|9(?:[0-46-9]\\d{5}|5\\d{3,5}))", [7, 8, 9, 10, 11]], ["1(?:610\\d|740[0-5])\\d{6}|1(?:[38]\\d|4[57]|[59][0-35-9]|6[25-7]|7[0-35-8])\\d{8}", [11]], ["(?:(?:10|21)8|8)00\\d{7}", [10, 12]], ["16[08]\\d{5}", [8]], 0, 0, 0, 0, 0, ["10(?:10\\d{4}|96\\d{3,4})|400\\d{7}|950\\d{7,8}|(?:2[0-57-9]|3(?:[157]\\d|35|49|9[1-68])|4(?:[17]\\d|2[179]|[35][1-9]|6[47-9]|8[23])|5(?:[1357]\\d|2[37]|4[36]|6[1-46]|80|9[1-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]\\d|2[248]|3[014-9]|4[3-6]|6[023689])|8(?:1[236-8]|2[5-7]|[37]\\d|5[14-9]|8[36-8]|9[1-8])|9(?:0[1-3689]|1[1-79]|[379]\\d|4[13]|5[1-5]))96\\d{3,4}", [7, 8, 9, 10, 11]]], "00"], "CO": ["57", "00(?:4(?:[14]4|56)|[579])", "(?:46|60\\d\\d)\\d{6}|(?:1\\d|[39])\\d{9}", [8, 10, 11], [["(\\d{4})(\\d{4})", "$1 $2", ["46"]], ["(\\d{3})(\\d{7})", "$1 $2", ["6|90"], "($1)"], ["(\\d{3})(\\d{7})", "$1 $2", ["3[0-357]|9[14]"]], ["(\\d)(\\d{3})(\\d{7})", "$1-$2-$3", ["1"], "0$1", 0, "$1 $2 $3"]], "0", 0, "0([3579]|4(?:[14]4|56))?", 0, 0, 0, [["601055(?:[0-4]\\d|50)\\d\\d|6010(?:[0-4]\\d|5[0-4])\\d{4}|(?:46|60(?:[18][1-9]|[24-7][2-9]))\\d{6}", [8, 10]], ["333301[0-5]\\d{3}|3333(?:00|2[5-9]|[3-9]\\d)\\d{4}|(?:3(?:(?:0[0-5]|1\\d|5[01]|70)\\d|2(?:[0-3]\\d|4[1-9])|3(?:00|3[0-24-9]))|9(?:101|408))\\d{6}", [10]], ["1800\\d{7}", [11]], ["(?:19(?:0[01]|4[78])|901)\\d{7}", [10, 11]]]], "CR": ["506", "00", "(?:8\\d|90)\\d{8}|(?:[24-8]\\d{3}|3005)\\d{4}", [8, 10], [["(\\d{4})(\\d{4})", "$1 $2", ["[2-7]|8[3-9]"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", ["[89]"]]], 0, 0, "(19(?:0[0-2468]|1[09]|20|66|77|99))", 0, 0, 0, [["210[7-9]\\d{4}|2(?:[024-7]\\d|1[1-9])\\d{5}", [8]], ["(?:3005\\d|6500[01])\\d{3}|(?:5[07]|6[0-4]|7[0-3]|8[3-9])\\d{6}", [8]], ["800\\d{7}", [10]], ["90[059]\\d{7}", [10]], 0, 0, 0, 0, ["(?:210[0-6]|4\\d{3}|5100)\\d{4}", [8]]]], "CU": ["53", "119", "(?:[2-7]|8\\d\\d)\\d{7}|[2-47]\\d{6}|[34]\\d{5}", [6, 7, 8, 10], [["(\\d{2})(\\d{4,6})", "$1 $2", ["2[1-4]|[34]"], "(0$1)"], ["(\\d)(\\d{6,7})", "$1 $2", ["7"], "(0$1)"], ["(\\d)(\\d{7})", "$1 $2", ["[56]"], "0$1"], ["(\\d{3})(\\d{7})", "$1 $2", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:3[23]|4[89])\\d{4,6}|(?:31|4[36]|8(?:0[25]|78)\\d)\\d{6}|(?:2[1-4]|4[1257]|7\\d)\\d{5,6}"], ["(?:5\\d|6[2-4])\\d{6}", [8]], ["800\\d{7}", [10]], 0, 0, 0, 0, 0, 0, ["807\\d{7}", [10]]]], "CV": ["238", "0", "(?:[2-59]\\d\\d|800)\\d{4}", [7], [["(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", ["[2-589]"]]], 0, 0, 0, 0, 0, 0, [["2(?:2[1-7]|3[0-8]|4[12]|5[1256]|6\\d|7[1-3]|8[1-5])\\d{4}"], ["(?:36|5[1-389]|9\\d)\\d{5}"], ["800\\d{4}"], 0, 0, 0, 0, 0, ["(?:3[3-5]|4[356])\\d{5}"]]], "CW": ["599", "00", "(?:[34]1|60|(?:7|9\\d)\\d)\\d{5}", [7, 8], [["(\\d{3})(\\d{4})", "$1 $2", ["[3467]"]], ["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["9[4-8]"]]], 0, 0, 0, 0, 0, "[69]", [["9(?:4(?:3[0-5]|4[14]|6\\d)|50\\d|7(?:2[014]|3[02-9]|4[4-9]|6[357]|77|8[7-9])|8(?:3[39]|[46]\\d|7[01]|8[57-9]))\\d{4}"], ["953[01]\\d{4}|9(?:5[12467]|6[5-9])\\d{5}"], 0, 0, 0, 0, 0, ["955\\d{5}", [8]], 0, ["60[0-2]\\d{4}", [7]]]], "CX": ["61", "001[14-689]|14(?:1[14]|34|4[17]|[56]6|7[47]|88)0011", "1(?:[0-79]\\d{8}(?:\\d{2})?|8[0-24-9]\\d{7})|[148]\\d{8}|1\\d{5,7}", [6, 7, 8, 9, 10, 12], 0, "0", 0, "([59]\\d{7})$|0", "8$1", 0, 0, [["8(?:51(?:0(?:01|30|59|88)|1(?:17|46|75)|2(?:22|35))|91(?:00[6-9]|1(?:[28]1|49|78)|2(?:09|63)|3(?:12|26|75)|4(?:56|97)|64\\d|7(?:0[01]|1[0-2])|958))\\d{3}", [9]], ["4(?:79[01]|83[0-36-9]|95[0-3])\\d{5}|4(?:[0-36]\\d|4[047-9]|[58][0-24-9]|7[02-8]|9[0-47-9])\\d{6}", [9]], ["180(?:0\\d{3}|2)\\d{3}", [7, 10]], ["190[0-26]\\d{6}", [10]], 0, 0, 0, 0, ["14(?:5(?:1[0458]|[23][458])|71\\d)\\d{4}", [9]], ["13(?:00\\d{6}(?:\\d{2})?|45[0-4]\\d{3})|13\\d{4}", [6, 8, 10, 12]]], "0011"], "CY": ["357", "00", "(?:[279]\\d|[58]0)\\d{6}", [8], [["(\\d{2})(\\d{6})", "$1 $2", ["[257-9]"]]], 0, 0, 0, 0, 0, 0, [["2[2-6]\\d{6}"], ["9(?:10|[4-79]\\d)\\d{5}"], ["800\\d{5}"], ["90[09]\\d{5}"], ["700\\d{5}"], 0, ["(?:50|77)\\d{6}"], 0, 0, ["80[1-9]\\d{5}"]]], "CZ": ["420", "00", "(?:[2-578]\\d|60)\\d{7}|9\\d{8,11}", [9, 10, 11, 12], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2-8]|9[015-7]"]], ["(\\d{2})(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3 $4", ["96"]], ["(\\d{2})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["9"]], ["(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["9"]]], 0, 0, 0, 0, 0, 0, [["(?:2\\d|3[1257-9]|4[16-9]|5[13-9])\\d{7}", [9]], ["7060\\d{5}|(?:60[1-8]|7(?:0[2-5]|19|[2379]\\d))\\d{6}", [9]], ["800\\d{6}", [9]], ["9(?:0[05689]|76)\\d{6}", [9]], ["70[01]\\d{6}", [9]], ["9(?:3\\d{9}|6\\d{7,10})"], ["9(?:5\\d|7[2-4])\\d{6}", [9]], 0, ["9[17]0\\d{6}", [9]], ["8[134]\\d{7}", [9]]]], "DE": ["49", "00", "[2579]\\d{5,14}|49(?:[34]0|69|8\\d)\\d\\d?|49(?:37|49|60|7[089]|9\\d)\\d{1,3}|49(?:2[024-9]|3[2-689]|7[1-7])\\d{1,8}|(?:1|[368]\\d|4[0-8])\\d{3,13}|49(?:[015]\\d|2[13]|31|[46][1-8])\\d{1,9}", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [["(\\d{2})(\\d{3,13})", "$1 $2", ["3[02]|40|[68]9"], "0$1"], ["(\\d{3})(\\d{3,12})", "$1 $2", ["2(?:0[1-389]|1[124]|2[18]|3[14])|3(?:[35-9][15]|4[015])|906|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1", "2(?:0[1-389]|12[0-8])|3(?:[35-9][15]|4[015])|906|2(?:[13][14]|2[18])|(?:2[4-9]|4[2-9]|[579][1-9]|[68][1-8])1"], "0$1"], ["(\\d{4})(\\d{2,11})", "$1 $2", ["[24-6]|3(?:[3569][02-46-9]|4[2-4679]|7[2-467]|8[2-46-8])|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]", "[24-6]|3(?:3(?:0[1-467]|2[127-9]|3[124578]|7[1257-9]|8[1256]|9[145])|4(?:2[135]|4[13578]|9[1346])|5(?:0[14]|2[1-3589]|6[1-4]|7[13468]|8[13568])|6(?:2[1-489]|3[124-6]|6[13]|7[12579]|8[1-356]|9[135])|7(?:2[1-7]|4[145]|6[1-5]|7[1-4])|8(?:21|3[1468]|6|7[1467]|8[136])|9(?:0[12479]|2[1358]|4[134679]|6[1-9]|7[136]|8[147]|9[1468]))|70[2-8]|8(?:0[2-9]|[1-8])|90[7-9]|[79][1-9]|3[68]4[1347]|3(?:47|60)[1356]|3(?:3[46]|46|5[49])[1246]|3[4579]3[1357]"], "0$1"], ["(\\d{3})(\\d{4})", "$1 $2", ["138"], "0$1"], ["(\\d{5})(\\d{2,10})", "$1 $2", ["3"], "0$1"], ["(\\d{3})(\\d{5,11})", "$1 $2", ["181"], "0$1"], ["(\\d{3})(\\d)(\\d{4,10})", "$1 $2 $3", ["1(?:3|80)|9"], "0$1"], ["(\\d{3})(\\d{7,8})", "$1 $2", ["1[67]"], "0$1"], ["(\\d{3})(\\d{7,12})", "$1 $2", ["8"], "0$1"], ["(\\d{5})(\\d{6})", "$1 $2", ["185", "1850", "18500"], "0$1"], ["(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", ["7"], "0$1"], ["(\\d{4})(\\d{7})", "$1 $2", ["18[68]"], "0$1"], ["(\\d{4})(\\d{7})", "$1 $2", ["15[1279]"], "0$1"], ["(\\d{5})(\\d{6})", "$1 $2", ["15[03568]", "15(?:[0568]|3[13])"], "0$1"], ["(\\d{3})(\\d{8})", "$1 $2", ["18"], "0$1"], ["(\\d{3})(\\d{2})(\\d{7,8})", "$1 $2 $3", ["1(?:6[023]|7)"], "0$1"], ["(\\d{4})(\\d{2})(\\d{7})", "$1 $2 $3", ["15[279]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{8})", "$1 $2 $3", ["15"], "0$1"]], "0", 0, 0, 0, 0, 0, [["32\\d{9,11}|49[1-6]\\d{10}|322\\d{6}|49[0-7]\\d{3,9}|(?:[34]0|[68]9)\\d{3,13}|(?:2(?:0[1-689]|[1-3569]\\d|4[0-8]|7[1-7]|8[0-7])|3(?:[3569]\\d|4[0-79]|7[1-7]|8[1-8])|4(?:1[02-9]|[2-48]\\d|5[0-6]|6[0-8]|7[0-79])|5(?:0[2-8]|[124-6]\\d|[38][0-8]|[79][0-7])|6(?:0[02-9]|[1-358]\\d|[47][0-8]|6[1-9])|7(?:0[2-8]|1[1-9]|[27][0-7]|3\\d|[4-6][0-8]|8[0-5]|9[013-7])|8(?:0[2-9]|1[0-79]|2\\d|3[0-46-9]|4[0-6]|5[013-9]|6[1-8]|7[0-8]|8[0-24-6])|9(?:0[6-9]|[1-4]\\d|[589][0-7]|6[0-8]|7[0-467]))\\d{3,12}", [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]], ["1(?:6[023]|7\\d)\\d{7,8}|15(?:[0-25-9]\\d\\d|3(?:10|33))\\d{6}", [10, 11]], ["800\\d{7,12}", [10, 11, 12, 13, 14, 15]], ["(?:137[7-9]|900(?:[135]|9\\d))\\d{6}", [10, 11]], ["700\\d{8}", [11]], ["1(?:6(?:013|255|399)|7(?:(?:[015]1|[69]3)3|[2-4]55|[78]99))\\d{7,8}|15(?:(?:[03-68]00|113)\\d|2\\d55|7\\d99|9\\d33)\\d{7}", [12, 13]], ["18(?:1\\d{5,11}|[2-9]\\d{8})", [8, 9, 10, 11, 12, 13, 14]], ["16(?:4\\d{1,10}|[89]\\d{1,11})", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]], 0, ["180\\d{5,11}|13(?:7[1-6]\\d\\d|8)\\d{4}", [7, 8, 9, 10, 11, 12, 13, 14]]]], "DJ": ["253", "00", "(?:2\\d|77)\\d{6}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[27]"]]], 0, 0, 0, 0, 0, 0, [["2(?:1[2-5]|7[45])\\d{5}"], ["77\\d{6}"]]], "DK": ["45", "00", "[2-9]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:[0-59][1-9]|[6-8]\\d)|3(?:[0-3][1-9]|4[13]|5[1-58]|6[1347-9]|7\\d|8[1-8]|9[1-79])|4(?:[0-25][1-9]|[34][2-9]|6[13-579]|7[13579]|8[1-47]|9[127])|5(?:[0-36][1-9]|4[146-9]|5[3-57-9]|7[568]|8[1-358]|9[1-69])|6(?:[0135][1-9]|2[1-68]|4[2-8]|6[1689]|[78]\\d|9[15689])|7(?:[0-69][1-9]|7[3-9]|8[147])|8(?:[16-9][1-9]|2[1-58])|9(?:[1-47-9][1-9]|6\\d))\\d{5}"], ["(?:2[6-8]|37|6[78]|96)\\d{6}|(?:2[0-59]|3[0-689]|[457]\\d|6[0-69]|8[126-9]|9[1-47-9])[1-9]\\d{5}"], ["80\\d{6}"], ["90\\d{6}"]]], "DM": ["1", "011", "(?:[58]\\d\\d|767|900)\\d{7}", [10], 0, "1", 0, "([2-7]\\d{6})$|1", "767$1", 0, "767", [["767(?:2(?:55|66)|4(?:2[01]|4[0-25-9])|50[0-4])\\d{4}"], ["767(?:2(?:[2-4689]5|7[5-7])|31[5-7]|61[1-8]|70[1-6])\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "DO": ["1", "011", "(?:[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, 0, 0, 0, "8001|8[024]9", [["8(?:[04]9[2-9]\\d\\d|29(?:2(?:[0-59]\\d|6[04-9]|7[0-27]|8[0237-9])|3(?:[0-35-9]\\d|4[7-9])|[45]\\d\\d|6(?:[0-27-9]\\d|[3-5][1-9]|6[0135-8])|7(?:0[013-9]|[1-37]\\d|4[1-35689]|5[1-4689]|6[1-57-9]|8[1-79]|9[1-8])|8(?:0[146-9]|1[0-48]|[248]\\d|3[1-79]|5[01589]|6[013-68]|7[124-8]|9[0-8])|9(?:[0-24]\\d|3[02-46-9]|5[0-79]|60|7[0169]|8[57-9]|9[02-9])))\\d{4}"], ["8[024]9[2-9]\\d{6}"], ["800(?:14|[2-9]\\d)\\d{5}|8[024]9[01]\\d{6}|8(?:33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "DZ": ["213", "00", "(?:[1-4]|[5-79]\\d|80)\\d{7}", [8, 9], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[1-4]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["9"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[5-8]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["9619\\d{5}|(?:[1-3]\\d|4[013-689])\\d{6}"], ["5(?:4[0-29]|6[0-4])\\d{6}|(?:55|6\\d|7[7-9])\\d{7}", [9]], ["800\\d{6}", [9]], ["80[3-689]1\\d{5}", [9]], 0, 0, 0, 0, ["98[23]\\d{6}", [9]], ["80[12]1\\d{5}", [9]]]], "EC": ["593", "00", "1\\d{9,10}|(?:[2-7]|9\\d)\\d{7}", [8, 9, 10, 11], [["(\\d)(\\d{3})(\\d{4})", "$1 $2-$3", ["[2-7]"], "(0$1)", 0, "$1-$2-$3"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["9"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["1"]]], "0", 0, 0, 0, 0, 0, [["[2-7][2-7]\\d{6}", [8]], ["964[0-2]\\d{5}|9(?:39|[57][89]|6[0-36-9]|[89]\\d)\\d{6}", [9]], ["1800\\d{7}|1[78]00\\d{6}", [10, 11]], 0, 0, 0, 0, 0, ["[2-7]890\\d{4}", [8]]]], "EE": ["372", "00", "8\\d{9}|[4578]\\d{7}|(?:[3-8]\\d|90)\\d{5}", [7, 8, 10], [["(\\d{3})(\\d{4})", "$1 $2", ["[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]|88", "[369]|4[3-8]|5(?:[02]|1(?:[0-8]|95)|5[0-478]|6(?:4[0-4]|5[1-589]))|7[1-9]|88"]], ["(\\d{4})(\\d{3,4})", "$1 $2", ["[45]|8(?:00|[1-49])", "[45]|8(?:00[1-9]|[1-49])"]], ["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["7"]], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["(?:3[23589]|4[3-8]|6\\d|7[1-9]|88)\\d{5}", [7]], ["(?:5\\d{5}|8(?:1(?:0(?:0(?:00|[178]\\d)|[3-9]\\d\\d)|(?:1(?:0[2-6]|1\\d)|[2-79]\\d\\d)\\d)|2(?:0(?:0(?:00|4\\d)|[1-7]\\d\\d)|(?:(?:[124-69]\\d|3[5-9])\\d|7(?:[0-79]\\d|8[013-9])|8(?:[2-6]\\d|7[01]))\\d)|[349]\\d{4}))\\d\\d|5(?:(?:[02]\\d|5[0-478])\\d|1(?:[0-8]\\d|95)|6(?:4[0-4]|5[1-589]))\\d{3}", [7, 8]], ["800(?:(?:0\\d\\d|1)\\d|[2-9])\\d{3}"], ["(?:40\\d\\d|900)\\d{4}", [7, 8]], ["70[0-2]\\d{5}", [8]]]], "EG": ["20", "00", "[189]\\d{8,9}|[24-6]\\d{8}|[135]\\d{7}", [8, 9, 10], [["(\\d)(\\d{7,8})", "$1 $2", ["[23]"], "0$1"], ["(\\d{2})(\\d{6,7})", "$1 $2", ["1[35]|[4-6]|8[2468]|9[235-7]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[89]"], "0$1"], ["(\\d{2})(\\d{8})", "$1 $2", ["1"], "0$1"]], "0", 0, 0, 0, 0, 0, [["13[23]\\d{6}|(?:15|57)\\d{6,7}|(?:2\\d|3|4[05-8]|5[05]|6[24-689]|8[2468]|9[235-7])\\d{7}", [8, 9]], ["1[0-25]\\d{8}", [10]], ["800\\d{7}", [10]], ["900\\d{7}", [10]]]], "EH": ["212", "00", "[5-8]\\d{8}", [9], 0, "0", 0, 0, 0, 0, 0, [["528[89]\\d{5}"], ["(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[016-8]\\d|2[0-8]|3[01]|5[0-5]))\\d{6}"], ["80[0-7]\\d{6}"], ["89\\d{7}"], 0, 0, 0, 0, ["(?:592(?:4[0-2]|93)|80[89]\\d\\d)\\d{4}"]]], "ER": ["291", "00", "[178]\\d{6}", [7], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["[178]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:1(?:1[12568]|[24]0|55|6[146])|8\\d\\d)\\d{4}"], ["(?:17[1-3]|7\\d\\d)\\d{4}"]]], "ES": ["34", "00", "(?:400|[5-9]\\d\\d)\\d{6}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[89]00"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[4-9]"]]], 0, 0, 0, 0, 0, 0, [["96906(?:0[0-8]|1[1-9]|[2-9]\\d)\\d\\d|9(?:69(?:0[0-57-9]|[1-9]\\d)|73(?:[0-8]\\d|9[1-9]))\\d{4}|(?:400|8(?:[1356]\\d|[28][0-8]|[47][1-9])|9(?:[135]\\d|[268][0-8]|4[1-9]|7[124-9]))\\d{6}"], ["96906(?:09|10)\\d\\d|(?:590(?:10[0-2]|600)|97390\\d)\\d{3}|(?:6\\d|7[1-48])\\d{7}"], ["[89]00\\d{6}"], ["80[367]\\d{6}"], ["70\\d{7}"], 0, ["51\\d{7}"], 0, 0, ["90[12]\\d{6}"]]], "ET": ["251", "00", "(?:11|[2-57-9]\\d)\\d{7}", [9], [["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[1-57-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:11(?:[124]\\d\\d|3(?:[0-79]\\d|8[0-7])|5(?:[02-9]\\d|1[0-57-9])|6(?:[02-79]\\d|1[0-57-9]|8[0-8]))|2(?:2(?:11[1-9]|22[0-7]|33\\d|44[1467]|66[1-68])|5(?:11[124-6]|33[2-8]|44[1467]|55[14]|66[1-3679]|77[124-79]|880))|3(?:3(?:11[0-46-8]|(?:22|55)[0-6]|33[0134689]|44[04]|66[01467])|4(?:44[0-8]|55[0-69]|66[0-3]|77[1-5]))|4(?:6(?:119|22[0-24-7]|33[1-5]|44[13-69]|55[14-689]|660|88[1-4])|7(?:(?:11|22)[1-9]|33[13-7]|44[13-6]|55[1-689]))|5(?:7(?:227|55[05]|(?:66|77)[14-8])|8(?:11[149]|22[013-79]|33[0-68]|44[013-8]|550|66[1-5]|77\\d)))\\d{4}"], ["700[1-9]\\d{5}|(?:7(?:0[1-9]|1[0-8]|2[1-35-79]|3\\d|77|86|99)|(?:8[01]|9\\d)\\d)\\d{6}"]]], "FI": ["358", "00|99(?:[01469]|5(?:[14]1|3[23]|5[59]|77|88|9[09]))", "[1-35689]\\d{4}|7\\d{10,11}|(?:[124-7]\\d|3[0-46-9])\\d{8}|[1-9]\\d{5,8}", [5, 6, 7, 8, 9, 10, 11, 12], [["(\\d{5})", "$1", ["20[2-59]"], "0$1"], ["(\\d{3})(\\d{3,7})", "$1 $2", ["(?:[1-3]0|[68])0|70[07-9]"], "0$1"], ["(\\d{2})(\\d{4,8})", "$1 $2", ["[14]|2[09]|50|7[135]"], "0$1"], ["(\\d{2})(\\d{6,10})", "$1 $2", ["7"], "0$1"], ["(\\d)(\\d{4,9})", "$1 $2", ["(?:19|[2568])[1-8]|3(?:0[1-9]|[1-9])|9"], "0$1"]], "0", 0, 0, 0, 0, "1[03-79]|[2-9]", [["1[3-7][1-8]\\d{3,6}|(?:19[1-8]|[23568][1-8]\\d|9(?:00|[1-8]\\d))\\d{2,6}", [5, 6, 7, 8, 9]], ["4946\\d{2,6}|(?:4[0-8]|50)\\d{4,8}", [6, 7, 8, 9, 10]], ["800\\d{4,6}", [7, 8, 9]], ["[67]00\\d{5,6}", [8, 9]], 0, 0, ["20\\d{4,8}|60[12]\\d{5,6}|7(?:099\\d{4,5}|5[03-9]\\d{3,7})|20[2-59]\\d\\d|(?:606|7(?:0[78]|1|3\\d))\\d{7}|(?:10|29|3[09]|70[1-5]\\d)\\d{4,8}"]], "00"], "FJ": ["679", "0(?:0|52)", "45\\d{5}|(?:0800\\d|[235-9])\\d{6}", [7, 11], [["(\\d{3})(\\d{4})", "$1 $2", ["[235-9]|45"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["0"]]], 0, 0, 0, 0, 0, 0, [["603\\d{4}|(?:3[0-6]|6[25-7]|8[58])\\d{5}", [7]], ["(?:[279]\\d|45|5[01568]|8[034679])\\d{5}", [7]], ["0800\\d{7}", [11]]], "00"], "FK": ["500", "00", "[2-7]\\d{4}", [5], 0, 0, 0, 0, 0, 0, 0, [["[2-47]\\d{4}"], ["[56]\\d{4}"]]], "FM": ["691", "00", "(?:[39]\\d\\d|820)\\d{4}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[389]"]]], 0, 0, 0, 0, 0, 0, [["31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-6]\\d)\\d)\\d{3}"], ["31(?:00[67]|208|309)\\d\\d|(?:3(?:[2357]0[1-9]|602|804|905)|(?:820|9[2-7]\\d)\\d)\\d{3}"]]], "FO": ["298", "00", "[2-9]\\d{5}", [6], [["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["[2-9]"]]], 0, 0, "(10(?:01|[12]0|88))", 0, 0, 0, [["(?:20|[34]\\d|8[19])\\d{4}"], ["(?:[27][1-9]|5\\d|9[16])\\d{4}"], ["80[257-9]\\d{3}"], ["90(?:[13-5][15-7]|2[125-7]|9\\d)\\d\\d"], 0, 0, 0, 0, ["6[0-36]\\d{4}"]]], "FR": ["33", "00", "[1-9]\\d{8}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"], "0 $1"], ["(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["[1-79]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:26[013-9]|59[1-35-9])\\d{6}|(?:[13]\\d|2[0-57-9]|4[1-9]|5[0-8])\\d{7}"], ["(?:6(?:[0-24-8]\\d|3[0-8]|9[589])|7[3-9]\\d)\\d{6}"], ["80[0-5]\\d{6}"], ["836(?:0[0-36-9]|[1-9]\\d)\\d{4}|8(?:1[2-9]|2[2-47-9]|3[0-57-9]|[569]\\d|8[0-35-9])\\d{6}"], 0, 0, ["80[6-9]\\d{6}"], 0, ["9\\d{8}"], ["8(?:1[01]|2[0156]|4[024]|84)\\d{6}"]]], "GA": ["241", "00", "(?:[067]\\d|11)\\d{6}|[2-7]\\d{6}", [7, 8], [["(\\d)(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2-7]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["0"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["11|[67]"], "0$1"]], 0, 0, "0(11\\d{6}|60\\d{6}|61\\d{6}|6[256]\\d{6}|7[467]\\d{6})", "$1", 0, 0, [["[01]1\\d{6}", [8]], ["(?:(?:0[2-7]|7[467])\\d|6(?:0[0-4]|10|[256]\\d))\\d{5}|[2-7]\\d{6}"]]], "GB": ["44", "00", "[1-357-9]\\d{9}|[18]\\d{8}|8\\d{6}", [7, 9, 10], [["(\\d{3})(\\d{4})", "$1 $2", ["800", "8001", "80011", "800111", "8001111"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", ["845", "8454", "84546", "845464"], "0$1"], ["(\\d{3})(\\d{6})", "$1 $2", ["800"], "0$1"], ["(\\d{5})(\\d{4,5})", "$1 $2", ["1(?:38|5[23]|69|76|94)", "1(?:(?:38|69)7|5(?:24|39)|768|946)", "1(?:3873|5(?:242|39[4-6])|(?:697|768)[347]|9467)"], "0$1"], ["(\\d{4})(\\d{5,6})", "$1 $2", ["1(?:[2-69][02-9]|[78])"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["[25]|7(?:0|6[02-9])", "[25]|7(?:0|6(?:[03-9]|2[356]))"], "0$1"], ["(\\d{4})(\\d{6})", "$1 $2", ["7"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[1389]"], "0$1"]], "0", 0, "0|180020", 0, 0, 0, [["(?:1(?:1(?:3(?:[0-58]\\d\\d|73[0-5])|4(?:(?:[0-5]\\d|70)\\d|69[7-9])|(?:(?:5[0-26-9]|[78][0-49])\\d|6(?:[0-4]\\d|5[01]))\\d)|(?:2(?:(?:0[024-9]|2[3-9]|3[3-79]|4[1-689]|[58][02-9]|6[0-47-9]|7[013-9]|9\\d)\\d|1(?:[0-7]\\d|8[0-3]))|(?:3(?:0\\d|1[0-8]|[25][02-9]|3[02-579]|[468][0-46-9]|7[1-35-79]|9[2-578])|4(?:0[03-9]|[137]\\d|[28][02-57-9]|4[02-69]|5[0-8]|[69][0-79])|5(?:0[1-35-9]|[16]\\d|2[024-9]|3[015689]|4[02-9]|5[03-9]|7[0-35-9]|8[0-468]|9[0-57-9])|6(?:0[034689]|1\\d|2[0-35689]|[38][013-9]|4[1-467]|5[0-69]|6[13-9]|7[0-8]|9[0-24578])|7(?:0[0246-9]|2\\d|3[0236-8]|4[03-9]|5[0-46-9]|6[013-9]|7[0-35-9]|8[024-9]|9[02-9])|8(?:0[35-9]|2[1-57-9]|3[02-578]|4[0-578]|5[124-9]|6[2-69]|7\\d|8[02-9]|9[02569])|9(?:0[02-589]|[18]\\d|2[02-689]|3[1-57-9]|4[2-9]|5[0-579]|6[2-47-9]|7[0-24578]|9[2-57]))\\d)\\d)|2(?:0[013478]|3[0189]|4[017]|8[0-46-9]|9[0-2])\\d{3})\\d{4}|1(?:2(?:0(?:46[1-4]|87[2-9])|545[1-79]|76(?:2\\d|3[1-8]|6[1-6])|9(?:7(?:2[0-4]|3[2-5])|8(?:2[2-8]|7[0-47-9]|8[3-5])))|3(?:6(?:38[2-5]|47[23])|8(?:47[04-9]|64[0157-9]))|4(?:044[1-7]|20(?:2[23]|8\\d)|6(?:0(?:30|5[2-57]|6[1-8]|7[2-8])|140)|8(?:052|87[1-3]))|5(?:2(?:4(?:3[2-79]|6\\d)|76\\d)|6(?:26[06-9]|686))|6(?:06(?:4\\d|7[4-79])|295[5-7]|35[34]\\d|47(?:24|61)|59(?:5[08]|6[67]|74)|9(?:55[0-4]|77[23]))|7(?:26(?:6[13-9]|7[0-7])|(?:442|688)\\d|50(?:2[0-3]|[3-68]2|76))|8(?:27[56]\\d|37(?:5[2-5]|8[239])|843[2-58])|9(?:0(?:0(?:6[1-8]|85)|52\\d)|3583|4(?:66[1-8]|9(?:2[01]|81))|63(?:23|3[1-4])|9561))\\d{3}", [9, 10]], ["7(?:457[0-57-9]|700[01]|911[028])\\d{5}|7(?:[1-3]\\d\\d|4(?:[0-46-9]\\d|5[0-689])|5(?:0[0-8]|[13-9]\\d|2[0-35-9])|7(?:0[1-9]|[1-7]\\d|8[02-9]|9[0-689])|8(?:[014-9]\\d|[23][0-8])|9(?:[024-9]\\d|1[02-9]|3[0-689]))\\d{6}", [10]], ["80[08]\\d{7}|800\\d{6}|8001111"], ["(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[2-49]))\\d{7}|845464\\d", [7, 10]], ["70\\d{8}", [10]], 0, ["(?:3[0347]|55)\\d{8}", [10]], ["76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}", [10]], ["56\\d{8}", [10]]], 0, " x"], "GD": ["1", "011", "(?:473|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "473$1", 0, "473", [["473(?:2(?:3[0-2]|69)|3(?:2[89]|86)|4(?:[06]8|3[5-9]|4[0-4]|5[59]|73|90)|63[68]|7(?:58|84)|800|938)\\d{4}"], ["473(?:4(?:0[2-79]|1[04-9]|2[0-5]|49|5[6-8])|5(?:2[01]|3[3-8])|901)\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "GE": ["995", "00", "(?:[3-57]\\d\\d|800)\\d{6}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["70"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["32"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[57]"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[348]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:3(?:[256]\\d|4[124-9]|7[0-4])|4(?:1\\d|2[2-7]|3[1-79]|4[2-8]|7[239]|9[1-7]))\\d{6}"], ["5(?:(?:(?:0555|1(?:[17]77|555))[5-9]|757(?:7[7-9]|8[01]))\\d|22252[0-4])\\d\\d|5(?:0(?:0(?:1[09]|70)|505)|1(?:0[01]0|1(?:07|33|51))|2(?:0[02]0|2[25]2)|3(?:0[03]0|3[35]3)|4(?:0[04]0|411)|5222|9000)[0-4]\\d{3}|(?:5(?:0(?:0(?:0\\d|1[12]|2[02]|3[0-6]|4[04]|5[05]|77|88|9[09])|(?:[14]\\d|77)\\d|22[02])|1(?:1(?:[03][01]|[124]\\d|5[02-6]|7[0-6])|4\\d\\d)|2(?:228|555)|3555|4(?:4(?:[02-9]\\d|14)|555)|5(?:[0157-9]\\d\\d|200|333|4(?:44|55))|6[89]\\d\\d|7(?:(?:[0147-9]\\d|22)\\d|5(?:00|[57]5))|8(?:0(?:[018]\\d|2[0-4])|5(?:55|8[89])|8(?:55|88))|9(?:090|[1-35-9]\\d\\d))|790\\d\\d)\\d{4}"], ["800\\d{6}"], 0, 0, 0, 0, 0, ["70[67]\\d{6}"]]], "GF": ["594", "00", "(?:694\\d|7093)\\d{5}|(?:59|[89]\\d)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[5-7]|80[6-9]|9[47]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[89]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:59(?:4(?:[02-49]\\d|1[0-5]|5[6-9]|6[0-3]|80)|88\\d)|80[6-9]\\d\\d)\\d{4}"], ["(?:694(?:[0-249]\\d|3[0-8])|7093[0-3])\\d{4}"], ["80[0-5]\\d{6}"], ["8[129]\\d{7}"], 0, 0, 0, 0, ["9(?:(?:396|76\\d)\\d|476[0-6])\\d{4}"]]], "GG": ["44", "00", "(?:1481|[357-9]\\d{3})\\d{6}|8\\d{6}(?:\\d{2})?", [7, 9, 10], 0, "0", 0, "([25-9]\\d{5})$|0|180020", "1481$1", 0, 0, [["1481[25-9]\\d{5}", [10]], ["7(?:(?:781|839)\\d|911[17])\\d{5}", [10]], ["80[08]\\d{7}|800\\d{6}|8001111"], ["(?:8(?:4[2-5]|7[0-3])|9(?:[01]\\d|8[0-3]))\\d{7}|845464\\d", [7, 10]], ["70\\d{8}", [10]], 0, ["(?:3[0347]|55)\\d{8}", [10]], ["76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}", [10]], ["56\\d{8}", [10]]]], "GH": ["233", "00", "[235]\\d{8}|800\\d{5,6}", [8, 9], [["(\\d{3})(\\d{5})", "$1 $2", ["8"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[2358]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["3082[0-5]\\d{4}|3(?:0(?:[237]\\d|8[01])|[167](?:2[0-6]|7\\d|80)|2(?:2[0-5]|7\\d|80)|3(?:2[0-3]|7\\d|80)|4(?:2[013-9]|3[01]|7\\d|80)|5(?:2[0-7]|7\\d|80)|8(?:2[0-2]|7\\d|80)|9(?:[28]0|7\\d))\\d{5}", [9]], ["(?:2(?:[0346-9]\\d|5[67])|5(?:[03-7]\\d|9[1-9]))\\d{6}", [9]], ["800\\d{5,6}"]]], "GI": ["350", "00", "(?:[25]\\d|60)\\d{6}", [8], [["(\\d{3})(\\d{5})", "$1 $2", ["2"]]], 0, 0, 0, 0, 0, 0, [["2190[0-2]\\d{3}|2(?:0(?:[02]\\d|3[01])|16[24-9]|2[2-5]\\d)\\d{4}"], ["5251[0-4]\\d{3}|(?:5(?:[146-8]\\d\\d|250)|60(?:1[01]|6\\d))\\d{4}"]]], "GL": ["299", "00", "(?:19|[2-689]\\d|70)\\d{4}", [6], [["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["19|[2-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:19|3[1-7]|[68][1-9]|70|9\\d)\\d{4}"], ["[245]\\d{5}"], ["80\\d{4}"], 0, 0, 0, 0, 0, ["3[89]\\d{4}"]]], "GM": ["220", "00", "[48]\\d{8}|[2-9]\\d{6}", [7, 9], [["(\\d{3})(\\d{4})", "$1 $2", ["[235-9]|4(?:[0-35]|4[16-9])"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[48]"]]], 0, 0, 0, 0, 0, 0, [["(?:4(?:[23]\\d\\d|4(?:1[024679]|(?:4(?:[237-9]\\d|4[14-9])|8[0-389]\\d)\\d|5(?:5(?:3\\d|4[0-7])|[67]\\d\\d)))|5(?:5(?:3\\d|4[0-7])|6[67]\\d|7(?:1[04]|2[035]|3[58]|48))|8[0-389]\\d\\d)\\d{3}|44[6-9]\\d{4}"], ["(?:(?:[23679]\\d|4[015]|8(?:(?:3[35]|6[68]|99)\\d|7(?:[27]\\d|4[015])))\\d|5(?:[0-489]\\d|56))\\d{4}|8[4-7]\\d{5}"]]], "GN": ["224", "00", "722\\d{6}|(?:3|6\\d)\\d{7}", [8, 9], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["3"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[67]"]]], 0, 0, 0, 0, 0, 0, [["3(?:0(?:24|3[12]|4[1-35-7]|5[13]|6[189]|[78]1|9[1478])|1\\d\\d)\\d{4}", [8]], ["6[0-356]\\d{7}", [9]], 0, 0, 0, 0, 0, 0, ["722\\d{6}", [9]]]], "GP": ["590", "00", "7090\\d{5}|(?:[56]9|[89]\\d)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[5-79]|80[6-9]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:59(?:0(?:0[1-68]|[14][0-24-9]|2[0-68]|3[1-9]|5[3-579]|[68][0-689]|7[08]|9\\d)|87\\d)|80[6-9]\\d\\d)\\d{4}"], ["(?:69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))|7090[0-4])\\d{4}"], ["80[0-5]\\d{6}"], ["8[129]\\d{7}"], 0, 0, 0, 0, ["9(?:(?:39[5-7]|76[018])\\d|475[0-6])\\d{4}"]]], "GQ": ["240", "00", "222\\d{6}|(?:3\\d|55|[89]0)\\d{7}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[235]"]], ["(\\d{3})(\\d{6})", "$1 $2", ["[89]"]]], 0, 0, 0, 0, 0, 0, [["33[0-24-9]\\d[46]\\d{4}|3(?:33|5\\d)\\d[7-9]\\d{4}"], ["(?:222|55\\d)\\d{6}"], ["80\\d[1-9]\\d{5}"], ["90\\d[1-9]\\d{5}"]]], "GR": ["30", "00", "5005000\\d{3}|8\\d{9,11}|(?:[269]\\d|70)\\d{8}", [10, 11, 12], [["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["21|7"]], ["(\\d{4})(\\d{6})", "$1 $2", ["2(?:2|3[2-57-9]|4[2-469]|5[2-59]|6[2-9]|7[2-69]|8[2-49])|5"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[2689]"]], ["(\\d{3})(\\d{3,4})(\\d{5})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["2(?:1\\d\\d|2(?:2[1-46-9]|[36][1-8]|4[1-7]|5[1-4]|7[1-5]|[89][1-9])|3(?:1\\d|2[1-57]|[35][1-3]|4[13]|7[1-7]|8[124-6]|9[1-79])|4(?:1\\d|2[1-8]|3[1-4]|4[13-5]|6[1-578]|9[1-5])|5(?:1\\d|[29][1-4]|3[1-5]|4[124]|5[1-6])|6(?:1\\d|[269][1-6]|3[1245]|4[1-7]|5[13-9]|7[14]|8[1-5])|7(?:1\\d|2[1-5]|3[1-6]|4[1-7]|5[1-57]|6[135]|9[125-7])|8(?:1\\d|2[1-5]|[34][1-4]|9[1-57]))\\d{6}", [10]], ["68[57-9]\\d{7}|(?:69|94)\\d{8}", [10]], ["800\\d{7,9}"], ["90[19]\\d{7}", [10]], ["70\\d{8}", [10]], 0, ["5005000\\d{3}", [10]], 0, 0, ["8(?:0[16]|12|[27]5|50)\\d{7}", [10]]]], "GT": ["502", "00", "80\\d{6}|(?:1\\d{3}|[2-7])\\d{7}", [8, 11], [["(\\d{4})(\\d{4})", "$1 $2", ["[2-8]"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"]]], 0, 0, 0, 0, 0, 0, [["[267][2-9]\\d{6}", [8]], ["(?:[3-5]\\d\\d|80[0-4])\\d{5}", [8]], ["18[01]\\d{8}", [11]], ["19\\d{9}", [11]]]], "GU": ["1", "011", "(?:[58]\\d\\d|671|900)\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "671$1", 0, "671", [["671(?:2\\d\\d|3(?:00|3[39]|4[349]|55|6[26])|4(?:00|56|7[1-9]|8[02-9])|5(?:55|6[2-5]|88)|6(?:3[2-578]|4[24-9]|5[34]|78|8[235-9])|7(?:[0479]7|2[0167]|3[45]|8[7-9])|8(?:[2-57-9]8|6[478])|9(?:2[29]|6[79]|7[1279]|8[7-9]|9[16-9]))\\d{4}"], [""], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "GW": ["245", "00", "[49]\\d{8}|4\\d{6}", [7, 9], [["(\\d{3})(\\d{4})", "$1 $2", ["40"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[49]"]]], 0, 0, 0, 0, 0, 0, [["443\\d{6}", [9]], ["9(?:5\\d|6[569]|77)\\d{6}", [9]], 0, 0, 0, 0, 0, 0, ["40\\d{5}", [7]]]], "GY": ["592", "001", "(?:[2-8]\\d{3}|9008)\\d{3}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[2-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:1[6-9]|2[0-35-9]|3[1-4]|5[3-9]|6\\d|7[0-79])|3(?:2[25-9]|3\\d)|4(?:4[0-24]|5[56])|50[0-6]|77[1-57])\\d{4}"], ["(?:51[01]|6\\d\\d|7(?:[0-5]\\d|6[0-79]|70|8[067]))\\d{4}"], ["(?:289|8(?:00|6[28]|88|99))\\d{4}"], ["9008\\d{3}"], 0, 0, 0, 0, ["515\\d{4}"]]], "HK": ["852", "00(?:30|5[09]|[126-9]?)", "8[0-46-9]\\d{6,7}|9\\d{4,7}|(?:[2-7]|9\\d{3})\\d{7}", [5, 6, 7, 8, 9, 11], [["(\\d{3})(\\d{2,5})", "$1 $2", ["900", "9003"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[2-7]|8[1-4]|9(?:0[1-9]|[1-8])"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"]], ["(\\d{3})(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["9"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:[13-9]\\d|2[013-9])\\d|3(?:(?:[1569][0-24-9]|4[0-246-9]|7[0-24-69])\\d|8(?:4[0-8]|[579]\\d|6[0-5]))|58(?:0[1-9]|1[2-9]))\\d{4}", [8]], ["(?:4(?:0(?:6[0-3]|9[3-6])|24[3-6]|44[0-35-9]|6(?:4[0-57-9]|6[0-6])|7(?:4[0-48]|6[0-5]))|5(?:25[3-7]|35[4-8]|73[0-6]|95[0-8])|6(?:26[013-8]|(?:66|78)[0-5])|7(?:0(?:7[1-8]|8[0-8])|10[1-4])|84(?:4[0-2]|8[0-35-9])|9(?:29[013-9]|39[014-9]|59[0-467]|899))\\d{4}|(?:4(?:4[0-35-9]|6[0-357-9]|7[0-35])|5(?:[1-59][0-46-9]|6[0-4689]|7[0-246-9])|6(?:0[1-9]|[13-59]\\d|[268][0-57-9]|7[0-79])|70[1-59]|84[0-39]|9(?:0[1-9]|1[02-9]|[2358][0-8]|[467]\\d))\\d{5}", [8]], ["800\\d{6}", [9]], ["900(?:[0-24-9]\\d{7}|3\\d{1,4})", [5, 6, 7, 8, 11]], ["8(?:1[0-4679]\\d|2(?:[0-36]\\d|7[0-4])|3(?:[034]\\d|2[09]|70))\\d{4}", [8]], 0, ["30(?:0[1-9]|[15-7]\\d|2[047]|89)\\d{4}", [8]], ["7(?:1(?:0[08]|1[0-3679]|3[013]|69|9[0136])|2(?:[02389]\\d|1[18]|7[27-9])|3(?:[0-38]\\d|7[0-369]|9[2357-9])|47\\d|5(?:[178]\\d|5[0-5])|6(?:0[0-7]|2[236-9]|[35]\\d)|7(?:[27]\\d|8[7-9])|8(?:[23689]\\d|7[1-9])|9(?:[025]\\d|6[0-246-8]|7[0-36-9]|8[238]))\\d{4}", [8]]], "00"], "HN": ["504", "00", "8\\d{10}|[237-9]\\d{7}", [8, 11], [["(\\d{4})(\\d{4})", "$1-$2", ["[237-9]"]]], 0, 0, 0, 0, 0, 0, [["2(?:2(?:0[0-59]|1[1-9]|[23]\\d|4[02-8]|5[57]|6[2458]|7[0135689]|8[01346-9]|9[0-2])|4(?:0[578]|2[3-59]|3[13-9]|4[0-68]|5[1-3589]|80)|5(?:0[2357-9]|1[1-6]|4[03-58]|5\\d|6[014-69]|7[04]|80)|6(?:[056]\\d|17|2[067]|3[047]|4[0-378]|[78][0-8]|9[01])|7(?:0[5-79]|2[01]|6[46-9]|7[02-9]|8[034]|91)|8(?:79|8[0-357-9]|9[1-57-9]))\\d{4}", [8]], ["[37-9]\\d{7}", [8]], ["8002\\d{7}", [11]]]], "HR": ["385", "00", "[2-69]\\d{8}|80\\d{5,7}|[1-79]\\d{7}|6\\d{6}", [7, 8, 9], [["(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", ["6[01]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", ["8"], "0$1"], ["(\\d)(\\d{4})(\\d{3})", "$1 $2 $3", ["1"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["6|7[245]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["9"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[2-57]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1\\d{7}|(?:2[0-3]|3[1-5]|4[02-47-9]|5[1-3])\\d{6,7}", [8, 9]], ["9(?:(?:0[1-9]|[12589]\\d)\\d\\d|7(?:[0679]\\d\\d|5(?:[01]\\d|44|55|77|9[5-79])))\\d{4}|98\\d{6}", [8, 9]], ["80\\d{5,7}"], ["6[01459]\\d{6}|6[01]\\d{5}", [7, 8]], ["7[45]\\d{6}", [8]], 0, ["62\\d{6,7}|72\\d{6}", [8, 9]]]], "HT": ["509", "00", "[2-589]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["[2-589]"]]], 0, 0, 0, 0, 0, 0, [["2(?:2\\d|5[1-5]|81|9[149])\\d{5}"], ["(?:[34]\\d|5[568])\\d{6}"], ["8\\d{7}"], 0, 0, 0, 0, 0, ["9(?:[67][0-4]|8[0-3589]|9\\d)\\d{5}"]]], "HU": ["36", "00", "[235-7]\\d{8}|[1-9]\\d{7}", [8, 9], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["1"], "(06 $1)"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6|8[2-57-9]|9[2-69]"], "(06 $1)"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[2-9]"], "06 $1"]], "06", 0, 0, 0, 0, 0, [["(?:1\\d|[27][2-9]|3[2-7]|4[24-9]|5[2-79]|6[23689]|8[2-57-9]|9[2-69])\\d{6}", [8]], ["(?:[257]0|3[01])\\d{7}", [9]], ["(?:[48]0\\d|680[29])\\d{5}"], ["9[01]\\d{6}", [8]], 0, 0, ["38\\d{7}", [9]], 0, ["21\\d{7}", [9]]]], "ID": ["62", "00[89]", "00[1-9]\\d{9,14}|(?:[1-36]|8\\d{5})\\d{6}|00\\d{9}|[1-9]\\d{8,10}|[2-9]\\d{7}", [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["15"]], ["(\\d{2})(\\d{5,9})", "$1 $2", ["2[124]|[36]1"], "(0$1)"], ["(\\d{3})(\\d{5,7})", "$1 $2", ["800"], "0$1"], ["(\\d{3})(\\d{5,8})", "$1 $2", ["[2-79]"], "(0$1)"], ["(\\d{3})(\\d{3,4})(\\d{3})", "$1-$2-$3", ["8[1-35-9]"], "0$1"], ["(\\d{3})(\\d{6,8})", "$1 $2", ["1"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["804"], "0$1"], ["(\\d{3})(\\d)(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["80"], "0$1"], ["(\\d{3})(\\d{4})(\\d{4,5})", "$1-$2-$3", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["2[124]\\d{7,8}|619\\d{8}|2(?:1(?:14|500)|2\\d{3})\\d{3}|61\\d{5,8}|(?:2(?:[35][1-4]|6[0-8]|7[1-6]|8\\d|9[1-8])|3(?:1|[25][1-8]|3[1-68]|4[1-3]|6[1-3568]|7[0-469]|8\\d)|4(?:0[1-589]|1[01347-9]|2[0-36-8]|3[0-24-68]|43|5[1-378]|6[1-5]|7[134]|8[1245])|5(?:1[1-35-9]|2[25-8]|3[124-9]|4[1-3589]|5[1-46]|6[1-8])|6(?:[25]\\d|3[1-69]|4[1-6])|7(?:02|[125][1-9]|[36]\\d|4[1-8]|7[0-36-9])|9(?:0[12]|1[013-8]|2[0-479]|5[125-8]|6[23679]|7[159]|8[01346]))\\d{5,8}", [7, 8, 9, 10, 11]], ["8[1-35-9]\\d{7,10}", [9, 10, 11, 12]], ["00(?:1803\\d{5,11}|7803\\d{7})|(?:177\\d|800)\\d{5,7}", [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]], ["809\\d{7}", [10]], 0, 0, ["(?:1500|8071\\d{3})\\d{3}", [7, 10]], 0, 0, ["804\\d{7}", [10]]]], "IE": ["353", "00", "(?:1\\d|[2569])\\d{6,8}|4\\d{6,9}|7\\d{8}|8\\d{8,9}", [7, 8, 9, 10], [["(\\d{2})(\\d{5})", "$1 $2", ["2[24-9]|47|58|6[237-9]|9[35-9]"], "(0$1)"], ["(\\d{3})(\\d{5})", "$1 $2", ["[45]0"], "(0$1)"], ["(\\d)(\\d{3,4})(\\d{4})", "$1 $2 $3", ["1"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[2569]|4[1-69]|7[14]"], "(0$1)"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["70"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["81"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[78]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1"]], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["4"], "(0$1)"], ["(\\d{2})(\\d)(\\d{3})(\\d{4})", "$1 $2 $3 $4", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:1\\d|21)\\d{6,7}|(?:2[24-9]|4(?:0[24]|5\\d|7)|5(?:0[45]|1\\d|8)|6(?:1\\d|[237-9])|9(?:1\\d|[35-9]))\\d{5}|(?:23|4(?:[1-469]|8\\d)|5[23679]|6[4-6]|7[14]|9[04])\\d{7}"], ["8(?:22|[35-9]\\d)\\d{6}", [9]], ["1800\\d{6}", [10]], ["15(?:1[2-8]|[2-8]0|9[089])\\d{6}", [10]], ["700\\d{6}", [9]], ["88210[1-9]\\d{4}|8(?:[35-79]5\\d\\d|8(?:[013-9]\\d\\d|2(?:[01][1-9]|[2-9]\\d)))\\d{5}", [10]], ["818\\d{6}", [9]], 0, ["76\\d{7}", [9]], ["18[59]0\\d{6}", [10]]]], "IL": ["972", "0(?:0|1(?:05|[2-9]))", "1\\d{6}(?:\\d{3,5})?|[57]\\d{8}|[1-489]\\d{7}", [7, 8, 9, 10, 11, 12], [["(\\d{4})(\\d{3})", "$1-$2", ["125"]], ["(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3", ["121"]], ["(\\d)(\\d{3})(\\d{4})", "$1-$2-$3", ["[2-489]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", ["[57]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3})", "$1-$2-$3", ["12"]], ["(\\d{4})(\\d{6})", "$1-$2", ["159"]], ["(\\d)(\\d{3})(\\d{3})(\\d{3})", "$1-$2-$3-$4", ["1[7-9]"]], ["(\\d{3})(\\d{1,2})(\\d{3})(\\d{4})", "$1-$2 $3-$4", ["15"]]], "0", 0, 0, 0, 0, 0, [["153\\d{8,9}|29[1-9]\\d{5}|(?:2[0-8]|[3489]\\d)\\d{6}", [8, 11, 12]], ["55(?:4(?:0[0-4]|10|6[015-9])|57[0-289]|8[06][0-2])\\d{4}|5(?:(?:[0-2][02-9]|[36]\\d|[49][2-9]|8[3-7])\\d|5(?:01|2\\d|3[0-3]|4[3-5]|5[0-25689]|6[6-8]|7[0-267]|8[7-9]|9[1-9]))\\d{5}", [9]], ["1(?:255|80[019]\\d{3})\\d{3}", [7, 10]], ["1212\\d{4}|1(?:200|9(?:0[0-2]|19|9\\d))\\d{6}", [8, 10]], 0, ["151\\d{8,9}", [11, 12]], ["1599\\d{6}", [10]], 0, ["7(?:280[01]|38(?:[05]\\d|8[0-358])|8(?:33|55|77|81)\\d)\\d{4}|7(?:18|2[23]|3[237]|47|6[258]|7\\d|82|9[2-9])\\d{6}", [9]], ["1700\\d{6}", [10]]]], "IM": ["44", "00", "1624\\d{6}|(?:[3578]\\d|90)\\d{8}", [10], 0, "0", 0, "([25-8]\\d{5})$|0|180020", "1624$1", 0, "74576|(?:16|7[56])24", [["1624(?:230|[5-8]\\d\\d)\\d{3}"], ["76245[06]\\d{4}|7(?:4576|[59]24\\d|624[0-4689])\\d{5}"], ["808162\\d{4}"], ["8(?:440[49]06|72299\\d)\\d{3}|(?:8(?:45|70)|90[0167])624\\d{4}"], ["70\\d{8}"], 0, ["3440[49]06\\d{3}|(?:3(?:08162|3\\d{4}|45624|7(?:0624|2299))|55\\d{4})\\d{4}"], 0, ["56\\d{8}"]]], "IN": ["91", "00", "(?:000800|[2-9]\\d\\d)\\d{7}|1\\d{7,12}", [8, 9, 10, 11, 12, 13], [["(\\d{8})", "$1", ["5(?:0|2[23]|3[03]|[67]1|88)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|888)", "5(?:0|2(?:21|3)|3(?:0|3[23])|616|717|8888)"], 0, 1], ["(\\d{4})(\\d{4,5})", "$1 $2", ["180", "1800"], 0, 1], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["140"], 0, 1], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["11|2[02]|33|4[04]|79[1-6]|80[2-46]", "11|2[02]|33|4[04]|79[1-6]|80(?:[2-4]|6[0-589])", "11|2[02]|33|4[04]|79(?:[124-6]|3(?:[02-9]|1[0-24-9]))|80(?:[2-4]|6[0-589])"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["1(?:2[0-249]|3[0-25]|4[145]|[68]|7[1257])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|5[12]|[78]1)|6(?:12|[2-4]1|5[17]|6[13]|80)|7(?:12|3[134]|61|88)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)|(?:43|59|75)[15]|(?:1[59]|29|67)[14]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|674|7(?:(?:3[34]|5[15])[2-6]|61[346]|88[0-8])|8(?:70[2-6]|84[235-7]|91[3-7])|(?:1(?:29|60|8[06])|261|552|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|31)|8(?:16|2[014]|3[126]|6[136]|7[78]|83))[2-7]", "1(?:2[0-24]|3[0-25]|4[145]|[59][14]|6[1-9]|7[1257]|8[1-57-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[058]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12(?:[2-6]|7[0-8])|74[2-7])|7(?:3171|5[15][2-6]|61[346]|88(?:[2-7]|82))|8(?:70[2-6]|84(?:[2356]|7[19])|91(?:[3-6]|7[19]))|73[134][2-6]|8(?:16|2[014]|3[126]|6[136]|7[78]|83)(?:[2-6]|7[19])|(?:1(?:29|60|8[06])|261|552|6(?:[2-4]1|5[17]|6[13]|7(?:1|4[0189])|80)|7(?:12|88[01]))[2-7]"], "0$1", 1], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2[2457-9]|3[2-5]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[1-6])|7(?:1[013-9]|3[129]|5[29]|6[02-5]|70)|807", "1(?:[2-479]|5[0235-9])|[2-5]|6(?:1[1358]|2(?:[2457]|84|95)|3(?:[2-4]|55)|4[235-7]|5[2-689]|6[24578]|7(?:[23569]|8[0-57-9])|8[1-6])|7(?:1(?:[013-8]|9[6-9])|3(?:17|2[0-49]|9[2-57])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4|5[0-367])|70[13-7])|807[19]", "1(?:[2-479]|5(?:[0236-9]|5[013-9]))|[2-5]|6(?:2(?:84|95)|355|8(?:28[235-7]|3))|73179|807(?:1|9[1-3])|(?:1552|6(?:(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578])\\d|7(?:[23569]\\d|8[0-57-9])|8(?:[14-6]\\d|2[0-79]))|7(?:1(?:[013-8]\\d|9[6-9])|3(?:2[0-49]|9[2-57])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]))[2-7]"], "0$1", 1], ["(\\d{5})(\\d{5})", "$1 $2", ["16|[6-9]"], "0$1", 1], ["(\\d{4})(\\d{2,4})(\\d{4})", "$1 $2 $3", ["18[06]", "18[06]0"], 0, 1], ["(\\d{4})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["18"], 0, 1]], "0", 0, 0, 0, 0, 0, [["(?:2717(?:[2-7]\\d|95)|6828[235-7]\\d)\\d{4}|(?:170[24]|280[13468]|4(?:20[24]|72[2-8])|552[1-7])\\d{6}|(?:271[0-689]|682[0-79]|782[0-6])[2-7]\\d{5}|(?:2(?:[02][2-79]|90)|3(?:23|80)|683|79[1-6])\\d{7}|(?:11|33|4[04]|80)[2-7]\\d{7}|(?:342|674|788)(?:[0189][2-7]|[2-7]\\d)\\d{5}|(?:1(?:2[0-249]|3[0-25]|4[145]|[59][14]|6[014]|7[1257]|8[01346])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[13]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[0-26-9]|7[014-9]|8[013-57]|9[014-7])|5(?:1[025]|22|[36][25]|4[28]|[578]1|9[15])|6(?:12|[2-47]1|5[17]|6[13]|80)|7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1)|8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91))[2-7]\\d{6}|(?:1(?:2[35-8]|3[346-9]|4[236-9]|[59][0235-9]|6[235-9]|7[34689]|8[257-9])|2(?:1[134689]|3[24-8]|4[2-8]|5[25689]|6[2-4679]|7[3-79]|8[2-479]|9[235-9])|3(?:01|1[79]|2[1245]|4[5-8]|5[125689]|6[235-7]|7[157-9]|8[2-46-8])|4(?:1[14578]|2[5689]|3[2-467]|5[4-7]|6[35]|73|8[2689]|9[2389])|5(?:[16][146-9]|2[14-8]|3[1346]|4[14-69]|5[46]|7[2-4]|8[2-8]|9[246])|6(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578]|7[235689]|8[14-6])|7(?:1[013-9]|2[0235-9]|3[2679]|4[1-35689]|5[2-46-9]|[67][02-9]|8[013-7]|90)|8(?:1[1357-9]|2[235-8]|3[03-57-9]|4[0-24-9]|5\\d|6[2457-9]|7[1-6]|8[1256]|9[2-4]))\\d[2-7]\\d{5}", [10]], ["(?:6(?:1279|828[01489])|7(?:887[02-9]|9313)|8(?:079[04-9]|(?:84|91)7[02-8]))\\d{5}|(?:160[01]|6(?:(?:12|[2-4]1|5[17]|6[13]|80)[0189]|7(?:1[0189]|86))|7(?:1(?:2[0189]|9[0-5])|3(?:2[5-8]|[34][017-9]|9[016-9])|5(?:[15][017-9]|2[04-9]|9[7-9])|6(?:0[0-47]|1[0-257-9]|2[0-4]|3[19]|5[4589])|70[0289]|88[089])|8(?:0(?:6[67]|7[02-8])|70[017-9]|84[01489]|91[0-289]))\\d{6}|(?:731|8(?:16|2[014]|3[126]|6[136]|7[78]|83))(?:[0189]\\d|7[02-8])\\d{5}|(?:6(?:(?:1[1358]|2[2457]|3[2-4]|4[235-7]|5[2-689]|6[24578])\\d|7(?:[23569]\\d|4[0189]|8[0-57-9])|8(?:[14-6]\\d|2[0-79]))|7(?:1(?:[013-8]\\d|9[6-9])|3(?:2[0-49]|9[2-5])|5(?:2[1-3]|9[0-6])|6(?:0[5689]|2[5-9]|3[02-8]|4\\d|5[0-367])|70[13-7]|881))[0189]\\d{5}|(?:6(?:[09]\\d|1[04679]|2[03689]|3[05-9]|4[0489]|50|6[069]|7[07]|8[7-9])|7(?:[024]\\d|3[05-8]|5[0346-8]|6[6-9]|7[1-9]|8[0-79]|9[07-9])|8(?:0[01589]|1[0-57-9]|2[235-9]|3[03-57-9]|[45]\\d|6[02457-9]|7[1-69]|8[0-25-9]|9[02-9])|9\\d\\d)\\d{7}", [10]], ["000800\\d{7}|180(?:0\\d{4,9}|3\\d{9})"], ["186[12]\\d{9}", [13]], 0, 0, ["140\\d{7}", [10]], 0, 0, ["1860\\d{7}", [11]]]], "IO": ["246", "00", "3\\d{6}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["3"]]], 0, 0, 0, 0, 0, 0, [["37\\d{5}"], ["38\\d{5}"]]], "IQ": ["964", "00", "(?:1|7\\d\\d)\\d{7}|[2-6]\\d{7,8}", [8, 9, 10], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["1"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[2-6]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["7"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1\\d{7}|(?:2[13-5]|3[02367]|4[023]|5[03]|6[026])\\d{6,7}", [8, 9]], ["7[3-9]\\d{8}", [10]]]], "IR": ["98", "00", "[1-9]\\d{9}|(?:[1-8]\\d\\d|9)\\d{3,4}", [4, 5, 6, 7, 10], [["(\\d{4,5})", "$1", ["96"], "0$1"], ["(\\d{2})(\\d{4,5})", "$1 $2", ["(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])[12689]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["9"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["[1-8]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:1[137]|2[13-68]|3[1458]|4[145]|5[1468]|6[16]|7[1467]|8[13467])(?:[03-57]\\d{7}|[16]\\d{3}(?:\\d{4})?|[289]\\d{3}(?:\\d(?:\\d{3})?)?)|94(?:000[09]|(?:12\\d|30[0-2])\\d|2(?:[02689]0\\d|121)|4(?:111|40\\d))\\d{4}", [6, 7, 10]], ["9(?:(?:0[0-5]|[13]\\d|2[0-3])\\d\\d|9(?:[0-46]\\d\\d|5(?:10|5\\d)|8(?:[12]\\d|3[0-2]|88)|9(?:[0-359]\\d|69|77|8[7-9])))\\d{5}", [10]], 0, 0, 0, 0, ["96(?:0[12]|2[16-8]|3(?:08|[14]5|[23]|66)|4(?:0|80)|5[01]|6[89]|86|9[19])", [4, 5]]]], "IS": ["354", "00|1(?:0(?:01|[12]0)|100)", "(?:38\\d|[4-9])\\d{6}", [7, 9], [["(\\d{3})(\\d{4})", "$1 $2", ["[4-9]"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["3"]]], 0, 0, 0, 0, 0, 0, [["(?:4(?:1[0-24-69]|2[0-7]|[37][0-8]|4[0-24589]|5[0-68]|6\\d|8[0-36-8])|5(?:05|[156]\\d|2[02578]|3[0-579]|4[03-7]|7[0-2578]|8[0-35-9]|9[013-689])|872)\\d{4}", [7]], ["(?:38[589]\\d\\d|6(?:1[1-8]|2[0-6]|3[026-9]|4[014679]|5[0159]|6[0-69]|70|8[06-8]|9\\d)|7(?:5[057]|[6-9]\\d)|8(?:2[0-59]|[3-69]\\d|8[238]))\\d{4}"], ["80[0-8]\\d{4}", [7]], ["90(?:0\\d|1[5-79]|2[015-79]|3[135-79]|4[125-7]|5[25-79]|7[1-37]|8[0-35-7])\\d{3}", [7]], 0, ["(?:689|8(?:7[18]|80)|95[48])\\d{4}", [7]], ["809\\d{4}", [7]], 0, ["49[0-24-79]\\d{4}", [7]]], "00"], "IT": ["39", "00", "0\\d{5,11}|1\\d{8,10}|3(?:[0-8]\\d{7,10}|9\\d{7,8})|(?:43|55|70)\\d{8}|8\\d{5}(?:\\d{2,4})?", [6, 7, 8, 9, 10, 11, 12], [["(\\d{2})(\\d{4,6})", "$1 $2", ["0[26]"]], ["(\\d{3})(\\d{3,6})", "$1 $2", ["0[13-57-9][0159]|8(?:03|4[17]|9[2-5])", "0[13-57-9][0159]|8(?:03|4[17]|9(?:2|3[04]|[45][0-4]))"]], ["(\\d{4})(\\d{2,6})", "$1 $2", ["0(?:[13-579][2-46-8]|8[236-8])"]], ["(\\d{4})(\\d{4})", "$1 $2", ["894"]], ["(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", ["0[26]|5"]], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["1(?:44|[679])|[378]|43"]], ["(\\d{3})(\\d{3,4})(\\d{4})", "$1 $2 $3", ["0[13-57-9][0159]|14"]], ["(\\d{2})(\\d{4})(\\d{5})", "$1 $2 $3", ["0[26]"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["0"]], ["(\\d{3})(\\d{4})(\\d{4,5})", "$1 $2 $3", ["[03]"]]], 0, 0, 0, 0, 0, 0, [["0(?:669[0-79]\\d{1,6}|831\\d{2,8})|0(?:1(?:[0159]\\d|[27][1-5]|31|4[1-4]|6[1356]|8[2-57])|2\\d\\d|3(?:[0159]\\d|2[1-4]|3[12]|[48][1-6]|6[2-59]|7[1-7])|4(?:[0159]\\d|[23][1-9]|4[245]|6[1-5]|7[1-4]|81)|5(?:[0159]\\d|2[1-5]|3[2-6]|4[1-79]|6[4-6]|7[1-578]|8[3-8])|6(?:[0-57-9]\\d|6[0-8])|7(?:[0159]\\d|2[12]|3[1-7]|4[2-46]|6[13569]|7[13-6]|8[1-59])|8(?:[0159]\\d|2[3-578]|3[2356]|[6-8][1-5])|9(?:[0159]\\d|[238][1-5]|4[12]|6[1-8]|7[1-6]))\\d{2,7}"], ["3[2-9]\\d{7,8}|(?:31|43)\\d{8}", [9, 10]], ["80(?:0\\d{3}|3)\\d{3}", [6, 9]], ["(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}", [6, 8, 9, 10]], ["1(?:78\\d|99)\\d{6}", [9, 10]], ["3[2-8]\\d{9,10}", [11, 12]], 0, 0, ["55\\d{8}", [10]], ["84(?:[08]\\d{3}|[17])\\d{3}", [6, 9]]]], "JE": ["44", "00", "1534\\d{6}|(?:[3578]\\d|90)\\d{8}", [10], 0, "0", 0, "([0-24-8]\\d{5})$|0|180020", "1534$1", 0, 0, [["1534[0-24-8]\\d{5}"], ["7(?:(?:(?:50|82)9|937)\\d|7(?:00[378]|97\\d))\\d{5}"], ["80(?:07(?:35|81)|8901)\\d{4}"], ["(?:8(?:4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|90(?:066[59]|1810|71(?:07|55)))\\d{4}"], ["701511\\d{4}"], 0, ["(?:3(?:0(?:07(?:35|81)|8901)|3\\d{4}|4(?:4(?:4(?:05|42|69)|703)|5(?:041|800))|7(?:0002|1206))|55\\d{4})\\d{4}"], ["76(?:464|652)\\d{5}|76(?:0[0-28]|2[356]|34|4[01347]|5[49]|6[0-369]|77|8[14]|9[139])\\d{6}"], ["56\\d{8}"]]], "JM": ["1", "011", "(?:[58]\\d\\d|658|900)\\d{7}", [10], 0, "1", 0, 0, 0, 0, "658|876", [["8766060\\d{3}|(?:658(?:2(?:[5-8]\\d|9[0-46-9])|[3-9]\\d\\d)|876(?:52[35]|6(?:0[1-3579]|1[0235-9]|[23]\\d|40|5[06]|6[2-589]|7[0-25-9]|8[04]|9[4-9])|7(?:0[2-689]|[1-6]\\d|8[056]|9[45])|9(?:0[1-8]|1[02378]|[2-8]\\d|9[2-468])))\\d{4}"], ["(?:6582(?:[0-4]\\d|95)|876(?:2(?:0[1-9]|[13-9]\\d|2[013-9])|[348]\\d\\d|5(?:0[1-9]|[1-9]\\d)|6(?:4[89]|6[67])|7(?:0[07]|7\\d|8[1-47-9]|9[0-36-9])|9(?:[01]9|9[0579])))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "JO": ["962", "00", "(?:(?:[2689]|7\\d)\\d|32|427|53)\\d{6}", [8, 9], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["[2356]|87"], "(0$1)"], ["(\\d{3})(\\d{5,6})", "$1 $2", ["[89]"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["70"], "0$1"], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["[47]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["87(?:000|90[01])\\d{3}|(?:2(?:6(?:2[0-35-9]|3[0-578]|4[24-7]|5[0-24-8]|[6-8][023]|9[0-3])|7(?:0[1-79]|10|2[014-7]|3[0-689]|4[019]|5[0-3578]))|32(?:0[1-69]|1[1-35-7]|2[024-7]|3\\d|4[0-3]|[5-7][023])|53(?:0[0-3]|[13][023]|2[0-59]|49|5[0-35-9]|6[15]|7[45]|8[1-6]|9[0-36-9])|6(?:2(?:[05]0|22)|3(?:00|33)|4(?:0[0-25]|1[2-7]|2[0569]|[38][07-9]|4[025689]|6[0-589]|7\\d|9[0-2])|5(?:[01][056]|2[034]|3[0-57-9]|4[178]|5[0-69]|6[0-35-9]|7[1-379]|8[0-68]|9[0239]))|87(?:20|7[078]|99))\\d{4}", [8]], ["(?:427|7(?:11|[29]\\d|[78][0-25-9]))\\d{6}", [9]], ["80\\d{6}", [8]], ["9\\d{7}", [8]], ["70\\d{7}", [9]], 0, ["8(?:10|8\\d)\\d{5}", [8]], ["74(?:66|77)\\d{5}", [9]], 0, ["85\\d{6}", [8]]]], "JP": ["81", "010", "00[1-9]\\d{6,14}|[25-9]\\d{9}|(?:00|[1-9]\\d\\d)\\d{6}", [8, 9, 10, 11, 12, 13, 14, 15, 16, 17], [["(\\d{3})(\\d{3})(\\d{3})", "$1-$2-$3", ["(?:12|57|99)0"], "0$1"], ["(\\d{4})(\\d)(\\d{4})", "$1-$2-$3", ["1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|499|5(?:76|97)|746|8(?:3[89]|47|51)|9(?:80|9[16])", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:76|97)9|7468|8(?:3(?:8[7-9]|96)|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]", "1(?:267|3(?:7[247]|9[278])|466|5(?:47|58|64)|6(?:3[245]|48|5[4-68]))|499[2468]|5(?:769|979[2-69])|7468|8(?:3(?:8[7-9]|96[2457-9])|477|51[2-9])|9(?:802|9(?:1[23]|69))|1(?:45|58)[67]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", ["60"], "0$1"], ["(\\d)(\\d{4})(\\d{4})", "$1-$2-$3", ["3|4(?:2[09]|7[01])|6[1-9]", "3|4(?:2(?:0|9[02-69])|7(?:0[019]|1))|6[1-9]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", ["1(?:1|5[45]|77|88|9[69])|2(?:2[1-37]|3[0-269]|4[59]|5|6[24]|7[1-358]|8[1369]|9[0-38])|4(?:[28][1-9]|3[0-57]|[45]|6[248]|7[2-579]|9[29])|5(?:2|3[0459]|4[0-369]|5[29]|8[02389]|9[0-389])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9[2-6])|8(?:2[124589]|3[26-9]|49|51|6|7[0-468]|8[68]|9[019])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9[1-489])", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2(?:[127]|3[014-9])|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9[19])|62|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|8[1-9]|9[29])|5(?:2|3(?:[045]|9[0-8])|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0-2469])|3(?:[29]|60)|49|51|6(?:[0-24]|36|5[0-3589]|7[23]|9[01459])|7[0-468]|8[68])|9(?:[23][1-9]|4[15]|5[138]|6[1-3]|7[156]|8[189]|9(?:[1289]|3[34]|4[0178]))|(?:264|837)[016-9]|2(?:57|93)[015-9]|(?:25[0468]|422|838)[01]|(?:47[59]|59[89]|8(?:6[68]|9))[019]", "1(?:1|5(?:4[018]|5[017])|77|88|9[69])|2(?:2[127]|3[0-269]|4[59]|5(?:[1-3]|5[0-69]|9(?:17|99))|6(?:2|4[016-9])|7(?:[1-35]|8[0189])|8(?:[16]|3[0134]|9[0-5])|9(?:[028]|17))|4(?:2(?:[13-79]|8[014-6])|3[0-57]|[45]|6[248]|7[2-47]|9[29])|5(?:2|3(?:[045]|9(?:[0-58]|6[4-9]|7[0-35689]))|4[0-369]|5[29]|8[02389]|9[0-3])|7(?:2[02-46-9]|34|[58]|6[0249]|7[57]|9(?:[23]|4[0-59]|5[01569]|6[0167]))|8(?:2(?:[1258]|4[0-39]|9[0169])|3(?:[29]|60|7(?:[017-9]|6[6-8]))|49|51|6(?:[0-24]|36[2-57-9]|5(?:[0-389]|5[23])|6(?:[01]|9[178])|7(?:2[2-468]|3[78])|9[0145])|7[0-468]|8[68])|9(?:4[15]|5[138]|7[156]|8[189]|9(?:[1289]|3(?:31|4[357])|4[0178]))|(?:8294|96)[1-3]|2(?:57|93)[015-9]|(?:223|8699)[014-9]|(?:25[0468]|422|838)[01]|(?:48|8292|9[23])[1-9]|(?:47[59]|59[89]|8(?:68|9))[019]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{4})", "$1-$2-$3", ["[14]|[289][2-9]|5[3-9]|7[2-4679]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1-$2-$3", ["800"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", ["[25-9]"], "0$1"]], "0", 0, "(000[2569]\\d{4,6})$|(?:(?:003768)0?)|0", "$1", 0, 0, [["(?:1(?:1[235-8]|2[3-6]|3[3-9]|4[2-6]|[58][2-8]|6[2-7]|7[2-9]|9[1-9])|(?:2[2-9]|[36][1-9])\\d|4(?:[2-578]\\d|6[02-8]|9[2-59])|5(?:[2-589]\\d|6[1-9]|7[2-8])|7(?:[25-9]\\d|3[4-9]|4[02-9])|8(?:[2679]\\d|3[2-9]|4[5-9]|5[1-9]|8[03-9])|9(?:[2-58]\\d|[679][1-9]))\\d{6}", [9]], ["[6-9]0[1-9]\\d{7}", [10]], ["00777(?:[01]|5\\d)\\d\\d|(?:00(?:7778|882[1245])|(?:120|800\\d)\\d\\d)\\d{4}|00(?:37|66|78)\\d{6,13}"], ["990\\d{6}", [9]], ["60\\d{7}", [9]], 0, ["570\\d{6}", [9]], ["20\\d{8}", [10]], ["50[1-9]\\d{7}", [10]]]], "KE": ["254", "000", "(?:[17]\\d\\d|900)\\d{6}|(?:2|80)0\\d{6,7}|[4-6]\\d{6,8}", [7, 8, 9, 10], [["(\\d{2})(\\d{5,7})", "$1 $2", ["[24-6]"], "0$1"], ["(\\d{3})(\\d{6})", "$1 $2", ["[17]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[89]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:4[245]|5[1-79]|6[01457-9])\\d{5,7}|(?:4[136]|5[08]|62)\\d{7}|(?:[24]0|66)\\d{6,7}", [7, 8, 9]], ["(?:1(?:0[0-8]|[18]\\d|2[014]|30|4[0-5])|7\\d\\d)\\d{6}", [9]], ["800[02-8]\\d{5,6}", [9, 10]], ["900[02-9]\\d{5}", [9]]]], "KG": ["996", "00", "8\\d{9}|[235-9]\\d{8}", [9, 10], [["(\\d{4})(\\d{5})", "$1 $2", ["3(?:1[346]|[24-79])"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[235-79]|88"], "0$1"], ["(\\d{3})(\\d{3})(\\d)(\\d{2,3})", "$1 $2 $3 $4", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["312(?:5[0-79]\\d|9(?:[0-689]\\d|7[0-24-9]))\\d{3}|(?:3(?:1(?:2[0-46-8]|3[1-9]|47|[56]\\d)|2(?:22|3[0-479]|6[0-7])|4(?:22|5[6-9]|6\\d)|5(?:22|3[4-7]|59|6\\d)|6(?:22|5[35-7]|6\\d)|7(?:22|3[468]|4[1-9]|59|[67]\\d)|9(?:22|4[1-8]|6\\d))|6(?:09|12|2[2-4])\\d)\\d{5}", [9]], ["312(?:58\\d|973)\\d{3}|(?:2(?:0[0-35]|2\\d)|5[0-24-7]\\d|600|7(?:[07]\\d|55)|88[08]|9(?:12|9[05-9]))\\d{6}", [9]], ["800\\d{6,7}"]]], "KH": ["855", "00[14-9]", "1\\d{9}|[1-9]\\d{7,8}", [8, 9, 10], [["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[1-9]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1"]]], "0", 0, 0, 0, 0, 0, [["23(?:4(?:[2-4]|[56]\\d)|[568]\\d\\d)\\d{4}|23[236-9]\\d{5}|(?:2[4-6]|3[2-6]|4[2-4]|[5-7][2-5])(?:(?:[237-9]|4[56]|5\\d)\\d{5}|6\\d{5,6})", [8, 9]], ["(?:(?:1[28]|3[18]|9[67])\\d|6[016-9]|7(?:[07-9]|[16]\\d)|8(?:[013-79]|8\\d))\\d{6}|(?:1\\d|9[0-57-9])\\d{6}|(?:2[3-6]|3[2-6]|4[2-4]|[5-7][2-5])48\\d{5}", [8, 9]], ["1800(?:1\\d|2[019])\\d{4}", [10]], ["1900(?:1\\d|2[09])\\d{4}", [10]]]], "KI": ["686", "00", "(?:[37]\\d|6[0-79])\\d{6}|(?:[2-48]\\d|50)\\d{3}", [5, 8], 0, "0", 0, 0, 0, 0, 0, [["(?:[24]\\d|3[1-9]|50|65(?:02[12]|12[56]|22[89]|[3-5]00)|7(?:27\\d\\d|3100|5(?:02[12]|12[56]|22[89]|[34](?:00|81)|500))|8[0-5])\\d{3}"], ["(?:6200[01]|7(?:310[1-9]|5(?:02[03-9]|12[0-47-9]|22[0-7]|[34](?:0[1-9]|8[02-9])|50[1-9])))\\d{3}|(?:63\\d\\d|7(?:(?:[0146-9]\\d|2[0-689])\\d|3(?:[02-9]\\d|1[1-9])|5(?:[0-2][013-9]|[34][1-79]|5[1-9]|[6-9]\\d)))\\d{4}", [8]], 0, 0, 0, 0, 0, 0, ["30(?:0[01]\\d\\d|12(?:11|20))\\d\\d", [8]]]], "KM": ["269", "00", "[3478]\\d{6}", [7], [["(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", ["[3478]"]]], 0, 0, 0, 0, 0, 0, [["7[4-7]\\d{5}"], ["[34]\\d{6}"], 0, ["8\\d{6}"]]], "KN": ["1", "011", "(?:[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-7]\\d{6})$|1", "869$1", 0, "869", [["869(?:2(?:29|36)|302|4(?:6[015-9]|70)|56[5-7])\\d{4}"], ["869(?:48[89]|55[6-8]|66\\d|76[02-7])\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "KP": ["850", "00|99", "85\\d{6}|(?:19\\d|[2-7])\\d{7}", [8, 10], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"], "0$1"], ["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["[2-7]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:195|2)\\d|3[19]|4[159]|5[37]|6[17]|7[39]|85)\\d{6}"], ["19[1-3]\\d{7}", [10]]]], "KR": ["82", "00(?:[125689]|3(?:[46]5|91)|7(?:00|27|3|55|6[126]))", "00[1-9]\\d{8,11}|(?:[12]|5\\d{3})\\d{7}|[13-6]\\d{9}|(?:[1-6]\\d|80)\\d{7}|[3-6]\\d{4,5}|(?:00|7)0\\d{8}", [5, 6, 8, 9, 10, 11, 12, 13, 14], [["(\\d{2})(\\d{3,4})", "$1-$2", ["(?:3[1-3]|[46][1-4]|5[1-5])1"], "0$1"], ["(\\d{4})(\\d{4})", "$1-$2", ["1"]], ["(\\d)(\\d{3,4})(\\d{4})", "$1-$2-$3", ["2"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1-$2-$3", ["[36]0|8"], "0$1"], ["(\\d{2})(\\d{3,4})(\\d{4})", "$1-$2-$3", ["[1346]|5[1-5]"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1-$2-$3", ["[57]"], "0$1"], ["(\\d{2})(\\d{5})(\\d{4})", "$1-$2-$3", ["5"], "0$1"]], "0", 0, "0(8(?:[1-46-8]|5\\d\\d))?", 0, 0, 0, [["(?:2|3[1-3]|[46][1-4]|5[1-5])[1-9]\\d{6,7}|(?:3[1-3]|[46][1-4]|5[1-5])1\\d{2,3}", [5, 6, 8, 9, 10]], ["1(?:05(?:[0-8]\\d|9[0-6])|22[13]\\d)\\d{4,5}|1(?:0[0-46-9]|[16-9]\\d|2[013-9])\\d{6,7}", [9, 10]], ["00(?:308\\d{6,7}|798\\d{7,9})|(?:00368|[38]0)\\d{7}", [9, 11, 12, 13, 14]], ["60[2-9]\\d{6}", [9]], ["50\\d{8,9}", [10, 11]], 0, ["1(?:5(?:22|33|44|66|77|88|99)|6(?:[07]0|44|6[0168]|88)|8(?:00|33|55|77|99))\\d{4}", [8]], ["15\\d{7,8}", [9, 10]], ["70\\d{8}", [10]]]], "KW": ["965", "00", "18\\d{5}|(?:[2569]\\d|41)\\d{6}", [7, 8], [["(\\d{4})(\\d{3,4})", "$1 $2", ["[169]|2(?:[235]|4[1-35-9])|52"]], ["(\\d{3})(\\d{5})", "$1 $2", ["[245]"]]], 0, 0, 0, 0, 0, 0, [["2(?:[23]\\d\\d|4(?:[1-35-9]\\d|44)|5(?:0[034]|[2-46]\\d|5[1-3]|7[1-7]))\\d{4}", [8]], ["(?:41\\d\\d|5(?:(?:[05]\\d|1[0-7]|6[56])\\d|2(?:22|5[25])|7(?:55|77)|88[58])|6(?:(?:0[034679]|5[015-9]|6\\d)\\d|1(?:00|11|6[16])|2[26]2|3[36]3|4[46]4|7(?:0[013-9]|[67]\\d)|8[68]8|9(?:[069]\\d|3[039]))|9(?:(?:[04679]\\d|8[057-9])\\d|1(?:00|1[01]|99)|2(?:00|2\\d)|3(?:00|3[03])|5(?:00|5\\d)))\\d{4}", [8]], ["18\\d{5}", [7]]]], "KY": ["1", "011", "(?:345|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "345$1", 0, "345", [["345(?:2(?:22|3[23]|44|66)|333|444|6(?:23|38|40)|7(?:30|4[35-79]|6[6-9]|77)|8(?:00|1[45]|4[89]|88)|9(?:14|4[035-9]))\\d{4}"], ["345(?:32[1-9]|4(?:1[2-6]|2[0-4])|5(?:1[67]|2[5-79]|4[6-9]|50|76)|649|82[56]|9(?:1[679]|2[2-9]|3[06-9]|90))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["(?:345976|900[2-9]\\d\\d)\\d{4}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "KZ": ["7", "810", "8\\d{13}|[78]\\d{9}", [10, 14], 0, "8", 0, 0, 0, 0, "7", [["7(?:1(?:0(?:[23]\\d|4[0-3]|59|63)|1(?:[23]\\d|4[0-79]|59)|2(?:[23]\\d|59)|3(?:2\\d|3[0-79]|4[0-35-9]|59)|4(?:[24]\\d|3[013-9]|5[1-9]|97)|5(?:2\\d|3[1-9]|4[0-7]|59)|6(?:[2-4]\\d|5[19]|61)|72\\d|8(?:[27]\\d|3[1-46-9]|4[0-5]|59))|2(?:1(?:[23]\\d|4[46-9]|5[3469])|2(?:2\\d|3[0679]|46|5[12679])|3(?:[2-4]\\d|5[139])|4(?:2\\d|3[1-35-9]|59)|5(?:[23]\\d|4[0-8]|59|61)|6(?:2\\d|3[1-9]|4[0-4]|59)|7(?:[2379]\\d|40|5[279])|8(?:[23]\\d|4[0-3]|59)|9(?:2\\d|3[124578]|59)))\\d{5}", [10]], ["7(?:0[0-25-8]|47|6[0-4]|7[15-8]|85)\\d{7}", [10]], ["8(?:00|108\\d{3})\\d{7}"], ["809\\d{7}", [10]], ["808\\d{7}", [10]], 0, 0, 0, ["751\\d{7}", [10]]], "8~10"], "LA": ["856", "00", "[23]\\d{9}|3\\d{8}|(?:[235-8]\\d|41)\\d{6}", [8, 9, 10], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["2[13]|3[14]|[4-8]"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", ["3"], "0$1"], ["(\\d{2})(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["[23]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2[13]|[35-7][14]|41|8[1468])\\d{6}", [8]], ["(?:20(?:[23579]\\d|8[78])|30[24]\\d)\\d{6}|30\\d{7}", [9, 10]]]], "LB": ["961", "00", "[27-9]\\d{7}|[13-9]\\d{6}", [7, 8], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["[13-69]|7(?:[2-57]|62|8[0-6]|9[04-9])|8[02-9]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[27-9]"]]], "0", 0, 0, 0, 0, 0, [["7(?:62|8[0-6]|9[04-9])\\d{4}|(?:[14-69]\\d|2(?:[14-69]\\d|[78][1-9])|7[2-57]|8[02-9])\\d{5}"], ["(?:(?:3|81)\\d|7(?:[01]\\d|6[013-9]|8[7-9]|9[0-4]))\\d{5}"], 0, ["9[01]\\d{6}", [8]], 0, 0, 0, 0, 0, ["80\\d{6}", [8]]]], "LC": ["1", "011", "(?:[58]\\d\\d|758|900)\\d{7}", [10], 0, "1", 0, "([2-8]\\d{6})$|1", "758$1", 0, "758", [["758(?:234|4(?:30|5\\d|6[2-9]|8[0-2])|57[0-2]|(?:63|75)8)\\d{4}"], ["758(?:28[4-7]|384|4(?:6[01]|8[4-9])|5(?:1[89]|20|84)|7(?:1[2-9]|2\\d|3[0-3])|812)\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "LI": ["423", "00", "[68]\\d{8}|(?:[2378]\\d|90)\\d{5}", [7, 9], [["(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3", ["[2379]|8(?:0[09]|7)", "[2379]|8(?:0(?:02|9)|7)"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["69"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["6"]]], "0", 0, "(1001)|0", 0, 0, 0, [["(?:2(?:01|1[27]|2[024]|3\\d|6[02-578]|9[06])|3(?:[24]0|33|7[0135-7]|8[048]|9[0269]))\\d{4}", [7]], ["(?:6(?:(?:4[5-9]|5\\d)\\d|6(?:[024-68]\\d|1[01]|3[7-9]|7[02]))\\d|7(?:[37-9]\\d|42|56))\\d{4}"], ["8002[28]\\d\\d|80(?:05\\d|9)\\d{4}"], ["90(?:02[258]|1(?:23|3[14])|66[136])\\d\\d", [7]], 0, ["697(?:42|56|[78]\\d)\\d{4}", [9]], ["870(?:28|87)\\d\\d", [7]]]], "LK": ["94", "00", "[1-9]\\d{8}", [9], [["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["7"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[1-689]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:12[2-9]|602|8[12]\\d|9(?:1\\d|22|9[245]))\\d{6}|(?:11|2[13-7]|3[1-8]|4[157]|5[12457]|6[35-7])[2-57]\\d{6}"], ["7(?:[0-25-8]\\d|4[0-4])\\d{6}"], 0, 0, 0, 0, ["1973\\d{5}"]]], "LR": ["231", "00", "(?:[2457]\\d|33|88)\\d{7}|(?:2\\d|[4-6])\\d{6}", [7, 8, 9], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["4[67]|[56]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[2-578]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["2\\d{7}", [8]], ["(?:(?:(?:22|33)0|555|7(?:6[01]|7\\d)|88\\d)\\d|4(?:240|[67]))\\d{5}|[56]\\d{6}", [7, 9]], 0, ["332(?:02|[34]\\d)\\d{4}", [9]]]], "LS": ["266", "00", "(?:[256]\\d\\d|800)\\d{5}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["[2568]"]]], 0, 0, 0, 0, 0, 0, [["2\\d{7}"], ["[56]\\d{7}"], ["800[1256]\\d{4}"]]], "LT": ["370", "00", "(?:[3469]\\d|52|[78]0)\\d{6}", [8], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["52[0-7]"], "(0-$1)", 1], ["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["[7-9]"], "0 $1", 1], ["(\\d{2})(\\d{6})", "$1 $2", ["37|4(?:[15]|6[1-8])"], "(0-$1)", 1], ["(\\d{3})(\\d{5})", "$1 $2", ["[3-6]"], "(0-$1)", 1]], "0", 0, "[08]", 0, 0, 0, [["(?:3[1478]|4[124-6]|52)\\d{6}"], ["6\\d{7}"], ["80[02]\\d{5}"], ["9(?:0[0239]|10)\\d{5}"], ["70[05]\\d{5}"], 0, ["70[67]\\d{5}"], 0, ["[89]01\\d{5}"], ["808\\d{5}"]]], "LU": ["352", "00", "35[013-9]\\d{4,8}|6\\d{8}|35\\d{2,4}|(?:[2457-9]\\d|3[0-46-9])\\d{2,9}", [4, 5, 6, 7, 8, 9, 10, 11], [["(\\d{2})(\\d{3})", "$1 $2", ["2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])"]], ["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["2(?:0[2-689]|[2-9])|[3-57]|8(?:0[2-9]|[13-9])|9(?:0[89]|[2-579])"]], ["(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", ["20[2-689]"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})", "$1 $2 $3 $4", ["20"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{1,5})", "$1 $2 $3 $4", ["[3-57]|8[13-9]|9(?:0[89]|[2-579])|(?:2|80)[2-9]"]], ["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["80[01]|90[015]"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3 $4", ["20"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["6"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})", "$1 $2 $3 $4 $5", ["20"]]], 0, 0, "(15(?:0[06]|1[12]|[35]5|4[04]|6[26]|77|88|99)\\d)", 0, 0, 0, [["(?:35[013-9]|80[2-9]|90[89])\\d{1,8}|(?:2[2-9]|3[0-46-9]|[457]\\d|8[13-9]|9[2-579])\\d{2,9}"], ["6(?:[26][18]|5[1568]|7[189]|81|9[128])\\d{6}", [9]], ["800\\d{5}", [8]], ["90[015]\\d{5}", [8]], 0, 0, 0, 0, ["20(?:1\\d{5}|[2-689]\\d{1,7})", [4, 5, 6, 7, 8, 9, 10]], ["801\\d{5}", [8]]]], "LV": ["371", "00", "(?:[268]\\d|78|90)\\d{6}", [8], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2679]|8[01]"]]], 0, 0, 0, 0, 0, 0, [["6\\d{7}"], ["2333[0-8]\\d{3}|2(?:[0-24-9]\\d\\d|3(?:0[07]|[14-9]\\d|2[02-9]|3[0-24-9]))\\d{4}"], ["80\\d{6}"], ["90\\d{6}"], 0, 0, 0, 0, 0, ["81\\d{6}"]]], "LY": ["218", "00", "[2-9]\\d{8}", [9], [["(\\d{2})(\\d{7})", "$1-$2", ["[2-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2(?:0[56]|[1-6]\\d|7[124579]|8[124])|3(?:1\\d|2[2356])|4(?:[17]\\d|2[1-357]|5[2-4]|8[124])|5(?:[1347]\\d|2[1-469]|5[13-5]|8[1-4])|6(?:[1-479]\\d|5[2-57]|8[1-5])|7(?:[13]\\d|2[13-79])|8(?:[124]\\d|5[124]|84))\\d{6}"], ["9[1-6]\\d{7}"]]], "MA": ["212", "00", "[5-8]\\d{8}", [9], [["(\\d{4})(\\d{5})", "$1-$2", ["892"], "0$1"], ["(\\d{2})(\\d{7})", "$1-$2", ["8(?:0[0-7]|9)"], "0$1"], ["(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["[5-8]"], "0$1"]], "0", 0, 0, 0, 0, "[5-8]", [["5(?:(?:18|4[0679]|5[03])\\d|2(?:[0-25-79]\\d|3[1-578]|4[02-46-8]|8[0235-9])|3(?:[0-47]\\d|5[02-9]|6[02-8]|8[014-9]|9[3-9]))\\d{5}"], ["(?:6(?:[0-79]\\d|8[0-247-9])|7(?:[016-8]\\d|2[0-8]|3[01]|5[0-5]))\\d{6}"], ["80[0-7]\\d{6}"], ["89\\d{7}"], 0, 0, 0, 0, ["(?:592(?:4[0-2]|93)|80[89]\\d\\d)\\d{4}"]]], "MC": ["377", "00", "(?:[3489]|[67]\\d)\\d{7}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["4"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[389]"]], ["(\\d)(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4 $5", ["[67]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:870|9[2-47-9]\\d)\\d{5}", [8]], ["4(?:[46]\\d|5[1-9])\\d{5}|(?:3|[67]\\d)\\d{7}"], ["(?:800|90\\d)\\d{5}", [8]]]], "MD": ["373", "00", "(?:[235-7]\\d|[89]0)\\d{6}", [8], [["(\\d{3})(\\d{5})", "$1 $2", ["[89]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["22|3"], "0$1"], ["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["[25-7]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:2[1-9]|3[1-79])\\d|5(?:33|5[257]))\\d{5}"], ["562\\d{5}|(?:6\\d|7[16-9])\\d{6}"], ["800\\d{5}"], ["90[056]\\d{5}"], 0, 0, ["803\\d{5}"], 0, ["3[08]\\d{6}"], ["808\\d{5}"]]], "ME": ["382", "00", "(?:20|[3-79]\\d)\\d{6}|80\\d{6,7}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[2-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:20[2-8]|3(?:[0-2][2-7]|3[24-7])|4(?:0[2-467]|1[2467])|5(?:0[2467]|1[24-7]|2[2-467]))\\d{5}", [8]], ["6(?:[07-9]\\d|3[024]|6[0-25])\\d{5}", [8]], ["80(?:[0-2578]|9\\d)\\d{5}"], ["9(?:4[1568]|5[178])\\d{5}", [8]], 0, 0, ["77[1-9]\\d{5}", [8]], 0, ["78[1-49]\\d{5}", [8]]]], "MF": ["590", "00", "7090\\d{5}|(?:[56]9|[89]\\d)\\d{7}", [9], 0, "0", 0, 0, 0, 0, 0, [["(?:59(?:0(?:0[079]|[14]3|[27][79]|3[03-7]|5[0-268]|87)|87\\d)|80[6-9]\\d\\d)\\d{4}"], ["(?:69(?:0\\d\\d|1(?:2[2-9]|3[0-5]))|7090[0-4])\\d{4}"], ["80[0-5]\\d{6}"], ["8[129]\\d{7}"], 0, 0, 0, 0, ["9(?:(?:39[5-7]|76[018])\\d|475[0-6])\\d{4}"]]], "MG": ["261", "00", "[23]\\d{8}", [9], [["(\\d{2})(\\d{2})(\\d{3})(\\d{2})", "$1 $2 $3 $4", ["[23]"], "0$1"]], "0", 0, "([24-9]\\d{6})$|0", "20$1", 0, 0, [["2072[29]\\d{4}|20(?:2\\d|4[47]|5[3467]|6[279]|7[356]|8[268]|9[2457])\\d{5}"], ["3[2-9]\\d{7}"], 0, 0, 0, 0, 0, 0, ["22\\d{7}"]]], "MH": ["692", "011", "329\\d{4}|(?:[256]\\d|45)\\d{5}", [7], [["(\\d{3})(\\d{4})", "$1-$2", ["[2-6]"]]], "1", 0, 0, 0, 0, 0, [["(?:247|528|625)\\d{4}"], ["(?:(?:23|54)5|329|45[35-8])\\d{4}"], 0, 0, 0, 0, 0, 0, ["635\\d{4}"]]], "MK": ["389", "00", "[2-578]\\d{7}", [8], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["2|34[47]|4(?:[37]7|5[47]|64)"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[347]"], "0$1"], ["(\\d{3})(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[58]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:2(?:62|77)0|3444)\\d|4[56]440)\\d{3}|(?:34|4[357])700\\d{3}|(?:2(?:[0-3]\\d|5[0-578]|6[01]|82)|3(?:1[3-68]|[23][2-68]|4[23568])|4(?:[23][2-68]|4[3-68]|5[2568]|6[25-8]|7[24-68]|8[4-68]))\\d{5}"], ["7(?:3555|(?:474|9[019]7)7)\\d{3}|7(?:[0-25-8]\\d\\d|3(?:[1-478]\\d|6[01])|4(?:2\\d|60|7[01578])|9(?:[2-4]\\d|5[01]|7[015]))\\d{4}"], ["800\\d{5}"], ["5\\d{7}"], 0, 0, 0, 0, 0, ["8(?:0[1-9]|[1-9]\\d)\\d{5}"]]], "ML": ["223", "00", "[24-9]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[24-9]"]]], 0, 0, 0, 0, 0, 0, [["2(?:07[0-8]|12[67])\\d{4}|(?:2(?:02|1[4-689])|4(?:0[0-4]|4[1-69]))\\d{5}"], ["2(?:0(?:01|79)|17\\d)\\d{4}|(?:5[0-3]|[679]\\d|8[2-59])\\d{6}"], ["80\\d{6}"]]], "MM": ["95", "00", "1\\d{5,7}|95\\d{6}|(?:[4-7]|9[0-46-9])\\d{6,8}|(?:2|8\\d)\\d{5,8}", [6, 7, 8, 9, 10], [["(\\d)(\\d{2})(\\d{3})", "$1 $2 $3", ["16|2"], "0$1"], ["(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", ["4(?:[2-46]|5[3-5])|5|6(?:[1-689]|7[235-7])|7(?:[0-4]|5[2-7])|8[1-5]|(?:60|86)[23]"], "0$1"], ["(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[12]|452|678|86", "[12]|452|6788|86"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[4-7]|8[1-35]"], "0$1"], ["(\\d)(\\d{3})(\\d{4,6})", "$1 $2 $3", ["9(?:2[0-4]|[35-9]|4[137-9])"], "0$1"], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"], "0$1"], ["(\\d)(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["92"], "0$1"], ["(\\d)(\\d{5})(\\d{4})", "$1 $2 $3", ["9"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:1(?:(?:12|[28]\\d|3[56]|7[3-6]|9[0-6])\\d|4(?:2[29]|7[0-2]|83)|6)|2(?:2(?:00|8[34])|4(?:0\\d|22|7[0-2]|83)|51\\d\\d)|4(?:2(?:2\\d\\d|48[013])|3(?:20\\d|4(?:70|83)|56)|420\\d|5(?:2\\d|470))|6(?:0(?:[23]|88\\d)|(?:124|[56]2\\d)\\d|2472|3(?:20\\d|470)|4(?:2[04]\\d|472)|7(?:3\\d\\d|4[67]0|8(?:[01459]\\d|8))))\\d{4}|5(?:2(?:2\\d{5,6}|47[02]\\d{4})|(?:3472|4(?:2(?:1|86)|470)|522\\d|6(?:20\\d|483)|7(?:20\\d|48[01])|8(?:20\\d|47[02])|9(?:20\\d|470))\\d{4})|7(?:(?:0470|4(?:25\\d|470)|5(?:202|470|96\\d))\\d{4}|1(?:20\\d{4,5}|4(?:70|83)\\d{4}))|8(?:1(?:2\\d{5,6}|4(?:10|7[01]\\d)\\d{3})|2(?:2\\d{5,6}|(?:320|490\\d)\\d{3})|(?:3(?:2\\d\\d|470)|4[24-7]|5(?:(?:2\\d|51)\\d|4(?:[1-35-9]\\d|4[0-57-9]))|6[23])\\d{4})|(?:1[2-6]\\d|4(?:2[24-8]|3[2-7]|[46][2-6]|5[3-5])|5(?:[27][2-8]|3[2-68]|4[24-8]|5[23]|6[2-4]|8[24-7]|9[2-7])|6(?:[19]20|42[03-6]|(?:52|7[45])\\d)|7(?:[04][24-8]|[15][2-7]|22|3[2-4])|8(?:1[2-689]|2[2-8]|(?:[35]2|64)\\d))\\d{4}|25\\d{5,6}|(?:2[2-9]|6(?:1[2356]|[24][2-6]|3[24-6]|5[2-4]|6[2-8]|7[235-7]|8[245]|9[24])|8(?:3[24]|5[245]))\\d{4}", [6, 7, 8, 9]], ["(?:17[01]|9(?:2(?:[0-4]|[56]\\d\\d)|(?:3(?:[0-36]|4\\d)|(?:6\\d|8[89]|9[4-8])\\d|7(?:3|40|[5-9]\\d))\\d|4(?:(?:[0245]\\d|[1379])\\d|88)|5[0-6])\\d)\\d{4}|9[69]1\\d{6}|9(?:[68]\\d|9[089])\\d{5}", [7, 8, 9, 10]], ["80080(?:0[1-9]|2\\d)\\d{3}", [10]], 0, 0, 0, 0, 0, ["1333\\d{4}", [8]]]], "MN": ["976", "001", "[12]\\d{7,9}|[5-9]\\d{7}", [8, 9, 10], [["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["11|2[16]"], "0$1"], ["(\\d{4})(\\d{4})", "$1 $2", ["[5-9]"]], ["(\\d{3})(\\d{5,6})", "$1 $2", ["[12]2[1-3]"], "0$1"], ["(\\d{4})(\\d{5,6})", "$1 $2", ["[12](?:27|3[2-8]|4[2-68]|5[1-4689])", "[12](?:27|3[2-8]|4[2-68]|5[1-4689])[0-3]"], "0$1"], ["(\\d{5})(\\d{4,5})", "$1 $2", ["[12]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["[12](?:2[1-3]|(?:3[2-8]|4[2-68]|5[1-4689])\\d)\\d{5,6}|7(?:0(?:[0-5]\\d|7[078]|80)|128)\\d{4}|[12]27\\d{6}|(?:11|2[16]|5[368])\\d{6}"], ["(?:87[01]|92[0139])\\d{5}|(?:5[05]|6[069]|7[28]|8[0135689]|9[013-9])\\d{6}", [8]], 0, 0, 0, 0, 0, 0, ["712[0-79]\\d{4}|7(?:1[013-9]|[5-79]\\d)\\d{5}", [8]]]], "MO": ["853", "00", "0800\\d{3}|(?:28|[68]\\d)\\d{6}", [7, 8], [["(\\d{4})(\\d{3})", "$1 $2", ["0"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[268]"]]], 0, 0, 0, 0, 0, 0, [["(?:28[2-9]|8(?:11|[2-57-9]\\d))\\d{5}", [8]], ["6800[0-79]\\d{3}|6(?:[235]\\d\\d|6(?:0[0-5]|[1-9]\\d)|8(?:0[1-9]|[14-8]\\d|2[5-9]|[39][0-4]))\\d{4}", [8]], ["0800\\d{3}", [7]]]], "MP": ["1", "011", "[58]\\d{9}|(?:67|90)0\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "670$1", 0, "670", [["670(?:2(?:3[3-7]|56|8[4-8])|32[1-38]|4(?:33|8[348])|5(?:32|55|88)|6(?:64|70|82)|78[3589]|8[3-9]8|989)\\d{4}"], [""], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "MQ": ["596", "00", "7091\\d{5}|(?:[56]9|[89]\\d)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[5-79]|8(?:0[6-9]|[36])"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:59(?:6(?:[03-7]\\d|1[05]|2[7-9]|8[0-39]|9[04-9])|89\\d)|80[6-9]\\d\\d|9(?:477[6-9]|767[4589]))\\d{4}"], ["(?:69[67]\\d\\d|7091[0-3])\\d{4}"], ["80[0-5]\\d{6}"], ["8[129]\\d{7}"], 0, 0, 0, 0, ["9(?:397[0-3]|477[0-5]|76(?:6\\d|7[0-367]))\\d{4}"]]], "MR": ["222", "00", "(?:[2-4]\\d\\d|800)\\d{5}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2-48]"]]], 0, 0, 0, 0, 0, 0, [["(?:25[08]|35\\d|45[1-7])\\d{5}"], ["[2-4][0-46-9]\\d{6}"], ["800\\d{5}"]]], "MS": ["1", "011", "(?:[58]\\d\\d|664|900)\\d{7}", [10], 0, "1", 0, "([34]\\d{6})$|1", "664$1", 0, "664", [["6644(?:1[0-3]|91)\\d{4}"], ["664(?:3(?:49|9[1-6])|49[2-6])\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "MT": ["356", "00", "3550\\d{4}|(?:[2579]\\d\\d|800)\\d{5}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["[2357-9]"]]], 0, 0, 0, 0, 0, 0, [["20(?:3[1-4]|6[059])\\d{4}|2(?:0[19]|[1-357]\\d|60)\\d{5}"], ["(?:7(?:210|[79]\\d\\d)|9(?:[29]\\d\\d|69[67]|8(?:1[1-3]|89|97)))\\d{4}"], ["800(?:02|[3467]\\d)\\d{3}"], ["5(?:0(?:0(?:37|43)|(?:6\\d|70|9[0168])\\d)|[12]\\d0[1-5])\\d{3}"], 0, 0, ["501\\d{5}"], ["7117\\d{4}"], ["3550\\d{4}"]]], "MU": ["230", "0(?:0|[24-7]0|3[03])", "(?:[57]|8\\d\\d)\\d{7}|[2-468]\\d{6}", [7, 8, 10], [["(\\d{3})(\\d{4})", "$1 $2", ["[2-46]|8[013]"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[57]"]], ["(\\d{5})(\\d{5})", "$1 $2", ["8"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:[0346-8]\\d|1[0-8])|4(?:[013568]\\d|2[0-24-8]|71|90)|54(?:[3-5]\\d|71)|6\\d\\d|8(?:14|3[129]))\\d{4}", [7, 8]], ["5(?:4(?:2[1-389]|7[1-9])|87[15-8])\\d{4}|(?:5(?:2[5-9]|4[3-689]|[57]\\d|8[0-689]|9[0-8])|7(?:0[0-7]|3[013]))\\d{5}", [8]], ["802\\d{7}|80[0-2]\\d{4}", [7, 10]], ["30\\d{5}", [7]], 0, 0, 0, ["219\\d{4}", [7]], ["3(?:20|9\\d)\\d{4}", [7]]], "020"], "MV": ["960", "0(?:0|19)", "(?:800|9[0-57-9]\\d)\\d{7}|[34679]\\d{6}", [7, 10], [["(\\d{3})(\\d{4})", "$1-$2", ["[34679]"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[89]"]]], 0, 0, 0, 0, 0, 0, [["(?:3(?:0[0-4]|3[0-59])|6(?:[58][024689]|6[024-68]|7[02468]))\\d{4}", [7]], ["(?:46[46]|[79]\\d\\d)\\d{4}", [7]], ["800\\d{7}", [10]], ["900\\d{7}", [10]], 0, 0, ["4(?:0[01]|50)\\d{4}", [7]]], "00"], "MW": ["265", "00", "(?:[1289]\\d|31|77)\\d{7}|1\\d{6}", [7, 9], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["1[2-9]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[1-37-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1[2-9]\\d{5}", [7]], ["111\\d{6}|(?:2[12]|31|77|[89][89])\\d{7}", [9]]]], "MX": ["52", "0[09]", "[2-9]\\d{9}", [10], [["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["33|5[56]|81"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[2-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:0[01]|2\\d|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[267][1-9]|3[1-8]|[45]\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-36-9]|6[0-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1346][1-9]|[27]\\d|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[0-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69]\\d|7[12]|8[1-8]))\\d{7}"], ["(?:2(?:2\\d|3[1-35-8]|4[13-9]|7[1-689]|8[1-578]|9[467])|3(?:1[1-79]|[2458][1-9]|3\\d|7[1-8]|9[1-5])|4(?:1[1-57-9]|[267][1-9]|3[1-8]|[45]\\d|8[1-35-9]|9[2-689])|5(?:[56]\\d|88|9[1-79])|6(?:1[2-68]|[2-4][1-9]|5[1-36-9]|6[0-57-9]|7[1-7]|8[67]|9[4-8])|7(?:[1346][1-9]|[27]\\d|5[13-9]|8[1-69]|9[17])|8(?:1\\d|2[13-689]|3[1-6]|4[124-6]|6[1246-9]|7[0-378]|9[12479])|9(?:1[346-9]|2[1-4]|3[2-46-8]|5[1348]|[69]\\d|7[12]|8[1-8]))\\d{7}"], ["8(?:00|88)\\d{7}"], ["900\\d{7}"], ["500\\d{7}"], 0, 0, 0, 0, ["300\\d{7}"]], "00"], "MY": ["60", "00", "1\\d{8,9}|(?:3\\d|[4-9])\\d{7}", [8, 9, 10], [["(\\d)(\\d{3})(\\d{4})", "$1-$2 $3", ["[4-79]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1-$2 $3", ["1(?:[02469]|[378][1-9]|53)|8", "1(?:[02469]|[37][1-9]|53|8(?:[1-46-9]|5[7-9]))|8"], "0$1"], ["(\\d)(\\d{4})(\\d{4})", "$1-$2 $3", ["3"], "0$1"], ["(\\d)(\\d{3})(\\d{2})(\\d{4})", "$1-$2-$3-$4", ["1(?:[367]|80)"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1-$2 $3", ["15"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4})", "$1-$2 $3", ["1"], "0$1"]], "0", 0, 0, 0, 0, 0, [["427[01]\\d{4}|(?:3(?:2[0-36-9]|3[0-368]|4[0-278]|5[0-24-8]|6[0-467]|7[1246-9]|8\\d|9[0-57])\\d|4(?:2[0-689]|[3-79]\\d|8[1-35689])|5(?:2[0-589]|[3468]\\d|5[0-489]|7[1-9]|9[23])|6(?:2[2-9]|3[1357-9]|[46]\\d|5[0-6]|7[0-35-9]|85|9[015-8])|7(?:[2579]\\d|3[03-68]|4[0-8]|6[5-9]|8[0-35-9])|8(?:[24][2-8]|3[2-5]|5[2-7]|6[2-589]|7[2-578]|[89][2-9])|9(?:0[57]|13|[25-7]\\d|[3489][0-8]))\\d{5}", [8, 9]], ["1(?:(?:1888[689]|4400|8(?:47|8[27])[0-4])\\d{4}|9\\d{7,8})|1(?:0(?:[23568]\\d|4[0-6]|7[016-9]|9[0-8])|1(?:[1-5]\\d\\d|6(?:0[5-9]|[1-9]\\d)|7(?:[0-4]\\d|5[0-79]|6[02-4]|8[02-5]))|(?:[26]\\d|[37][1-9]|4[235-9])\\d|5(?:31|9\\d\\d)|8(?:1[23]|[236]\\d|4[06]|5(?:46|[7-9])|7[016-9]|8[01]|9[0-8]))\\d{5}", [9, 10]], ["1[378]00\\d{6}", [10]], ["1600\\d{6}", [10]], 0, 0, 0, 0, ["15(?:4(?:6[0-4]\\d|8(?:0[125]|[17]\\d|21|3[01]|4[01589]|5[014]|6[02]))|6(?:32[0-6]|78\\d))\\d{4}", [10]]]], "MZ": ["258", "00", "(?:2|8\\d)\\d{7}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["2|8[2-9]"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["2(?:[1346]\\d|5[0-2]|[78][12]|93)\\d{5}", [8]], ["8[2-9]\\d{7}", [9]], ["800\\d{6}", [9]]]], "NA": ["264", "00", "[68]\\d{7,8}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["88"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["6"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["87"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["64426\\d{3}|6(?:1(?:2[2-7]|3[01378]|4[0-4])|254|32[0237]|4(?:27|41|5[25])|52[236-8]|626|7(?:2[2-4]|30))\\d{4,5}|6(?:1(?:(?:0\\d|2[0189]|3[24-69]|4[5-9])\\d|17|69|7[014])|2(?:17|5[0-36-8]|69|70)|3(?:17|2[14-689]|34|6[289]|7[01]|81)|4(?:17|2[0-2]|4[06]|5[0137]|69|7[01])|5(?:17|2[0459]|69|7[01])|6(?:17|25|38|42|69|7[01])|7(?:17|2[569]|3[13]|6[89]|7[01]))\\d{4}"], ["(?:60|8[1245])\\d{7}", [9]], ["80\\d{7}", [9]], ["8701\\d{5}", [9]], 0, 0, 0, 0, ["8(?:3\\d\\d|86)\\d{5}"]]], "NC": ["687", "00", "(?:050|[2-57-9]\\d\\d)\\d{3}", [6], [["(\\d{2})(\\d{2})(\\d{2})", "$1.$2.$3", ["[02-57-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2[03-9]|3[0-5]|4[1-7]|88)\\d{4}"], ["(?:[579]\\d|8[0-79])\\d{4}"], ["050\\d{3}"], ["36\\d{4}"]]], "NE": ["227", "00", "[027-9]\\d{7}", [8], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["08"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[089]|2[013]|7[0467]"]]], 0, 0, 0, 0, 0, 0, [["2(?:0(?:20|3[1-8]|4[13-5]|5[14]|6[14578]|7[1-578])|1(?:4[145]|5[14]|6[14-68]|7[169]|88))\\d{4}"], ["(?:23|7[0467]|[89]\\d)\\d{6}"], ["08\\d{6}"], ["09\\d{6}"]]], "NF": ["672", "00", "[13]\\d{5}", [6], [["(\\d{2})(\\d{4})", "$1 $2", ["1[0-3]"]], ["(\\d)(\\d{5})", "$1 $2", ["[13]"]]], 0, 0, "([0-258]\\d{4})$", "3$1", 0, 0, [["(?:1(?:06|17|28|39)|3[0-2]\\d)\\d{3}"], ["(?:14|3[58])\\d{4}"]]], "NG": ["234", "009", "(?:20|9\\d)\\d{8}|[78]\\d{9,13}", [10, 11, 12, 13, 14], [["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[7-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["20[129]"], "0$1"], ["(\\d{4})(\\d{2})(\\d{4})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{3})(\\d{4})(\\d{4,5})", "$1 $2 $3", ["[78]"], "0$1"], ["(\\d{3})(\\d{5})(\\d{5,6})", "$1 $2 $3", ["[78]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["20(?:[1259]\\d|3[013-9]|4[1-8]|6[024-689]|7[1-79]|8[2-9])\\d{6}", [10]], ["(?:702[0-24-9]|819[01])\\d{6}|(?:7(?:0[13-9]|[12]\\d)|8(?:0[1-9]|1[0-8])|9(?:0[1-9]|1[0-6]))\\d{7}", [10]], ["800\\d{7,11}"], 0, 0, 0, ["700\\d{7,11}"]]], "NI": ["505", "00", "(?:1800|[25-8]\\d{3})\\d{4}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["[125-8]"]]], 0, 0, 0, 0, 0, 0, [["2\\d{7}"], ["(?:5(?:5[0-7]|[78]\\d)|6(?:20|3[035]|4[045]|5[05]|77|8[1-9]|9[059])|(?:7[5-8]|8\\d)\\d)\\d{5}"], ["1800\\d{4}"]]], "NL": ["31", "00", "(?:[124-7]\\d\\d|3(?:[02-9]\\d|1[0-8]))\\d{6}|8\\d{6,9}|9\\d{6,10}|1\\d{4,5}", [5, 6, 7, 8, 9, 10, 11], [["(\\d{3})(\\d{4,7})", "$1 $2", ["[89]0"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["66"], "0$1"], ["(\\d)(\\d{8})", "$1 $2", ["6"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["1[16-8]|2[259]|3[124]|4[17-9]|5[124679]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[1-578]|91"], "0$1"], ["(\\d{3})(\\d{3})(\\d{5})", "$1 $2 $3", ["9"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:1(?:[035]\\d|1[13-578]|6[124-8]|7[24]|8[0-467])|2(?:[0346]\\d|2[2-46-9]|5[125]|9[479])|3(?:[03568]\\d|1[3-8]|2[01]|4[1-8])|4(?:[0356]\\d|1[1-368]|7[58]|8[15-8]|9[23579])|5(?:[0358]\\d|[19][1-9]|2[1-57-9]|4[13-8]|6[126]|7[0-3578])|7\\d\\d)\\d{6}", [9]], ["(?:6[1-58]|970\\d)\\d{7}", [9, 11]], ["800\\d{4,7}", [7, 8, 9, 10]], ["90[069]\\d{4,7}", [7, 8, 9, 10]], 0, 0, ["140(?:1[035]|2[0346]|3[03568]|4[0356]|5[0358]|8[458])|(?:140(?:1[16-8]|2[259]|3[124]|4[17-9]|5[124679]|7)|8[478]\\d{6})\\d", [5, 6, 9]], ["66\\d{7}", [9]], ["(?:85|91)\\d{7}", [9]]]], "NO": ["47", "00", "(?:0|[2-9]\\d{3})\\d{4}", [5, 8], [["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["8"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[2-79]"]]], 0, 0, 0, 0, 0, "[02-689]|7[0-8]", [["(?:2[1-4]|3[1-3578]|5[1-35-7]|6[1-46-9]|7[0-8])\\d{6}", [8]], ["45(?:[0-24-9]\\d|3[0-57-9])\\d{4}|(?:4[016-8]|9\\d)\\d{6}", [8]], ["80[01]\\d{5}", [8]], ["82[09]\\d{5}", [8]], ["880\\d{5}", [8]], ["81[23]\\d{5}", [8]], ["(?:0[235-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}"], 0, ["85[0-5]\\d{5}", [8]], ["810(?:0[0-6]|[2-8]\\d)\\d{3}", [8]]]], "NP": ["977", "00", "(?:1\\d|9)\\d{9}|[1-9]\\d{7}", [8, 10, 11], [["(\\d)(\\d{7})", "$1-$2", ["1[2-6]"], "0$1"], ["(\\d{2})(\\d{6})", "$1-$2", ["1[01]|[2-8]|9(?:[1-59]|[67][2-6])"], "0$1"], ["(\\d{3})(\\d{7})", "$1-$2", ["9"]]], "0", 0, 0, 0, 0, 0, [["(?:1[0-6]\\d|99[02-6])\\d{5}|(?:2[13-79]|3[135-8]|4[146-9]|5[135-7]|6[13-9]|7[15-9]|8[1-46-9]|9[1-7])[2-6]\\d{5}", [8]], ["9(?:00|6[0-3]|7[0-24-6]|8[0-24-68])\\d{7}", [10]], ["1(?:66001|800\\d\\d)\\d{5}", [11]]]], "NR": ["674", "00", "(?:222|444|(?:55|8\\d)\\d|666|777|999)\\d{4}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[24-9]"]]], 0, 0, 0, 0, 0, 0, [["444\\d{4}"], ["(?:222|55[3-9]|666|777|8\\d\\d|999)\\d{4}"]]], "NU": ["683", "00", "(?:[4-7]|888\\d)\\d{3}", [4, 7], [["(\\d{3})(\\d{4})", "$1 $2", ["8"]]], 0, 0, 0, 0, 0, 0, [["[47]\\d{3}", [4]], ["(?:[56]|888[1-9])\\d{3}"]]], "NZ": ["64", "0(?:0|161)", "[1289]\\d{9}|50\\d{5}(?:\\d{2,3})?|[27-9]\\d{7,8}|(?:[34]\\d|6[0-35-9])\\d{6}|8\\d{4,6}", [5, 6, 7, 8, 9, 10], [["(\\d{2})(\\d{3,8})", "$1 $2", ["8[1-79]"], "0$1"], ["(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", ["50[036-8]|8|90", "50(?:[0367]|88)|8|90"], "0$1"], ["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["24|[346]|7[2-57-9]|9[2-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["2(?:10|74)|[589]"], "0$1"], ["(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", ["1|2[028]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,5})", "$1 $2 $3", ["2(?:[169]|7[0-35-9])|7"], "0$1"]], "0", 0, 0, 0, 0, 0, [["240\\d{5}|(?:3[2-79]|[49][2-9]|6[235-9]|7[2-57-9])\\d{6}", [8]], ["2(?:[0-27-9]\\d|6)\\d{6,7}|2(?:1\\d|75)\\d{5}", [8, 9, 10]], ["508\\d{6,7}|80\\d{6,8}", [8, 9, 10]], ["(?:1[13-57-9]\\d{5}|50(?:0[08]|30|66|77|88))\\d{3}|90\\d{6,8}", [7, 8, 9, 10]], ["70\\d{7}", [9]], 0, ["8(?:1[16-9]|22|3\\d|4[045]|5[459]|6[235-9]|7[0-3579]|90)\\d{2,7}"]], "00"], "OM": ["968", "00", "(?:1505|[279]\\d{3}|500)\\d{4}|800\\d{5,6}", [7, 8, 9], [["(\\d{3})(\\d{4,6})", "$1 $2", ["[58]"]], ["(\\d{2})(\\d{6})", "$1 $2", ["2"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[179]"]]], 0, 0, 0, 0, 0, 0, [["2[1-6]\\d{6}", [8]], ["(?:1505|90[1-9]\\d)\\d{4}|(?:7[124-9]|9[1-9])\\d{6}", [8]], ["8007\\d{4,5}|(?:500|800[05])\\d{4}"], ["900\\d{5}", [8]]]], "PA": ["507", "00", "(?:00800|8\\d{3})\\d{6}|[68]\\d{7}|[1-57-9]\\d{6}", [7, 8, 10, 11], [["(\\d{3})(\\d{4})", "$1-$2", ["[1-57-9]"]], ["(\\d{4})(\\d{4})", "$1-$2", ["[68]"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["(?:1(?:0\\d|1[0479]|2[37]|3[0137]|4[147]|5[05]|6[058]|7[0167]|8[2358]|9[1389])|2(?:[0235-79]\\d|1[0-7]|4[013-9]|8[02-9])|3(?:[0147-9]\\d|[25][0-5]|33|6[068])|4(?:00|3[0-579]|4\\d|7[0-57-9])|5(?:[01]\\d|2[0-7]|[56]0|79)|7(?:0[09]|2[0-26-8]|3[03]|4[04]|5[05-9]|6[0156]|7[0-24-9]|8[4-9]|90)|8(?:09|2[89]|3\\d|4[0-24-689]|5[014]|8[02])|9(?:0[5-9]|1[0-35-8]|2[036-9]|3[35-79]|40|5[0457-9]|6[05-9]|7[04-9]|8[235-8]|9\\d))\\d{4}", [7]], ["(?:1[16]1|21[89]|6\\d{3}|8(?:1[01]|7[23]))\\d{4}", [7, 8]], ["800\\d{4,5}|(?:00800|800\\d)\\d{6}"], ["(?:8(?:22|55|60|7[78]|86)|9(?:00|81))\\d{4}", [7]]]], "PE": ["51", "00|19(?:1[124]|77|90)00", "(?:[14-8]|9\\d)\\d{7}", [8, 9], [["(\\d{3})(\\d{5})", "$1 $2", ["80"], "(0$1)"], ["(\\d)(\\d{7})", "$1 $2", ["1"], "(0$1)"], ["(\\d{2})(\\d{6})", "$1 $2", ["[4-8]"], "(0$1)"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["9"]]], "0", 0, 0, 0, 0, 0, [["(?:(?:19[02-68]|(?:4[34]|5[14])[0-8]|687)\\d|7(?:173|(?:3[0-8]|55)\\d)|8(?:10[05689]|6(?:0[06-9]|1[6-9]|29)|7(?:0[0569]|[56]0)))\\d{4}|(?:1[0-8]|4[12]|5[236]|6[1-7]|7[246]|8[2-4])\\d{6}", [8]], ["9\\d{8}", [9]], ["800\\d{5}", [8]], ["805\\d{5}", [8]], ["80[24]\\d{5}", [8]], 0, 0, 0, 0, ["801\\d{5}", [8]]], "00", " Anexo "], "PF": ["689", "00", "4\\d{5}(?:\\d{2})?|8\\d{7,8}", [6, 8, 9], [["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["44"]], ["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["4|8[7-9]"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"]]], 0, 0, 0, 0, 0, 0, [["4(?:0[4-689]|9[4-68])\\d{5}", [8]], ["8[7-9]\\d{6}", [8]], ["80[0-5]\\d{6}", [9]], 0, 0, 0, ["44\\d{4}", [6]], 0, ["499\\d{5}", [8]]]], "PG": ["675", "00|140[1-3]", "(?:180|[78]\\d{3})\\d{4}|(?:[2-589]\\d|64)\\d{5}", [7, 8], [["(\\d{3})(\\d{4})", "$1 $2", ["18|[2-69]|85[02-46-9]"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[78]"]]], 0, 0, 0, 0, 0, 0, [["(?:(?:3[0-2]|4[257]|5[34]|9[78])\\d|64[1-9]|85[02-46-9])\\d{4}", [7]], ["(?:7\\d|8[1-58])\\d{6}", [8]], ["180\\d{4}", [7]], 0, 0, 0, 0, ["27[01]\\d{4}", [7]], ["2(?:0[0-57]|7[568])\\d{4}", [7]]], "00"], "PH": ["63", "00", "(?:[2-7]|9\\d)\\d{8}|2\\d{5}|(?:1800|8)\\d{7,9}", [6, 8, 9, 10, 11, 12, 13], [["(\\d)(\\d{5})", "$1 $2", ["2"], "(0$1)"], ["(\\d{4})(\\d{4,6})", "$1 $2", ["3(?:23|39|46)|4(?:2[3-6]|[35]9|4[26]|76)|544|88[245]|(?:52|64|86)2", "3(?:230|397|461)|4(?:2(?:35|[46]4|51)|396|4(?:22|63)|59[347]|76[15])|5(?:221|446)|642[23]|8(?:622|8(?:[24]2|5[13]))"], "(0$1)"], ["(\\d{5})(\\d{4})", "$1 $2", ["346|4(?:27|9[35])|883", "3469|4(?:279|9(?:30|56))|8834"], "(0$1)"], ["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["2"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[3-7]|8[2-8]"], "(0$1)"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["[89]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"]], ["(\\d{4})(\\d{1,2})(\\d{3})(\\d{4})", "$1 $2 $3 $4", ["1"]]], "0", 0, 0, 0, 0, 0, [["(?:(?:2[3-8]|3[2-68]|4[2-9]|5[2-6]|6[2-58]|7[24578])\\d{3}|88(?:22\\d\\d|42))\\d{4}|(?:2|8[2-8]\\d\\d)\\d{5}", [6, 8, 9, 10]], ["(?:8(?:1[37]|9[5-8])|9(?:0[5-9]|1[0-24-9]|[235-7]\\d|4[2-9]|8[135-9]|9[1-9]))\\d{7}", [10]], ["1800\\d{7,9}", [11, 12, 13]]]], "PK": ["92", "00", "122\\d{6}|[24-8]\\d{10,11}|9(?:[013-9]\\d{8,10}|2(?:[01]\\d\\d|2(?:[06-8]\\d|1[01]))\\d{7})|(?:[2-8]\\d{3}|92(?:[0-7]\\d|8[1-9]))\\d{6}|[24-9]\\d{8}|[89]\\d{7}", [8, 9, 10, 11, 12], [["(\\d{3})(\\d{3})(\\d{2,7})", "$1 $2 $3", ["[89]0"], "0$1"], ["(\\d{4})(\\d{5})", "$1 $2", ["1"]], ["(\\d{3})(\\d{6,7})", "$1 $2", ["2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8])", "9(?:2[3-8]|98)|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:22|3[27-9]|4[2-6]|6[3569]|9[25-7]))[2-9]"], "(0$1)"], ["(\\d{2})(\\d{7,8})", "$1 $2", ["(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]"], "(0$1)"], ["(\\d{5})(\\d{5})", "$1 $2", ["58"], "(0$1)"], ["(\\d{3})(\\d{7})", "$1 $2", ["3"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91"], "(0$1)"], ["(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["[24-9]"], "(0$1)"]], "0", 0, 0, 0, 0, 0, [["(?:(?:21|42)[2-9]|58[126])\\d{7}|(?:2[25]|4[0146-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]\\d{6,7}|(?:2(?:3[2358]|4[2-4]|9[2-8])|45[3479]|54[2-467]|60[468]|72[236]|8(?:2[2-689]|3[23578]|4[3478]|5[2356])|9(?:2[2-8]|3[27-9]|4[2-6]|6[3569]|9[25-8]))[2-9]\\d{5,6}", [9, 10]], ["3(?:[0-247]\\d|3[0-79]|55|64)\\d{7}", [10]], ["800\\d{5}(?:\\d{3})?", [8, 11]], ["900\\d{5}", [8]], ["122\\d{6}", [9]], 0, ["(?:2(?:[125]|3[2358]|4[2-4]|9[2-8])|4(?:[0-246-9]|5[3479])|5(?:[1-35-7]|4[2-467])|6(?:0[468]|[1-8])|7(?:[14]|2[236])|8(?:[16]|2[2-689]|3[23578]|4[3478]|5[2356])|9(?:1|22|3[27-9]|4[2-6]|6[3569]|9[2-7]))111\\d{6}", [11, 12]]]], "PL": ["48", "00", "(?:6|8\\d\\d)\\d{7}|[1-9]\\d{6}(?:\\d{2})?|[26]\\d{5}", [6, 7, 8, 9, 10], [["(\\d{5})", "$1", ["19"]], ["(\\d{3})(\\d{3})", "$1 $2", ["11|20|64"]], ["(\\d{2})(\\d{2})(\\d{3})", "$1 $2 $3", ["30|(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])1", "30|(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])19"]], ["(\\d{3})(\\d{2})(\\d{2,3})", "$1 $2 $3", ["64"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["21|39|45|5[0137]|6[0469]|7[02389]|8(?:0[14]|8)"]], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["1[2-8]|[2-7]|8[1-79]|9[145]"]], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["8"]]], 0, 0, 0, 0, 0, 0, [["(?:30|47\\d\\d)\\d{5}|(?:1[2-8]|2[2-69]|3[2-4]|4[1-468]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145])(?:[02-9]\\d{6}|1(?:[0-8]\\d{5}|9\\d{3}(?:\\d{2})?))", [7, 9]], ["21(?:1[013-5]|2\\d|3[1-9])\\d{5}|(?:45|5[0137]|6[069]|7[2389]|88)\\d{7}", [9]], ["800\\d{6,7}", [9, 10]], ["70[01346-8]\\d{6}", [9]], 0, 0, ["804\\d{6}", [9]], ["64\\d{4,7}", [6, 7, 8, 9]], ["39\\d{7}", [9]], ["801\\d{6}", [9]]]], "PM": ["508", "00", "[78]\\d{8}|[2-9]\\d{5}", [6, 9], [["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["[2-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["7"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["80[6-9]\\d{6}|(?:[236-9]\\d|4[1-35-9]|5[0-47-9])\\d{4}"], ["708(?:4[0-5]|5[0-6])\\d{4}|(?:[236-9]\\d|4[02-489]|5[02-9])\\d{4}"], ["80[0-5]\\d{6}", [9]], ["8[129]\\d{7}", [9]]]], "PR": ["1", "011", "(?:[589]\\d\\d|787)\\d{7}", [10], 0, "1", 0, 0, 0, 0, "787|939", [["(?:787|939)[2-9]\\d{6}"], [""], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "PS": ["970", "00", "[2489]2\\d{6}|(?:1\\d|5)\\d{8}", [8, 9, 10], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["[2489]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["5"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1"]]], "0", 0, 0, 0, 0, 0, [["(?:22[2-47-9]|42[45]|82[014-68]|92[3569])\\d{5}", [8]], ["5[69]\\d{7}", [9]], ["1800\\d{6}", [10]], 0, 0, 0, 0, 0, 0, ["1700\\d{6}", [10]]]], "PT": ["351", "00", "1693\\d{5}|(?:[26-9]\\d|30)\\d{7}", [9], [["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["2[12]"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["16|[236-9]"]]], 0, 0, 0, 0, 0, 0, [["2(?:[12]\\d|3[1-689]|4[1-59]|[57][1-9]|6[1-35689]|8[1-69]|9[1256])\\d{6}"], ["6(?:[06]92(?:30|9\\d)|[35]92(?:[049]\\d|3[034]))\\d{3}|(?:(?:16|6[0356])93|9(?:[1-36]\\d\\d|480))\\d{5}"], ["80[02]\\d{6}"], ["(?:6(?:0[178]|4[68])\\d|76(?:0[1-57]|1[2-47]|2[1-37]))\\d{5}"], ["884[0-4689]\\d{5}"], ["600\\d{6}|6[06]92(?:0\\d|3[349]|49)\\d{3}"], ["70(?:38[01]|596|(?:7\\d|8[17])\\d)\\d{4}"], ["6(?:222\\d|89(?:00|88|99))\\d{4}"], ["30\\d{7}"], ["80(?:8\\d|9[1579])\\d{5}"]]], "PW": ["680", "01[12]", "(?:[24-8]\\d\\d|345|900)\\d{4}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[2-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2(?:55|77)|345|488|5(?:35|44|87)|6(?:22|54|79)|7(?:33|47)|8(?:24|55|76)|900)\\d{4}"], ["(?:(?:46|83)[0-5]|(?:6[2-4689]|78)0)\\d{4}|(?:45|77|88)\\d{5}"]]], "PY": ["595", "00", "[36-8]\\d{5,8}|4\\d{6,8}|59\\d{6}|9\\d{5,10}|(?:2\\d|5[0-8])\\d{6,7}", [6, 7, 8, 9, 10, 11], [["(\\d{3})(\\d{3,6})", "$1 $2", ["[2-9]0"], "0$1"], ["(\\d{2})(\\d{5})", "$1 $2", ["3[289]|4[246-8]|61|7[1-3]|8[1-36]"], "(0$1)"], ["(\\d{3})(\\d{4,5})", "$1 $2", ["2[279]|3[13-5]|4[359]|5|6(?:[34]|7[1-46-8])|7[46-8]|85"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["2[14-68]|3[26-9]|4[1246-8]|6(?:1|75)|7[1-35]|8[1-36]"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["87"]], ["(\\d{3})(\\d{6})", "$1 $2", ["9(?:[5-79]|8[1-7])"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2-8]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["9"]]], "0", 0, 0, 0, 0, 0, [["(?:3[289]|4[246-8]|61|7[1-3]|8[1-36])\\d{5,7}|(?:2(?:[14-68]\\d|2[4-68]|7[15]|9[1-5])|3(?:18|3[167]|4[2357]|51|[67]\\d)|4(?:1\\d|3[12]|5[13]|9[1-47])|5(?:[1-4]\\d|5[02-4])|6(?:3[1-3]|44|7[1-8])|7(?:4[0-4]|5\\d|6[1-578]|75|8[0-8])|858)\\d{5,6}", [7, 8, 9]], ["9(?:51|6[129]|7[1-6]|8[1-7]|9[1-5])\\d{6}", [9]], ["9800\\d{5,7}", [9, 10, 11]], 0, 0, 0, ["[245]0\\d{6,7}|[36-9]0\\d{4,7}", [6, 7, 8, 9]], 0, ["8700[0-4]\\d{4}", [9]]]], "QA": ["974", "00", "800\\d{4}|(?:2|800)\\d{6}|(?:0080|[3-7])\\d{7}", [7, 8, 9, 11], [["(\\d{3})(\\d{4})", "$1 $2", ["2[136]|8"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[3-7]"]]], 0, 0, 0, 0, 0, 0, [["4(?:(?:[014]\\d\\d|999)\\d|2022)\\d{3}", [8]], ["[35-7]\\d{7}", [8]], ["800\\d{4}|(?:0080[01]|800)\\d{6}", [7, 9, 11]], 0, 0, 0, 0, ["2[136]\\d{5}", [7]]]], "RE": ["262", "00", "709\\d{6}|(?:26|[689]\\d)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[26-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["2631[0-6]\\d{4}|26(?:2\\d|30|88)\\d{5}"], ["(?:69(?:2\\d\\d|3(?:[06][0-6]|1[0-3]|2[0-2]|3[0-39]|4\\d|5[0-5]|7[0-37]|8[0-8]|9[0-479]))|7092[0-3])\\d{4}"], ["80\\d{7}"], ["89[1-37-9]\\d{6}"], 0, 0, 0, 0, ["9(?:399[0-3]|479[0-6]|76(?:2[278]|3[0-37]))\\d{4}"], ["8(?:1[019]|2[0156]|84|90)\\d{6}"]]], "RO": ["40", "00", "(?:[236-8]\\d|90)\\d{7}|[23]\\d{5}", [6, 9], [["(\\d{3})(\\d{3})", "$1 $2", ["2[3-6]", "2[3-6]\\d9"], "0$1"], ["(\\d{2})(\\d{4})", "$1 $2", ["219|31"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[23]1"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[236-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["[23][13-6]\\d{7}|(?:2(?:19\\d|[3-6]\\d9)|31\\d\\d)\\d\\d"], ["(?:630|702)0\\d{5}|(?:6(?:00|2\\d)|7(?:0[013-9]|1[0-3]|[2-7]\\d|8[03-8]|9[0-39]))\\d{6}", [9]], ["800\\d{6}", [9]], ["90[0136]\\d{6}", [9]], 0, 0, ["(?:37\\d|80[578])\\d{6}", [9]], 0, 0, ["801\\d{6}", [9]]], 0, " int "], "RS": ["381", "00", "38[02-9]\\d{6,9}|6\\d{7,9}|90\\d{4,8}|38\\d{5,6}|(?:7\\d\\d|800)\\d{3,9}|(?:[12]\\d|3[0-79])\\d{5,10}", [6, 7, 8, 9, 10, 11, 12], [["(\\d{3})(\\d{3,9})", "$1 $2", ["(?:2[389]|39)0|[7-9]"], "0$1"], ["(\\d{2})(\\d{5,10})", "$1 $2", ["[1-36]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:11[1-9]\\d|(?:2[389]|39)(?:0[2-9]|[2-9]\\d))\\d{3,8}|(?:1[02-9]|2[0-24-7]|3[0-8])[2-9]\\d{4,9}", [7, 8, 9, 10, 11, 12]], ["6(?:[0-689]|7\\d)\\d{6,7}", [8, 9, 10]], ["800\\d{3,9}"], ["(?:78\\d|90[0169])\\d{3,7}", [6, 7, 8, 9, 10]], 0, 0, ["7[06]\\d{4,10}"]]], "RU": ["7", "810", "8\\d{13}|[347-9]\\d{9}", [10, 14], [["(\\d{4})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["7(?:1[0-8]|2[1-9])", "7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:1[23]|[2-9]2))", "7(?:1(?:[0-356]2|4[29]|7|8[27])|2(?:13[03-69]|62[013-9]))|72[1-57-9]2"], "8 ($1)", 1], ["(\\d{5})(\\d)(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["7(?:1[0-68]|2[1-9])", "7(?:1(?:[06][3-6]|[18]|2[35]|[3-5][3-5])|2(?:[13][3-5]|[24-689]|7[457]))", "7(?:1(?:0(?:[356]|4[023])|[18]|2(?:3[013-9]|5)|3[45]|43[013-79]|5(?:3[1-8]|4[1-7]|5)|6(?:3[0-35-9]|[4-6]))|2(?:1(?:3[178]|[45])|[24-689]|3[35]|7[457]))|7(?:14|23)4[0-8]|71(?:33|45)[1-79]"], "8 ($1)", 1], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["7"], "8 ($1)", 1], ["(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2-$3-$4", ["[349]|8(?:[02-7]|1[1-8])"], "8 ($1)", 1], ["(\\d{4})(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["8"], "8 ($1)"]], "8", 0, 0, 0, 0, "[3489]", [["(?:3(?:0[12]|36|4[1-35-79]|5[1-3]|65|8[1-58]|9[0145])|4(?:01|1[1356]|2[13467]|7[1-5]|8[1-7]|9[1-689])|8(?:1[1-8]|2[01]|3[13-6]|4[0-8]|5[15-7]|6[0-35-79]|7[1-37-9]))\\d{7}", [10]], ["9\\d{9}", [10]], ["8(?:0[04]|108\\d{3})\\d{7}"], ["80[39]\\d{7}", [10]], ["808\\d{7}", [10]]], "8~10"], "RW": ["250", "00", "(?:06|[27]\\d\\d|[89]00)\\d{6}", [8, 9], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["0"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["2"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[7-9]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:06|2[23568]\\d)\\d{6}"], ["7[237-9]\\d{7}", [9]], ["800\\d{6}", [9]], ["900\\d{6}", [9]]]], "SA": ["966", "00", "(?:[15]\\d|800|92)\\d{7}", [9, 10], [["(\\d{4})(\\d{5})", "$1 $2", ["9"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["5"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"]]], "0", 0, 0, 0, 0, 0, [["1(?:1\\d|2[24-8]|3[35-8]|4[3-68]|6[2-5]|7[235-7])\\d{6}", [9]], ["579[0-8]\\d{5}|5(?:[013-689]\\d|7[0-8])\\d{6}", [9]], ["800\\d{7}", [10]], ["925\\d{6}", [9]], 0, 0, 0, 0, 0, ["920\\d{6}", [9]]]], "SB": ["677", "0[01]", "[6-9]\\d{6}|[1-6]\\d{4}", [5, 7], [["(\\d{2})(\\d{5})", "$1 $2", ["6[89]|7|8[4-9]|9(?:[0-8]|9[0-8])"]]], 0, 0, 0, 0, 0, 0, [["(?:1[4-79]|[23]\\d|4[0-2]|5[03]|6[0-37])\\d{3}", [5]], ["(?:48|99[0-8]\\d)\\d{3}|(?:6[89]|7[1-9]|8[4-9]|9[0-8])\\d{5}"], ["1[38]\\d{3}", [5]], 0, 0, 0, 0, 0, ["5[12]\\d{3}", [5]]]], "SC": ["248", "010|0[0-2]", "(?:[2489]\\d|64)\\d{5}", [7], [["(\\d)(\\d{3})(\\d{3})", "$1 $2 $3", ["[246]|9[57]"]]], 0, 0, 0, 0, 0, 0, [["4[2-46]\\d{5}"], ["2[125-8]\\d{5}"], ["800[08]\\d{3}"], ["85\\d{5}"], 0, 0, 0, 0, ["971\\d{4}|(?:64|95)\\d{5}"]], "00"], "SD": ["249", "00", "[19]\\d{8}", [9], [["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[19]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1(?:5\\d|8[35-7])\\d{6}"], ["(?:1[0-2]|9[0-3569])\\d{7}"]]], "SE": ["46", "00", "(?:[26]\\d\\d|9)\\d{9}|[1-9]\\d{8}|[1-689]\\d{7}|[1-4689]\\d{6}|2\\d{5}", [6, 7, 8, 9, 10, 12], [["(\\d{2})(\\d{2,3})(\\d{2})", "$1-$2 $3", ["20"], "0$1", 0, "$1 $2 $3"], ["(\\d{3})(\\d{4})", "$1-$2", ["9(?:00|39|44|9)"], "0$1", 0, "$1 $2"], ["(\\d{2})(\\d{3})(\\d{2})", "$1-$2 $3", ["[12][136]|3[356]|4[0246]|6[03]|90[1-9]"], "0$1", 0, "$1 $2 $3"], ["(\\d)(\\d{2,3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", ["8"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d{3})(\\d{2,3})(\\d{2})", "$1-$2 $3", ["1[2457]|2(?:[247-9]|5[0138])|3[0247-9]|4[1357-9]|5[0-35-9]|6(?:[125689]|4[02-57]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"], "0$1", 0, "$1 $2 $3"], ["(\\d{3})(\\d{2,3})(\\d{3})", "$1-$2 $3", ["9(?:00|39|44)"], "0$1", 0, "$1 $2 $3"], ["(\\d{2})(\\d{2,3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", ["1[13689]|2[0136]|3[1356]|4[0246]|54|6[03]|90[1-9]"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1-$2 $3 $4", ["10|7"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1-$2 $3 $4", ["8"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1-$2 $3 $4", ["[13-5]|2(?:[247-9]|5[0138])|6(?:[124-689]|7[0-2])|9(?:[125-8]|3[02-5]|4[0-3])"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d{3})(\\d{2})(\\d{2})(\\d{3})", "$1-$2 $3 $4", ["9"], "0$1", 0, "$1 $2 $3 $4"], ["(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1-$2 $3 $4 $5", ["[26]"], "0$1", 0, "$1 $2 $3 $4 $5"]], "0", 0, 0, 0, 0, 0, [["(?:(?:[12][136]|3[356]|4[0246]|6[03]|8\\d)\\d|90[1-9])\\d{4,6}|(?:1(?:2[0-35]|4[0-4]|5[0-25-9]|7[13-6]|[89]\\d)|2(?:2[0-7]|4[0136-8]|5[0138]|7[018]|8[01]|9[0-57])|3(?:0[0-4]|1\\d|2[0-25]|4[056]|7[0-2]|8[0-3]|9[023])|4(?:1[013-8]|3[0135]|5[14-79]|7[0-246-9]|8[0156]|9[0-689])|5(?:0[0-6]|[15][0-5]|2[0-68]|3[0-4]|4\\d|6[03-5]|7[013]|8[0-79]|9[01])|6(?:1[1-3]|2[0-4]|4[02-57]|5[0-37]|6[0-3]|7[0-2]|8[0247]|9[0-356])|9(?:1[0-68]|2\\d|3[02-5]|4[0-3]|5[0-4]|[68][01]|7[0135-8]))\\d{5,6}", [7, 8, 9]], ["7[023689]\\d{7}", [9]], ["20\\d{4,7}", [6, 7, 8, 9]], ["649\\d{6}|99[1-59]\\d{4}(?:\\d{3})?|9(?:00|39|44)[1-8]\\d{3,6}", [7, 8, 9, 10]], ["75[1-8]\\d{6}", [9]], ["(?:25[245]|67[3-68])\\d{9}", [12]], ["10[1-8]\\d{6}", [9]], ["74[02-9]\\d{6}", [9]], 0, ["77[0-7]\\d{6}", [9]]]], "SG": ["65", "0[0-3]\\d", "(?:(?:1\\d|8)\\d\\d|7000)\\d{7}|[3689]\\d{7}", [8, 10, 11], [["(\\d{4})(\\d{4})", "$1 $2", ["[369]|8(?:0[1-9]|[1-9])"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"]], ["(\\d{4})(\\d{4})(\\d{3})", "$1 $2 $3", ["7"]], ["(\\d{4})(\\d{3})(\\d{4})", "$1 $2 $3", ["1"]]], 0, 0, 0, 0, 0, 0, [["662[0-24-9]\\d{4}|6(?:[0-578]\\d|6[013-57-9]|9[0-35-9])\\d{5}", [8]], ["80[1-9]\\d{5}|(?:8[1-9]|9[0-8])\\d{6}", [8]], ["(?:18|8)00\\d{7}", [10, 11]], ["1900\\d{7}", [11]], 0, 0, ["7000\\d{7}", [11]], 0, ["(?:3[12]\\d|666)\\d{5}", [8]]]], "SH": ["290", "00", "(?:[256]\\d|8)\\d{3}", [4, 5], 0, 0, 0, 0, 0, 0, "[256]", [["2(?:[0-57-9]\\d|6[4-9])\\d\\d"], ["[56]\\d{4}", [5]], 0, 0, 0, 0, 0, 0, ["262\\d\\d", [5]]]], "SI": ["386", "00|10(?:22|66|88|99)", "[1-7]\\d{7}|8\\d{4,7}|90\\d{4,6}", [5, 6, 7, 8], [["(\\d{2})(\\d{3,6})", "$1 $2", ["8[09]|9"], "0$1"], ["(\\d{3})(\\d{5})", "$1 $2", ["59|8"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[37][01]|4[013]|51|6"], "0$1"], ["(\\d)(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[1-57]"], "(0$1)"]], "0", 0, 0, 0, 0, 0, [["(?:[1-357][2-8]|4[24-8])\\d{6}", [8]], ["65(?:[178]\\d|5[56]|6[01])\\d{4}|(?:[37][01]|4[013]|51|6[489])\\d{6}", [8]], ["80\\d{4,6}", [6, 7, 8]], ["89[1-3]\\d{2,5}|90\\d{4,6}"], 0, 0, 0, 0, ["(?:59\\d\\d|8(?:1(?:[67]\\d|8[0-589])|2(?:0\\d|2[0-37-9]|8[0-2489])|3[389]\\d))\\d{4}", [8]]], "00"], "SJ": ["47", "00", "0\\d{4}|(?:[489]\\d|79)\\d{6}", [5, 8], 0, 0, 0, 0, 0, 0, "79", [["79\\d{6}", [8]], ["45(?:[0-24-9]\\d|3[0-57-9])\\d{4}|(?:4[016-8]|9\\d)\\d{6}", [8]], ["80[01]\\d{5}", [8]], ["82[09]\\d{5}", [8]], ["880\\d{5}", [8]], ["81[23]\\d{5}", [8]], ["(?:0[235-9]|81(?:0(?:0[7-9]|1\\d)|5\\d\\d))\\d{3}"], 0, ["85[0-5]\\d{5}", [8]], ["810(?:0[0-6]|[2-8]\\d)\\d{3}", [8]]]], "SK": ["421", "00", "[2-689]\\d{8}|[2-59]\\d{6}|[2-5]\\d{5}", [6, 7, 9], [["(\\d)(\\d{2})(\\d{3,4})", "$1 $2 $3", ["21"], "0$1"], ["(\\d{2})(\\d{2})(\\d{2,3})", "$1 $2 $3", ["[3-5][1-8]1", "[3-5][1-8]1[67]"], "0$1"], ["(\\d)(\\d{3})(\\d{3})(\\d{2})", "$1 $2 $3 $4", ["2"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[689]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[3-5]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2(?:16|[2-9]\\d{3})|(?:(?:[3-5][1-8]\\d|819)\\d|601[1-5])\\d)\\d{4}|(?:2|[3-5][1-8])1[67]\\d{3}|[3-5][1-8]16\\d\\d"], ["909[1-9]\\d{5}|9(?:0[1-8]|1[0-24-9]|4[03-57-9]|5\\d)\\d{6}", [9]], ["800\\d{6}", [9]], ["9(?:00|[78]\\d)\\d{6}", [9]], 0, 0, ["96\\d{7}", [9]], ["9090\\d{3}", [7]], ["6(?:02|5[0-4]|9[0-6])\\d{6}", [9]], ["8[5-9]\\d{7}", [9]]]], "SL": ["232", "00", "(?:[237-9]\\d|66)\\d{6}", [8], [["(\\d{2})(\\d{6})", "$1 $2", ["[236-9]"], "(0$1)"]], "0", 0, 0, 0, 0, 0, [["22[2-4][2-9]\\d{4}"], ["(?:25|3[0-5]|66|7\\d|8[08]|9[09])\\d{6}"]]], "SM": ["378", "00", "(?:0549|[5-7]\\d)\\d{6}", [8, 10], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[5-7]"]], ["(\\d{4})(\\d{6})", "$1 $2", ["0"]]], 0, 0, "([89]\\d{5})$", "0549$1", 0, 0, [["0549(?:8[0157-9]|9\\d)\\d{4}", [10]], ["6[16]\\d{6}", [8]], 0, ["7[178]\\d{6}", [8]], 0, 0, 0, 0, ["5[158]\\d{6}", [8]]]], "SN": ["221", "00", "(?:[378]\\d|93)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"]], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[379]"]]], 0, 0, 0, 0, 0, 0, [["3(?:[026]\\d|3[89])\\d{6}"], ["7(?:[015-8]\\d|21|90)\\d{6}"], ["800\\d{6}"], ["88[4689]\\d{6}"], 0, 0, 0, 0, ["(?:39|93)\\d{7}"], ["81[02468]\\d{6}"]]], "SO": ["252", "00", "[346-9]\\d{8}|[12679]\\d{7}|[1-5]\\d{6}|[1348]\\d{5}", [6, 7, 8, 9], [["(\\d{2})(\\d{4})", "$1 $2", ["8[125]"]], ["(\\d{6})", "$1", ["[134]"]], ["(\\d)(\\d{6})", "$1 $2", ["[15]|2[0-79]|3[0-46-8]|4[0-7]"]], ["(\\d{2})(\\d{5,7})", "$1 $2", ["1|28|9[2-9]"]], ["(\\d)(\\d{7})", "$1 $2", ["[267]|904"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[346-9]"]]], "0", 0, 0, 0, 0, 0, [["(?:1\\d|2[0-79]|3[0-46-8]|4[0-7]|5[57-9])\\d{5}|(?:[134]\\d|8[125])\\d{4}", [6, 7]], ["(?:(?:15|(?:3[59]|4[89]|6\\d|7[0-35-9]|8[08])\\d|9(?:0\\d|[2-9]))\\d|2(?:4\\d|8))\\d{5}|(?:[67]\\d\\d|904)\\d{5}", [7, 8, 9]]]], "SR": ["597", "00", "(?:[2-5]|[6-9]\\d)\\d{5}", [6, 7], [["(\\d{2})(\\d{2})(\\d{2})", "$1-$2-$3", ["56"]], ["(\\d{3})(\\d{3})", "$1-$2", ["[2-5]"]], ["(\\d{3})(\\d{4})", "$1-$2", ["[6-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2[1-3]|3[0-7]|4\\d|5[2-578])\\d{4}", [6]], ["(?:6[08]|7[1-79]|8[1-9])\\d{5}", [7]], ["80\\d{5}", [7]], ["90\\d{5}", [7]], 0, 0, 0, 0, ["(?:56|91\\d)\\d{4}"]]], "SS": ["211", "00", "[19]\\d{8}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[19]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["1[89]\\d{7}"], ["(?:12|9[1257-9])\\d{7}"]]], "ST": ["239", "00", "(?:22|9\\d)\\d{5}", [7], [["(\\d{3})(\\d{4})", "$1 $2", ["[29]"]]], 0, 0, 0, 0, 0, 0, [["22\\d{5}"], ["900[5-9]\\d{3}|9(?:0[1-9]|[89]\\d)\\d{4}"]]], "SV": ["503", "00", "[25-7]\\d{7}|(?:80\\d|900)\\d{4}(?:\\d{4})?", [7, 8, 11], [["(\\d{3})(\\d{4})", "$1 $2", ["[89]"]], ["(\\d{4})(\\d{4})", "$1 $2", ["[25-7]"]], ["(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", ["[89]"]]], 0, 0, 0, 0, 0, 0, [["2(?:79(?:0[0347-9]|[1-9]\\d)|89(?:0[024589]|[1-9]\\d))\\d{3}|2(?:[1-69]\\d|[78][0-8])\\d{5}", [8]], ["[5-7]\\d{7}", [8]], ["800\\d{8}|80[01]\\d{4}", [7, 11]], ["900\\d{4}(?:\\d{4})?", [7, 11]]]], "SX": ["1", "011", "7215\\d{6}|(?:[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "(5\\d{6})$|1", "721$1", 0, "721", [["7215(?:4[2-8]|8[39]|9[056])\\d{4}"], ["7215(?:1[02]|2\\d|5[034679]|8[0-24-8])\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "SY": ["963", "00", "[1-359]\\d{8}|[1-5]\\d{7}", [8, 9], [["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[1-4]|5[1-3]"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[59]"], "0$1", 1]], "0", 0, 0, 0, 0, 0, [["(?:1(?:[1478]\\d|[2356])|21\\d|3(?:[13]\\d|4)|4[134]|5[1-3])\\d{6}|2[1-5]\\d{6}"], ["(?:50|9[03-689])\\d{7}", [9]]]], "SZ": ["268", "00", "0800\\d{4}|(?:[237]\\d|900)\\d{6}", [8, 9], [["(\\d{4})(\\d{4})", "$1 $2", ["[0237]"]], ["(\\d{5})(\\d{4})", "$1 $2", ["9"]]], 0, 0, 0, 0, 0, 0, [["[23][2-5]\\d{6}", [8]], ["7[5-9]\\d{6}", [8]], ["0800\\d{4}", [8]], ["900\\d{6}", [9]], 0, 0, 0, 0, ["70\\d{6}", [8]]]], "TA": ["290", "00", "8\\d{3}", [4], 0, 0, 0, 0, 0, 0, "8", [["8\\d{3}"]]], "TC": ["1", "011", "(?:[58]\\d\\d|649|900)\\d{7}", [10], 0, "1", 0, "([2-479]\\d{6})$|1", "649$1", 0, "649", [["649(?:266|712|9(?:4\\d|50))\\d{4}"], ["649(?:2(?:3[129]|4[1-79])|3\\d\\d|4[34][1-3])\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, 0, 0, ["649(?:71[01]|966)\\d{4}"]]], "TD": ["235", "00|16", "(?:22|[3689]\\d|77)\\d{6}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[236-9]"]]], 0, 0, 0, 0, 0, 0, [["22(?:[37-9]0|5[0-5]|6[89])\\d{4}"], ["(?:3[01]|[69]\\d|77|8[5-7])\\d{6}"]], "00"], "TG": ["228", "00", "[279]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[279]"]]], 0, 0, 0, 0, 0, 0, [["2(?:2[2-7]|3[23]|4[45]|55|6[67]|77)\\d{5}"], ["(?:7[0-389]|9[0-36-9])\\d{6}"]]], "TH": ["66", "00[1-9]", "(?:001800|[2-57]|[689]\\d)\\d{7}|1\\d{7,9}", [8, 9, 10, 13], [["(\\d)(\\d{3})(\\d{4})", "$1 $2 $3", ["2"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[13-9]"], "0$1"], ["(\\d{4})(\\d{3})(\\d{3})", "$1 $2 $3", ["1"]]], "0", 0, 0, 0, 0, 0, [["(?:1[0689]|2\\d|3[2-9]|4[2-5]|5[2-6]|7[3-7])\\d{6}", [8]], ["(?:(?:14|[89]\\d)\\d\\d|6(?:[1-6]\\d\\d|7(?:1[0-8]|2[4-7]|3[1-6])))\\d{5}", [9]], ["(?:001800\\d|1800)\\d{6}", [10, 13]], ["1900\\d{6}", [10]], 0, 0, 0, 0, ["6[08]\\d{7}", [9]]]], "TJ": ["992", "810", "(?:[0-57-9]\\d|66)\\d{7}", [9], [["(\\d{6})(\\d)(\\d{2})", "$1 $2 $3", ["331", "3317"]], ["(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", ["44[02-479]|[34]7"]], ["(\\d{4})(\\d)(\\d{4})", "$1 $2 $3", ["3(?:[1245]|3[12])"]], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["\\d"]]], 0, 0, 0, 0, 0, 0, [["(?:3(?:1[3-5]|2[245]|3[12]|4[24-7]|5[25]|72)|4(?:46|74|87))\\d{6}"], ["(?:33[03-9]|4(?:1[18]|4[02-479])|81[1-9])\\d{6}|(?:[09]\\d|1[0-27-9]|2[0-27]|3[08]|40|5[05]|66|7[0157-9]|8[07-9])\\d{7}"]], "8~10"], "TK": ["690", "00", "[2-47]\\d{3,6}", [4, 5, 6, 7], 0, 0, 0, 0, 0, 0, 0, [["(?:2[2-4]|[34]\\d)\\d{2,5}"], ["7[2-4]\\d{2,5}"]]], "TL": ["670", "00", "7\\d{7}|(?:[2-47]\\d|[89]0)\\d{5}", [7, 8], [["(\\d{3})(\\d{4})", "$1 $2", ["[2-489]|70"]], ["(\\d{4})(\\d{4})", "$1 $2", ["7"]]], 0, 0, 0, 0, 0, 0, [["(?:2[1-5]|3[1-9]|4[1-4])\\d{5}", [7]], ["7[2-8]\\d{6}", [8]], ["80\\d{5}", [7]], ["90\\d{5}", [7]], ["70\\d{5}", [7]]]], "TM": ["993", "810", "[1-7]\\d{7}", [8], [["(\\d{2})(\\d{2})(\\d{2})(\\d{2})", "$1 $2-$3-$4", ["12"], "(8 $1)"], ["(\\d{3})(\\d)(\\d{2})(\\d{2})", "$1 $2-$3-$4", ["[1-5]"], "(8 $1)"], ["(\\d{2})(\\d{6})", "$1 $2", ["[67]"], "8 $1"]], "8", 0, 0, 0, 0, 0, [["(?:1(?:2\\d|3[1-9])|2(?:22|4[0-35-8])|3(?:22|4[03-9])|4(?:22|3[128]|4\\d|6[15])|5(?:22|5[7-9]|6[014-689]))\\d{5}"], ["(?:6\\d|7[12])\\d{6}"]], "8~10"], "TN": ["216", "00", "[2-57-9]\\d{7}", [8], [["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2-57-9]"]]], 0, 0, 0, 0, 0, 0, [["81200\\d{3}|(?:3[0-2]|7\\d)\\d{6}"], ["3(?:001|[12]40)\\d{4}|(?:(?:[259]\\d|4[0-8])\\d|3(?:1[1-35]|6[0-4]|91))\\d{5}"], ["8010\\d{4}"], ["88\\d{6}"], 0, 0, 0, 0, 0, ["8[12]10\\d{4}"]]], "TO": ["676", "00", "(?:0800|(?:[5-8]\\d\\d|999)\\d)\\d{3}|[2-8]\\d{4}", [5, 7], [["(\\d{2})(\\d{3})", "$1-$2", ["[2-4]|50|6[09]|7[0-24-69]|8[05]"]], ["(\\d{4})(\\d{3})", "$1 $2", ["0"]], ["(\\d{3})(\\d{4})", "$1 $2", ["[5-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:2\\d|3[0-8]|4[0-4]|50|6[09]|7[0-24-69]|8[05])\\d{3}", [5]], ["(?:5(?:4[0-5]|5[4-6])|6(?:[09]\\d|3[02]|8[15-9])|(?:7\\d|8[46-9])\\d|999)\\d{4}", [7]], ["0800\\d{3}", [7]], 0, 0, 0, 0, 0, ["55[0-37-9]\\d{4}", [7]]]], "TR": ["90", "00", "4\\d{6}|8\\d{11,12}|(?:[2-58]\\d\\d|900)\\d{7}", [7, 10, 12, 13], [["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["512|8[01589]|90"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["5"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[24][1-8]|3[1-9]"], "(0$1)", 1], ["(\\d{3})(\\d{3})(\\d{6,7})", "$1 $2 $3", ["80"], "0$1", 1]], "0", 0, 0, 0, 0, 0, [["(?:2(?:1[26]|[28][2468]|[3-5][268]|[67][246])|3(?:[13][28]|[24-6][2468]|[78][02468]|92)|4(?:[16][246]|[23578][2468]|4[26]))\\d{7}", [10]], ["5(?:61(?:011|61\\d)|82[2-5]\\d\\d)\\d{4}|5(?:[03-5]\\d|1[06]|24|6[24]|7[245]|9[46])\\d{7}", [10]], ["8(?:00\\d{7}(?:\\d{2,3})?|11\\d{7})", [10, 12, 13]], ["(?:8[89]8|900)\\d{7}", [10]], ["592(?:21[12]|461)\\d{4}", [10]], 0, ["444\\d{4}", [7]], ["512\\d{7}", [10]], ["850\\d{7}", [10]]]], "TT": ["1", "011", "(?:[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-46-8]\\d{6})$|1", "868$1", 0, "868", [["868(?:2(?:01|1[5-9]|[23]\\d|4[0-2])|6(?:0[7-9]|1[02-8]|2[1-9]|[3-69]\\d|7[0-79])|82[124])\\d{4}"], ["868(?:(?:2[5-9]|3\\d)\\d|4(?:3[0-6]|[6-9]\\d)|6(?:20|78|8\\d)|7(?:0[1-9]|1[02-9]|[2-9]\\d))\\d{4}"], ["868800\\d{4}|8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], ["868619\\d{4}"]]], "TV": ["688", "00", "(?:2|7\\d\\d|90)\\d{4}", [5, 6, 7], [["(\\d{2})(\\d{3})", "$1 $2", ["2"]], ["(\\d{2})(\\d{4})", "$1 $2", ["90"]], ["(\\d{2})(\\d{5})", "$1 $2", ["7"]]], 0, 0, 0, 0, 0, 0, [["2[02-9]\\d{3}", [5]], ["(?:7[01]\\d|90)\\d{4}", [6, 7]]]], "TW": ["886", "0(?:0[25-79]|19)", "[2-689]\\d{8}|7\\d{9,10}|[2-8]\\d{7}|2\\d{6}", [7, 8, 9, 10, 11], [["(\\d{2})(\\d)(\\d{4})", "$1 $2 $3", ["202"], "0$1"], ["(\\d{3})(\\d{5})", "$1 $2", ["826"], "0$1"], ["(\\d{3})(\\d{2})(\\d{3})", "$1 $2 $3", ["83"], "0$1"], ["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["82"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[25]0|37|49|8[09]"], "0$1"], ["(\\d)(\\d{3,4})(\\d{4})", "$1 $2 $3", ["[23568]|4(?:0[02-48]|[1-478])|7[1-9]", "[23568]|4(?:0[2-48]|[1-478])|(?:400|7)[1-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[49]"], "0$1"], ["(\\d{2})(\\d{4})(\\d{4,5})", "$1 $2 $3", ["7"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2[2-8]\\d|370|55[01]|7[1-9])\\d{6}|4(?:(?:0(?:0[1-9]|[2-48]\\d)|1[023]\\d)\\d{4,5}|(?:[239]\\d\\d|4(?:0[56]|12|49))\\d{5})|6(?:[01]\\d{7}|4(?:0[56]|12|24|4[09])\\d{4,5})|8(?:(?:2(?:3\\d|4[0-269]|[578]0|66)|36[24-9]|90\\d\\d)\\d{4}|4(?:0[56]|12|24|4[09])\\d{4,5})|(?:2(?:2(?:0\\d\\d|4(?:0[68]|[249]0|3[0-467]|5[0-25-9]|6[0235689]))|(?:3(?:[09]\\d|1[0-4])|(?:4\\d|5[0-49]|6[0-29]|7[0-5])\\d)\\d)|(?:(?:3[2-9]|5[2-8]|6[0-35-79]|8[7-9])\\d\\d|4(?:2(?:[089]\\d|7[1-9])|(?:3[0-4]|[78]\\d|9[01])\\d))\\d)\\d{3}", [8, 9]], ["(?:40001[0-2]|9[0-8]\\d{4})\\d{3}", [9]], ["80[0-79]\\d{6}|800\\d{5}", [8, 9]], ["20(?:[013-9]\\d\\d|2)\\d{4}", [7, 9]], ["99\\d{7}", [9]], 0, ["50[0-46-9]\\d{6}", [9]], 0, ["7010(?:[0-2679]\\d|3[0-7]|8[0-5])\\d{5}|70\\d{8}", [10, 11]]], 0, "#"], "TZ": ["255", "00[056]", "(?:[25-8]\\d|41|90)\\d{7}", [9], [["(\\d{3})(\\d{2})(\\d{4})", "$1 $2 $3", ["[89]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[24]"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["5"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[67]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["2[2-8]\\d{7}"], ["(?:6[0-35-9]|7\\d)\\d{7}"], ["80[08]\\d{6}"], ["90\\d{7}"], 0, 0, 0, 0, ["41\\d{7}"], ["8(?:40|6[01])\\d{6}"]]], "UA": ["380", "00", "[89]\\d{9}|[3-9]\\d{8}", [9, 10], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["6[12][29]|(?:3[1-8]|4[136-8]|5[12457]|6[49])2|(?:56|65)[24]", "6[12][29]|(?:35|4[1378]|5[12457]|6[49])2|(?:56|65)[24]|(?:3[1-46-8]|46)2[013-9]"], "0$1"], ["(\\d{4})(\\d{5})", "$1 $2", ["3[1-8]|4(?:[1367]|[45][6-9]|8[4-6])|5(?:[1-5]|6[0135689]|7[4-6])|6(?:[12][3-7]|[459])", "3[1-8]|4(?:[1367]|[45][6-9]|8[4-6])|5(?:[1-5]|6(?:[015689]|3[02389])|7[4-6])|6(?:[12][3-7]|[459])"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[3-7]|89|9[1-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[89]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:3[1-8]|4[13-8]|5[1-7]|6[12459])\\d{7}", [9]], ["790\\d{6}|(?:39|50|6[36-8]|7[1-357]|9[1-9])\\d{7}", [9]], ["800[1-8]\\d{5,6}"], ["900[239]\\d{5,6}"], 0, 0, 0, 0, ["89[1-579]\\d{6}", [9]]], "0~0"], "UG": ["256", "00[057]", "800\\d{6}|(?:[29]0|[347]\\d)\\d{7}", [9], [["(\\d{4})(\\d{5})", "$1 $2", ["202", "2024", "20240"], "0$1"], ["(\\d{3})(\\d{6})", "$1 $2", ["20[0-35-7]|4(?:6[45]|[7-9])|[7-9]", "20(?:[0135-7]|2[5-9])|4(?:6[45]|[7-9])|[7-9]"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["[2-4]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["20(?:(?:24[09]|30[67])\\d|6(?:00[0-2]|30[0-4]))\\d{3}|(?:20(?:[017]\\d|2[5-9]|3[1-4]|5[0-4]|6[15-9])|[34]\\d{3})\\d{5}"], ["7(?:28|34)0\\d{5}|7(?:[014-8]\\d|2[01467]|3[0-267]|9[0-589])\\d{6}"], ["800[1-3]\\d{5}"], ["90[1-3]\\d{6}"]]], "US": ["1", "011", "[2-9]\\d{9}|3\\d{6}", [10], [["(\\d{3})(\\d{4})", "$1-$2", ["310"], 0, 1], ["(\\d{3})(\\d{3})(\\d{4})", "($1) $2-$3", ["[2-9]"], 0, 1, "$1-$2-$3"]], "1", 0, 0, 0, 0, 0, [["983[2-57-9]\\d{6}|(?:2(?:0[1-35-9]|1[02-9]|2[03-57-9]|3[1459]|4[08]|5[1-46]|6[0279]|7[02469]|8[13])|3(?:0[1-57-9]|1[02-9]|2[013-79]|3[0-24679]|4[167]|5[0-3]|6[01349]|8[056])|4(?:0[124-9]|1[02-579]|2[3-5]|3[0245]|4[023578]|58|6[349]|7[02589]|8[04])|5(?:0[1-57-9]|1[0235-8]|20|3[0149]|4[01]|5[179]|6[1-47]|7[0-5]|8[0256])|6(?:0[1-35-9]|1[024-9]|2[03689]|3[016]|4[0156]|5[01679]|6[0-279]|78|8[0-269])|7(?:0[1-46-8]|1[2-9]|2[04-8]|3[0-2478]|4[0378]|5[47]|6[02359]|7[0-59]|8[156])|8(?:0[1-68]|1[02-8]|2[0168]|3[0-2589]|4[03578]|5[046-9]|6[02-5]|7[028])|9(?:0[1346-9]|1[02-9]|2[0589]|3[0146-8]|4[01357-9]|5[12469]|7[0-3589]|8[04-69]))[2-9]\\d{6}"], [""], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "UY": ["598", "0(?:0|1[3-9]\\d)", "0004\\d{2,9}|[1249]\\d{7}|2\\d{3,4}|(?:[49]\\d|80)\\d{5}", [4, 5, 6, 7, 8, 9, 10, 11, 12, 13], [["(\\d{4,5})", "$1", ["21"]], ["(\\d{3})(\\d{3,4})", "$1 $2", ["0"]], ["(\\d{3})(\\d{4})", "$1 $2", ["[49]0|8"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["9"], "0$1"], ["(\\d{4})(\\d{4})", "$1 $2", ["[124]"]], ["(\\d{3})(\\d{3})(\\d{2,4})", "$1 $2 $3", ["0"]], ["(\\d{3})(\\d{3})(\\d{3})(\\d{2,4})", "$1 $2 $3 $4", ["0"]]], "0", 0, 0, 0, 0, 0, [["(?:1(?:770|9(?:20|[89]7))|(?:2\\d|4[2-7])\\d\\d)\\d{4}", [8]], ["9[1-9]\\d{6}", [8]], ["0004\\d{2,9}|(?:405|80[05])\\d{4}", [6, 7, 8, 9, 10, 11, 12, 13]], ["90[0-8]\\d{4}", [7]], 0, 0, ["21\\d{2,3}", [4, 5]]], "00", " int. "], "UZ": ["998", "00", "(?:20|33|[5-9]\\d)\\d{7}", [9], [["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["[235-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:55\\d\\d|6(?:1(?:22|3[124]|4[1-4]|5[1-3578]|64)|2(?:22|3[0-57-9]|41)|5(?:22|3[3-7]|5[024-8])|[69]\\d\\d|7(?:[23]\\d|7[69]))|7(?:[168]\\d\\d|2(?:22|3[13-57-9]|4[1-3579]|5[14])|3(?:2\\d|3[1578]|4[1-35-7]|5[1-57]|61)|4(?:2\\d|3[1-579]|7[1-79])|5(?:22|5[1-9]|6[1457])|9(?:22|5[1-9])))\\d{5}"], ["(?:(?:[25]0|33|8[078]|9[0-57-9])\\d{3}|6(?:1(?:2(?:2[01]|98)|35[0-4]|50\\d|61[23]|7(?:[01][017]|4\\d|55|9[5-9]))|2(?:(?:11|7\\d)\\d|2(?:[12]1|9[01379])|5(?:[126]\\d|3[0-4]))|5(?:19[01]|2(?:27|9[26])|(?:30|59|7\\d)\\d)|6(?:2(?:1[5-9]|2[0367]|38|41|52|60)|(?:3[79]|9[0-3])\\d|4(?:56|83)|7(?:[07]\\d|1[017]|3[07]|4[047]|5[057]|67|8[0178]|9[79]))|7(?:2(?:24|3[237]|4[5-9]|7[15-8])|5(?:7[12]|8[0589])|7(?:0\\d|[39][07])|9(?:0\\d|7[079])))|7(?:[07]\\d{3}|2(?:2(?:2[79]|95)|3(?:2[5-9]|6[0-6])|57\\d|7(?:0\\d|1[17]|2[27]|3[37]|44|5[057]|66|88))|3(?:2(?:1[0-6]|21|3[469]|7[159])|(?:33|9[4-6])\\d|5(?:0[0-4]|5[579]|9\\d)|7(?:[0-3579]\\d|4[0467]|6[67]|8[078]))|4(?:2(?:29|5[0257]|6[0-7]|7[1-57])|5(?:1[0-4]|8\\d|9[5-9])|7(?:0\\d|1[024589]|2[0-27]|3[0137]|[46][07]|5[01]|7[5-9]|9[079])|9(?:7[015-9]|[89]\\d))|5(?:112|2(?:0\\d|2[29]|[49]4)|3[1568]\\d|52[6-9]|7(?:0[01578]|1[017]|[23]7|4[047]|[5-7]\\d|8[78]|9[079]))|9(?:22[128]|3(?:2[0-4]|7\\d)|57[02569]|7(?:2[05-9]|3[37]|4\\d|60|7[2579]|87|9[07]))))\\d{4}"]]], "VA": ["39", "00", "0\\d{5,10}|3[0-8]\\d{7,10}|55\\d{8}|8\\d{5}(?:\\d{2,4})?|(?:1\\d|39)\\d{7,8}", [6, 7, 8, 9, 10, 11, 12], 0, 0, 0, 0, 0, 0, "06698", [["06698\\d{1,6}", [6, 7, 8, 9, 10, 11]], ["3[1-9]\\d{8}|3[2-9]\\d{7}", [9, 10]], ["80(?:0\\d{3}|3)\\d{3}", [6, 9]], ["(?:0878\\d{3}|89(?:2\\d|3[04]|4(?:[0-4]|[5-9]\\d\\d)|5[0-4]))\\d\\d|(?:1(?:44|6[346])|89(?:38|5[5-9]|9))\\d{6}", [6, 8, 9, 10]], ["1(?:78\\d|99)\\d{6}", [9, 10]], ["3[2-8]\\d{9,10}", [11, 12]], 0, 0, ["55\\d{8}", [10]], ["84(?:[08]\\d{3}|[17])\\d{3}", [6, 9]]]], "VC": ["1", "011", "(?:[58]\\d\\d|784|900)\\d{7}", [10], 0, "1", 0, "([2-7]\\d{6})$|1", "784$1", 0, "784", [["784(?:266|3(?:6[6-9]|7\\d|8[0-6])|4(?:38|5[0-36-8]|8[0-8])|5(?:55|7[0-2]|93)|638|784)\\d{4}"], ["784(?:4(?:3[0-5]|5[45]|89|9[0-8])|5(?:2[6-9]|3[0-4])|720)\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"], 0, 0, 0, ["78451[0-2]\\d{4}"]]], "VE": ["58", "00", "[68]00\\d{7}|(?:[24]\\d|[59]0)\\d{8}", [10], [["(\\d{3})(\\d{7})", "$1-$2", ["[24-689]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2(?:12|3[457-9]|[467]\\d|[58][1-9]|9[1-6])|[4-6]00)\\d{7}"], ["4(?:1[24-8]|2[246])\\d{7}"], ["800\\d{7}"], ["90[01]\\d{7}"], 0, 0, ["501\\d{7}"]]], "VG": ["1", "011", "(?:284|[58]\\d\\d|900)\\d{7}", [10], 0, "1", 0, "([2-578]\\d{6})$|1", "284$1", 0, "284", [["284(?:229|4(?:22|9[45])|774|8(?:52|6[459]))\\d{4}"], ["284(?:245|3(?:0[0-3]|4[0-7]|68|9[34])|4(?:4[0-6]|68|9[69])|5(?:4[0-7]|68|9[69]))\\d{4}"], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "VI": ["1", "011", "[58]\\d{9}|(?:34|90)0\\d{7}", [10], 0, "1", 0, "([2-9]\\d{6})$|1", "340$1", 0, "340", [["340(?:2(?:0\\d|10|2[06-8]|4[49]|77)|3(?:32|44)|4(?:2[23]|44|7[34]|89)|5(?:1[34]|55)|6(?:2[56]|4[23]|77|9[023])|7(?:1[2-57-9]|2[57]|7\\d)|884|998)\\d{4}"], [""], ["8(?:00|33|44|55|66|77|88)[2-9]\\d{6}"], ["900[2-9]\\d{6}"], ["52(?:3(?:[2-46-9][02-9]\\d|5(?:[02-46-9]\\d|5[0-46-9]))|4(?:[2-478][02-9]\\d|5(?:[034]\\d|2[024-9]|5[0-46-9])|6(?:0[1-9]|[2-9]\\d)|9(?:[05-9]\\d|2[0-5]|49)))\\d{4}|52[34][2-9]1[02-9]\\d{4}|5(?:00|2[125-9]|3[23]|44|66|77|88)[2-9]\\d{6}"]]], "VN": ["84", "00", "[12]\\d{9}|[135-9]\\d{8}|[16]\\d{6,7}|7\\d{6}", [7, 8, 9, 10], [["(\\d{4})(\\d{4,6})", "$1 $2", ["1(?:2[02]|[89])"], 0, 1], ["(\\d{2})(\\d{3})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["1[26]|6"], "0$1", 1], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[1357-9]"], "0$1", 1], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["2[48]"], "0$1", 1], ["(\\d{3})(\\d{4})(\\d{3})", "$1 $2 $3", ["2"], "0$1", 1]], "0", 0, 0, 0, 0, 0, [["2(?:0[3-9]|1[0-689]|2[0-25-9]|[38][2-9]|4[2-8]|5[124-9]|6[0-39]|7[0-7]|9[0-4679])\\d{7}", [10]], ["121[0-3]\\d{5}|(?:1[46]0|(?:3\\d|7[06-9])\\d|5(?:[1689]\\d|2[238]|59)|8(?:[1-8]\\d|9[6-9])|9(?:[0-8]\\d|9[013-9]))\\d{6}", [9]], ["1800\\d{4,6}|12(?:0[13]|28)\\d{4}", [8, 9, 10]], ["1900\\d{4,6}", [8, 9, 10]], 0, 0, ["[17]99\\d{4}|69\\d{5,6}", [7, 8]], 0, ["672\\d{6}", [9]]]], "VU": ["678", "00", "[57-9]\\d{6}|(?:[238]\\d|48)\\d{3}", [5, 7], [["(\\d{3})(\\d{4})", "$1 $2", ["[57-9]"]]], 0, 0, 0, 0, 0, 0, [["(?:38[0-8]|48[4-9])\\d\\d|(?:2[02-9]|3[4-7]|88)\\d{3}", [5]], ["(?:[58]\\d|7[0-7])\\d{5}", [7]], ["81[18]\\d\\d", [5]], 0, 0, 0, ["(?:3[03]|900\\d)\\d{3}"], 0, ["9(?:0[1-9]|1[01])\\d{4}", [7]]]], "WF": ["681", "00", "(?:40|72|8\\d{4})\\d{4}|[89]\\d{5}", [6, 9], [["(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3", ["[47-9]"]], ["(\\d{3})(\\d{2})(\\d{2})(\\d{2})", "$1 $2 $3 $4", ["8"]]], 0, 0, 0, 0, 0, 0, [["72\\d{4}", [6]], ["(?:72|8[23])\\d{4}", [6]], ["80[0-5]\\d{6}", [9]], 0, 0, ["[48]0\\d{4}", [6]], 0, 0, ["9[23]\\d{4}", [6]]]], "WS": ["685", "0", "(?:[2-6]|8\\d{5})\\d{4}|[78]\\d{6}|[68]\\d{5}", [5, 6, 7, 10], [["(\\d{5})", "$1", ["[2-5]|6[1-9]"]], ["(\\d{3})(\\d{3,7})", "$1 $2", ["[68]"]], ["(\\d{2})(\\d{5})", "$1 $2", ["7"]]], 0, 0, 0, 0, 0, 0, [["6[1-9]\\d{3}|(?:[2-5]|60)\\d{4}", [5, 6]], ["(?:7[1-35-8]|8(?:[3-7]|9\\d{3}))\\d{5}", [7, 10]], ["800\\d{3}", [6]]]], "XK": ["383", "00", "2\\d{7,8}|3\\d{7,11}|(?:4\\d\\d|[89]00)\\d{5}", [8, 9, 10, 11, 12], [["(\\d{3})(\\d{5})", "$1 $2", ["[89]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3})", "$1 $2 $3", ["[2-4]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["2|39"], "0$1"], ["(\\d{2})(\\d{7,10})", "$1 $2", ["3"], "0$1"]], "0", 0, 0, 0, 0, 0, [["38\\d{6,10}|(?:2[89]|39)(?:0\\d{5,6}|[1-9]\\d{5})"], ["4[3-9]\\d{6}", [8]], ["800\\d{5}", [8]], ["900\\d{5}", [8]]]], "YE": ["967", "00", "(?:1|7\\d)\\d{7}|[1-7]\\d{6}", [7, 8, 9], [["(\\d)(\\d{3})(\\d{3,4})", "$1 $2 $3", ["[1-6]|7(?:[24-6]|8[0-7])"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["7"], "0$1"]], "0", 0, 0, 0, 0, 0, [["78[0-7]\\d{4}|17\\d{6}|(?:[12][2-68]|3[2358]|4[2-58]|5[2-6]|6[3-58]|7[24-6])\\d{5}", [7, 8]], ["7[01378]\\d{7}", [9]]]], "YT": ["262", "00", "(?:639\\d|7093)\\d{5}|(?:26|80|9\\d)\\d{7}", [9], 0, "0", 0, 0, 0, 0, 0, [["26(?:89\\d|9(?:0[0-467]|15|5[0-4]|6\\d|[78]0))\\d{4}"], ["(?:639(?:0[0-79]|1[019]|[267]\\d|3[09]|40|5[05-9]|9[04-79])|7093[5-7])\\d{4}"], ["80\\d{7}"], 0, 0, 0, 0, 0, ["9(?:(?:39|47)8[01]|769\\d)\\d{4}"]]], "ZA": ["27", "00", "[1-79]\\d{8}|8\\d{4,9}", [5, 6, 7, 8, 9, 10], [["(\\d{2})(\\d{3,4})", "$1 $2", ["8[1-4]"], "0$1"], ["(\\d{2})(\\d{3})(\\d{2,3})", "$1 $2 $3", ["8[1-4]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["860"], "0$1"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["[1-9]"], "0$1"], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:2(?:0330|4302)|52087)0\\d{3}|(?:1[0-8]|2[1-378]|3[1-69]|4\\d|5[1346-8])\\d{7}", [9]], ["(?:1(?:3492[0-25]|4495[0235]|549(?:20|5[01]))|4[34]492[01])\\d{3}|8[1-4]\\d{3,7}|(?:2[27]|47|54)4950\\d{3}|(?:1(?:049[2-4]|9[12]\\d\\d)|(?:50[0-2]|[67]\\d\\d)\\d\\d|8(?:5\\d{3}|7(?:08[67]|158|28[5-9]|310)))\\d{4}|(?:1[6-8]|28|3[2-69]|4[025689]|5[36-8])4920\\d{3}|(?:12|[2-5]1)492\\d{4}", [5, 6, 7, 8, 9]], ["80\\d{7}", [9]], ["(?:86[2-9]|9[0-2]\\d)\\d{6}", [9]], 0, 0, ["861\\d{6,7}", [9, 10]], 0, ["87(?:08[0-589]|15[0-79]|28[0-4]|31[1-9])\\d{4}|87(?:[02][0-79]|1[0-46-9]|3[02-9]|[4-9]\\d)\\d{5}", [9]], ["860\\d{6}", [9]]]], "ZM": ["260", "00", "800\\d{6}|(?:21|[579]\\d|63)\\d{7}", [9], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[28]"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["[579]"], "0$1"]], "0", 0, 0, 0, 0, 0, [["21[1-8]\\d{6}"], ["(?:[59][5-8]|7[5-9])\\d{7}"], ["800\\d{6}"], 0, 0, 0, 0, 0, ["63\\d{7}"]]], "ZW": ["263", "00", "(?:13|8\\d{4})\\d{5}|[235-8]\\d{8}|[23568]\\d{6}", [7, 9, 10], [["(\\d{2})(\\d{3,5})", "$1 $2", ["1|2(?:0[0-36-9]|29|58)|67[0-46-9]|(?:55|68)[0-69]"], "0$1"], ["(\\d{3})(\\d{3,5})", "$1 $2", ["2(?:0[45]|[27]|48)|37|675|(?:55|68)[78]"], "0$1"], ["(\\d{3})(\\d{4})", "$1 $2", ["80"], "0$1"], ["(\\d{4})(\\d{3,5})", "$1 $2", ["548"], "0$1"], ["(\\d{2})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["29[013-9]"], "0$1"], ["(\\d{2})(\\d{7})", "$1 $2", ["[256]|39|8[13-59]"], "(0$1)"], ["(\\d{2})(\\d{3})(\\d{4})", "$1 $2 $3", ["7"], "0$1"], ["(\\d{3})(\\d{3})(\\d{3,4})", "$1 $2 $3", ["3"], "0$1"], ["(\\d{4})(\\d{6})", "$1 $2", ["8"], "0$1"]], "0", 0, 0, 0, 0, 0, [["(?:(?:(?:13|6(?:[16-8]21|52[013])|8(?:[1349]28|523))\\d|3(?:(?:123|92\\d)\\d|7[56]))\\d|2(?:(?:(?:02[014]|[56]20|72[03]|9\\d\\d)\\d|4(?:2\\d\\d|8))\\d|2(?:[278]\\d|92))|5(?:4(?:2\\d{3}|83)|525\\d\\d))\\d{3}|(?:2(?:(?:0\\d|7[1-7])\\d|583)|(?:55|6[78])\\d\\d)\\d{3}", [7, 9]], ["7(?:[1278]\\d|3[1-9]|9[01])\\d{6}", [9]], ["80(?:[01]\\d|20|8[0-8])\\d{3}", [7]], 0, 0, 0, 0, 0, ["86(?:1[12]|22|30|44|55|77|8[368])\\d{6}", [10]]]] }, "nonGeographic": { "800": ["800", 0, "(?:00|[1-9]\\d)\\d{6}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["\\d"]]], 0, 0, 0, 0, 0, 0, [0, 0, ["(?:00|[1-9]\\d)\\d{6}"]]], "808": ["808", 0, "[1-9]\\d{7}", [8], [["(\\d{4})(\\d{4})", "$1 $2", ["[1-9]"]]], 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, ["[1-9]\\d{7}"]]], "870": ["870", 0, "7\\d{11}|[235-7]\\d{8}", [9, 12], [["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["[235-7]"]]], 0, 0, 0, 0, 0, 0, [0, ["(?:[356]|774[45])\\d{8}|7[6-8]\\d{7}"], 0, 0, 0, 0, 0, 0, ["2\\d{8}", [9]]]], "878": ["878", 0, "10\\d{10}", [12], [["(\\d{2})(\\d{5})(\\d{5})", "$1 $2 $3", ["1"]]], 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, ["10\\d{10}"]]], "881": ["881", 0, "6\\d{9}|[0-36-9]\\d{8}", [9, 10], [["(\\d)(\\d{3})(\\d{5})", "$1 $2 $3", ["[0-37-9]"]], ["(\\d)(\\d{3})(\\d{5,6})", "$1 $2 $3", ["6"]]], 0, 0, 0, 0, 0, 0, [0, ["6\\d{9}|[0-36-9]\\d{8}"]]], "882": ["882", 0, "[13]\\d{6}(?:\\d{2,5})?|[19]\\d{7}|(?:[25]\\d\\d|4)\\d{7}(?:\\d{2})?", [7, 8, 9, 10, 11, 12], [["(\\d{2})(\\d{5})", "$1 $2", ["16|342"]], ["(\\d{2})(\\d{6})", "$1 $2", ["49"]], ["(\\d{2})(\\d{2})(\\d{4})", "$1 $2 $3", ["1[36]|9"]], ["(\\d{2})(\\d{4})(\\d{3})", "$1 $2 $3", ["3[23]"]], ["(\\d{2})(\\d{3,4})(\\d{4})", "$1 $2 $3", ["16"]], ["(\\d{2})(\\d{4})(\\d{4})", "$1 $2 $3", ["10|23|3(?:[15]|4[57])|4|5[12]"]], ["(\\d{3})(\\d{4})(\\d{4})", "$1 $2 $3", ["34"]], ["(\\d{2})(\\d{4,5})(\\d{5})", "$1 $2 $3", ["[1-35]"]]], 0, 0, 0, 0, 0, 0, [0, ["342\\d{4}|(?:337|49)\\d{6}|(?:3(?:2|47|7\\d{3})|5(?:0\\d{3}|2[0-2]))\\d{7}", [7, 8, 9, 10, 12]], 0, 0, 0, ["348[57]\\d{7}", [11]], 0, 0, ["1(?:3(?:0[0347]|[13][0139]|2[035]|4[013568]|6[0459]|7[06]|8[15-8]|9[0689])\\d{4}|6\\d{5,10})|(?:345\\d|9[89])\\d{6}|(?:10|2(?:3|85\\d)|3(?:[15]|[69]\\d\\d)|4[15-8]|51)\\d{8}"]]], "883": ["883", 0, "(?:[1-4]\\d|51)\\d{6,10}", [8, 9, 10, 11, 12], [["(\\d{3})(\\d{3})(\\d{2,8})", "$1 $2 $3", ["[14]|2[24-689]|3[02-689]|51[24-9]"]], ["(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3", ["510"]], ["(\\d{3})(\\d{3})(\\d{4})", "$1 $2 $3", ["21"]], ["(\\d{4})(\\d{4})(\\d{4})", "$1 $2 $3", ["51[13]"]], ["(\\d{3})(\\d{3})(\\d{3})(\\d{3})", "$1 $2 $3 $4", ["[235]"]]], 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, 0, 0, ["(?:2(?:00\\d\\d|10)|(?:370[1-9]|51\\d0)\\d)\\d{7}|51(?:00\\d{5}|[24-9]0\\d{4,7})|(?:1[0-79]|2[24-689]|3[02-689]|4[0-4])0\\d{5,9}"]]], "888": ["888", 0, "\\d{11}", [11], [["(\\d{3})(\\d{3})(\\d{5})", "$1 $2 $3"]], 0, 0, 0, 0, 0, 0, [0, 0, 0, 0, 0, 0, ["\\d{11}"]]], "979": ["979", 0, "[1359]\\d{8}", [9], [["(\\d)(\\d{4})(\\d{4})", "$1 $2 $3", ["[1359]"]]], 0, 0, 0, 0, 0, 0, [0, 0, 0, ["[1359]\\d{8}"]]] } };
  function withMetadataArgument(func, _arguments) {
    var args = Array.prototype.slice.call(_arguments);
    args.push(metadata);
    return func.apply(this, args);
  }
  function compare(a, b) {
    a = a.split("-");
    b = b.split("-");
    var pa = a[0].split(".");
    var pb = b[0].split(".");
    for (var i = 0; i < 3; i++) {
      var na = Number(pa[i]);
      var nb = Number(pb[i]);
      if (na > nb) return 1;
      if (nb > na) return -1;
      if (!isNaN(na) && isNaN(nb)) return 1;
      if (isNaN(na) && !isNaN(nb)) return -1;
    }
    if (a[1] && b[1]) {
      return a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0;
    }
    return !a[1] && b[1] ? 1 : a[1] && !b[1] ? -1 : 0;
  }
  var objectConstructor = {}.constructor;
  function isObject(object) {
    return object !== void 0 && object !== null && object.constructor === objectConstructor;
  }
  var CALLING_CODE_REG_EXP = /^\d+$/;
  function isCallingCode(string) {
    return CALLING_CODE_REG_EXP.test(string);
  }
  function _typeof$b(o) {
    "@babel/helpers - typeof";
    return _typeof$b = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$b(o);
  }
  function _classCallCheck$8(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$7(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$a(o.key), o);
    }
  }
  function _createClass$8(e, r, t) {
    return r && _defineProperties$7(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$a(t) {
    var i = _toPrimitive$a(t, "string");
    return "symbol" == _typeof$b(i) ? i : i + "";
  }
  function _toPrimitive$a(t, r) {
    if ("object" != _typeof$b(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$b(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var V3 = "1.2.0";
  var V4 = "1.7.35";
  var DEFAULT_EXT_PREFIX = " ext. ";
  var Metadata = /* @__PURE__ */ (function() {
    function Metadata2(metadata2) {
      _classCallCheck$8(this, Metadata2);
      validateMetadata(metadata2);
      this.metadata = metadata2;
      setVersion.call(this, metadata2);
    }
    return _createClass$8(Metadata2, [{
      key: "getCountries",
      value: function getCountries2() {
        return Object.keys(this.metadata.countries).filter(function(_) {
          return _ !== "001";
        });
      }
    }, {
      key: "getCountryMetadata",
      value: function getCountryMetadata(countryCode) {
        return this.metadata.countries[countryCode];
      }
    }, {
      key: "nonGeographic",
      value: function nonGeographic() {
        if (this.v1 || this.v2 || this.v3) return;
        return this.metadata.nonGeographic || this.metadata.nonGeographical;
      }
    }, {
      key: "hasCountry",
      value: function hasCountry(country) {
        return this.getCountryMetadata(country) !== void 0;
      }
    }, {
      key: "hasCallingCode",
      value: function hasCallingCode(callingCode) {
        if (this.getCountryCodesForCallingCode(callingCode)) {
          return true;
        }
        if (this.nonGeographic()) {
          if (this.nonGeographic()[callingCode]) {
            return true;
          }
        } else {
          var countryCodes = this.countryCallingCodes()[callingCode];
          if (countryCodes && countryCodes.length === 1 && countryCodes[0] === "001") {
            return true;
          }
        }
      }
    }, {
      key: "isNonGeographicCallingCode",
      value: function isNonGeographicCallingCode(callingCode) {
        if (this.nonGeographic()) {
          return this.nonGeographic()[callingCode] ? true : false;
        } else {
          return this.getCountryCodesForCallingCode(callingCode) ? false : true;
        }
      }
      // Deprecated.
    }, {
      key: "country",
      value: function country(countryCode) {
        return this.selectNumberingPlan(countryCode);
      }
      /**
       * Selects a telephone numbering plan based on either a country code or a calling code.
       * @param {string} argument — Country code or calling code.
       * @param {string} legacyArgumentCallingCode — Legacy argument: calling code, if the first argument is not passed.
       */
    }, {
      key: "selectNumberingPlan",
      value: function selectNumberingPlan(argument, legacyArgumentCallingCode) {
        var countryCode;
        var callingCode;
        if (argument) {
          if (isCallingCode(argument)) {
            callingCode = argument;
          } else {
            countryCode = argument;
          }
        }
        if (legacyArgumentCallingCode) {
          callingCode = legacyArgumentCallingCode;
        }
        if (countryCode && countryCode !== "001") {
          var countryMetadata = this.getCountryMetadata(countryCode);
          if (!countryMetadata) {
            throw new Error("Unknown country: ".concat(countryCode));
          }
          this.numberingPlan = new NumberingPlan(countryMetadata, this);
        } else if (callingCode) {
          if (!this.hasCallingCode(callingCode)) {
            throw new Error("Unknown calling code: ".concat(callingCode));
          }
          this.numberingPlan = new NumberingPlan(this.getNumberingPlanMetadata(callingCode), this);
        } else {
          this.numberingPlan = void 0;
        }
        return this;
      }
    }, {
      key: "getCountryCodesForCallingCode",
      value: function getCountryCodesForCallingCode(callingCode) {
        var countryCodes = this.countryCallingCodes()[callingCode];
        if (countryCodes) {
          if (countryCodes.length === 1 && countryCodes[0].length === 3) {
            return;
          }
          return countryCodes;
        }
      }
    }, {
      key: "getCountryCodeForCallingCode",
      value: function getCountryCodeForCallingCode(callingCode) {
        var countryCodes = this.getCountryCodesForCallingCode(callingCode);
        if (countryCodes) {
          return countryCodes[0];
        }
      }
    }, {
      key: "getNumberingPlanMetadata",
      value: function getNumberingPlanMetadata(callingCode) {
        var countryCode = this.getCountryCodeForCallingCode(callingCode);
        if (countryCode) {
          return this.getCountryMetadata(countryCode);
        }
        if (this.nonGeographic()) {
          var metadata2 = this.nonGeographic()[callingCode];
          if (metadata2) {
            return metadata2;
          }
        } else {
          var countryCodes = this.countryCallingCodes()[callingCode];
          if (countryCodes && countryCodes.length === 1 && countryCodes[0] === "001") {
            return this.metadata.countries["001"];
          }
        }
      }
      // Deprecated.
    }, {
      key: "countryCallingCode",
      value: function countryCallingCode() {
        return this.numberingPlan.callingCode();
      }
      // Deprecated.
    }, {
      key: "IDDPrefix",
      value: function IDDPrefix() {
        return this.numberingPlan.IDDPrefix();
      }
      // Deprecated.
    }, {
      key: "defaultIDDPrefix",
      value: function defaultIDDPrefix() {
        return this.numberingPlan.defaultIDDPrefix();
      }
      // Deprecated.
    }, {
      key: "nationalNumberPattern",
      value: function nationalNumberPattern() {
        return this.numberingPlan.nationalNumberPattern();
      }
      // Deprecated.
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        return this.numberingPlan.possibleLengths();
      }
      // Deprecated.
    }, {
      key: "formats",
      value: function formats2() {
        return this.numberingPlan.formats();
      }
      // Deprecated.
    }, {
      key: "nationalPrefixForParsing",
      value: function nationalPrefixForParsing() {
        return this.numberingPlan.nationalPrefixForParsing();
      }
      // Deprecated.
    }, {
      key: "nationalPrefixTransformRule",
      value: function nationalPrefixTransformRule() {
        return this.numberingPlan.nationalPrefixTransformRule();
      }
      // Deprecated.
    }, {
      key: "leadingDigits",
      value: function leadingDigits() {
        return this.numberingPlan.leadingDigits();
      }
      // Deprecated.
    }, {
      key: "hasTypes",
      value: function hasTypes() {
        return this.numberingPlan.hasTypes();
      }
      // Deprecated.
    }, {
      key: "type",
      value: function type(_type) {
        return this.numberingPlan.type(_type);
      }
      // Deprecated.
    }, {
      key: "ext",
      value: function ext() {
        return this.numberingPlan.ext();
      }
    }, {
      key: "countryCallingCodes",
      value: function countryCallingCodes() {
        if (this.v1) return this.metadata.country_phone_code_to_countries;
        return this.metadata.country_calling_codes;
      }
      // Deprecated.
    }, {
      key: "chooseCountryByCountryCallingCode",
      value: function chooseCountryByCountryCallingCode(callingCode) {
        return this.selectNumberingPlan(callingCode);
      }
    }, {
      key: "hasSelectedNumberingPlan",
      value: function hasSelectedNumberingPlan() {
        return this.numberingPlan !== void 0;
      }
    }]);
  })();
  var NumberingPlan = /* @__PURE__ */ (function() {
    function NumberingPlan2(metadata2, globalMetadataObject) {
      _classCallCheck$8(this, NumberingPlan2);
      this.globalMetadataObject = globalMetadataObject;
      this.metadata = metadata2;
      setVersion.call(this, globalMetadataObject.metadata);
    }
    return _createClass$8(NumberingPlan2, [{
      key: "callingCode",
      value: function callingCode() {
        return this.metadata[0];
      }
      // When multiple countries share the same calling code,
      // all phone number formatting rules are included in the metadata
      // of the "default" country for that calling code.
      // Any other countries' metdata doesn't include any formatting rules.
      // Google developers said that such storage architecture was chosen for performance reasons.
      //
      // For example, for NANPA region ("North American Numbering Plan Administration",
      // which includes USA, Canada, Cayman Islands, Bahamas, etc) all formatting rules
      // are contained in the metadata of `US` country.
      //
      // This is not public API.
      //
    }, {
      key: "_getDefaultCountryMetadataForThisCallingCode",
      value: function _getDefaultCountryMetadataForThisCallingCode() {
        return this.globalMetadataObject.getNumberingPlanMetadata(this.callingCode());
      }
      // Deprecated.
    }, {
      key: "getDefaultCountryMetadataForRegion",
      value: function getDefaultCountryMetadataForRegion() {
        return this._getDefaultCountryMetadataForThisCallingCode();
      }
      // Is always present.
    }, {
      key: "IDDPrefix",
      value: function IDDPrefix() {
        if (this.v1 || this.v2) return;
        return this.metadata[1];
      }
      // Is only present when a country supports multiple IDD prefixes.
    }, {
      key: "defaultIDDPrefix",
      value: function defaultIDDPrefix() {
        if (this.v1 || this.v2) return;
        return this.metadata[12];
      }
    }, {
      key: "nationalNumberPattern",
      value: function nationalNumberPattern() {
        if (this.v1 || this.v2) return this.metadata[1];
        return this.metadata[2];
      }
      // "possible length" data is always present in Google's metadata.
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        if (this.v1) return;
        return this.metadata[this.v2 ? 2 : 3];
      }
    }, {
      key: "_getFormats",
      value: function _getFormats(metadata2) {
        return metadata2[this.v1 ? 2 : this.v2 ? 3 : 4];
      }
      // For countries of the same region (e.g. NANPA)
      // formats are all stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "formats",
      value: function formats2() {
        var _this = this;
        var formats3 = this._getFormats(this.metadata) || this._getFormats(this._getDefaultCountryMetadataForThisCallingCode()) || [];
        return formats3.map(function(_) {
          return new Format(_, _this);
        });
      }
    }, {
      key: "nationalPrefix",
      value: function nationalPrefix() {
        return this.metadata[this.v1 ? 3 : this.v2 ? 4 : 5];
      }
    }, {
      key: "_getNationalPrefixFormattingRule",
      value: function _getNationalPrefixFormattingRule(metadata2) {
        return metadata2[this.v1 ? 4 : this.v2 ? 5 : 6];
      }
      // For countries of the same region (e.g. NANPA)
      // national prefix formatting rule is stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "nationalPrefixFormattingRule",
      value: function nationalPrefixFormattingRule() {
        return this._getNationalPrefixFormattingRule(this.metadata) || this._getNationalPrefixFormattingRule(this._getDefaultCountryMetadataForThisCallingCode());
      }
    }, {
      key: "_nationalPrefixForParsing",
      value: function _nationalPrefixForParsing() {
        return this.metadata[this.v1 ? 5 : this.v2 ? 6 : 7];
      }
    }, {
      key: "nationalPrefixForParsing",
      value: function nationalPrefixForParsing() {
        return this._nationalPrefixForParsing() || this.nationalPrefix();
      }
    }, {
      key: "nationalPrefixTransformRule",
      value: function nationalPrefixTransformRule() {
        return this.metadata[this.v1 ? 6 : this.v2 ? 7 : 8];
      }
    }, {
      key: "_getNationalPrefixIsOptionalWhenFormatting",
      value: function _getNationalPrefixIsOptionalWhenFormatting() {
        return !!this.metadata[this.v1 ? 7 : this.v2 ? 8 : 9];
      }
      // For countries of the same region (e.g. NANPA)
      // "national prefix is optional when formatting" flag is
      // stored in the "main" country for that region.
      // E.g. "RU" and "KZ", "US" and "CA".
    }, {
      key: "nationalPrefixIsOptionalWhenFormattingInNationalFormat",
      value: function nationalPrefixIsOptionalWhenFormattingInNationalFormat() {
        return this._getNationalPrefixIsOptionalWhenFormatting(this.metadata) || this._getNationalPrefixIsOptionalWhenFormatting(this._getDefaultCountryMetadataForThisCallingCode());
      }
    }, {
      key: "leadingDigits",
      value: function leadingDigits() {
        return this.metadata[this.v1 ? 8 : this.v2 ? 9 : 10];
      }
    }, {
      key: "types",
      value: function types() {
        return this.metadata[this.v1 ? 9 : this.v2 ? 10 : 11];
      }
    }, {
      key: "hasTypes",
      value: function hasTypes() {
        if (this.types() && this.types().length === 0) {
          return false;
        }
        return !!this.types();
      }
    }, {
      key: "type",
      value: function type(_type2) {
        if (this.hasTypes() && getType(this.types(), _type2)) {
          return new Type(getType(this.types(), _type2), this);
        }
      }
    }, {
      key: "ext",
      value: function ext() {
        if (this.v1 || this.v2) return DEFAULT_EXT_PREFIX;
        return this.metadata[13] || DEFAULT_EXT_PREFIX;
      }
    }]);
  })();
  var Format = /* @__PURE__ */ (function() {
    function Format2(format, metadata2) {
      _classCallCheck$8(this, Format2);
      this._format = format;
      this.metadata = metadata2;
    }
    return _createClass$8(Format2, [{
      key: "pattern",
      value: function pattern() {
        return this._format[0];
      }
    }, {
      key: "format",
      value: function format() {
        return this._format[1];
      }
    }, {
      key: "leadingDigitsPatterns",
      value: function leadingDigitsPatterns() {
        return this._format[2] || [];
      }
    }, {
      key: "nationalPrefixFormattingRule",
      value: function nationalPrefixFormattingRule() {
        return this._format[3] || this.metadata.nationalPrefixFormattingRule();
      }
    }, {
      key: "nationalPrefixIsOptionalWhenFormattingInNationalFormat",
      value: function nationalPrefixIsOptionalWhenFormattingInNationalFormat() {
        return !!this._format[4] || this.metadata.nationalPrefixIsOptionalWhenFormattingInNationalFormat();
      }
    }, {
      key: "nationalPrefixIsMandatoryWhenFormattingInNationalFormat",
      value: function nationalPrefixIsMandatoryWhenFormattingInNationalFormat() {
        return this.usesNationalPrefix() && !this.nationalPrefixIsOptionalWhenFormattingInNationalFormat();
      }
      // Checks whether national prefix formatting rule contains national prefix.
    }, {
      key: "usesNationalPrefix",
      value: function usesNationalPrefix() {
        return this.nationalPrefixFormattingRule() && // Check that national prefix formatting rule is not a "dummy" one.
        !FIRST_GROUP_ONLY_PREFIX_PATTERN.test(this.nationalPrefixFormattingRule()) ? true : false;
      }
    }, {
      key: "internationalFormat",
      value: function internationalFormat() {
        return this._format[5] || this.format();
      }
    }]);
  })();
  var FIRST_GROUP_ONLY_PREFIX_PATTERN = /^\(?\$1\)?$/;
  var Type = /* @__PURE__ */ (function() {
    function Type2(type, metadata2) {
      _classCallCheck$8(this, Type2);
      this.type = type;
      this.metadata = metadata2;
    }
    return _createClass$8(Type2, [{
      key: "pattern",
      value: function pattern() {
        if (this.metadata.v1) return this.type;
        return this.type[0];
      }
    }, {
      key: "possibleLengths",
      value: function possibleLengths() {
        if (this.metadata.v1) return;
        return this.type[1] || this.metadata.possibleLengths();
      }
    }]);
  })();
  function getType(types, type) {
    switch (type) {
      case "FIXED_LINE":
        return types[0];
      case "MOBILE":
        return types[1];
      case "TOLL_FREE":
        return types[2];
      case "PREMIUM_RATE":
        return types[3];
      case "PERSONAL_NUMBER":
        return types[4];
      case "VOICEMAIL":
        return types[5];
      case "UAN":
        return types[6];
      case "PAGER":
        return types[7];
      case "VOIP":
        return types[8];
      case "SHARED_COST":
        return types[9];
    }
  }
  function validateMetadata(metadata2) {
    if (!metadata2) {
      throw new Error("[libphonenumber-js] `metadata` argument not passed. Check your arguments.");
    }
    if (!isObject(metadata2) || !isObject(metadata2.countries)) {
      throw new Error("[libphonenumber-js] `metadata` argument was passed but it's not a valid metadata. Must be an object having `.countries` child object property. Got ".concat(isObject(metadata2) ? "an object of shape: { " + Object.keys(metadata2).join(", ") + " }" : "a " + typeOf(metadata2) + ": " + metadata2, "."));
    }
  }
  var typeOf = function typeOf2(_) {
    return _typeof$b(_);
  };
  function getCountryCallingCode$1(country, metadataJson) {
    var metadata2 = new Metadata(metadataJson);
    if (metadata2.hasCountry(country)) {
      return metadata2.selectNumberingPlan(country).countryCallingCode();
    }
    throw new Error("Unknown country: ".concat(country));
  }
  function isSupportedCountry(country, metadataJson) {
    return metadataJson.countries.hasOwnProperty(country);
  }
  function setVersion(metadata2) {
    var version = metadata2.version;
    if (typeof version === "number") {
      this.v1 = version === 1;
      this.v2 = version === 2;
      this.v3 = version === 3;
      this.v4 = version === 4;
    } else {
      if (!version) {
        this.v1 = true;
      } else if (compare(version, V3) === -1) {
        this.v2 = true;
      } else if (compare(version, V4) === -1) {
        this.v3 = true;
      } else {
        this.v4 = true;
      }
    }
  }
  function checkNumberLength(nationalNumber, country, metadata2) {
    return checkNumberLengthForType(nationalNumber, void 0, country, metadata2);
  }
  function checkNumberLengthForType(nationalNumber, type, country, metadata2) {
    if (country) {
      metadata2 = new Metadata(metadata2.metadata);
      metadata2.selectNumberingPlan(country);
    }
    var type_info = metadata2.type(type);
    var possible_lengths = type_info && type_info.possibleLengths() || metadata2.possibleLengths();
    if (!possible_lengths) {
      return "IS_POSSIBLE";
    }
    var actual_length = nationalNumber.length;
    var minimum_length = possible_lengths[0];
    if (minimum_length === actual_length) {
      return "IS_POSSIBLE";
    }
    if (minimum_length > actual_length) {
      return "TOO_SHORT";
    }
    if (possible_lengths[possible_lengths.length - 1] < actual_length) {
      return "TOO_LONG";
    }
    return possible_lengths.indexOf(actual_length, 1) >= 0 ? "IS_POSSIBLE" : "INVALID_LENGTH";
  }
  function isPossiblePhoneNumber(input, options, metadataJson) {
    if (options === void 0) {
      options = {};
    }
    var metadata2 = new Metadata(metadataJson);
    if (options.v2) {
      if (!input.countryCallingCode) {
        throw new Error("Invalid phone number object passed");
      }
      metadata2.selectNumberingPlan(input.country || input.countryCallingCode);
    } else {
      if (!input.phone) {
        return false;
      }
      if (input.country) {
        if (!metadata2.hasCountry(input.country)) {
          throw new Error("Unknown country: ".concat(input.country));
        }
        metadata2.selectNumberingPlan(input.country);
      } else {
        if (!input.countryCallingCode) {
          throw new Error("Invalid phone number object passed");
        }
        metadata2.selectNumberingPlan(input.countryCallingCode);
      }
    }
    if (metadata2.possibleLengths()) {
      return isPossibleNumber(input.phone || input.nationalNumber, metadata2);
    }
    if (input.countryCallingCode && metadata2.isNonGeographicCallingCode(input.countryCallingCode)) {
      return true;
    }
    throw new Error('Missing "possibleLengths" in metadata. Perhaps the metadata has been generated before v1.0.18.');
  }
  function isPossibleNumber(nationalNumber, metadata2) {
    switch (checkNumberLength(nationalNumber, void 0, metadata2)) {
      case "IS_POSSIBLE":
        return true;
      // This library ignores "local-only" phone numbers (for simplicity).
      // See the readme for more info on what are "local-only" phone numbers.
      // case 'IS_POSSIBLE_LOCAL_ONLY':
      // 	return !isInternational
      default:
        return false;
    }
  }
  function matchesEntirely(text, regularExpressionText) {
    text = text || "";
    return new RegExp("^(?:" + regularExpressionText + ")$").test(text);
  }
  function _createForOfIteratorHelperLoose$6(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$9(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$9(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$9(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$9(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$9(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  var NON_FIXED_LINE_PHONE_TYPES = ["MOBILE", "PREMIUM_RATE", "TOLL_FREE", "SHARED_COST", "VOIP", "PERSONAL_NUMBER", "PAGER", "UAN", "VOICEMAIL"];
  function getNumberType(input, options, metadataJson) {
    options = options || {};
    if (!input.country && !input.countryCallingCode) {
      return;
    }
    var metadata2 = new Metadata(metadataJson);
    metadata2.selectNumberingPlan(input.country || input.countryCallingCode);
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    if (!matchesEntirely(nationalNumber, metadata2.nationalNumberPattern())) {
      return;
    }
    if (isNumberTypeEqualTo(nationalNumber, "FIXED_LINE", metadata2)) {
      if (metadata2.type("MOBILE") && metadata2.type("MOBILE").pattern() === "") {
        return "FIXED_LINE_OR_MOBILE";
      }
      if (!metadata2.type("MOBILE")) {
        return "FIXED_LINE_OR_MOBILE";
      }
      if (isNumberTypeEqualTo(nationalNumber, "MOBILE", metadata2)) {
        return "FIXED_LINE_OR_MOBILE";
      }
      return "FIXED_LINE";
    }
    for (var _iterator = _createForOfIteratorHelperLoose$6(NON_FIXED_LINE_PHONE_TYPES), _step; !(_step = _iterator()).done; ) {
      var type = _step.value;
      if (isNumberTypeEqualTo(nationalNumber, type, metadata2)) {
        return type;
      }
    }
  }
  function isNumberTypeEqualTo(nationalNumber, type, metadata2) {
    var typeDefinition = metadata2.type(type);
    if (!typeDefinition || !typeDefinition.pattern()) {
      return false;
    }
    if (typeDefinition.possibleLengths() && typeDefinition.possibleLengths().indexOf(nationalNumber.length) < 0) {
      return false;
    }
    return matchesEntirely(nationalNumber, typeDefinition.pattern());
  }
  function isValidNumber(input, options, metadataJson) {
    options = options || {};
    var metadata2 = new Metadata(metadataJson);
    metadata2.selectNumberingPlan(input.country || input.countryCallingCode);
    if (metadata2.hasTypes()) {
      return getNumberType(input, options, metadata2.metadata) !== void 0;
    }
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    return matchesEntirely(nationalNumber, metadata2.nationalNumberPattern());
  }
  var COUNTRY_CODE_REG_EXP = /^[A-Z]{2}$/;
  function isCountryCode(string) {
    return COUNTRY_CODE_REG_EXP.test(string);
  }
  function getCountryAndCallingCodeFromOneOfThem(countryOrCallingCode, metadataJson) {
    var country;
    var callingCode;
    var metadata2 = new Metadata(metadataJson);
    if (isCountryCode(countryOrCallingCode)) {
      country = countryOrCallingCode;
      metadata2.selectNumberingPlan(country);
      callingCode = metadata2.countryCallingCode();
    } else {
      callingCode = countryOrCallingCode;
    }
    return {
      country,
      callingCode
    };
  }
  function getPossibleCountriesForNumber(callingCode, nationalNumber, metadata2) {
    var _metadata = new Metadata(metadata2);
    var possibleCountries = _metadata.getCountryCodesForCallingCode(callingCode);
    if (!possibleCountries) {
      return [];
    }
    return possibleCountries.filter(function(country) {
      return couldNationalNumberBelongToCountry(nationalNumber, country, metadata2);
    });
  }
  function couldNationalNumberBelongToCountry(nationalNumber, country, metadataJson) {
    var metadata2 = new Metadata(metadataJson);
    metadata2.selectNumberingPlan(country);
    return metadata2.numberingPlan.possibleLengths().indexOf(nationalNumber.length) >= 0;
  }
  var MIN_LENGTH_FOR_NSN = 2;
  var MAX_LENGTH_FOR_NSN = 17;
  var MAX_LENGTH_COUNTRY_CODE = 3;
  var VALID_DIGITS = "0-9０-９٠-٩۰-۹";
  var DASHES = "-‐-―−ー－";
  var SLASHES = "／/";
  var DOTS = "．.";
  var WHITESPACE = "  ­​⁠　";
  var BRACKETS = "()（）［］\\[\\]";
  var TILDES = "~⁓∼～";
  var VALID_PUNCTUATION = "".concat(DASHES).concat(SLASHES).concat(DOTS).concat(WHITESPACE).concat(BRACKETS).concat(TILDES);
  var PLUS_CHARS = "+＋";
  var CAPTURING_DIGIT_PATTERN = new RegExp("([" + VALID_DIGITS + "])");
  function stripIddPrefix(number, country, callingCode, metadataJson) {
    if (!country) {
      return;
    }
    var metadata2 = new Metadata(metadataJson);
    metadata2.selectNumberingPlan(country || callingCode);
    var IDDPrefixPattern = new RegExp(metadata2.IDDPrefix());
    if (number.search(IDDPrefixPattern) !== 0) {
      return;
    }
    number = number.slice(number.match(IDDPrefixPattern)[0].length);
    var matchedGroups = number.match(CAPTURING_DIGIT_PATTERN);
    if (matchedGroups && matchedGroups[1] != null && matchedGroups[1].length > 0) {
      if (matchedGroups[1] === "0") {
        return;
      }
    }
    return number;
  }
  function extractNationalNumberFromPossiblyIncompleteNumber(number, metadata2) {
    if (number && metadata2.numberingPlan.nationalPrefixForParsing()) {
      var prefixPattern = new RegExp("^(?:" + metadata2.numberingPlan.nationalPrefixForParsing() + ")");
      var prefixMatch = prefixPattern.exec(number);
      if (prefixMatch) {
        var nationalNumber;
        var carrierCode;
        var capturedGroupsCount = prefixMatch.length - 1;
        var hasCapturedGroups = capturedGroupsCount > 0 && prefixMatch[capturedGroupsCount];
        if (metadata2.nationalPrefixTransformRule() && hasCapturedGroups) {
          nationalNumber = number.replace(prefixPattern, metadata2.nationalPrefixTransformRule());
          if (capturedGroupsCount > 1) {
            carrierCode = prefixMatch[1];
          }
        } else {
          var prefixBeforeNationalNumber = prefixMatch[0];
          nationalNumber = number.slice(prefixBeforeNationalNumber.length);
          if (hasCapturedGroups) {
            carrierCode = prefixMatch[1];
          }
        }
        var nationalPrefix;
        if (hasCapturedGroups) {
          var possiblePositionOfTheFirstCapturedGroup = number.indexOf(prefixMatch[1]);
          var possibleNationalPrefix = number.slice(0, possiblePositionOfTheFirstCapturedGroup);
          if (possibleNationalPrefix === metadata2.numberingPlan.nationalPrefix()) {
            nationalPrefix = metadata2.numberingPlan.nationalPrefix();
          }
        } else {
          nationalPrefix = prefixMatch[0];
        }
        return {
          nationalNumber,
          nationalPrefix,
          carrierCode
        };
      }
    }
    return {
      nationalNumber: number
    };
  }
  function _createForOfIteratorHelperLoose$5(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$8(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$8(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$8(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$8(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$8(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function getCountryByNationalNumber(nationalNumber, countries, metadataJson) {
    var metadata2 = new Metadata(metadataJson);
    for (var _iterator = _createForOfIteratorHelperLoose$5(countries), _step; !(_step = _iterator()).done; ) {
      var country = _step.value;
      metadata2.selectNumberingPlan(country);
      if (metadata2.leadingDigits()) {
        if (nationalNumber && nationalNumber.search(metadata2.leadingDigits()) === 0) {
          return country;
        }
      } else if (getNumberType({
        phone: nationalNumber,
        country
      }, void 0, metadata2.metadata)) {
        return country;
      }
    }
  }
  function getCountryByCallingCode(callingCode, _ref) {
    var nationalNumber = _ref.nationalNumber, metadata2 = _ref.metadata;
    var possibleCountries = metadata2.getCountryCodesForCallingCode(callingCode);
    if (!possibleCountries) {
      return;
    }
    if (possibleCountries.length === 1) {
      return possibleCountries[0];
    }
    return getCountryByNationalNumber(nationalNumber, possibleCountries, metadata2.metadata);
  }
  function extractNationalNumber(number, country, metadata2) {
    var _extractNationalNumbe = extractNationalNumberFromPossiblyIncompleteNumber(number, metadata2), carrierCode = _extractNationalNumbe.carrierCode, nationalNumber = _extractNationalNumbe.nationalNumber;
    if (nationalNumber !== number) {
      if (!shouldHaveExtractedNationalPrefix(number, nationalNumber, metadata2)) {
        return {
          nationalNumber: number
        };
      }
      if (metadata2.numberingPlan.possibleLengths()) {
        if (!country) {
          country = getCountryByCallingCode(metadata2.numberingPlan.callingCode(), {
            nationalNumber,
            metadata: metadata2
          });
        }
        if (!isPossibleIncompleteNationalNumber(nationalNumber, country, metadata2)) {
          return {
            nationalNumber: number
          };
        }
      }
    }
    return {
      nationalNumber,
      carrierCode
    };
  }
  function shouldHaveExtractedNationalPrefix(nationalNumberBefore, nationalNumberAfter, metadata2) {
    if (matchesEntirely(nationalNumberBefore, metadata2.nationalNumberPattern()) && !matchesEntirely(nationalNumberAfter, metadata2.nationalNumberPattern())) {
      return false;
    }
    return true;
  }
  function isPossibleIncompleteNationalNumber(nationalNumber, country, metadata2) {
    switch (checkNumberLength(nationalNumber, country, metadata2)) {
      case "TOO_SHORT":
      case "INVALID_LENGTH":
        return false;
      default:
        return true;
    }
  }
  function extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(number, country, defaultCountry, defaultCallingCode, metadataJson) {
    if (!(country || defaultCountry || defaultCallingCode)) {
      return {
        number
      };
    }
    var countryCallingCode = country || defaultCountry ? getCountryCallingCode$1(country || defaultCountry, metadataJson) : defaultCallingCode;
    if (number.indexOf(countryCallingCode) === 0) {
      var metadata2 = new Metadata(metadataJson);
      metadata2.selectNumberingPlan(country || defaultCountry || defaultCallingCode);
      var possibleShorterNumber = number.slice(countryCallingCode.length);
      var _extractNationalNumbe = extractNationalNumber(possibleShorterNumber, void 0, metadata2), possibleShorterNationalNumber = _extractNationalNumbe.nationalNumber;
      var _extractNationalNumbe2 = extractNationalNumber(number, void 0, metadata2), nationalNumber = _extractNationalNumbe2.nationalNumber;
      if (!matchesEntirely(nationalNumber, metadata2.nationalNumberPattern()) && matchesEntirely(possibleShorterNationalNumber, metadata2.nationalNumberPattern()) || checkNumberLength(nationalNumber, void 0, metadata2) === "TOO_LONG") {
        return {
          countryCallingCode,
          number: possibleShorterNumber
        };
      }
    }
    return {
      number
    };
  }
  function extractCountryCallingCode(number, country, defaultCountry, defaultCallingCode, metadataJson) {
    if (!number) {
      return {};
    }
    var isNumberWithIddPrefix;
    if (number[0] !== "+") {
      var numberWithoutIDD = stripIddPrefix(number, country || defaultCountry, defaultCallingCode, metadataJson);
      if (numberWithoutIDD && numberWithoutIDD !== number) {
        isNumberWithIddPrefix = true;
        number = "+" + numberWithoutIDD;
      } else {
        if (country || defaultCountry || defaultCallingCode) {
          var _extractCountryCallin = extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(number, country, defaultCountry, defaultCallingCode, metadataJson), countryCallingCode = _extractCountryCallin.countryCallingCode, shorterNumber = _extractCountryCallin.number;
          if (countryCallingCode) {
            return {
              countryCallingCodeSource: "FROM_NUMBER_WITHOUT_PLUS_SIGN",
              countryCallingCode,
              number: shorterNumber
            };
          }
        }
        return {
          // No need to set it to `UNSPECIFIED`. It can be just `undefined`.
          // countryCallingCodeSource: 'UNSPECIFIED',
          number
        };
      }
    }
    if (number[1] === "0") {
      return {};
    }
    var metadata2 = new Metadata(metadataJson);
    var i = 2;
    while (i - 1 <= MAX_LENGTH_COUNTRY_CODE && i <= number.length) {
      var _countryCallingCode = number.slice(1, i);
      if (metadata2.hasCallingCode(_countryCallingCode)) {
        metadata2.selectNumberingPlan(_countryCallingCode);
        return {
          countryCallingCodeSource: isNumberWithIddPrefix ? "FROM_NUMBER_WITH_IDD" : "FROM_NUMBER_WITH_PLUS_SIGN",
          countryCallingCode: _countryCallingCode,
          number: number.slice(i)
        };
      }
      i++;
    }
    return {};
  }
  function applyInternationalSeparatorStyle(formattedNumber) {
    return formattedNumber.replace(new RegExp("[".concat(VALID_PUNCTUATION, "]+"), "g"), " ").trim();
  }
  var FIRST_GROUP_PATTERN = /(\$\d)/;
  function formatNationalNumberUsingFormat(number, format, _ref) {
    var useInternationalFormat = _ref.useInternationalFormat, withNationalPrefix = _ref.withNationalPrefix;
    _ref.carrierCode;
    _ref.metadata;
    var formattedNumber = number.replace(new RegExp(format.pattern()), useInternationalFormat ? format.internationalFormat() : (
      // This library doesn't use `domestic_carrier_code_formatting_rule`,
      // because that one is only used when formatting phone numbers
      // for dialing from a mobile phone, and this is not a dialing library.
      // carrierCode && format.domesticCarrierCodeFormattingRule()
      // 	// First, replace the $CC in the formatting rule with the desired carrier code.
      // 	// Then, replace the $FG in the formatting rule with the first group
      // 	// and the carrier code combined in the appropriate way.
      // 	? format.format().replace(FIRST_GROUP_PATTERN, format.domesticCarrierCodeFormattingRule().replace('$CC', carrierCode))
      // 	: (
      // 		withNationalPrefix && format.nationalPrefixFormattingRule()
      // 			? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule())
      // 			: format.format()
      // 	)
      withNationalPrefix && format.nationalPrefixFormattingRule() ? format.format().replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule()) : format.format()
    ));
    if (useInternationalFormat) {
      return applyInternationalSeparatorStyle(formattedNumber);
    }
    return formattedNumber;
  }
  var SINGLE_IDD_PREFIX_REG_EXP = /^[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?$/;
  function getIddPrefix(country, callingCode, metadata2) {
    var countryMetadata = new Metadata(metadata2);
    countryMetadata.selectNumberingPlan(country || callingCode);
    if (countryMetadata.defaultIDDPrefix()) {
      return countryMetadata.defaultIDDPrefix();
    }
    if (SINGLE_IDD_PREFIX_REG_EXP.test(countryMetadata.IDDPrefix())) {
      return countryMetadata.IDDPrefix();
    }
  }
  var RFC3966_EXTN_PREFIX = ";ext=";
  var getExtensionDigitsPattern = function getExtensionDigitsPattern2(maxLength) {
    return "([".concat(VALID_DIGITS, "]{1,").concat(maxLength, "})");
  };
  function createExtensionPattern(purpose) {
    var extLimitAfterExplicitLabel = "20";
    var extLimitAfterLikelyLabel = "15";
    var extLimitAfterAmbiguousChar = "9";
    var extLimitWhenNotSure = "6";
    var possibleSeparatorsBetweenNumberAndExtLabel = "[  \\t,]*";
    var possibleCharsAfterExtLabel = "[:\\.．]?[  \\t,-]*";
    var optionalExtnSuffix = "#?";
    var explicitExtLabels = "(?:e?xt(?:ensi(?:ó?|ó))?n?|ｅ?ｘｔｎ?|доб|anexo)";
    var ambiguousExtLabels = "(?:[xｘ#＃~～]|int|ｉｎｔ)";
    var ambiguousSeparator = "[- ]+";
    var possibleSeparatorsNumberExtLabelNoComma = "[  \\t]*";
    var autoDiallingAndExtLabelsFound = "(?:,{2}|;)";
    var rfcExtn = RFC3966_EXTN_PREFIX + getExtensionDigitsPattern(extLimitAfterExplicitLabel);
    var explicitExtn = possibleSeparatorsBetweenNumberAndExtLabel + explicitExtLabels + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterExplicitLabel) + optionalExtnSuffix;
    var ambiguousExtn = possibleSeparatorsBetweenNumberAndExtLabel + ambiguousExtLabels + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterAmbiguousChar) + optionalExtnSuffix;
    var americanStyleExtnWithSuffix = ambiguousSeparator + getExtensionDigitsPattern(extLimitWhenNotSure) + "#";
    var autoDiallingExtn = possibleSeparatorsNumberExtLabelNoComma + autoDiallingAndExtLabelsFound + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterLikelyLabel) + optionalExtnSuffix;
    var onlyCommasExtn = possibleSeparatorsNumberExtLabelNoComma + "(?:,)+" + possibleCharsAfterExtLabel + getExtensionDigitsPattern(extLimitAfterAmbiguousChar) + optionalExtnSuffix;
    return rfcExtn + "|" + explicitExtn + "|" + ambiguousExtn + "|" + americanStyleExtnWithSuffix + "|" + autoDiallingExtn + "|" + onlyCommasExtn;
  }
  var MIN_LENGTH_PHONE_NUMBER_PATTERN = "[" + VALID_DIGITS + "]{" + MIN_LENGTH_FOR_NSN + "}";
  var VALID_PHONE_NUMBER = "[" + PLUS_CHARS + "]{0,1}(?:[" + VALID_PUNCTUATION + "]*[" + VALID_DIGITS + "]){3,}[" + VALID_PUNCTUATION + VALID_DIGITS + "]*";
  var VALID_PHONE_NUMBER_START_REG_EXP = new RegExp("^[" + PLUS_CHARS + "]{0,1}(?:[" + VALID_PUNCTUATION + "]*[" + VALID_DIGITS + "]){1,2}$", "i");
  var VALID_PHONE_NUMBER_WITH_EXTENSION = VALID_PHONE_NUMBER + // Phone number extensions
  "(?:" + createExtensionPattern() + ")?";
  var VALID_PHONE_NUMBER_PATTERN = new RegExp(
    // Either a short two-digit-only phone number
    "^" + MIN_LENGTH_PHONE_NUMBER_PATTERN + "$|^" + VALID_PHONE_NUMBER_WITH_EXTENSION + "$",
    "i"
  );
  function isViablePhoneNumber(number) {
    return number.length >= MIN_LENGTH_FOR_NSN && VALID_PHONE_NUMBER_PATTERN.test(number);
  }
  function isViablePhoneNumberStart(number) {
    return VALID_PHONE_NUMBER_START_REG_EXP.test(number);
  }
  function formatRFC3966(_ref) {
    var number = _ref.number, ext = _ref.ext;
    if (!number) {
      return "";
    }
    if (number[0] !== "+") {
      throw new Error('"formatRFC3966()" expects "number" to be in E.164 format.');
    }
    return "tel:".concat(number).concat(ext ? ";ext=" + ext : "");
  }
  var DEFAULT_OPTIONS = {
    formatExtension: function formatExtension(formattedNumber, extension, metadata2) {
      return "".concat(formattedNumber).concat(metadata2.ext()).concat(extension);
    }
  };
  function formatNumber(input, format, options, metadataJson) {
    if (options) {
      options = merge({}, DEFAULT_OPTIONS, options);
    } else {
      options = DEFAULT_OPTIONS;
    }
    var metadata2 = new Metadata(metadataJson);
    if (input.country && input.country !== "001") {
      if (!metadata2.hasCountry(input.country)) {
        throw new Error("Unknown country: ".concat(input.country));
      }
      metadata2.selectNumberingPlan(input.country);
    } else if (input.countryCallingCode) {
      metadata2.selectNumberingPlan(input.countryCallingCode);
    } else return input.phone || "";
    var countryCallingCode = metadata2.countryCallingCode();
    var nationalNumber = options.v2 ? input.nationalNumber : input.phone;
    var number;
    switch (format) {
      case "NATIONAL":
        if (!nationalNumber) {
          return "";
        }
        number = formatNationalNumber$1(nationalNumber, input.carrierCode, "NATIONAL", metadata2, options);
        return addExtension(number, input.ext, metadata2, options.formatExtension);
      case "INTERNATIONAL":
        if (!nationalNumber) {
          return "+".concat(countryCallingCode);
        }
        number = formatNationalNumber$1(nationalNumber, null, "INTERNATIONAL", metadata2, options);
        number = "+".concat(countryCallingCode, " ").concat(number);
        return addExtension(number, input.ext, metadata2, options.formatExtension);
      case "E.164":
        return "+".concat(countryCallingCode).concat(nationalNumber);
      case "RFC3966":
        return formatRFC3966({
          number: "+".concat(countryCallingCode).concat(nationalNumber),
          ext: input.ext
        });
      // For reference, here's Google's IDD formatter:
      // https://github.com/google/libphonenumber/blob/32719cf74e68796788d1ca45abc85dcdc63ba5b9/java/libphonenumber/src/com/google/i18n/phonenumbers/PhoneNumberUtil.java#L1546
      // Not saying that this IDD formatter replicates it 1:1, but it seems to work.
      // Who would even need to format phone numbers in IDD format anyway?
      case "IDD":
        if (!options.fromCountry) {
          return;
        }
        var formattedNumber = formatIDD(nationalNumber, input.carrierCode, countryCallingCode, options.fromCountry, metadata2);
        if (!formattedNumber) {
          return;
        }
        return addExtension(formattedNumber, input.ext, metadata2, options.formatExtension);
      default:
        throw new Error('Unknown "format" argument passed to "formatNumber()": "'.concat(format, '"'));
    }
  }
  function formatNationalNumber$1(number, carrierCode, formatAs, metadata2, options) {
    var format = chooseFormatForNumber(metadata2.formats(), number);
    if (!format) {
      return number;
    }
    return formatNationalNumberUsingFormat(number, format, {
      useInternationalFormat: formatAs === "INTERNATIONAL",
      withNationalPrefix: format.nationalPrefixIsOptionalWhenFormattingInNationalFormat() && options && options.nationalPrefix === false ? false : true,
      carrierCode,
      metadata: metadata2
    });
  }
  function chooseFormatForNumber(availableFormats, nationalNumber) {
    return pickFirstMatchingElement(availableFormats, function(format) {
      if (format.leadingDigitsPatterns().length > 0) {
        var lastLeadingDigitsPattern = format.leadingDigitsPatterns()[format.leadingDigitsPatterns().length - 1];
        if (nationalNumber.search(lastLeadingDigitsPattern) !== 0) {
          return false;
        }
      }
      return matchesEntirely(nationalNumber, format.pattern());
    });
  }
  function addExtension(formattedNumber, ext, metadata2, formatExtension) {
    return ext ? formatExtension(formattedNumber, ext, metadata2) : formattedNumber;
  }
  function formatIDD(nationalNumber, carrierCode, countryCallingCode, fromCountry, metadata2) {
    var fromCountryCallingCode = getCountryCallingCode$1(fromCountry, metadata2.metadata);
    if (fromCountryCallingCode === countryCallingCode) {
      var formattedNumber = formatNationalNumber$1(nationalNumber, carrierCode, "NATIONAL", metadata2);
      if (countryCallingCode === "1") {
        return countryCallingCode + " " + formattedNumber;
      }
      return formattedNumber;
    }
    var iddPrefix = getIddPrefix(fromCountry, void 0, metadata2.metadata);
    if (iddPrefix) {
      return "".concat(iddPrefix, " ").concat(countryCallingCode, " ").concat(formatNationalNumber$1(nationalNumber, null, "INTERNATIONAL", metadata2));
    }
  }
  function merge() {
    var i = 1;
    for (var _len = arguments.length, objects = new Array(_len), _key = 0; _key < _len; _key++) {
      objects[_key] = arguments[_key];
    }
    while (i < objects.length) {
      if (objects[i]) {
        for (var key in objects[i]) {
          objects[0][key] = objects[i][key];
        }
      }
      i++;
    }
    return objects[0];
  }
  function pickFirstMatchingElement(elements, testFunction) {
    var i = 0;
    while (i < elements.length) {
      if (testFunction(elements[i])) {
        return elements[i];
      }
      i++;
    }
  }
  function _typeof$a(o) {
    "@babel/helpers - typeof";
    return _typeof$a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$a(o);
  }
  function ownKeys$3(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$3(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys$3(Object(t), true).forEach(function(r2) {
        _defineProperty$3(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$3(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty$3(e, r, t) {
    return (r = _toPropertyKey$9(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _classCallCheck$7(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$6(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$9(o.key), o);
    }
  }
  function _createClass$7(e, r, t) {
    return r && _defineProperties$6(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$9(t) {
    var i = _toPrimitive$9(t, "string");
    return "symbol" == _typeof$a(i) ? i : i + "";
  }
  function _toPrimitive$9(t, r) {
    if ("object" != _typeof$a(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$a(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var PhoneNumber = /* @__PURE__ */ (function() {
    function PhoneNumber2(countryOrCountryCallingCode, nationalNumber, metadata2) {
      _classCallCheck$7(this, PhoneNumber2);
      if (!countryOrCountryCallingCode) {
        throw new TypeError("First argument is required");
      }
      if (typeof countryOrCountryCallingCode !== "string") {
        throw new TypeError("First argument must be a string");
      }
      if (countryOrCountryCallingCode[0] === "+" && !nationalNumber) {
        throw new TypeError("`metadata` argument not passed");
      }
      if (isObject(nationalNumber) && isObject(nationalNumber.countries)) {
        metadata2 = nationalNumber;
        var e164Number = countryOrCountryCallingCode;
        if (!E164_NUMBER_REGEXP.test(e164Number)) {
          throw new Error('Invalid `number` argument passed: must consist of a "+" followed by digits');
        }
        var _extractCountryCallin = extractCountryCallingCode(e164Number, void 0, void 0, void 0, metadata2), _countryCallingCode = _extractCountryCallin.countryCallingCode, number = _extractCountryCallin.number;
        nationalNumber = number;
        countryOrCountryCallingCode = _countryCallingCode;
        if (!nationalNumber) {
          throw new Error("Invalid `number` argument passed: too short");
        }
      }
      if (!nationalNumber) {
        throw new TypeError("`nationalNumber` argument is required");
      }
      if (typeof nationalNumber !== "string") {
        throw new TypeError("`nationalNumber` argument must be a string");
      }
      validateMetadata(metadata2);
      var _getCountryAndCalling = getCountryAndCallingCodeFromOneOfThem(countryOrCountryCallingCode, metadata2), country = _getCountryAndCalling.country, countryCallingCode = _getCountryAndCalling.callingCode;
      this.country = country;
      this.countryCallingCode = countryCallingCode;
      this.nationalNumber = nationalNumber;
      this.number = "+" + this.countryCallingCode + this.nationalNumber;
      this.getMetadata = function() {
        return metadata2;
      };
    }
    return _createClass$7(PhoneNumber2, [{
      key: "setExt",
      value: function setExt(ext) {
        this.ext = ext;
      }
    }, {
      key: "getPossibleCountries",
      value: function getPossibleCountries() {
        if (this.country) {
          return [this.country];
        }
        return getPossibleCountriesForNumber(this.countryCallingCode, this.nationalNumber, this.getMetadata());
      }
    }, {
      key: "isPossible",
      value: function isPossible() {
        return isPossiblePhoneNumber(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "isValid",
      value: function isValid() {
        return isValidNumber(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "isNonGeographic",
      value: function isNonGeographic() {
        var metadata2 = new Metadata(this.getMetadata());
        return metadata2.isNonGeographicCallingCode(this.countryCallingCode);
      }
    }, {
      key: "isEqual",
      value: function isEqual(phoneNumber) {
        return this.number === phoneNumber.number && this.ext === phoneNumber.ext;
      }
      // `validateLength()` method was originally meant to be an equivalent for `validatePhoneNumberLength()`.
      //
      // Later, it became apparent that it's not really a true equivalent.
      // The reason is that a `PhoneNumber` instance is not created
      // when the phone number string is too short for it to be considered a valid phone number:
      // * When there must be at least 2 national (significant) number digits: `"1"`.
      // * When the country calling code part of an international number is incomplete: `"+12"`.
      //
      // So leaving this `validateLength()` method here would suggest a hidden anti-pattern
      // of using it instead of `validatePhoneNumberLength()` while ignoring
      // the "too short to be even possible" case from phone number length validation.
      // And ignoring that case wouldn't make any sense in a real-world application
      // because it would still be a valid case that should be handled.
      //
      // Because of that, this method was eventually commented out in order to not introduce
      // that kind of an anti-pattern.
      //
      // validateLength() {
      // 	const result = checkNumberLength(
      // 		this.nationalNumber,
      // 		undefined,
      // 		this.getMetadata()
      // 	)
      // 	if (result !== 'IS_POSSIBLE') {
      // 		return result
      // 	}
      // }
    }, {
      key: "getType",
      value: function getType2() {
        return getNumberType(this, {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "format",
      value: function format(_format, options) {
        return formatNumber(this, _format, options ? _objectSpread$3(_objectSpread$3({}, options), {}, {
          v2: true
        }) : {
          v2: true
        }, this.getMetadata());
      }
    }, {
      key: "formatNational",
      value: function formatNational(options) {
        return this.format("NATIONAL", options);
      }
    }, {
      key: "formatInternational",
      value: function formatInternational(options) {
        return this.format("INTERNATIONAL", options);
      }
    }, {
      key: "getURI",
      value: function getURI(options) {
        return this.format("RFC3966", options);
      }
    }]);
  })();
  var E164_NUMBER_REGEXP = /^\+\d+$/;
  function _typeof$9(o) {
    "@babel/helpers - typeof";
    return _typeof$9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$9(o);
  }
  function _createClass$6(e, r, t) {
    return Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _classCallCheck$6(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == _typeof$9(e) || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: true, configurable: true } }), Object.defineProperty(t, "prototype", { writable: false }), e && _setPrototypeOf(t, e);
  }
  function _wrapNativeSuper(t) {
    var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
    return _wrapNativeSuper = function _wrapNativeSuper2(t2) {
      if (null === t2 || !_isNativeFunction(t2)) return t2;
      if ("function" != typeof t2) throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== r) {
        if (r.has(t2)) return r.get(t2);
        r.set(t2, Wrapper);
      }
      function Wrapper() {
        return _construct(t2, arguments, _getPrototypeOf(this).constructor);
      }
      return Wrapper.prototype = Object.create(t2.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }), _setPrototypeOf(Wrapper, t2);
    }, _wrapNativeSuper(t);
  }
  function _construct(t, e, r) {
    if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
    var o = [null];
    o.push.apply(o, e);
    var p = new (t.bind.apply(t, o))();
    return r && _setPrototypeOf(p, r.prototype), p;
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
      }));
    } catch (t2) {
    }
    return (_isNativeReflectConstruct = function _isNativeReflectConstruct2() {
      return !!t;
    })();
  }
  function _isNativeFunction(t) {
    try {
      return -1 !== Function.toString.call(t).indexOf("[native code]");
    } catch (n) {
      return "function" == typeof t;
    }
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t2, e2) {
      return t2.__proto__ = e2, t2;
    }, _setPrototypeOf(t, e);
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t2) {
      return t2.__proto__ || Object.getPrototypeOf(t2);
    }, _getPrototypeOf(t);
  }
  var ParseError = /* @__PURE__ */ (function(_Error) {
    function ParseError2(code) {
      var _this;
      _classCallCheck$6(this, ParseError2);
      _this = _callSuper(this, ParseError2, [code]);
      Object.setPrototypeOf(_this, ParseError2.prototype);
      _this.name = _this.constructor.name;
      return _this;
    }
    _inherits(ParseError2, _Error);
    return _createClass$6(ParseError2);
  })(/* @__PURE__ */ _wrapNativeSuper(Error));
  var EXTN_PATTERN = new RegExp("(?:" + createExtensionPattern() + ")$", "i");
  function extractExtension(number) {
    var start = number.search(EXTN_PATTERN);
    if (start < 0) {
      return {};
    }
    var numberWithoutExtension = number.slice(0, start);
    var matches = number.match(EXTN_PATTERN);
    var i = 1;
    while (i < matches.length) {
      if (matches[i]) {
        return {
          number: numberWithoutExtension,
          ext: matches[i]
        };
      }
      i++;
    }
  }
  function _createForOfIteratorHelperLoose$4(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$7(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$7(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$7(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$7(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$7(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  var DIGITS = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "０": "0",
    // Fullwidth digit 0
    "１": "1",
    // Fullwidth digit 1
    "２": "2",
    // Fullwidth digit 2
    "３": "3",
    // Fullwidth digit 3
    "４": "4",
    // Fullwidth digit 4
    "５": "5",
    // Fullwidth digit 5
    "６": "6",
    // Fullwidth digit 6
    "７": "7",
    // Fullwidth digit 7
    "８": "8",
    // Fullwidth digit 8
    "９": "9",
    // Fullwidth digit 9
    "٠": "0",
    // Arabic-indic digit 0
    "١": "1",
    // Arabic-indic digit 1
    "٢": "2",
    // Arabic-indic digit 2
    "٣": "3",
    // Arabic-indic digit 3
    "٤": "4",
    // Arabic-indic digit 4
    "٥": "5",
    // Arabic-indic digit 5
    "٦": "6",
    // Arabic-indic digit 6
    "٧": "7",
    // Arabic-indic digit 7
    "٨": "8",
    // Arabic-indic digit 8
    "٩": "9",
    // Arabic-indic digit 9
    "۰": "0",
    // Eastern-Arabic digit 0
    "۱": "1",
    // Eastern-Arabic digit 1
    "۲": "2",
    // Eastern-Arabic digit 2
    "۳": "3",
    // Eastern-Arabic digit 3
    "۴": "4",
    // Eastern-Arabic digit 4
    "۵": "5",
    // Eastern-Arabic digit 5
    "۶": "6",
    // Eastern-Arabic digit 6
    "۷": "7",
    // Eastern-Arabic digit 7
    "۸": "8",
    // Eastern-Arabic digit 8
    "۹": "9"
    // Eastern-Arabic digit 9
  };
  function parseDigit(character) {
    return DIGITS[character];
  }
  function parseDigits(string) {
    var result2 = "";
    for (var _iterator = _createForOfIteratorHelperLoose$4(string.split("")), _step; !(_step = _iterator()).done; ) {
      var character = _step.value;
      var digit = parseDigit(character);
      if (digit) {
        result2 += digit;
      }
    }
    return result2;
  }
  function _createForOfIteratorHelperLoose$3(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$6(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$6(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$6(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$6(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$6(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function parseIncompletePhoneNumber(string) {
    var result2 = "";
    for (var _iterator = _createForOfIteratorHelperLoose$3(string.split("")), _step; !(_step = _iterator()).done; ) {
      var character = _step.value;
      result2 += parsePhoneNumberCharacter(character, result2) || "";
    }
    return result2;
  }
  function parsePhoneNumberCharacter(character, prevParsedCharacters, eventListener) {
    if (character === "+") {
      if (prevParsedCharacters) {
        return;
      }
      return "+";
    }
    return parseDigit(character);
  }
  var PLUS_SIGN = "+";
  var RFC3966_VISUAL_SEPARATOR_ = "[\\-\\.\\(\\)]?";
  var RFC3966_PHONE_DIGIT_ = "([" + VALID_DIGITS + "]|" + RFC3966_VISUAL_SEPARATOR_ + ")";
  var RFC3966_GLOBAL_NUMBER_DIGITS_ = "^\\" + PLUS_SIGN + RFC3966_PHONE_DIGIT_ + "*[" + VALID_DIGITS + "]" + RFC3966_PHONE_DIGIT_ + "*$";
  var RFC3966_GLOBAL_NUMBER_DIGITS_PATTERN_ = new RegExp(RFC3966_GLOBAL_NUMBER_DIGITS_, "g");
  var ALPHANUM_ = VALID_DIGITS;
  var RFC3966_DOMAINLABEL_ = "[" + ALPHANUM_ + "]+((\\-)*[" + ALPHANUM_ + "])*";
  var VALID_ALPHA_ = "a-zA-Z";
  var RFC3966_TOPLABEL_ = "[" + VALID_ALPHA_ + "]+((\\-)*[" + ALPHANUM_ + "])*";
  var RFC3966_DOMAINNAME_ = "^(" + RFC3966_DOMAINLABEL_ + "\\.)*" + RFC3966_TOPLABEL_ + "\\.?$";
  var RFC3966_DOMAINNAME_PATTERN_ = new RegExp(RFC3966_DOMAINNAME_, "g");
  var RFC3966_PREFIX_ = "tel:";
  var RFC3966_PHONE_CONTEXT_ = ";phone-context=";
  var RFC3966_ISDN_SUBADDRESS_ = ";isub=";
  function extractPhoneContext(numberToExtractFrom) {
    var indexOfPhoneContext = numberToExtractFrom.indexOf(RFC3966_PHONE_CONTEXT_);
    if (indexOfPhoneContext < 0) {
      return null;
    }
    var phoneContextStart = indexOfPhoneContext + RFC3966_PHONE_CONTEXT_.length;
    if (phoneContextStart >= numberToExtractFrom.length) {
      return "";
    }
    var phoneContextEnd = numberToExtractFrom.indexOf(";", phoneContextStart);
    if (phoneContextEnd >= 0) {
      return numberToExtractFrom.substring(phoneContextStart, phoneContextEnd);
    } else {
      return numberToExtractFrom.substring(phoneContextStart);
    }
  }
  function isPhoneContextValid(phoneContext) {
    if (phoneContext === null) {
      return true;
    }
    if (phoneContext.length === 0) {
      return false;
    }
    return RFC3966_GLOBAL_NUMBER_DIGITS_PATTERN_.test(phoneContext) || RFC3966_DOMAINNAME_PATTERN_.test(phoneContext);
  }
  function extractFormattedPhoneNumberFromPossibleRfc3966NumberUri(numberToParse, _ref) {
    var extractFormattedPhoneNumber2 = _ref.extractFormattedPhoneNumber;
    var phoneContext = extractPhoneContext(numberToParse);
    if (!isPhoneContextValid(phoneContext)) {
      throw new ParseError("NOT_A_NUMBER");
    }
    var phoneNumberString;
    if (phoneContext === null) {
      phoneNumberString = extractFormattedPhoneNumber2(numberToParse) || "";
    } else {
      phoneNumberString = "";
      if (phoneContext.charAt(0) === PLUS_SIGN) {
        phoneNumberString += phoneContext;
      }
      var indexOfRfc3966Prefix = numberToParse.indexOf(RFC3966_PREFIX_);
      var indexOfNationalNumber;
      if (indexOfRfc3966Prefix >= 0) {
        indexOfNationalNumber = indexOfRfc3966Prefix + RFC3966_PREFIX_.length;
      } else {
        indexOfNationalNumber = 0;
      }
      var indexOfPhoneContext = numberToParse.indexOf(RFC3966_PHONE_CONTEXT_);
      phoneNumberString += numberToParse.substring(indexOfNationalNumber, indexOfPhoneContext);
    }
    var indexOfIsdn = phoneNumberString.indexOf(RFC3966_ISDN_SUBADDRESS_);
    if (indexOfIsdn > 0) {
      phoneNumberString = phoneNumberString.substring(0, indexOfIsdn);
    }
    if (phoneNumberString !== "") {
      return phoneNumberString;
    }
  }
  var MAX_INPUT_STRING_LENGTH = 250;
  var PHONE_NUMBER_START_PATTERN = new RegExp("[" + PLUS_CHARS + VALID_DIGITS + "]");
  var AFTER_PHONE_NUMBER_END_PATTERN = new RegExp("[^" + VALID_DIGITS + "#]+$");
  function parse(text, options, metadataJson) {
    options = options || {};
    var metadata2 = new Metadata(metadataJson);
    if (options.defaultCountry && !metadata2.hasCountry(options.defaultCountry)) {
      if (options.v2) {
        throw new ParseError("INVALID_COUNTRY");
      }
      throw new Error("Unknown country: ".concat(options.defaultCountry));
    }
    var _parseInput = parseInput(text, options.v2, options.extract), formattedPhoneNumber = _parseInput.number, ext = _parseInput.ext, error = _parseInput.error;
    if (!formattedPhoneNumber) {
      if (options.v2) {
        if (error === "TOO_SHORT") {
          throw new ParseError("TOO_SHORT");
        }
        throw new ParseError("NOT_A_NUMBER");
      }
      return {};
    }
    var _parsePhoneNumber = parsePhoneNumber$3(
      formattedPhoneNumber,
      options.defaultCountry,
      options.defaultCallingCode,
      // If `country` is returned, its numbering plan will also be selected in `metadata`.
      // Otherwise, if `countryCallingCode` is returned, its numbering plan will also be selected in `metadata`.
      // Otherwise, if neither `country` nor `countryCallingCode` are returned, no numbering plan will be selected in `metadata`.
      metadata2
    ), country = _parsePhoneNumber.country, nationalNumber = _parsePhoneNumber.nationalNumber, countryCallingCode = _parsePhoneNumber.countryCallingCode, countryCallingCodeSource = _parsePhoneNumber.countryCallingCodeSource, carrierCode = _parsePhoneNumber.carrierCode;
    if (!metadata2.hasSelectedNumberingPlan()) {
      if (options.v2) {
        throw new ParseError("INVALID_COUNTRY");
      }
      return {};
    }
    if (!nationalNumber || nationalNumber.length < MIN_LENGTH_FOR_NSN) {
      if (options.v2) {
        throw new ParseError("TOO_SHORT");
      }
      return {};
    }
    if (nationalNumber.length > MAX_LENGTH_FOR_NSN) {
      if (options.v2) {
        throw new ParseError("TOO_LONG");
      }
      return {};
    }
    if (options.v2) {
      var phoneNumber = new PhoneNumber(countryCallingCode, nationalNumber, metadata2.metadata);
      if (country) {
        phoneNumber.country = country;
      }
      if (carrierCode) {
        phoneNumber.carrierCode = carrierCode;
      }
      if (ext) {
        phoneNumber.ext = ext;
      }
      phoneNumber.__countryCallingCodeSource = countryCallingCodeSource;
      return phoneNumber;
    }
    var valid = (options.extended ? metadata2.hasSelectedNumberingPlan() : country) ? matchesEntirely(nationalNumber, metadata2.nationalNumberPattern()) : false;
    if (!options.extended) {
      return valid ? result(country, nationalNumber, ext) : {};
    }
    return {
      country,
      countryCallingCode,
      carrierCode,
      valid,
      possible: valid ? true : options.extended === true && metadata2.possibleLengths() && isPossibleNumber(nationalNumber, metadata2) ? true : false,
      phone: nationalNumber,
      ext
    };
  }
  function _extractFormattedPhoneNumber(text, extract, throwOnError) {
    if (!text) {
      return;
    }
    if (text.length > MAX_INPUT_STRING_LENGTH) {
      if (throwOnError) {
        throw new ParseError("TOO_LONG");
      }
      return;
    }
    if (extract === false) {
      return text;
    }
    var startsAt = text.search(PHONE_NUMBER_START_PATTERN);
    if (startsAt < 0) {
      return;
    }
    return text.slice(startsAt).replace(AFTER_PHONE_NUMBER_END_PATTERN, "");
  }
  function parseInput(text, v2, extract) {
    var number = extractFormattedPhoneNumberFromPossibleRfc3966NumberUri(text, {
      extractFormattedPhoneNumber: function extractFormattedPhoneNumber2(text2) {
        return _extractFormattedPhoneNumber(text2, extract, v2);
      }
    });
    if (!number) {
      return {};
    }
    if (!isViablePhoneNumber(number)) {
      if (isViablePhoneNumberStart(number)) {
        return {
          error: "TOO_SHORT"
        };
      }
      return {};
    }
    var withExtensionStripped = extractExtension(number);
    if (withExtensionStripped.ext) {
      return withExtensionStripped;
    }
    return {
      number
    };
  }
  function result(country, nationalNumber, ext) {
    var result2 = {
      country,
      phone: nationalNumber
    };
    if (ext) {
      result2.ext = ext;
    }
    return result2;
  }
  function parsePhoneNumber$3(formattedPhoneNumber, defaultCountry, defaultCallingCode, metadata2) {
    var _extractCountryCallin = extractCountryCallingCode(
      parseIncompletePhoneNumber(formattedPhoneNumber),
      void 0,
      // `defaultCountry` and `defaultCallingCode` are only used to detect
      // if it's an "international" phone number or not. They won't be used
      // to derive the resulting `countryCallingCode` from them, or anything like that.
      defaultCountry,
      defaultCallingCode,
      metadata2.metadata
    ), countryCallingCodeSource = _extractCountryCallin.countryCallingCodeSource, countryCallingCode = _extractCountryCallin.countryCallingCode, number = _extractCountryCallin.number;
    var country;
    if (countryCallingCode) {
      metadata2.selectNumberingPlan(countryCallingCode);
    } else if (number && (defaultCountry || defaultCallingCode)) {
      if (defaultCountry) {
        country = defaultCountry;
        metadata2.selectNumberingPlan(defaultCountry);
        countryCallingCode = metadata2.numberingPlan.callingCode();
      } else {
        metadata2.selectNumberingPlan(defaultCallingCode);
        countryCallingCode = defaultCallingCode;
      }
    } else return {};
    if (!number) {
      return {
        countryCallingCodeSource,
        countryCallingCode
      };
    }
    var _extractNationalNumbe = extractNationalNumber(parseIncompletePhoneNumber(number), void 0, metadata2), nationalNumber = _extractNationalNumbe.nationalNumber, carrierCode = _extractNationalNumbe.carrierCode;
    var exactCountry = getCountryByCallingCode(countryCallingCode, {
      nationalNumber,
      metadata: metadata2
    });
    if (exactCountry) {
      country = exactCountry;
      if (exactCountry === "001") ;
      else {
        metadata2.selectNumberingPlan(country);
      }
    }
    return {
      country,
      countryCallingCode,
      countryCallingCodeSource,
      nationalNumber,
      carrierCode
    };
  }
  function _typeof$8(o) {
    "@babel/helpers - typeof";
    return _typeof$8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$8(o);
  }
  function ownKeys$2(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$2(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys$2(Object(t), true).forEach(function(r2) {
        _defineProperty$2(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty$2(e, r, t) {
    return (r = _toPropertyKey$8(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey$8(t) {
    var i = _toPrimitive$8(t, "string");
    return "symbol" == _typeof$8(i) ? i : i + "";
  }
  function _toPrimitive$8(t, r) {
    if ("object" != _typeof$8(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$8(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function parsePhoneNumberWithError(text, options, metadata2) {
    return parse(text, _objectSpread$2(_objectSpread$2({}, options), {}, {
      v2: true
    }), metadata2);
  }
  function _typeof$7(o) {
    "@babel/helpers - typeof";
    return _typeof$7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$7(o);
  }
  function ownKeys$1(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread$1(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys$1(Object(t), true).forEach(function(r2) {
        _defineProperty$1(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty$1(e, r, t) {
    return (r = _toPropertyKey$7(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey$7(t) {
    var i = _toPrimitive$7(t, "string");
    return "symbol" == _typeof$7(i) ? i : i + "";
  }
  function _toPrimitive$7(t, r) {
    if ("object" != _typeof$7(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$7(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _slicedToArray$2(r, e) {
    return _arrayWithHoles$2(r) || _iterableToArrayLimit$2(r, e) || _unsupportedIterableToArray$5(r, e) || _nonIterableRest$2();
  }
  function _nonIterableRest$2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$5(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$5(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$5(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$5(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _iterableToArrayLimit$2(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ;
        else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles$2(r) {
    if (Array.isArray(r)) return r;
  }
  function normalizeArguments(args) {
    var _Array$prototype$slic = Array.prototype.slice.call(args), _Array$prototype$slic2 = _slicedToArray$2(_Array$prototype$slic, 4), arg_1 = _Array$prototype$slic2[0], arg_2 = _Array$prototype$slic2[1], arg_3 = _Array$prototype$slic2[2], arg_4 = _Array$prototype$slic2[3];
    var text;
    var options;
    var metadata2;
    if (typeof arg_1 === "string") {
      text = arg_1;
    } else throw new TypeError("A text for parsing must be a string.");
    if (!arg_2 || typeof arg_2 === "string") {
      if (arg_4) {
        options = arg_3;
        metadata2 = arg_4;
      } else {
        options = void 0;
        metadata2 = arg_3;
      }
      if (arg_2) {
        options = _objectSpread$1({
          defaultCountry: arg_2
        }, options);
      }
    } else if (isObject(arg_2)) {
      if (arg_3) {
        options = arg_2;
        metadata2 = arg_3;
      } else {
        metadata2 = arg_2;
      }
    } else throw new Error("Invalid second argument: ".concat(arg_2));
    return {
      text,
      options,
      metadata: metadata2
    };
  }
  function _typeof$6(o) {
    "@babel/helpers - typeof";
    return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$6(o);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey$6(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey$6(t) {
    var i = _toPrimitive$6(t, "string");
    return "symbol" == _typeof$6(i) ? i : i + "";
  }
  function _toPrimitive$6(t, r) {
    if ("object" != _typeof$6(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$6(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function parsePhoneNumber$2(text, options, metadata2) {
    if (options && options.defaultCountry && !isSupportedCountry(options.defaultCountry, metadata2)) {
      options = _objectSpread(_objectSpread({}, options), {}, {
        defaultCountry: void 0
      });
    }
    try {
      return parsePhoneNumberWithError(text, options, metadata2);
    } catch (error) {
      if (error instanceof ParseError) ;
      else {
        throw error;
      }
    }
  }
  function parsePhoneNumber$1() {
    var _normalizeArguments = normalizeArguments(arguments), text = _normalizeArguments.text, options = _normalizeArguments.options, metadata2 = _normalizeArguments.metadata;
    return parsePhoneNumber$2(text, options, metadata2);
  }
  function _typeof$5(o) {
    "@babel/helpers - typeof";
    return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$5(o);
  }
  function _classCallCheck$5(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$5(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$5(o.key), o);
    }
  }
  function _createClass$5(e, r, t) {
    return r && _defineProperties$5(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$5(t) {
    var i = _toPrimitive$5(t, "string");
    return "symbol" == _typeof$5(i) ? i : i + "";
  }
  function _toPrimitive$5(t, r) {
    if ("object" != _typeof$5(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$5(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var AsYouTypeState = /* @__PURE__ */ (function() {
    function AsYouTypeState2(_ref) {
      var onCountryChange = _ref.onCountryChange, onCallingCodeChange = _ref.onCallingCodeChange;
      _classCallCheck$5(this, AsYouTypeState2);
      this.onCountryChange = onCountryChange;
      this.onCallingCodeChange = onCallingCodeChange;
    }
    return _createClass$5(AsYouTypeState2, [{
      key: "reset",
      value: function reset(_ref2) {
        var country = _ref2.country, callingCode = _ref2.callingCode;
        this.international = false;
        this.missingPlus = false;
        this.IDDPrefix = void 0;
        this.callingCode = void 0;
        this.digits = "";
        this.resetNationalSignificantNumber();
        this.initCountryAndCallingCode(country, callingCode);
      }
    }, {
      key: "resetNationalSignificantNumber",
      value: function resetNationalSignificantNumber() {
        this.nationalSignificantNumber = this.getNationalDigits();
        this.nationalSignificantNumberIsModified = false;
        this.nationalPrefix = void 0;
        this.carrierCode = void 0;
        this.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix = void 0;
      }
    }, {
      key: "update",
      value: function update(properties) {
        for (var _i = 0, _Object$keys = Object.keys(properties); _i < _Object$keys.length; _i++) {
          var key = _Object$keys[_i];
          this[key] = properties[key];
        }
      }
    }, {
      key: "initCountryAndCallingCode",
      value: function initCountryAndCallingCode(country, callingCode) {
        this.setCountry(country);
        this.setCallingCode(callingCode);
      }
    }, {
      key: "setCountry",
      value: function setCountry(country) {
        this.country = country;
        this.onCountryChange(country);
      }
    }, {
      key: "setCallingCode",
      value: function setCallingCode(callingCode) {
        this.callingCode = callingCode;
        this.onCallingCodeChange(callingCode, this.country);
      }
    }, {
      key: "startInternationalNumber",
      value: function startInternationalNumber(country, callingCode) {
        this.international = true;
        this.initCountryAndCallingCode(country, callingCode);
      }
    }, {
      key: "appendDigits",
      value: function appendDigits(nextDigits) {
        this.digits += nextDigits;
      }
    }, {
      key: "appendNationalSignificantNumberDigits",
      value: function appendNationalSignificantNumberDigits(nextDigits) {
        this.nationalSignificantNumber += nextDigits;
      }
      /**
       * Returns the part of `this.digits` that corresponds to the national number.
       * Basically, all digits that have been input by the user, except for the
       * international prefix and the country calling code part
       * (if the number is an international one).
       * @return {string}
       */
    }, {
      key: "getNationalDigits",
      value: function getNationalDigits() {
        if (this.international) {
          return this.digits.slice((this.IDDPrefix ? this.IDDPrefix.length : 0) + (this.callingCode ? this.callingCode.length : 0));
        }
        return this.digits;
      }
    }, {
      key: "getDigitsWithoutInternationalPrefix",
      value: function getDigitsWithoutInternationalPrefix() {
        if (this.international) {
          if (this.IDDPrefix) {
            return this.digits.slice(this.IDDPrefix.length);
          }
        }
        return this.digits;
      }
    }]);
  })();
  function _createForOfIteratorHelperLoose$2(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$4(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$4(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$4(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$4(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$4(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  var DIGIT_PLACEHOLDER = "x";
  var DIGIT_PLACEHOLDER_MATCHER = new RegExp(DIGIT_PLACEHOLDER);
  function repeat(string, times) {
    if (times < 1) {
      return "";
    }
    var result2 = "";
    while (times > 1) {
      if (times & 1) {
        result2 += string;
      }
      times >>= 1;
      string += string;
    }
    return result2 + string;
  }
  function cutAndStripNonPairedParens(string, cutBeforeIndex) {
    if (string[cutBeforeIndex] === ")") {
      cutBeforeIndex++;
    }
    return stripNonPairedParens(string.slice(0, cutBeforeIndex));
  }
  function stripNonPairedParens(string) {
    var dangling_braces = [];
    var i = 0;
    while (i < string.length) {
      if (string[i] === "(") {
        dangling_braces.push(i);
      } else if (string[i] === ")") {
        dangling_braces.pop();
      }
      i++;
    }
    var start = 0;
    var cleared_string = "";
    dangling_braces.push(string.length);
    for (var _i = 0, _dangling_braces = dangling_braces; _i < _dangling_braces.length; _i++) {
      var index = _dangling_braces[_i];
      cleared_string += string.slice(start, index);
      start = index + 1;
    }
    return cleared_string;
  }
  function populateTemplateWithDigits(template, position, digits) {
    for (var _iterator2 = _createForOfIteratorHelperLoose$2(digits.split("")), _step2; !(_step2 = _iterator2()).done; ) {
      var digit = _step2.value;
      if (template.slice(position + 1).search(DIGIT_PLACEHOLDER_MATCHER) < 0) {
        return;
      }
      position = template.search(DIGIT_PLACEHOLDER_MATCHER);
      template = template.replace(DIGIT_PLACEHOLDER_MATCHER, digit);
    }
    return [template, position];
  }
  function formatCompleteNumber(state, format, _ref) {
    var metadata2 = _ref.metadata, shouldTryNationalPrefixFormattingRule = _ref.shouldTryNationalPrefixFormattingRule, getSeparatorAfterNationalPrefix = _ref.getSeparatorAfterNationalPrefix;
    var matcher = new RegExp("^(?:".concat(format.pattern(), ")$"));
    if (matcher.test(state.nationalSignificantNumber)) {
      return formatNationalNumberWithAndWithoutNationalPrefixFormattingRule(state, format, {
        metadata: metadata2,
        shouldTryNationalPrefixFormattingRule,
        getSeparatorAfterNationalPrefix
      });
    }
  }
  function canFormatCompleteNumber(nationalSignificantNumber, metadata2) {
    return checkNumberLength(nationalSignificantNumber, void 0, metadata2) === "IS_POSSIBLE";
  }
  function formatNationalNumberWithAndWithoutNationalPrefixFormattingRule(state, format, _ref2) {
    var metadata2 = _ref2.metadata, shouldTryNationalPrefixFormattingRule = _ref2.shouldTryNationalPrefixFormattingRule, getSeparatorAfterNationalPrefix = _ref2.getSeparatorAfterNationalPrefix;
    state.nationalSignificantNumber;
    state.international;
    state.nationalPrefix;
    state.carrierCode;
    if (shouldTryNationalPrefixFormattingRule(format)) {
      var formattedNumber = formatNationalNumber(state, format, {
        useNationalPrefixFormattingRule: true,
        getSeparatorAfterNationalPrefix,
        metadata: metadata2
      });
      if (formattedNumber) {
        return formattedNumber;
      }
    }
    return formatNationalNumber(state, format, {
      useNationalPrefixFormattingRule: false,
      getSeparatorAfterNationalPrefix,
      metadata: metadata2
    });
  }
  function formatNationalNumber(state, format, _ref3) {
    var metadata2 = _ref3.metadata, useNationalPrefixFormattingRule = _ref3.useNationalPrefixFormattingRule, getSeparatorAfterNationalPrefix = _ref3.getSeparatorAfterNationalPrefix;
    var formattedNationalNumber = formatNationalNumberUsingFormat(state.nationalSignificantNumber, format, {
      carrierCode: state.carrierCode,
      useInternationalFormat: state.international,
      withNationalPrefix: useNationalPrefixFormattingRule,
      metadata: metadata2
    });
    if (!useNationalPrefixFormattingRule) {
      if (state.nationalPrefix) {
        formattedNationalNumber = state.nationalPrefix + getSeparatorAfterNationalPrefix(format) + formattedNationalNumber;
      } else if (state.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix) {
        formattedNationalNumber = state.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix + " " + formattedNationalNumber;
      }
    }
    if (isValidFormattedNationalNumber(formattedNationalNumber, state)) {
      return formattedNationalNumber;
    }
  }
  function isValidFormattedNationalNumber(formattedNationalNumber, state) {
    return parseDigits(formattedNationalNumber) === state.getNationalDigits();
  }
  function _typeof$4(o) {
    "@babel/helpers - typeof";
    return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$4(o);
  }
  function _classCallCheck$4(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$4(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$4(o.key), o);
    }
  }
  function _createClass$4(e, r, t) {
    return r && _defineProperties$4(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$4(t) {
    var i = _toPrimitive$4(t, "string");
    return "symbol" == _typeof$4(i) ? i : i + "";
  }
  function _toPrimitive$4(t, r) {
    if ("object" != _typeof$4(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$4(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var PatternParser = /* @__PURE__ */ (function() {
    function PatternParser2() {
      _classCallCheck$4(this, PatternParser2);
    }
    return _createClass$4(PatternParser2, [{
      key: "parse",
      value: function parse2(pattern) {
        this.context = [{
          or: true,
          instructions: []
        }];
        this.parsePattern(pattern);
        if (this.context.length !== 1) {
          throw new Error("Non-finalized contexts left when pattern parse ended");
        }
        var _this$context$ = this.context[0], branches = _this$context$.branches, instructions = _this$context$.instructions;
        if (branches) {
          return {
            op: "|",
            args: branches.concat([expandSingleElementArray(instructions)])
          };
        }
        if (instructions.length === 0) {
          throw new Error("Pattern is required");
        }
        if (instructions.length === 1) {
          return instructions[0];
        }
        return instructions;
      }
    }, {
      key: "startContext",
      value: function startContext(context) {
        this.context.push(context);
      }
    }, {
      key: "endContext",
      value: function endContext() {
        this.context.pop();
      }
    }, {
      key: "getContext",
      value: function getContext() {
        return this.context[this.context.length - 1];
      }
    }, {
      key: "parsePattern",
      value: function parsePattern(pattern) {
        if (!pattern) {
          throw new Error("Pattern is required");
        }
        var match = pattern.match(OPERATOR);
        if (!match) {
          if (ILLEGAL_CHARACTER_REGEXP.test(pattern)) {
            throw new Error("Illegal characters found in a pattern: ".concat(pattern));
          }
          this.getContext().instructions = this.getContext().instructions.concat(pattern.split(""));
          return;
        }
        var operator = match[1];
        var before = pattern.slice(0, match.index);
        var rightPart = pattern.slice(match.index + operator.length);
        switch (operator) {
          case "(?:":
            if (before) {
              this.parsePattern(before);
            }
            this.startContext({
              or: true,
              instructions: [],
              branches: []
            });
            break;
          case ")":
            if (!this.getContext().or) {
              throw new Error('")" operator must be preceded by "(?:" operator');
            }
            if (before) {
              this.parsePattern(before);
            }
            if (this.getContext().instructions.length === 0) {
              throw new Error('No instructions found after "|" operator in an "or" group');
            }
            var _this$getContext = this.getContext(), branches = _this$getContext.branches;
            branches.push(expandSingleElementArray(this.getContext().instructions));
            this.endContext();
            this.getContext().instructions.push({
              op: "|",
              args: branches
            });
            break;
          case "|":
            if (!this.getContext().or) {
              throw new Error('"|" operator can only be used inside "or" groups');
            }
            if (before) {
              this.parsePattern(before);
            }
            if (!this.getContext().branches) {
              if (this.context.length === 1) {
                this.getContext().branches = [];
              } else {
                throw new Error('"branches" not found in an "or" group context');
              }
            }
            this.getContext().branches.push(expandSingleElementArray(this.getContext().instructions));
            this.getContext().instructions = [];
            break;
          case "[":
            if (before) {
              this.parsePattern(before);
            }
            this.startContext({
              oneOfSet: true
            });
            break;
          case "]":
            if (!this.getContext().oneOfSet) {
              throw new Error('"]" operator must be preceded by "[" operator');
            }
            this.endContext();
            this.getContext().instructions.push({
              op: "[]",
              args: parseOneOfSet(before)
            });
            break;
          /* istanbul ignore next */
          default:
            throw new Error("Unknown operator: ".concat(operator));
        }
        if (rightPart) {
          this.parsePattern(rightPart);
        }
      }
    }]);
  })();
  function parseOneOfSet(pattern) {
    var values = [];
    var i = 0;
    while (i < pattern.length) {
      if (pattern[i] === "-") {
        if (i === 0 || i === pattern.length - 1) {
          throw new Error("Couldn't parse a one-of set pattern: ".concat(pattern));
        }
        var prevValue = pattern[i - 1].charCodeAt(0) + 1;
        var nextValue = pattern[i + 1].charCodeAt(0) - 1;
        var value = prevValue;
        while (value <= nextValue) {
          values.push(String.fromCharCode(value));
          value++;
        }
      } else {
        values.push(pattern[i]);
      }
      i++;
    }
    return values;
  }
  var ILLEGAL_CHARACTER_REGEXP = /[\(\)\[\]\?\:\|]/;
  var OPERATOR = new RegExp(
    // any of:
    "(\\||\\(\\?\\:|\\)|\\[|\\])"
  );
  function expandSingleElementArray(array) {
    if (array.length === 1) {
      return array[0];
    }
    return array;
  }
  function _createForOfIteratorHelperLoose$1(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$3(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$3(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$3(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$3(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$3(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _typeof$3(o) {
    "@babel/helpers - typeof";
    return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$3(o);
  }
  function _classCallCheck$3(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$3(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$3(o.key), o);
    }
  }
  function _createClass$3(e, r, t) {
    return r && _defineProperties$3(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$3(t) {
    var i = _toPrimitive$3(t, "string");
    return "symbol" == _typeof$3(i) ? i : i + "";
  }
  function _toPrimitive$3(t, r) {
    if ("object" != _typeof$3(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$3(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var PatternMatcher = /* @__PURE__ */ (function() {
    function PatternMatcher2(pattern) {
      _classCallCheck$3(this, PatternMatcher2);
      this.matchTree = new PatternParser().parse(pattern);
    }
    return _createClass$3(PatternMatcher2, [{
      key: "match",
      value: function match(string) {
        var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, allowOverflow = _ref.allowOverflow;
        if (!string) {
          throw new Error("String is required");
        }
        var result2 = _match(string.split(""), this.matchTree, true);
        if (result2 && result2.match) {
          delete result2.matchedChars;
        }
        if (result2 && result2.overflow) {
          if (!allowOverflow) {
            return;
          }
        }
        return result2;
      }
    }]);
  })();
  function _match(characters, tree, last) {
    if (typeof tree === "string") {
      var characterString = characters.join("");
      if (tree.indexOf(characterString) === 0) {
        if (characters.length === tree.length) {
          return {
            match: true,
            matchedChars: characters
          };
        }
        return {
          partialMatch: true
          // matchedChars: characters
        };
      }
      if (characterString.indexOf(tree) === 0) {
        if (last) {
          if (characters.length > tree.length) {
            return {
              overflow: true
            };
          }
        }
        return {
          match: true,
          matchedChars: characters.slice(0, tree.length)
        };
      }
      return;
    }
    if (Array.isArray(tree)) {
      var restCharacters = characters.slice();
      var i = 0;
      while (i < tree.length) {
        var subtree = tree[i];
        var result2 = _match(restCharacters, subtree, last && i === tree.length - 1);
        if (!result2) {
          return;
        } else if (result2.overflow) {
          return result2;
        } else if (result2.match) {
          restCharacters = restCharacters.slice(result2.matchedChars.length);
          if (restCharacters.length === 0) {
            if (i === tree.length - 1) {
              return {
                match: true,
                matchedChars: characters
              };
            } else {
              return {
                partialMatch: true
                // matchedChars: characters
              };
            }
          }
        } else {
          if (result2.partialMatch) {
            return {
              partialMatch: true
              // matchedChars: characters
            };
          } else {
            throw new Error("Unsupported match result:\n".concat(JSON.stringify(result2, null, 2)));
          }
        }
        i++;
      }
      if (last) {
        return {
          overflow: true
        };
      }
      return {
        match: true,
        matchedChars: characters.slice(0, characters.length - restCharacters.length)
      };
    }
    switch (tree.op) {
      case "|":
        var partialMatch;
        for (var _iterator = _createForOfIteratorHelperLoose$1(tree.args), _step; !(_step = _iterator()).done; ) {
          var branch = _step.value;
          var _result = _match(characters, branch, last);
          if (_result) {
            if (_result.overflow) {
              return _result;
            } else if (_result.match) {
              return {
                match: true,
                matchedChars: _result.matchedChars
              };
            } else {
              if (_result.partialMatch) {
                partialMatch = true;
              } else {
                throw new Error("Unsupported match result:\n".concat(JSON.stringify(_result, null, 2)));
              }
            }
          }
        }
        if (partialMatch) {
          return {
            partialMatch: true
            // matchedChars: ...
          };
        }
        return;
      case "[]":
        for (var _iterator2 = _createForOfIteratorHelperLoose$1(tree.args), _step2; !(_step2 = _iterator2()).done; ) {
          var _char = _step2.value;
          if (characters[0] === _char) {
            if (characters.length === 1) {
              return {
                match: true,
                matchedChars: characters
              };
            }
            if (last) {
              return {
                overflow: true
              };
            }
            return {
              match: true,
              matchedChars: [_char]
            };
          }
        }
        return;
      /* istanbul ignore next */
      default:
        throw new Error("Unsupported instruction tree: ".concat(tree));
    }
  }
  function _typeof$2(o) {
    "@babel/helpers - typeof";
    return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$2(o);
  }
  function _createForOfIteratorHelperLoose(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (t) return (t = t.call(r)).next.bind(t);
    if (Array.isArray(r) || (t = _unsupportedIterableToArray$2(r)) || e) {
      t && (r = t);
      var o = 0;
      return function() {
        return o >= r.length ? { done: true } : { done: false, value: r[o++] };
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$2(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$2(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$2(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$2(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _classCallCheck$2(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$2(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$2(o.key), o);
    }
  }
  function _createClass$2(e, r, t) {
    return r && _defineProperties$2(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$2(t) {
    var i = _toPrimitive$2(t, "string");
    return "symbol" == _typeof$2(i) ? i : i + "";
  }
  function _toPrimitive$2(t, r) {
    if ("object" != _typeof$2(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$2(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var DUMMY_DIGIT = "9";
  var LONGEST_NATIONAL_PHONE_NUMBER_LENGTH = 15;
  var LONGEST_DUMMY_PHONE_NUMBER = repeat(DUMMY_DIGIT, LONGEST_NATIONAL_PHONE_NUMBER_LENGTH);
  var NATIONAL_PREFIX_SEPARATORS_PATTERN = /[- ]/;
  var CREATE_CHARACTER_CLASS_PATTERN = function() {
    return /\[([^\[\]])*\]/g;
  };
  var CREATE_STANDALONE_DIGIT_PATTERN = function() {
    return /\d(?=[^,}][^,}])/g;
  };
  var NON_ALTERING_FORMAT_REG_EXP = new RegExp("[" + VALID_PUNCTUATION + "]*\\$1[" + VALID_PUNCTUATION + "]*(\\$\\d[" + VALID_PUNCTUATION + "]*)*$");
  var MIN_LEADING_DIGITS_LENGTH = 3;
  var AsYouTypeFormatter = /* @__PURE__ */ (function() {
    function AsYouTypeFormatter2(_ref) {
      _ref.state;
      var metadata2 = _ref.metadata;
      _classCallCheck$2(this, AsYouTypeFormatter2);
      this.metadata = metadata2;
      this.resetFormat();
    }
    return _createClass$2(AsYouTypeFormatter2, [{
      key: "resetFormat",
      value: function resetFormat() {
        this.chosenFormat = void 0;
        this.template = void 0;
        this.nationalNumberTemplate = void 0;
        this.populatedNationalNumberTemplate = void 0;
        this.populatedNationalNumberTemplatePosition = -1;
      }
    }, {
      key: "reset",
      value: function reset(numberingPlan, state) {
        this.resetFormat();
        if (numberingPlan) {
          this.isNANP = numberingPlan.callingCode() === "1";
          this.matchingFormats = numberingPlan.formats();
          if (state.nationalSignificantNumber) {
            this.narrowDownMatchingFormats(state);
          }
        } else {
          this.isNANP = void 0;
          this.matchingFormats = [];
        }
      }
      /**
       * Formats an updated phone number.
       * @param  {string} nextDigits — Additional phone number digits.
       * @param  {object} state — `AsYouType` state.
       * @return {[string]} Returns undefined if the updated phone number can't be formatted using any of the available formats.
       */
    }, {
      key: "format",
      value: function format(nextDigits, state) {
        var _this = this;
        if (canFormatCompleteNumber(state.nationalSignificantNumber, this.metadata)) {
          for (var _iterator = _createForOfIteratorHelperLoose(this.matchingFormats), _step; !(_step = _iterator()).done; ) {
            var _format = _step.value;
            var formattedCompleteNumber = formatCompleteNumber(state, _format, {
              metadata: this.metadata,
              shouldTryNationalPrefixFormattingRule: function shouldTryNationalPrefixFormattingRule(format2) {
                return _this.shouldTryNationalPrefixFormattingRule(format2, {
                  international: state.international,
                  nationalPrefix: state.nationalPrefix
                });
              },
              getSeparatorAfterNationalPrefix: function getSeparatorAfterNationalPrefix(format2) {
                return _this.getSeparatorAfterNationalPrefix(format2);
              }
            });
            if (formattedCompleteNumber) {
              this.resetFormat();
              this.chosenFormat = _format;
              this.setNationalNumberTemplate(formattedCompleteNumber.replace(/\d/g, DIGIT_PLACEHOLDER), state);
              this.populatedNationalNumberTemplate = formattedCompleteNumber;
              this.populatedNationalNumberTemplatePosition = this.template.lastIndexOf(DIGIT_PLACEHOLDER);
              return formattedCompleteNumber;
            }
          }
        }
        return this.formatNationalNumberWithNextDigits(nextDigits, state);
      }
      // Formats the next phone number digits.
    }, {
      key: "formatNationalNumberWithNextDigits",
      value: function formatNationalNumberWithNextDigits(nextDigits, state) {
        var previouslyChosenFormat = this.chosenFormat;
        var newlyChosenFormat = this.chooseFormat(state);
        if (newlyChosenFormat) {
          if (newlyChosenFormat === previouslyChosenFormat) {
            return this.formatNextNationalNumberDigits(nextDigits);
          } else {
            return this.formatNextNationalNumberDigits(state.getNationalDigits());
          }
        }
      }
    }, {
      key: "narrowDownMatchingFormats",
      value: function narrowDownMatchingFormats(_ref2) {
        var _this2 = this;
        var nationalSignificantNumber = _ref2.nationalSignificantNumber, nationalPrefix = _ref2.nationalPrefix, international = _ref2.international;
        var leadingDigits = nationalSignificantNumber;
        var leadingDigitsPatternIndex = leadingDigits.length - MIN_LEADING_DIGITS_LENGTH;
        if (leadingDigitsPatternIndex < 0) {
          leadingDigitsPatternIndex = 0;
        }
        this.matchingFormats = this.matchingFormats.filter(function(format) {
          return _this2.formatSuits(format, international, nationalPrefix) && _this2.formatMatches(format, leadingDigits, leadingDigitsPatternIndex);
        });
        if (this.chosenFormat && this.matchingFormats.indexOf(this.chosenFormat) === -1) {
          this.resetFormat();
        }
      }
    }, {
      key: "formatSuits",
      value: function formatSuits(format, international, nationalPrefix) {
        if (nationalPrefix && !format.usesNationalPrefix() && // !format.domesticCarrierCodeFormattingRule() &&
        !format.nationalPrefixIsOptionalWhenFormattingInNationalFormat()) {
          return false;
        }
        if (!international && !nationalPrefix && format.nationalPrefixIsMandatoryWhenFormattingInNationalFormat()) {
          return false;
        }
        return true;
      }
    }, {
      key: "formatMatches",
      value: function formatMatches(format, leadingDigits, leadingDigitsPatternIndex) {
        var leadingDigitsPatternsCount = format.leadingDigitsPatterns().length;
        if (leadingDigitsPatternsCount === 0) {
          return true;
        }
        leadingDigitsPatternIndex = Math.min(leadingDigitsPatternIndex, leadingDigitsPatternsCount - 1);
        var leadingDigitsPattern = format.leadingDigitsPatterns()[leadingDigitsPatternIndex];
        if (leadingDigits.length < MIN_LEADING_DIGITS_LENGTH) {
          try {
            return new PatternMatcher(leadingDigitsPattern).match(leadingDigits, {
              allowOverflow: true
            }) !== void 0;
          } catch (error) {
            console.error(error);
            return true;
          }
        }
        return new RegExp("^(".concat(leadingDigitsPattern, ")")).test(leadingDigits);
      }
    }, {
      key: "getFormatFormat",
      value: function getFormatFormat(format, international) {
        return international ? format.internationalFormat() : format.format();
      }
    }, {
      key: "chooseFormat",
      value: function chooseFormat(state) {
        var _this3 = this;
        var _loop = function _loop2() {
          var format = _step2.value;
          if (_this3.chosenFormat === format) {
            return 0;
          }
          if (!NON_ALTERING_FORMAT_REG_EXP.test(_this3.getFormatFormat(format, state.international))) {
            return 1;
          }
          if (!_this3.createTemplateForFormat(format, state)) {
            _this3.matchingFormats = _this3.matchingFormats.filter(function(_) {
              return _ !== format;
            });
            return 1;
          }
          _this3.chosenFormat = format;
          return 0;
        }, _ret;
        for (var _iterator2 = _createForOfIteratorHelperLoose(this.matchingFormats.slice()), _step2; !(_step2 = _iterator2()).done; ) {
          _ret = _loop();
          if (_ret === 0) break;
          if (_ret === 1) continue;
        }
        if (!this.chosenFormat) {
          this.resetFormat();
        }
        return this.chosenFormat;
      }
    }, {
      key: "createTemplateForFormat",
      value: function createTemplateForFormat(format, state) {
        if (format.pattern().indexOf("|") >= 0) {
          return;
        }
        var template = this.getTemplateForFormat(format, state);
        if (template) {
          this.setNationalNumberTemplate(template, state);
          return true;
        }
      }
    }, {
      key: "getSeparatorAfterNationalPrefix",
      value: function getSeparatorAfterNationalPrefix(format) {
        if (this.isNANP) {
          return " ";
        }
        if (format && format.nationalPrefixFormattingRule() && NATIONAL_PREFIX_SEPARATORS_PATTERN.test(format.nationalPrefixFormattingRule())) {
          return " ";
        }
        return "";
      }
    }, {
      key: "getInternationalPrefixBeforeCountryCallingCode",
      value: function getInternationalPrefixBeforeCountryCallingCode(_ref3, options) {
        var IDDPrefix = _ref3.IDDPrefix, missingPlus = _ref3.missingPlus;
        if (IDDPrefix) {
          return options && options.spacing === false ? IDDPrefix : IDDPrefix + " ";
        }
        if (missingPlus) {
          return "";
        }
        return "+";
      }
    }, {
      key: "getTemplate",
      value: function getTemplate(state) {
        if (!this.template) {
          return;
        }
        var index = -1;
        var i = 0;
        var internationalPrefix = state.international ? this.getInternationalPrefixBeforeCountryCallingCode(state, {
          spacing: false
        }) : "";
        while (i < internationalPrefix.length + state.getDigitsWithoutInternationalPrefix().length) {
          index = this.template.indexOf(DIGIT_PLACEHOLDER, index + 1);
          i++;
        }
        return cutAndStripNonPairedParens(this.template, index + 1);
      }
    }, {
      key: "setNationalNumberTemplate",
      value: function setNationalNumberTemplate(template, state) {
        this.nationalNumberTemplate = template;
        this.populatedNationalNumberTemplate = template;
        this.populatedNationalNumberTemplatePosition = -1;
        if (state.international) {
          this.template = this.getInternationalPrefixBeforeCountryCallingCode(state).replace(/[\d\+]/g, DIGIT_PLACEHOLDER) + repeat(DIGIT_PLACEHOLDER, state.callingCode.length) + " " + template;
        } else {
          this.template = template;
        }
      }
      /**
       * Generates formatting template for a national phone number,
       * optionally containing a national prefix, for a format.
       * @param  {Format} format
       * @param  {string} nationalPrefix
       * @return {string}
       */
    }, {
      key: "getTemplateForFormat",
      value: function getTemplateForFormat(format, _ref4) {
        var nationalSignificantNumber = _ref4.nationalSignificantNumber, international = _ref4.international, nationalPrefix = _ref4.nationalPrefix, prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix = _ref4.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix;
        var pattern = format.pattern();
        {
          pattern = pattern.replace(CREATE_CHARACTER_CLASS_PATTERN(), "\\d").replace(CREATE_STANDALONE_DIGIT_PATTERN(), "\\d");
        }
        var digits = LONGEST_DUMMY_PHONE_NUMBER.match(pattern)[0];
        if (nationalSignificantNumber.length > digits.length) {
          return;
        }
        var strictPattern = new RegExp("^" + pattern + "$");
        var nationalNumberDummyDigits = nationalSignificantNumber.replace(/\d/g, DUMMY_DIGIT);
        if (strictPattern.test(nationalNumberDummyDigits)) {
          digits = nationalNumberDummyDigits;
        }
        var numberFormat = this.getFormatFormat(format, international);
        var nationalPrefixIncludedInTemplate;
        if (this.shouldTryNationalPrefixFormattingRule(format, {
          international,
          nationalPrefix
        })) {
          var numberFormatWithNationalPrefix = numberFormat.replace(FIRST_GROUP_PATTERN, format.nationalPrefixFormattingRule());
          if (parseDigits(format.nationalPrefixFormattingRule()) === (nationalPrefix || "") + parseDigits("$1")) {
            numberFormat = numberFormatWithNationalPrefix;
            nationalPrefixIncludedInTemplate = true;
            if (nationalPrefix) {
              var i = nationalPrefix.length;
              while (i > 0) {
                numberFormat = numberFormat.replace(/\d/, DIGIT_PLACEHOLDER);
                i--;
              }
            }
          }
        }
        var template = digits.replace(new RegExp(pattern), numberFormat).replace(new RegExp(DUMMY_DIGIT, "g"), DIGIT_PLACEHOLDER);
        if (!nationalPrefixIncludedInTemplate) {
          if (prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix) {
            template = repeat(DIGIT_PLACEHOLDER, prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix.length) + " " + template;
          } else if (nationalPrefix) {
            template = repeat(DIGIT_PLACEHOLDER, nationalPrefix.length) + this.getSeparatorAfterNationalPrefix(format) + template;
          }
        }
        if (international) {
          template = applyInternationalSeparatorStyle(template);
        }
        return template;
      }
    }, {
      key: "formatNextNationalNumberDigits",
      value: function formatNextNationalNumberDigits(digits) {
        var result2 = populateTemplateWithDigits(this.populatedNationalNumberTemplate, this.populatedNationalNumberTemplatePosition, digits);
        if (!result2) {
          this.resetFormat();
          return;
        }
        this.populatedNationalNumberTemplate = result2[0];
        this.populatedNationalNumberTemplatePosition = result2[1];
        return cutAndStripNonPairedParens(this.populatedNationalNumberTemplate, this.populatedNationalNumberTemplatePosition + 1);
      }
    }, {
      key: "shouldTryNationalPrefixFormattingRule",
      value: function shouldTryNationalPrefixFormattingRule(format, _ref5) {
        var international = _ref5.international, nationalPrefix = _ref5.nationalPrefix;
        if (format.nationalPrefixFormattingRule()) {
          var usesNationalPrefix = format.usesNationalPrefix();
          if (usesNationalPrefix && nationalPrefix || !usesNationalPrefix && !international) {
            return true;
          }
        }
      }
    }]);
  })();
  function _typeof$1(o) {
    "@babel/helpers - typeof";
    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof$1(o);
  }
  function _slicedToArray$1(r, e) {
    return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest$1();
  }
  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$1(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
    }
  }
  function _arrayLikeToArray$1(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _iterableToArrayLimit$1(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ;
        else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles$1(r) {
    if (Array.isArray(r)) return r;
  }
  function _classCallCheck$1(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties$1(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$1(o.key), o);
    }
  }
  function _createClass$1(e, r, t) {
    return r && _defineProperties$1(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey$1(t) {
    var i = _toPrimitive$1(t, "string");
    return "symbol" == _typeof$1(i) ? i : i + "";
  }
  function _toPrimitive$1(t, r) {
    if ("object" != _typeof$1(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof$1(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var VALID_FORMATTED_PHONE_NUMBER_DIGITS_PART = "[" + VALID_PUNCTUATION + VALID_DIGITS + "]+";
  var VALID_FORMATTED_PHONE_NUMBER_DIGITS_PART_PATTERN = new RegExp("^" + VALID_FORMATTED_PHONE_NUMBER_DIGITS_PART + "$", "i");
  var VALID_FORMATTED_PHONE_NUMBER_PART = "(?:[" + PLUS_CHARS + "][" + VALID_PUNCTUATION + VALID_DIGITS + "]*|[" + VALID_PUNCTUATION + VALID_DIGITS + "]+)";
  var AFTER_PHONE_NUMBER_DIGITS_END_PATTERN = new RegExp("[^" + VALID_PUNCTUATION + VALID_DIGITS + "]+.*$");
  var COMPLEX_NATIONAL_PREFIX = /[^\d\[\]]/;
  var AsYouTypeParser = /* @__PURE__ */ (function() {
    function AsYouTypeParser2(_ref) {
      var defaultCountry = _ref.defaultCountry, defaultCallingCode = _ref.defaultCallingCode, metadata2 = _ref.metadata, onNationalSignificantNumberChange = _ref.onNationalSignificantNumberChange;
      _classCallCheck$1(this, AsYouTypeParser2);
      this.defaultCountry = defaultCountry;
      this.defaultCallingCode = defaultCallingCode;
      this.metadata = metadata2;
      this.onNationalSignificantNumberChange = onNationalSignificantNumberChange;
    }
    return _createClass$1(AsYouTypeParser2, [{
      key: "input",
      value: function input(text, state) {
        var _extractFormattedDigi = extractFormattedDigitsAndPlus(text), _extractFormattedDigi2 = _slicedToArray$1(_extractFormattedDigi, 2), formattedDigits = _extractFormattedDigi2[0], hasPlus = _extractFormattedDigi2[1];
        var digits = parseDigits(formattedDigits);
        var justLeadingPlus;
        if (hasPlus) {
          if (!state.digits) {
            state.startInternationalNumber(void 0, void 0);
            if (!digits) {
              justLeadingPlus = true;
            }
          }
        }
        if (digits) {
          this.inputDigits(digits, state);
        }
        return {
          digits,
          justLeadingPlus
        };
      }
      /**
       * Inputs "next" phone number digits.
       * @param  {string} digits
       * @return {string} [formattedNumber] Formatted national phone number (if it can be formatted at this stage). Returning `undefined` means "don't format the national phone number at this stage".
       */
    }, {
      key: "inputDigits",
      value: function inputDigits(nextDigits, state) {
        var digits = state.digits;
        var hasReceivedThreeLeadingDigits = digits.length < 3 && digits.length + nextDigits.length >= 3;
        state.appendDigits(nextDigits);
        if (hasReceivedThreeLeadingDigits) {
          this.extractIddPrefix(state);
        }
        if (this.isWaitingForCountryCallingCode(state)) {
          if (!this.extractCountryCallingCode(state)) {
            return;
          }
        } else {
          state.appendNationalSignificantNumberDigits(nextDigits);
        }
        if (!state.international) {
          if (!this.hasExtractedNationalSignificantNumber) {
            this.extractNationalSignificantNumber(state.getNationalDigits(), function(stateUpdate) {
              return state.update(stateUpdate);
            });
          }
        }
      }
    }, {
      key: "isWaitingForCountryCallingCode",
      value: function isWaitingForCountryCallingCode(_ref2) {
        var international = _ref2.international, callingCode = _ref2.callingCode;
        return international && !callingCode;
      }
      // Extracts a country calling code from a number
      // being entered in internatonal format.
    }, {
      key: "extractCountryCallingCode",
      value: function extractCountryCallingCode$1(state) {
        var _extractCountryCallin = extractCountryCallingCode("+" + state.getDigitsWithoutInternationalPrefix(), state.country, this.defaultCountry, this.defaultCallingCode, this.metadata.metadata), countryCallingCode = _extractCountryCallin.countryCallingCode, number = _extractCountryCallin.number;
        if (countryCallingCode) {
          state.setCallingCode(countryCallingCode);
          state.update({
            nationalSignificantNumber: number
          });
          return true;
        }
      }
    }, {
      key: "reset",
      value: function reset(numberingPlan) {
        if (numberingPlan) {
          this.hasSelectedNumberingPlan = true;
          var nationalPrefixForParsing = numberingPlan._nationalPrefixForParsing();
          this.couldPossiblyExtractAnotherNationalSignificantNumber = nationalPrefixForParsing && COMPLEX_NATIONAL_PREFIX.test(nationalPrefixForParsing);
        } else {
          this.hasSelectedNumberingPlan = void 0;
          this.couldPossiblyExtractAnotherNationalSignificantNumber = void 0;
        }
      }
      /**
       * Extracts a national (significant) number from user input.
       * Google's library is different in that it only applies `national_prefix_for_parsing`
       * and doesn't apply `national_prefix_transform_rule` after that.
       * https://github.com/google/libphonenumber/blob/a3d70b0487875475e6ad659af404943211d26456/java/libphonenumber/src/com/google/i18n/phonenumbers/AsYouTypeFormatter.java#L539
       * @return {boolean} [extracted]
       */
    }, {
      key: "extractNationalSignificantNumber",
      value: function extractNationalSignificantNumber(nationalDigits, setState) {
        if (!this.hasSelectedNumberingPlan) {
          return;
        }
        var _extractNationalNumbe = extractNationalNumberFromPossiblyIncompleteNumber(nationalDigits, this.metadata), nationalPrefix = _extractNationalNumbe.nationalPrefix, nationalNumber = _extractNationalNumbe.nationalNumber, carrierCode = _extractNationalNumbe.carrierCode;
        if (nationalNumber === nationalDigits) {
          return;
        }
        this.onExtractedNationalNumber(nationalPrefix, carrierCode, nationalNumber, nationalDigits, setState);
        return true;
      }
      /**
       * In Google's code this function is called "attempt to extract longer NDD".
       * "Some national prefixes are a substring of others", they say.
       * @return {boolean} [result] — Returns `true` if extracting a national prefix produced different results from what they were.
       */
    }, {
      key: "extractAnotherNationalSignificantNumber",
      value: function extractAnotherNationalSignificantNumber(nationalDigits, prevNationalSignificantNumber, setState) {
        if (!this.hasExtractedNationalSignificantNumber) {
          return this.extractNationalSignificantNumber(nationalDigits, setState);
        }
        if (!this.couldPossiblyExtractAnotherNationalSignificantNumber) {
          return;
        }
        var _extractNationalNumbe2 = extractNationalNumberFromPossiblyIncompleteNumber(nationalDigits, this.metadata), nationalPrefix = _extractNationalNumbe2.nationalPrefix, nationalNumber = _extractNationalNumbe2.nationalNumber, carrierCode = _extractNationalNumbe2.carrierCode;
        if (nationalNumber === prevNationalSignificantNumber) {
          return;
        }
        this.onExtractedNationalNumber(nationalPrefix, carrierCode, nationalNumber, nationalDigits, setState);
        return true;
      }
    }, {
      key: "onExtractedNationalNumber",
      value: function onExtractedNationalNumber(nationalPrefix, carrierCode, nationalSignificantNumber, nationalDigits, setState) {
        var nationalSignificantNumberIsModified = false;
        var prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix;
        var nationalSignificantNumberIndex = nationalDigits.lastIndexOf(nationalSignificantNumber);
        if (nationalSignificantNumberIndex < 0 || nationalSignificantNumberIndex !== nationalDigits.length - nationalSignificantNumber.length) {
          nationalSignificantNumberIsModified = true;
        } else {
          var prefixBeforeNationalNumber = nationalDigits.slice(0, nationalSignificantNumberIndex);
          if (prefixBeforeNationalNumber) {
            if (prefixBeforeNationalNumber !== nationalPrefix) {
              prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix = prefixBeforeNationalNumber;
            }
          }
        }
        setState({
          nationalPrefix,
          carrierCode,
          nationalSignificantNumber,
          nationalSignificantNumberIsModified,
          prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix
        });
        this.hasExtractedNationalSignificantNumber = true;
        this.onNationalSignificantNumberChange();
      }
    }, {
      key: "reExtractNationalSignificantNumber",
      value: function reExtractNationalSignificantNumber(state) {
        if (this.extractAnotherNationalSignificantNumber(state.getNationalDigits(), state.nationalSignificantNumber, function(stateUpdate) {
          return state.update(stateUpdate);
        })) {
          return true;
        }
        if (this.extractIddPrefix(state)) {
          this.extractCallingCodeAndNationalSignificantNumber(state);
          return true;
        }
        if (this.fixMissingPlus(state)) {
          this.extractCallingCodeAndNationalSignificantNumber(state);
          return true;
        }
      }
    }, {
      key: "extractIddPrefix",
      value: function extractIddPrefix(state) {
        var international = state.international, IDDPrefix = state.IDDPrefix, digits = state.digits;
        state.nationalSignificantNumber;
        if (international || IDDPrefix) {
          return;
        }
        var numberWithoutIDD = stripIddPrefix(digits, this.defaultCountry, this.defaultCallingCode, this.metadata.metadata);
        if (numberWithoutIDD !== void 0 && numberWithoutIDD !== digits) {
          state.update({
            IDDPrefix: digits.slice(0, digits.length - numberWithoutIDD.length)
          });
          this.startInternationalNumber(state, {
            country: void 0,
            callingCode: void 0
          });
          return true;
        }
      }
    }, {
      key: "fixMissingPlus",
      value: function fixMissingPlus(state) {
        if (!state.international) {
          var _extractCountryCallin2 = extractCountryCallingCodeFromInternationalNumberWithoutPlusSign(state.digits, state.country, this.defaultCountry, this.defaultCallingCode, this.metadata.metadata), newCallingCode = _extractCountryCallin2.countryCallingCode;
          if (newCallingCode) {
            state.update({
              missingPlus: true
            });
            this.startInternationalNumber(state, {
              country: state.country,
              callingCode: newCallingCode
            });
            return true;
          }
        }
      }
    }, {
      key: "startInternationalNumber",
      value: function startInternationalNumber(state, _ref3) {
        var country = _ref3.country, callingCode = _ref3.callingCode;
        state.startInternationalNumber(country, callingCode);
        if (state.nationalSignificantNumber) {
          state.resetNationalSignificantNumber();
          this.onNationalSignificantNumberChange();
          this.hasExtractedNationalSignificantNumber = void 0;
        }
      }
    }, {
      key: "extractCallingCodeAndNationalSignificantNumber",
      value: function extractCallingCodeAndNationalSignificantNumber(state) {
        if (this.extractCountryCallingCode(state)) {
          this.extractNationalSignificantNumber(state.getNationalDigits(), function(stateUpdate) {
            return state.update(stateUpdate);
          });
        }
      }
    }]);
  })();
  function extractFormattedPhoneNumber(text) {
    var startsAt = text.search(VALID_FORMATTED_PHONE_NUMBER_PART);
    if (startsAt < 0) {
      return;
    }
    text = text.slice(startsAt);
    var hasPlus;
    if (text[0] === "+") {
      hasPlus = true;
      text = text.slice("+".length);
    }
    text = text.replace(AFTER_PHONE_NUMBER_DIGITS_END_PATTERN, "");
    if (hasPlus) {
      text = "+" + text;
    }
    return text;
  }
  function _extractFormattedDigitsAndPlus(text) {
    var extractedNumber = extractFormattedPhoneNumber(text) || "";
    if (extractedNumber[0] === "+") {
      return [extractedNumber.slice("+".length), true];
    }
    return [extractedNumber];
  }
  function extractFormattedDigitsAndPlus(text) {
    var _extractFormattedDigi3 = _extractFormattedDigitsAndPlus(text), _extractFormattedDigi4 = _slicedToArray$1(_extractFormattedDigi3, 2), formattedDigits = _extractFormattedDigi4[0], hasPlus = _extractFormattedDigi4[1];
    if (!VALID_FORMATTED_PHONE_NUMBER_DIGITS_PART_PATTERN.test(formattedDigits)) {
      formattedDigits = "";
    }
    return [formattedDigits, hasPlus];
  }
  function _typeof(o) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
      return typeof o2;
    } : function(o2) {
      return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
    }, _typeof(o);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e, n, i, u, a = [], f = true, o = false;
      try {
        if (i = (t = t.call(r)).next, 0 === l) ;
        else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) ;
      } catch (r2) {
        o = true, n = r2;
      } finally {
        try {
          if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), Object.defineProperty(e, "prototype", { writable: false }), e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == _typeof(i) ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != _typeof(t) || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != _typeof(i)) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return String(t);
  }
  var AsYouType$1 = /* @__PURE__ */ (function() {
    function AsYouType2(optionsOrDefaultCountry, metadata2) {
      _classCallCheck(this, AsYouType2);
      this.metadata = new Metadata(metadata2);
      var _this$getCountryAndCa = this.getCountryAndCallingCode(optionsOrDefaultCountry), _this$getCountryAndCa2 = _slicedToArray(_this$getCountryAndCa, 2), defaultCountry = _this$getCountryAndCa2[0], defaultCallingCode = _this$getCountryAndCa2[1];
      this.defaultCountry = defaultCountry;
      this.defaultCallingCode = defaultCallingCode;
      this.reset();
    }
    return _createClass(AsYouType2, [{
      key: "getCountryAndCallingCode",
      value: function getCountryAndCallingCode(optionsOrDefaultCountry) {
        var defaultCountry;
        var defaultCallingCode;
        if (optionsOrDefaultCountry) {
          if (isObject(optionsOrDefaultCountry)) {
            defaultCountry = optionsOrDefaultCountry.defaultCountry;
            defaultCallingCode = optionsOrDefaultCountry.defaultCallingCode;
          } else {
            defaultCountry = optionsOrDefaultCountry;
          }
        }
        if (defaultCountry && !this.metadata.hasCountry(defaultCountry)) {
          defaultCountry = void 0;
        }
        return [defaultCountry, defaultCallingCode];
      }
      /**
       * Inputs "next" phone number characters.
       * @param  {string} text
       * @return {string} Formatted phone number characters that have been input so far.
       */
    }, {
      key: "input",
      value: function input(text) {
        var _this$parser$input = this.parser.input(text, this.state), digits = _this$parser$input.digits, justLeadingPlus = _this$parser$input.justLeadingPlus;
        if (justLeadingPlus) {
          this.formattedOutput = "+";
        } else if (digits) {
          this.determineTheCountryIfNeeded();
          if (this.state.nationalSignificantNumber) {
            this.formatter.narrowDownMatchingFormats(this.state);
          }
          var formattedNationalNumber;
          if (this.metadata.hasSelectedNumberingPlan()) {
            formattedNationalNumber = this.formatter.format(digits, this.state);
          }
          if (formattedNationalNumber === void 0) {
            if (this.parser.reExtractNationalSignificantNumber(this.state)) {
              this.determineTheCountryIfNeeded();
              var nationalDigits = this.state.getNationalDigits();
              if (nationalDigits) {
                formattedNationalNumber = this.formatter.format(nationalDigits, this.state);
              }
            }
          }
          this.formattedOutput = formattedNationalNumber ? this.getFullNumber(formattedNationalNumber) : this.getNonFormattedNumber();
        }
        return this.formattedOutput;
      }
    }, {
      key: "reset",
      value: function reset() {
        var _this = this;
        this.state = new AsYouTypeState({
          onCountryChange: function onCountryChange(country) {
            _this.country = country;
          },
          onCallingCodeChange: function onCallingCodeChange(callingCode, country) {
            _this.metadata.selectNumberingPlan(country || callingCode);
            _this.formatter.reset(_this.metadata.numberingPlan, _this.state);
            _this.parser.reset(_this.metadata.numberingPlan);
          }
        });
        this.formatter = new AsYouTypeFormatter({
          state: this.state,
          metadata: this.metadata
        });
        this.parser = new AsYouTypeParser({
          defaultCountry: this.defaultCountry,
          defaultCallingCode: this.defaultCallingCode,
          metadata: this.metadata,
          state: this.state,
          onNationalSignificantNumberChange: function onNationalSignificantNumberChange() {
            _this.determineTheCountryIfNeeded();
            _this.formatter.reset(_this.metadata.numberingPlan, _this.state);
          }
        });
        this.state.reset({
          country: this.defaultCountry,
          callingCode: this.defaultCallingCode
        });
        this.formattedOutput = "";
        return this;
      }
      /**
       * Returns `true` if the phone number is being input in international format.
       * In other words, returns `true` if and only if the parsed phone number starts with a `"+"`.
       * @return {boolean}
       */
    }, {
      key: "isInternational",
      value: function isInternational() {
        return this.state.international;
      }
      /**
       * Returns the "calling code" part of the phone number when it's being input
       * in an international format.
       * If no valid calling code has been entered so far, returns `undefined`.
       * @return {string} [callingCode]
       */
    }, {
      key: "getCallingCode",
      value: function getCallingCode() {
        if (this.isInternational()) {
          return this.state.callingCode;
        }
      }
      // A legacy alias.
    }, {
      key: "getCountryCallingCode",
      value: function getCountryCallingCode2() {
        return this.getCallingCode();
      }
      /**
       * Returns a two-letter country code of the phone number.
       * Returns `undefined` for "non-geographic" phone numbering plans.
       * Returns `undefined` if no phone number has been input yet.
       * @return {string} [country]
       */
    }, {
      key: "getCountry",
      value: function getCountry() {
        var digits = this.state.digits;
        if (digits) {
          return this._getCountry();
        }
      }
      /**
       * Returns a two-letter country code of the phone number.
       * Returns `undefined` for "non-geographic" phone numbering plans.
       * @return {string} [country]
       */
    }, {
      key: "_getCountry",
      value: function _getCountry() {
        var country = this.state.country;
        return country;
      }
    }, {
      key: "determineTheCountryIfNeeded",
      value: function determineTheCountryIfNeeded() {
        if (!this.state.country || this.isCountryCallingCodeAmbiguous()) {
          this.determineTheCountry();
        }
      }
      // Prepends `+CountryCode ` in case of an international phone number
    }, {
      key: "getFullNumber",
      value: function getFullNumber(formattedNationalNumber) {
        var _this2 = this;
        if (this.isInternational()) {
          var prefix = function prefix2(text) {
            return _this2.formatter.getInternationalPrefixBeforeCountryCallingCode(_this2.state, {
              spacing: text ? true : false
            }) + text;
          };
          var callingCode = this.state.callingCode;
          if (!callingCode) {
            return prefix("".concat(this.state.getDigitsWithoutInternationalPrefix()));
          }
          if (!formattedNationalNumber) {
            return prefix(callingCode);
          }
          return prefix("".concat(callingCode, " ").concat(formattedNationalNumber));
        }
        return formattedNationalNumber;
      }
    }, {
      key: "getNonFormattedNationalNumberWithPrefix",
      value: function getNonFormattedNationalNumberWithPrefix() {
        var _this$state = this.state, nationalSignificantNumber = _this$state.nationalSignificantNumber, prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix = _this$state.prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix, nationalPrefix = _this$state.nationalPrefix;
        var number = nationalSignificantNumber;
        var prefix = prefixBeforeNationalSignificantNumberThatIsNotNationalPrefix || nationalPrefix;
        if (prefix) {
          number = prefix + number;
        }
        return number;
      }
    }, {
      key: "getNonFormattedNumber",
      value: function getNonFormattedNumber() {
        var nationalSignificantNumberIsModified = this.state.nationalSignificantNumberIsModified;
        return this.getFullNumber(nationalSignificantNumberIsModified ? this.state.getNationalDigits() : this.getNonFormattedNationalNumberWithPrefix());
      }
    }, {
      key: "getNonFormattedTemplate",
      value: function getNonFormattedTemplate() {
        var number = this.getNonFormattedNumber();
        if (number) {
          return number.replace(/[\+\d]/g, DIGIT_PLACEHOLDER);
        }
      }
    }, {
      key: "isCountryCallingCodeAmbiguous",
      value: function isCountryCallingCodeAmbiguous() {
        var callingCode = this.state.callingCode;
        var countryCodes = this.metadata.getCountryCodesForCallingCode(callingCode);
        return countryCodes && countryCodes.length > 1;
      }
      // Determines the exact country of the phone number
      // entered so far based on the country phone code
      // and the national phone number.
    }, {
      key: "determineTheCountry",
      value: function determineTheCountry() {
        var country = getCountryByCallingCode(this.isInternational() ? this.state.callingCode : this.defaultCallingCode, {
          nationalNumber: this.state.nationalSignificantNumber,
          metadata: this.metadata
        });
        if (country !== this.state.country) {
          this.state.setCountry(country);
          if (country) {
            this.metadata.selectNumberingPlan(country);
          }
        }
      }
      /**
       * Returns a E.164 phone number value for the user's input.
       *
       * For example, for country `"US"` and input `"(222) 333-4444"`
       * it will return `"+12223334444"`.
       *
       * For international phone number input, it will also auto-correct
       * some minor errors such as using a national prefix when writing
       * an international phone number. For example, if the user inputs
       * `"+44 0 7400 000000"` then it will return an auto-corrected
       * `"+447400000000"` phone number value.
       *
       * Will return `undefined` if no digits have been input,
       * or when inputting a phone number in national format and no
       * default country or default "country calling code" have been set.
       *
       * @return {string} [value]
       */
    }, {
      key: "getNumberValue",
      value: function getNumberValue() {
        var _this$state2 = this.state, digits = _this$state2.digits, callingCode = _this$state2.callingCode, country = _this$state2.country, nationalSignificantNumber = _this$state2.nationalSignificantNumber;
        if (!digits) {
          return;
        }
        if (this.isInternational()) {
          if (callingCode) {
            return "+" + callingCode + nationalSignificantNumber;
          } else {
            return "+" + digits;
          }
        } else {
          if (country || callingCode) {
            var callingCode_ = country ? this.metadata.countryCallingCode() : callingCode;
            return "+" + callingCode_ + nationalSignificantNumber;
          }
        }
      }
      /**
       * Returns an instance of `PhoneNumber` class.
       * Will return `undefined` if no national (significant) number
       * digits have been entered so far, or if no `defaultCountry` has been
       * set and the user enters a phone number not in international format.
       */
    }, {
      key: "getNumber",
      value: function getNumber() {
        var _this$state3 = this.state, nationalSignificantNumber = _this$state3.nationalSignificantNumber, carrierCode = _this$state3.carrierCode, callingCode = _this$state3.callingCode;
        if (!nationalSignificantNumber) {
          return;
        }
        var country = this._getCountry();
        if (!country && !callingCode) {
          return;
        }
        if (country) {
          if (country === this.defaultCountry) {
            var countryCallingCode = this.metadata.numberingPlan.callingCode();
            var exactCountry = getExactCountryForMultiCountryCallingCode(countryCallingCode, nationalSignificantNumber, this.metadata);
            if (exactCountry) {
              country = exactCountry;
            }
          }
        }
        var phoneNumber = new PhoneNumber(country || callingCode, nationalSignificantNumber, this.metadata.metadata);
        if (carrierCode) {
          phoneNumber.carrierCode = carrierCode;
        }
        return phoneNumber;
      }
      /**
       * Returns `true` if the phone number is "possible".
       * Is just a shortcut for `PhoneNumber.isPossible()`.
       * @return {boolean}
       */
    }, {
      key: "isPossible",
      value: function isPossible() {
        var phoneNumber = this.getNumber();
        if (!phoneNumber) {
          return false;
        }
        return phoneNumber.isPossible();
      }
      /**
       * Returns `true` if the phone number is "valid".
       * Is just a shortcut for `PhoneNumber.isValid()`.
       * @return {boolean}
       */
    }, {
      key: "isValid",
      value: function isValid() {
        var phoneNumber = this.getNumber();
        if (!phoneNumber) {
          return false;
        }
        return phoneNumber.isValid();
      }
      /**
       * Checks if the phone number length is valid.
       * If it is, nothing is returned.
       * Otherwise, a rejection reason is returned.
       * @return {string?}
       */
    }, {
      key: "validateLength",
      value: function validateLength() {
        var _this$state4 = this.state, digits = _this$state4.digits, nationalSignificantNumber = _this$state4.nationalSignificantNumber;
        if (!digits) {
          return "NOT_A_NUMBER";
        }
        if (!this.metadata.numberingPlan) {
          return "INVALID_COUNTRY";
        }
        if (!nationalSignificantNumber) {
          return "TOO_SHORT";
        }
        var result2 = checkNumberLength(nationalSignificantNumber, void 0, this.metadata);
        if (result2 !== "IS_POSSIBLE") {
          return result2;
        }
      }
      /**
       * @deprecated
       * This method is used in `react-phone-number-input/source/input-control.js`
       * in versions before `3.0.16`.
       */
    }, {
      key: "getNationalNumber",
      value: function getNationalNumber() {
        return this.state.nationalSignificantNumber;
      }
      /**
       * Returns the phone number characters entered by the user.
       * @return {string}
       */
    }, {
      key: "getChars",
      value: function getChars() {
        return (this.state.international ? "+" : "") + this.state.digits;
      }
      /**
       * Returns the template for the formatted phone number.
       * @return {string}
       */
    }, {
      key: "getTemplate",
      value: function getTemplate() {
        return this.formatter.getTemplate(this.state) || this.getNonFormattedTemplate() || "";
      }
    }]);
  })();
  function getExactCountryForMultiCountryCallingCode(callingCode, nationalSignificantNumber, metadata2) {
    var ambiguousCountries = metadata2.getCountryCodesForCallingCode(callingCode);
    if (ambiguousCountries.length > 1) {
      return getCountryByNationalNumber(nationalSignificantNumber, ambiguousCountries, metadata2.metadata);
    }
  }
  function getCountries$1(metadata2) {
    return new Metadata(metadata2).getCountries();
  }
  function parsePhoneNumber() {
    return withMetadataArgument(parsePhoneNumber$1, arguments);
  }
  function AsYouType(country) {
    return AsYouType$1.call(this, country, metadata);
  }
  AsYouType.prototype = Object.create(AsYouType$1.prototype, {});
  AsYouType.prototype.constructor = AsYouType;
  function getCountries() {
    return withMetadataArgument(getCountries$1, arguments);
  }
  function getCountryCallingCode() {
    return withMetadataArgument(getCountryCallingCode$1, arguments);
  }
  function normalizeContactPhone(value, country) {
    const text = value.trim().replace(/^00/, "+");
    const phone = parsePhoneNumber(text, { defaultCountry: country, extract: false });
    if (!phone || !phone.isValid() || phone.ext || !phone.country || phone.country !== country) return null;
    return phone;
  }
  function detectPhoneCountry(value) {
    const text = value.trim().replace(/^00/, "+");
    if (!text.startsWith("+")) return void 0;
    const phone = parsePhoneNumber(text, { extract: false });
    return (phone == null ? void 0 : phone.isValid()) ? phone.country : void 0;
  }
  function flag(code) {
    return String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0)));
  }
  function createInternationalPhone(phone, country, english2) {
    const wrapper = document.createElement("div");
    wrapper.className = "engine-phone";
    const row = document.createElement("div");
    row.className = "engine-phone-row";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "engine-phone-country";
    toggle.setAttribute("aria-expanded", "false");
    const panel = document.createElement("div");
    panel.className = "engine-phone-countries";
    panel.id = `${phone.id}-countries`;
    panel.hidden = true;
    toggle.setAttribute("aria-controls", panel.id);
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = english2 ? "Search country or calling code" : "Buscar país ou DDI";
    search.setAttribute("aria-label", search.placeholder);
    const list = document.createElement("div");
    list.className = "engine-phone-country-list";
    const empty = document.createElement("p");
    empty.textContent = english2 ? "No countries found." : "Nenhum país encontrado.";
    empty.hidden = true;
    const choices = [];
    const fold = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const close = (focus = false) => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (focus) toggle.focus();
    };
    for (const option of country.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.country = option.value;
      button.textContent = `${flag(option.value)} ${option.text}`;
      button.addEventListener("click", () => {
        country.value = option.value;
        country.dispatchEvent(new Event("input", { bubbles: true }));
        country.dispatchEvent(new Event("change", { bubbles: true }));
        close();
        phone.focus();
      });
      list.append(button);
      choices.push({ button, text: fold(`${option.text} ${option.value}`) });
    }
    search.addEventListener("input", (e) => {
      e.stopPropagation();
      const query = fold(search.value.trim());
      choices.forEach((choice) => {
        choice.button.hidden = !choice.text.includes(query);
      });
      empty.hidden = choices.some((choice) => !choice.button.hidden);
    });
    panel.addEventListener("keydown", (e) => {
      var _a;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close(true);
      }
      if (e.key === "Enter" && e.target === search) {
        e.preventDefault();
        (_a = choices.find((choice) => !choice.button.hidden)) == null ? void 0 : _a.button.focus();
      }
    });
    toggle.onclick = () => {
      if (!panel.hidden) return close();
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      search.value = "";
      choices.forEach((choice) => {
        choice.button.hidden = false;
      });
      empty.hidden = true;
      search.focus();
    };
    panel.append(search, list, empty);
    phone.before(wrapper);
    row.append(toggle, phone);
    wrapper.append(row, panel);
    country.hidden = true;
    const updateFlag = () => {
      var _a;
      const code = country.value;
      toggle.textContent = `${flag(code)} +${getCountryCallingCode(code)} ⌄`;
      toggle.setAttribute("aria-label", `${english2 ? "Phone country" : "País do telefone"}: ${(_a = country.selectedOptions[0]) == null ? void 0 : _a.text}`);
      choices.forEach(({ button }) => button.setAttribute("aria-pressed", String(button.dataset.country === code)));
    };
    const format = (event) => {
      var _a;
      const raw = phone.value;
      const detected = detectPhoneCountry(raw);
      if (detected) country.value = detected;
      updateFlag();
      const normalized = normalizeContactPhone(raw, country.value);
      if (!/^[+\d\s().-]*$/.test(raw)) return;
      if ((_a = event == null ? void 0 : event.inputType) == null ? void 0 : _a.startsWith("delete")) return;
      const caret = phone.selectionStart ?? raw.length;
      const digitsBefore = raw.slice(0, caret).replace(/\D/g, "").length;
      const formatted = normalized ? normalized.formatNational() : new AsYouType(country.value).input(raw);
      phone.value = formatted;
      if (document.activeElement === phone) {
        let position = formatted.length;
        if (caret < raw.length && !detected) {
          let count = 0;
          position = 0;
          while (position < formatted.length && count < digitsBefore) {
            if (/\d/.test(formatted[position])) count++;
            position++;
          }
        }
        phone.setSelectionRange(position, position);
      }
    };
    phone.addEventListener("input", format);
    country.addEventListener("change", () => {
      updateFlag();
      format();
    });
    format();
    if (document.getElementById("engine-phone-style")) return;
    const style = document.createElement("style");
    style.id = "engine-phone-style";
    style.textContent = `
.engine-phone{min-width:0}
.engine-phone-row{display:flex;align-items:stretch;border:1px solid var(--restrictions-line,#e2e8f0);border-radius:8px;background:white;overflow:hidden}
.engine-phone-row:focus-within{border-color:var(--restrictions-brand,#32c0a0);box-shadow:0 0 0 2px color-mix(in srgb,var(--restrictions-brand,#32c0a0) 12%,transparent)}
.engine-emergency-editor .engine-phone-country{flex-shrink:0;border:0;border-right:1px solid var(--restrictions-line,#e2e8f0);border-radius:0;padding:10px 12px;min-height:48px;font-size:15px;color:inherit;background:var(--booking-engine-colors-gray-50,#f7fafc);white-space:nowrap}
.engine-emergency-editor .engine-phone-row input{border:0;border-radius:0;outline:none;box-shadow:none;flex:1;width:0;min-height:48px;padding:10px 12px}
.engine-phone-row:has([aria-invalid=true]){border-color:#a12424}
.engine-phone-countries{margin-top:8px;padding:10px;border:1px solid var(--restrictions-line,#e2e8f0);border-radius:10px;background:white}
.engine-phone-country-list{max-height:190px;overflow:auto;overscroll-behavior:contain;margin-top:6px}
.engine-phone-country-list button{display:block;width:100%;min-height:44px;text-align:left;border:0;font-size:13px;padding:10px 8px}
.engine-phone-country-list button[aria-pressed=true]{background:var(--booking-engine-colors-gray-100,#edf2f7);font-weight:600}
`;
    document.head.append(style);
  }
  const EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS = {
    pt: [
      { value: "Pai", text: "Pai" },
      { value: "Mãe", text: "Mãe" },
      { value: "Irmão", text: "Irmão" },
      { value: "Irmã", text: "Irmã" },
      { value: "Cônjuge", text: "Cônjuge" },
      { value: "Amigo", text: "Amigo" },
      { value: "Outro", text: "Outro" }
    ],
    en: [
      { value: "Father", text: "Father" },
      { value: "Mother", text: "Mother" },
      { value: "Brother", text: "Brother" },
      { value: "Sister", text: "Sister" },
      { value: "Spouse", text: "Spouse" },
      { value: "Friend", text: "Friend" },
      { value: "Other", text: "Other" }
    ]
  };
  function initializeEmergencyContactField() {
    const input = document.querySelector(SELECTORS.emergencyContactInput);
    if (!input || isInitialized(input, "emergencyContactApplied")) return;
    markAsInitialized(input, "emergencyContactApplied");
    const en = detectPageLanguage();
    const t = (pt2, english2) => en ? english2 : pt2;
    const title = t("Contato de emergência", "Emergency contact");
    const field = input.closest(".chakra-stack");
    field == null ? void 0 : field.classList.add("engine-restrictions-field");
    const label = field == null ? void 0 : field.querySelector("label");
    input.style.display = "none";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = "emergency-contact-trigger";
    trigger.className = "engine-restrictions-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML = `<span class="restrictions-status" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2-2-5Z"/><path d="M17 3v6m-3-3h6"/></svg></span><span class="restrictions-summary"></span><span class="restrictions-action"></span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>`;
    if (label) {
      label.textContent = `${title} *`;
      label.htmlFor = trigger.id;
    }
    input.before(trigger);
    const refresh2 = () => {
      const parts = input.value.split("|").map((s) => s.trim());
      const hasContact = parts.length === 3 && parts.every(Boolean);
      trigger.querySelector(".restrictions-summary").textContent = hasContact ? `${parts[0]} · ${parts[1]} · ${parts[2]}` : t("Quem podemos contatar se você precisar?", "Who can we contact if you need help?");
      trigger.querySelector(".restrictions-action").textContent = hasContact ? t("Editar", "Edit") : t("Informar", "Add");
      trigger.setAttribute("aria-label", `${title}: ${trigger.textContent}`);
    };
    refresh2();
    input.addEventListener("input", refresh2);
    if (!document.getElementById("engine-restrictions-style")) {
      const style = document.createElement("style");
      style.id = "engine-restrictions-style";
      style.textContent = RESTRICTIONS_STYLES;
      document.head.append(style);
    }
    if (!document.getElementById("engine-emergency-style")) {
      const style = document.createElement("style");
      style.id = "engine-emergency-style";
      style.textContent = `.engine-emergency-editor .emergency-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.engine-emergency-editor .emergency-control{display:flex;flex-direction:column;gap:6px;min-width:0}.engine-emergency-editor .emergency-control input,.engine-emergency-editor select{box-sizing:border-box;width:100%;min-width:0;min-height:44px;padding:10px 12px;font:inherit;font-size:16px;border:1px solid var(--restrictions-line);border-radius:7px;background:white;color:inherit}.engine-emergency-editor [data-phone-preview]{font-size:12px;overflow-wrap:anywhere;min-height:20px;margin:0}.engine-emergency-editor [aria-invalid=true]{border-color:#a12424}.engine-emergency-editor .emergency-wide{grid-column:1/-1}@media(max-width:639px){.engine-emergency-editor .emergency-grid{grid-template-columns:1fr}}`;
      document.head.append(style);
    }
    let active;
    trigger.onclick = () => {
      if (active == null ? void 0 : active.open) return;
      const dialog = document.createElement("dialog");
      active = dialog;
      dialog.className = "engine-restrictions engine-emergency-editor";
      prepareResponsiveDialog(dialog);
      dialog.setAttribute("aria-labelledby", "emergency-title");
      dialog.innerHTML = `<form novalidate>
<header><h2 id="emergency-title">${title}</h2><button type="button" data-close aria-label="${t("Fechar", "Close")}">×</button></header>
<p><strong>${t("Uma pessoa de confiança faz a diferença.", "A trusted contact makes a difference.")}</strong> ${t("Estamos em uma região isolada, onde o atendimento de emergência não é imediato. Se você precisar de ajuda ou não puder se comunicar, precisamos saber quem avisar.", "We are in a remote area where emergency assistance is not immediate. If you need help or cannot communicate, we need to know whom to notify.")}</p>
<p>${t("Informe alguém que conheça você, esteja ciente da viagem e possa atender ao telefone. Prefira uma pessoa que não esteja viajando com você. Confira o país, o código de área e o número antes de salvar.", "Choose someone who knows you, is aware of your trip and can answer the phone. Prefer someone who is not travelling with you. Check the country, area code and number before saving.")}</p>
<div class="emergency-grid">
<label class="emergency-control">${t("Nome completo", "Full name")}<input name="contactName" autocomplete="off" maxlength="120" required></label>
<label class="emergency-control">${t("Parentesco ou relação", "Relationship")}<select name="relationship" required></select></label>
<div class="emergency-control emergency-wide"><label for="emergency-phone">${t("Telefone com código de área", "Phone with area code")}</label><select name="country" hidden autocomplete="off" aria-label="${t("País do telefone", "Phone country")}"></select><input id="emergency-phone" name="phone" type="tel" inputmode="tel" autocomplete="off" maxlength="40" placeholder="${t("DDD e número", "Area code and number")}" aria-describedby="emergency-phone-preview" required></div>
<p class="emergency-wide" id="emergency-phone-preview" data-phone-preview aria-live="polite"></p>
</div>
<label class="choice"><input type="checkbox" name="confirmed"> ${t("Confirmo que esta pessoa está ciente e pode ser contatada em uma emergência.", "I confirm this person is aware and can be contacted in an emergency.")}</label>
<p data-error role="alert"></p>
<footer><button type="button" data-cancel>${t("Cancelar", "Cancel")}</button><button type="submit">${t("Salvar contato", "Save contact")}</button></footer>
</form>`;
      const form = dialog.querySelector("form");
      const name = form.elements.namedItem("contactName");
      const relation = form.elements.namedItem("relationship");
      const country = form.elements.namedItem("country");
      const phone = form.elements.namedItem("phone");
      const confirmed = form.elements.namedItem("confirmed");
      const error = dialog.querySelector("[data-error]");
      const preview = dialog.querySelector("[data-phone-preview]");
      relation.add(new Option(t("Selecione", "Select"), ""));
      EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS[en ? "en" : "pt"].forEach((o) => relation.add(new Option(o.text, o.value)));
      const regionNames = new Intl.DisplayNames([en ? "en" : "pt-BR"], { type: "region" });
      getCountries().map((code) => ({ code, name: regionNames.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, en ? "en" : "pt-BR")).forEach(({ code, name: name2 }) => country.add(new Option(`${name2} (+${getCountryCallingCode(code)})`, code)));
      country.value = "BR";
      const parts = input.value.split("|").map((s) => s.trim());
      if (parts.length === 3) {
        name.value = parts[0] || "";
        if (parts[1] && !Array.from(relation.options).some((o) => o.value === parts[1])) relation.add(new Option(parts[1], parts[1]));
        relation.value = parts[1] || "";
        phone.value = parts[2] || "";
        country.value = detectPhoneCountry(phone.value) || "BR";
      } else if (input.value.trim()) {
        const legacy = document.createElement("p");
        legacy.textContent = `${t("Contato anterior — confira e preencha os campos:", "Previous contact — review and complete the fields:")} ${input.value}`;
        form.querySelector(".emergency-grid").before(legacy);
      }
      createInternationalPhone(phone, country, en);
      const updatePreview = (detectCountry = false) => {
        if (detectCountry) country.value = detectPhoneCountry(phone.value) || country.value;
        const normalized = normalizeContactPhone(phone.value, country.value);
        preview.textContent = normalized ? `${t("Número internacional:", "International number:")} ${normalized.formatInternational()}` : `${t("Código do país:", "Country calling code:")} +${getCountryCallingCode(country.value)} · ${t("Inclua o código de área.", "Include the area code.")}`;
        phone.removeAttribute("aria-invalid");
      };
      phone.addEventListener("input", () => updatePreview(true));
      country.addEventListener("change", () => updatePreview());
      form.addEventListener("input", (e) => {
        error.textContent = "";
        if (e.target !== confirmed) confirmed.checked = false;
      });
      updatePreview();
      form.onsubmit = (e) => {
        e.preventDefault();
        error.textContent = "";
        const fail = (message, control) => {
          error.textContent = message;
          control.focus();
        };
        if (name.value.trim().length < 2 || name.value.includes("|")) return fail(t("Informe o nome completo, sem o caractere |.", "Enter the full name without the | character."), name);
        if (!relation.value) return fail(t("Selecione o parentesco ou relação.", "Select the relationship."), relation);
        const normalized = normalizeContactPhone(phone.value, country.value);
        if (!normalized) {
          phone.setAttribute("aria-invalid", "true");
          return fail(t("Confira o país e informe um telefone válido com código de área, sem ramal.", "Check the country and enter a valid phone with area code, without an extension."), phone);
        }
        if (!confirmed.checked) return fail(t("Confirme que esta pessoa pode ser contatada.", "Confirm this person can be contacted."), confirmed);
        const value = `${name.value.trim()} | ${relation.value} | ${normalized.number}`;
        if (input.maxLength > 0 && value.length > input.maxLength) return fail(t("O contato excede o tamanho permitido. Abrevie o nome.", "Contact exceeds the field limit. Shorten the name."), name);
        triggerReactInput(input, value);
        refresh2();
        dialog.close();
      };
      dialog.querySelector("[data-close]").onclick = () => dialog.close();
      dialog.querySelector("[data-cancel]").onclick = () => dialog.close();
      dialog.addEventListener("close", () => {
        dialog.remove();
        active = void 0;
        trigger.focus();
      });
      document.body.append(dialog);
      dialog.showModal();
    };
  }
  const ENCODED_TOKEN_SEGMENTS = "=sGc_2|==AMulkc0d0YyUFRiNnUtR2dkJTT4Z0RNdXSy0UaS1WZ2x2VipmSp9UaF1WSzlUaOJzdHJGaSdlYwZ1Rhl2bqlUMKlXZ_67|==QUXhVVx81UCd1cLNFSzcWQIZGUEVGN_22";
  function decodeToken() {
    return ENCODED_TOKEN_SEGMENTS.split("|").map((segment) => {
      const [reversedBase64] = segment.split("_");
      try {
        return atob((reversedBase64 ?? "").split("").reverse().join(""));
      } catch {
        return "";
      }
    }).join(".");
  }
  const MAPBOX_ACCESS_TOKEN = decodeToken();
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  const MANAUS_BBOX = "-60.1,-3.2,-59.9,-2.9";
  const MANAUS_PROXIMITY = "-60.0215,-3.1190";
  let sessionToken;
  function getSessionToken() {
    sessionToken ?? (sessionToken = generateUUID());
    return sessionToken;
  }
  const MapboxClient = {
    /**
     * Autocompletes an address/POI query, filtered down to results whose
     * place text mentions Manaus (the Search Box API's bbox param alone
     * isn't a hard filter, so this double-checks client-side).
     */
    async suggest(query, options = {}) {
      if (!MAPBOX_ACCESS_TOKEN) {
        console.warn("Mapbox access token não configurado");
        return [];
      }
      if (!query || query.trim().length === 0)
        return [];
      const searchQuery = query.trim().substring(0, 256);
      const params = new URLSearchParams({
        q: searchQuery,
        access_token: MAPBOX_ACCESS_TOKEN,
        session_token: getSessionToken(),
        language: options.language || "pt",
        limit: String(options.limit || 10),
        country: "BR",
        types: "address,poi",
        proximity: options.proximity || MANAUS_PROXIMITY
      });
      params.append("bbox", MANAUS_BBOX);
      try {
        const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?${params.toString()}`);
        if (!response.ok) {
          console.warn("Erro na requisição Mapbox:", response.status, response.statusText);
          return [];
        }
        const data = await response.json();
        if (!Array.isArray(data.suggestions))
          return [];
        return data.suggestions.filter((suggestion) => {
          var _a, _b, _c, _d, _e;
          const placeFormatted = ((_a = suggestion.place_formatted) == null ? void 0 : _a.toLowerCase()) || "";
          const fullAddress = ((_b = suggestion.full_address) == null ? void 0 : _b.toLowerCase()) || "";
          const contextPlace = ((_e = (_d = (_c = suggestion.context) == null ? void 0 : _c.place) == null ? void 0 : _d.name) == null ? void 0 : _e.toLowerCase()) || "";
          return placeFormatted.includes("manaus") || fullAddress.includes("manaus") || contextPlace.includes("manaus");
        });
      } catch (error) {
        console.warn("Erro ao buscar sugestões do Mapbox:", error);
        return [];
      }
    },
    /** Resolves a suggestion's `mapbox_id` into full feature details. Currently unused by any field. */
    async retrieve(mapboxId) {
      var _a;
      if (!MAPBOX_ACCESS_TOKEN || !mapboxId)
        return null;
      const params = new URLSearchParams({ access_token: MAPBOX_ACCESS_TOKEN, session_token: getSessionToken() });
      try {
        const response = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}?${params.toString()}`);
        if (!response.ok) {
          console.warn("Erro ao recuperar detalhes do Mapbox:", response.status, response.statusText);
          return null;
        }
        const data = await response.json();
        return ((_a = data.features) == null ? void 0 : _a[0]) ?? null;
      } catch (error) {
        console.warn("Erro ao recuperar detalhes do Mapbox:", error);
        return null;
      }
    },
    isPOI(suggestion) {
      return suggestion.feature_type === "poi";
    },
    getDisplayName(suggestion) {
      if (this.isPOI(suggestion))
        return suggestion.name || suggestion.address || "";
      return suggestion.address || suggestion.name || "";
    },
    getStreetAddress(suggestion) {
      var _a;
      if (suggestion.address)
        return suggestion.address;
      const addr = (_a = suggestion.context) == null ? void 0 : _a.address;
      if (addr) {
        const parts = [];
        if (addr.street_name)
          parts.push(addr.street_name);
        if (addr.address_number)
          parts.push(addr.address_number);
        return parts.join(",");
      }
      return "";
    },
    getSecondaryAddress(suggestion) {
      var _a, _b, _c, _d;
      const parts = [];
      if ((_b = (_a = suggestion.context) == null ? void 0 : _a.neighborhood) == null ? void 0 : _b.name)
        parts.push(suggestion.context.neighborhood.name);
      if ((_d = (_c = suggestion.context) == null ? void 0 : _c.place) == null ? void 0 : _d.name)
        parts.push(suggestion.context.place.name);
      if (parts.length === 0 && suggestion.place_formatted)
        return suggestion.place_formatted;
      return parts.join(",");
    },
    /** Text to show in the address input once a suggestion is picked. */
    formatForInput(suggestion) {
      if (this.isPOI(suggestion))
        return suggestion.name || suggestion.address || "";
      return suggestion.address || suggestion.full_address || suggestion.name || "";
    },
    /** Text sent to Cloudbeds (the hidden field) once a suggestion is picked. */
    formatForBackend(suggestion) {
      const streetAddress = this.getStreetAddress(suggestion);
      if (this.isPOI(suggestion)) {
        const name = suggestion.name || "";
        if (name && streetAddress)
          return `${name}-${streetAddress}`;
        return name || streetAddress || suggestion.full_address || "";
      }
      return streetAddress || suggestion.address || suggestion.full_address || "";
    },
    /** Currently unused by any field — kept for parity with the original script. */
    formatSuggestion(suggestion) {
      if (suggestion.full_address)
        return suggestion.full_address;
      const parts = [];
      if (suggestion.address)
        parts.push(suggestion.address);
      if (suggestion.place_formatted)
        parts.push(suggestion.place_formatted);
      return parts.length > 0 ? parts.join(",") : suggestion.name || "";
    }
  };
  function generateTimeOptions() {
    const options = [];
    for (let hour = 8; hour <= 15; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 15 && minute > 0)
          break;
        const hourStr = hour.toString().padStart(2, "0");
        const minuteStr = minute.toString().padStart(2, "0");
        const time = `${hourStr}:${minuteStr}`;
        options.push({ value: time, text: time });
      }
    }
    return options;
  }
  function buildStyleSheet(wrapperId) {
    return `
#${wrapperId}{--spacing-sm:8px;--spacing-md:12px;--border-radius:10px;--border-color:#e5e7eb;--border-color-focus:var(--booking-engine-colors-primary-500,#32c0a0);--border-color-error:#ef4444;--text-color:#111827;--text-color-placeholder:#9ca3af;--bg-color:#ffffff;--bg-color-error:#fef2f2;--shadow:0 1px 2px rgba(0,0,0,0.05);--shadow-focus:0 0 0 4px rgba(50,192,160,0.1),0 2px 4px rgba(0,0,0,0.1);}
#${wrapperId},#${wrapperId} *{box-sizing:border-box;}
#${wrapperId} .fields-row{display:flex;flex-direction:column;gap:var(--spacing-md);width:100%;}
@media(min-width:640px){#${wrapperId},#${wrapperId} *{box-sizing:border-box;}
#${wrapperId} .fields-row{flex-direction:row;gap:var(--spacing-md);align-items:flex-start;}#${wrapperId} .field-group.field-time{flex:0 0 180px;min-width:0;}#${wrapperId} .field-group.field-address{flex:1;min-width:0;}}
#${wrapperId} .field-group{display:flex;flex-direction:column;gap:6px;position:relative;}
#${wrapperId} .field-label{font-size:0.875rem;font-weight:500;color:#374151;margin:0;letter-spacing:-0.01em;}
#${wrapperId} .field-input{padding:14px 16px;font-size:16px;border:1.5px solid var(--border-color);border-radius:var(--border-radius);background:var(--bg-color);width:100%;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);color:var(--text-color);font-weight:400;box-shadow:var(--shadow);min-height:48px;box-sizing:border-box;outline:none;font-family:inherit;}
#${wrapperId} .field-input::placeholder{color:var(--text-color-placeholder);}
#${wrapperId} .field-input:focus{border-color:var(--border-color-focus);box-shadow:var(--shadow-focus);}
#${wrapperId} .field-input.error{border-color:var(--border-color-error);background:var(--bg-color-error);}
#${wrapperId} .field-input:disabled{background:#f3f4f6;color:#9ca3af;cursor:not-allowed;}
#${wrapperId} .field-error{color:#dc2626;font-size:0.8125rem;margin-top:4px;font-weight:500;display:none;}
#${wrapperId} .field-error.show{display:block;}
#${wrapperId} .checkbox-container{display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer;user-select:none;justify-content:flex-end;}
#${wrapperId} .checkbox-container input[type="checkbox"]{width:18px;height:18px;cursor:pointer;accent-color:var(--booking-engine-colors-primary-500,#32c0a0);}
#${wrapperId} .checkbox-container label{font-size:0.875rem;color:#6b7280;cursor:pointer;margin:0;font-weight:400;}
#${wrapperId} .checkbox-container:hover label{color:#374151;}
#${wrapperId} .time-dropdown-wrapper .tooltip{position:absolute;bottom:calc(100%+16px);left:0;right:0;background:#fff3cd;border:1.5px solid #ffc107;border-radius:8px;padding:12px 16px;font-size:0.8125rem;color:#856404;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:1001;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity 0.3s ease,transform 0.3s ease;line-height:1.5;cursor:pointer;}
#${wrapperId} .time-dropdown-wrapper .tooltip.show{opacity:1;pointer-events:auto;transform:translateY(0);}
#${wrapperId} .time-dropdown-wrapper .tooltip:hover{background:#ffe69c;}
#${wrapperId} .field-group.field-time{position:relative;}
#${wrapperId} .time-dropdown-wrapper{position:relative;width:100%;}
#${wrapperId} .address-autocomplete-wrapper{position:relative;width:100%;}
#${wrapperId} .autocomplete-dropdown{position:absolute;top:calc(100%+4px);left:0;right:0;background:#ffffff;border:1.5px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:1000;max-height:300px;overflow-y:auto;display:none;opacity:0;transform:translateY(-8px);transition:all 0.2s cubic-bezier(0.4,0,0.2,1);}
#${wrapperId} .autocomplete-dropdown.show{position:relative;top:auto;margin-top:6px;display:block;opacity:1;transform:translateY(0);}
#${wrapperId} .autocomplete-item{padding:12px 16px;cursor:pointer;transition:all 0.15s ease;border-bottom:1px solid #f3f4f6;display:flex;flex-direction:column;gap:2px;}
#${wrapperId} .autocomplete-item:last-child{border-bottom:none;}
#${wrapperId} .autocomplete-item:hover{background:#f9fafb;}
#${wrapperId} .autocomplete-item:hover .autocomplete-item-name{color:var(--booking-engine-colors-primary-500,#32c0a0);}
#${wrapperId} .autocomplete-item.selected{background:#e8f4f8;}
#${wrapperId} .autocomplete-item.selected .autocomplete-item-name{color:var(--booking-engine-colors-primary-500,#32c0a0);font-weight:500;}
#${wrapperId} .autocomplete-item-name{font-size:16px;color:#111827;font-weight:500;}
#${wrapperId} .autocomplete-item-address{font-size:0.8125rem;color:#6b7280;}
#${wrapperId} .autocomplete-loading{padding:12px 16px;font-size:0.875rem;color:#6b7280;text-align:center;}
`;
  }
  const TIME_DROPDOWN_STYLES = {
    button: "padding:14px 16px;font-size:16px;border:1.5px solid #e5e7eb;border-radius:10px;background:#ffffff;width:100%;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);color:#111827;font-weight:400;box-shadow:0 1px 2px rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:space-between;min-height:48px;cursor:pointer;",
    buttonPlaceholder: "color:#9ca3af;",
    buttonActive: "border-color:var(--booking-engine-colors-primary-500,#32c0a0);box-shadow:0 0 0 4px rgba(50,192,160,0.1),0 2px 4px rgba(0,0,0,0.1);",
    buttonHover: "border-color:#d1d5db;",
    dropdown: "position:absolute;top:calc(100%+4px);left:0;right:0;background:#ffffff;border:1.5px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.15);z-index:1000;max-height:300px;overflow-y:auto;display:none;opacity:0;transform:translateY(-8px);transition:all 0.2s cubic-bezier(0.4,0,0.2,1);",
    option: "padding:12px 16px;font-size:16px;color:#111827;cursor:pointer;transition:all 0.15s ease;border-bottom:1px solid #f3f4f6;"
  };
  function createTransferField(config) {
    const textarea = document.querySelector(config.selector);
    const initializedFlag = `transfer${config.direction === "in" ? "In" : "Out"}Applied`;
    if (!textarea || isInitialized(textarea, initializedFlag))
      return;
    markAsInitialized(textarea, initializedFlag);
    const isEnglish = detectPageLanguage();
    const lang = isEnglish ? "en" : "pt";
    const currentLabels = {
      time: lang === "pt" ? "Horário" : "Time",
      address: lang === "pt" ? "Endereço" : "Address",
      sendLater: lang === "pt" ? "Enviar posteriormente" : "Send later",
      sendLaterBackend: "Envio posterior",
      timePlaceholder: lang === "pt" ? "Selecione o horário" : "Select time",
      addressPlaceholder: lang === "pt" ? "Digite o endereço completo" : "Enter full address",
      timeError: lang === "pt" ? "Horário é obrigatório" : "Time is required",
      addressError: lang === "pt" ? "Endereço é obrigatório" : "Address is required",
      extraFeeTooltip: config.extraFeeTooltip[lang]
    };
    const wrapperId = `transfer-${config.direction}-wrapper`;
    const title = isEnglish ? config.direction === "in" ? "Arrival transfer (IN)" : "Departure transfer (OUT)" : config.direction === "in" ? "Transfer de chegada (IN)" : "Transfer de saída (OUT)";
    const field = textarea.closest(".chakra-stack");
    field == null ? void 0 : field.classList.add("engine-restrictions-field");
    const nativeLabel = field == null ? void 0 : field.querySelector("label");
    if (nativeLabel) nativeLabel.textContent = `${title} *`;
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = `${wrapperId}-trigger`;
    trigger.className = "engine-restrictions-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.innerHTML = `<span class="restrictions-status" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 16V8l2-4h12l2 4v8M4 9h16M7 13h2m6 0h2M6 16v3m12-3v3M3 16h18"/></svg></span><span class="restrictions-summary"></span><span class="restrictions-action"></span><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>`;
    const summary = trigger.querySelector(".restrictions-summary");
    const action = trigger.querySelector(".restrictions-action");
    if (nativeLabel) nativeLabel.htmlFor = trigger.id;
    let editing = false;
    if (!document.getElementById("engine-restrictions-style")) {
      const style = document.createElement("style");
      style.id = "engine-restrictions-style";
      style.textContent = RESTRICTIONS_STYLES;
      document.head.append(style);
    }
    textarea.style.display = "none";
    const wrapper = document.createElement("div");
    wrapper.id = wrapperId;
    wrapper.style.cssText = "width:100%;font-family:inherit;";
    const styleTag = document.createElement("style");
    styleTag.textContent = buildStyleSheet(wrapperId) + `
.engine-transfer-row{display:flex;align-items:center;gap:18px;min-width:0;padding:2px 0 3px}
.engine-transfer-row .engine-restrictions-trigger{flex:1;min-width:0;gap:10px;padding:5px 0;min-height:44px}
.engine-transfer-row .restrictions-status{width:28px;height:28px}
.engine-transfer-row .restrictions-summary{font-size:12px;line-height:1.5;font-weight:400}
.engine-transfer-row .restrictions-action{font-size:12px;font-weight:500}
.engine-transfer-later{display:flex;align-items:center;gap:8px;flex-shrink:0;font-size:11px;color:var(--booking-engine-colors-gray-500,#718096);padding:8px 0 8px 16px;border-left:1px solid var(--booking-engine-colors-gray-200,#e2e8f0)}
.engine-transfer-later input{appearance:auto;width:16px;height:16px;margin:0;flex-shrink:0;accent-color:var(--booking-engine-colors-primary-500,#32c0a0);cursor:pointer}
.engine-transfer-later label{cursor:pointer;margin:0;font:inherit;white-space:nowrap;padding:4px 0}
.engine-transfer-later:has(input:checked){color:var(--booking-engine-colors-gray-700,#2d3748)}
@media(max-width:600px){.engine-transfer-row{flex-wrap:wrap;gap:0;padding-bottom:4px}.engine-transfer-row .engine-restrictions-trigger{flex-basis:100%}.engine-transfer-later{margin-left:38px;border-left:0;padding:0;min-height:32px}}

`;
    document.head.appendChild(styleTag);
    const fieldsRow = document.createElement("div");
    fieldsRow.className = "fields-row";
    let timeValue = config.defaultTime;
    let addressValue = "";
    let sendLaterChecked = false;
    let timeTouched = false;
    let addressTouched = false;
    function parseExistingValue() {
      const existingValue = textarea.value.trim();
      if (!existingValue)
        return;
      const sendLaterText = lang === "pt" ? "enviar posteriormente" : "send later";
      if (existingValue === currentLabels.sendLaterBackend || existingValue.toLowerCase().includes(sendLaterText.toLowerCase())) {
        sendLaterChecked = true;
        const timeMatch = existingValue.match(/(\d{2}:\d{2})/);
        timeValue = (timeMatch == null ? void 0 : timeMatch[1]) || config.defaultTime;
      } else {
        const parts = existingValue.split("|").map((p) => p.trim());
        if (parts.length === 2) {
          timeValue = parts[0] || config.defaultTime;
          addressValue = parts[1] || "";
        } else if (/^\d{2}:\d{2}$/.test(existingValue)) {
          timeValue = existingValue;
        } else {
          addressValue = existingValue;
          timeValue = config.defaultTime;
        }
      }
      if (timeValue && timeValue !== config.defaultTime)
        timeTouched = true;
      if (addressValue)
        addressTouched = true;
    }
    parseExistingValue();
    const timeOptions = generateTimeOptions();
    const timeLabel = document.createElement("label");
    timeLabel.className = "field-label";
    timeLabel.textContent = currentLabels.time;
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = currentLabels.extraFeeTooltip;
    let tooltipTimeout = null;
    function updateTooltip() {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
      if (timeValue && timeValue !== config.defaultTime) {
        tooltip.classList.add("show");
        tooltipTimeout = setTimeout(() => {
          tooltip.classList.remove("show");
          tooltipTimeout = null;
        }, 5e3);
      } else {
        tooltip.classList.remove("show");
      }
    }
    tooltip.addEventListener("click", () => {
      tooltip.classList.remove("show");
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
    });
    const timeDropdown = CustomDropdown({
      placeholder: currentLabels.timePlaceholder,
      options: timeOptions,
      value: timeValue,
      id: `transfer-${config.direction}-time-${Date.now()}`,
      styles: TIME_DROPDOWN_STYLES,
      onChange: (newValue) => {
        timeValue = newValue;
        timeTouched = true;
        timeDropdown.setError(false);
        updateTooltip();
        updateHiddenInput();
        validateFields();
      }
    });
    const timeError = document.createElement("div");
    timeError.className = "field-error";
    timeError.textContent = currentLabels.timeError;
    const timeDropdownWrapper = document.createElement("div");
    timeDropdownWrapper.className = "time-dropdown-wrapper";
    timeDropdownWrapper.appendChild(timeDropdown);
    timeDropdownWrapper.appendChild(tooltip);
    const timeContainer = document.createElement("div");
    timeContainer.className = "field-group field-time";
    timeContainer.appendChild(timeLabel);
    timeContainer.appendChild(timeDropdownWrapper);
    timeContainer.appendChild(timeError);
    const addressLabel = document.createElement("label");
    addressLabel.className = "field-label";
    addressLabel.textContent = currentLabels.address;
    const addressInput = document.createElement("input");
    addressInput.type = "text";
    addressInput.id = `${wrapperId}-address`;
    addressLabel.htmlFor = addressInput.id;
    addressInput.className = "field-input";
    addressInput.placeholder = currentLabels.addressPlaceholder;
    addressInput.value = addressValue;
    addressInput.disabled = sendLaterChecked;
    addressInput.autocomplete = "off";
    const autocompleteDropdown = document.createElement("div");
    autocompleteDropdown.className = "autocomplete-dropdown";
    const addressAutocompleteWrapper = document.createElement("div");
    addressAutocompleteWrapper.className = "address-autocomplete-wrapper";
    addressAutocompleteWrapper.appendChild(addressInput);
    addressAutocompleteWrapper.appendChild(autocompleteDropdown);
    const addressError = document.createElement("div");
    addressError.className = "field-error";
    addressError.textContent = currentLabels.addressError;
    const addressContainer = document.createElement("div");
    addressContainer.className = "field-group field-address";
    addressContainer.appendChild(addressLabel);
    addressContainer.appendChild(addressAutocompleteWrapper);
    addressContainer.appendChild(addressError);
    let autocompleteTimeout = null;
    let currentSuggestions = [];
    let selectedIndex = -1;
    let isAutocompleteOpen = false;
    let addressBackendValue = addressValue;
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "checkbox-container";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `transfer-${config.direction}-checkbox-${Date.now()}`;
    checkbox.checked = sendLaterChecked;
    if (sendLaterChecked) {
      addressInput.disabled = true;
      timeDropdown.setDisabled(true);
    }
    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = checkbox.id;
    checkboxLabel.textContent = currentLabels.sendLater;
    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkboxLabel);
    function renderSuggestions(suggestions) {
      if (suggestions.length === 0) {
        autocompleteDropdown.innerHTML = '<div class="autocomplete-loading">Nenhum resultado encontrado</div>';
        return;
      }
      autocompleteDropdown.innerHTML = "";
      suggestions.forEach((suggestion, index) => {
        const item = document.createElement("div");
        item.className = "autocomplete-item";
        item.dataset.index = String(index);
        item.dataset.mapboxId = suggestion.mapbox_id;
        const nameEl = document.createElement("div");
        nameEl.className = "autocomplete-item-name";
        nameEl.textContent = MapboxClient.getDisplayName(suggestion);
        const addressEl = document.createElement("div");
        addressEl.className = "autocomplete-item-address";
        addressEl.textContent = MapboxClient.isPOI(suggestion) ? MapboxClient.getStreetAddress(suggestion) + (MapboxClient.getSecondaryAddress(suggestion) ? `,${MapboxClient.getSecondaryAddress(suggestion)}` : "") : MapboxClient.getSecondaryAddress(suggestion);
        item.appendChild(nameEl);
        if (addressEl.textContent)
          item.appendChild(addressEl);
        item.addEventListener("click", () => selectSuggestion(suggestion));
        item.addEventListener("mouseenter", () => {
          selectedIndex = index;
          updateSelectedItem();
        });
        autocompleteDropdown.appendChild(item);
      });
    }
    async function searchSuggestions(query) {
      if (!query || query.length < 2) {
        closeAutocomplete();
        return;
      }
      autocompleteDropdown.innerHTML = '<div class="autocomplete-loading">Buscando...</div>';
      autocompleteDropdown.classList.add("show");
      isAutocompleteOpen = true;
      if (autocompleteTimeout)
        clearTimeout(autocompleteTimeout);
      autocompleteTimeout = setTimeout(async () => {
        try {
          const suggestions = await MapboxClient.suggest(query, { language: lang, limit: 8 });
          if (!editing || sendLaterChecked || query !== addressInput.value.trim()) return;
          currentSuggestions = suggestions;
          selectedIndex = -1;
          renderSuggestions(suggestions);
        } catch (error) {
          console.warn("Erro ao buscar sugestões:", error);
          closeAutocomplete();
        }
      }, 300);
    }
    function selectSuggestion(suggestion) {
      const displayValue = MapboxClient.formatForInput(suggestion);
      const backendValue = MapboxClient.formatForBackend(suggestion);
      addressInput.value = displayValue;
      addressValue = displayValue;
      addressBackendValue = backendValue;
      addressTouched = true;
      closeAutocomplete();
      addressInput.classList.remove("error");
      updateHiddenInput();
      validateFields();
    }
    function updateSelectedItem() {
      autocompleteDropdown.querySelectorAll(".autocomplete-item").forEach((item, index) => {
        item.classList.toggle("selected", index === selectedIndex);
      });
    }
    function closeAutocomplete() {
      autocompleteDropdown.classList.remove("show");
      isAutocompleteOpen = false;
      selectedIndex = -1;
      currentSuggestions = [];
    }
    addressInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      addressValue = query;
      addressBackendValue = query;
      addressInput.classList.remove("error");
      if (!sendLaterChecked)
        searchSuggestions(query);
      updateHiddenInput();
      if (addressTouched)
        validateFields();
    });
    addressInput.addEventListener("focus", () => {
      addressInput.classList.remove("error");
      if (addressInput.value.trim().length >= 2 && !sendLaterChecked)
        searchSuggestions(addressInput.value.trim());
    });
    addressInput.addEventListener("blur", () => {
      setTimeout(() => {
        closeAutocomplete();
        addressTouched = true;
        validateFields();
      }, 200);
    });
    addressInput.addEventListener("keydown", (e) => {
      if (!isAutocompleteOpen || currentSuggestions.length === 0)
        return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
        updateSelectedItem();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelectedItem();
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault();
        selectSuggestion(currentSuggestions[selectedIndex]);
      } else if (e.key === "Escape") {
        closeAutocomplete();
      }
    });
    checkbox.addEventListener("change", (e) => {
      sendLaterChecked = e.target.checked;
      addressInput.disabled = sendLaterChecked;
      timeDropdown.setDisabled(sendLaterChecked);
      if (sendLaterChecked) {
        addressInput.classList.remove("error");
        addressError.classList.remove("show");
        addressValue = "";
        addressBackendValue = "";
        addressInput.value = "";
        closeAutocomplete();
        tooltip.classList.remove("show");
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout);
          tooltipTimeout = null;
        }
      } else {
        addressTouched = true;
        updateTooltip();
      }
      updateHiddenInput();
      validateFields();
    });
    function updateHiddenInput() {
      if (editing) return;
      let formatted = "";
      if (sendLaterChecked) {
        formatted = currentLabels.sendLaterBackend;
      } else {
        const parts = [];
        if (timeValue)
          parts.push(timeValue);
        if (addressBackendValue)
          parts.push(addressBackendValue);
        formatted = parts.join(" | ");
      }
      triggerReactInput(textarea, formatted);
      summary.textContent = sendLaterChecked ? isEnglish ? "Details to be confirmed" : "Dados a confirmar" : `${timeValue} · ${addressValue || (isEnglish ? "Enter the address" : "Informe o endereço")}`;
      action.textContent = addressValue || sendLaterChecked ? isEnglish ? "Edit" : "Editar" : isEnglish ? "Add" : "Informar";
      trigger.setAttribute("aria-label", `${title}: ${summary.textContent}. ${action.textContent}`);
    }
    function validateFields() {
      let hasError = false;
      if (!timeValue) {
        if (timeTouched) {
          timeError.classList.add("show");
          timeDropdown.setError(true);
        }
        hasError = true;
      } else {
        timeError.classList.remove("show");
        timeDropdown.setError(false);
      }
      if (!sendLaterChecked) {
        if (!addressValue || addressValue.length < 5) {
          if (addressTouched) {
            addressError.classList.add("show");
            addressInput.classList.add("error");
          }
          hasError = true;
        } else {
          addressError.classList.remove("show");
          addressInput.classList.remove("error");
        }
      }
      return !hasError;
    }
    fieldsRow.appendChild(timeContainer);
    fieldsRow.appendChild(addressContainer);
    wrapper.appendChild(fieldsRow);
    const modalCheckboxContainer = checkboxContainer.cloneNode(true);
    const modalCheckbox = modalCheckboxContainer.querySelector("input");
    modalCheckbox.id = `${checkbox.id}-modal`;
    modalCheckboxContainer.querySelector("label").htmlFor = modalCheckbox.id;
    modalCheckbox.addEventListener("change", () => {
      checkbox.checked = modalCheckbox.checked;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
    });
    checkbox.addEventListener("change", () => {
      modalCheckbox.checked = checkbox.checked;
    });
    wrapper.appendChild(modalCheckboxContainer);
    checkboxContainer.className = "engine-transfer-later";
    const row = document.createElement("div");
    row.className = "engine-transfer-row";
    row.append(trigger, checkboxContainer);
    textarea.before(row);
    const dialog = document.createElement("dialog");
    dialog.className = "engine-restrictions engine-transfer-dialog";
    prepareResponsiveDialog(dialog);
    dialog.setAttribute("aria-labelledby", `${wrapperId}-title`);
    const header = document.createElement("header");
    const heading = document.createElement("h2");
    heading.id = `${wrapperId}-title`;
    heading.textContent = title;
    const close = document.createElement("button");
    close.type = "button";
    close.dataset.close = "";
    close.setAttribute("aria-label", isEnglish ? "Close" : "Fechar");
    close.textContent = "×";
    header.append(heading, close);
    const description = document.createElement("p");
    description.textContent = `${isEnglish ? "Standard time" : "Horário padrão"}: ${config.defaultTime}. ${currentLabels.extraFeeTooltip}`;
    const footer = document.createElement("footer");
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = isEnglish ? "Cancel" : "Cancelar";
    const save = document.createElement("button");
    save.type = "button";
    save.dataset.prepare = "";
    save.textContent = isEnglish ? "Save transfer" : "Salvar transfer";
    footer.append(cancel, save);
    dialog.append(header, description, wrapper, footer);
    let restore = () => {
    };
    trigger.onclick = () => {
      if (dialog.open) return;
      const previous = { timeValue, addressValue, addressBackendValue, sendLaterChecked, timeTouched, addressTouched };
      restore = () => {
        ({ timeValue, addressValue, addressBackendValue, sendLaterChecked, timeTouched, addressTouched } = previous);
        addressInput.value = addressValue;
        addressInput.disabled = sendLaterChecked;
        checkbox.checked = sendLaterChecked;
        modalCheckbox.checked = sendLaterChecked;
        timeDropdown.setValue(timeValue);
        timeDropdown.setDisabled(sendLaterChecked);
        addressInput.classList.remove("error");
        addressError.classList.remove("show");
        timeError.classList.remove("show");
        timeDropdown.setError(false);
      };
      modalCheckbox.checked = sendLaterChecked;
      editing = true;
      document.body.append(dialog);
      dialog.showModal();
    };
    close.onclick = cancel.onclick = () => dialog.close();
    save.onclick = () => {
      timeTouched = addressTouched = true;
      if (!validateFields()) {
        addressInput.focus();
        return;
      }
      editing = false;
      updateHiddenInput();
      dialog.close();
    };
    dialog.addEventListener("close", () => {
      if (editing) restore();
      editing = false;
      closeAutocomplete();
      if (autocompleteTimeout) clearTimeout(autocompleteTimeout);
      if (tooltipTimeout) clearTimeout(tooltipTimeout);
      tooltip.classList.remove("show");
      timeDropdown.close();
      dialog.remove();
      trigger.focus();
    });
    updateHiddenInput();
    updateTooltip();
    if (timeTouched || addressTouched)
      validateFields();
  }
  function initializeTransferInField() {
    createTransferField({
      direction: "in",
      selector: SELECTORS.transferInInput,
      defaultTime: "08:00",
      extraFeeTooltip: {
        pt: "Horários fora do padrão (08:00) estão sujeitos a taxa adicional de R$ 250 por trecho.",
        en: "Times outside the standard window (08:00 AM) are subject to an additional fee of R$ 250 per segment."
      }
    });
  }
  function initializeTransferOutField() {
    createTransferField({
      direction: "out",
      selector: SELECTORS.transferOutInput,
      defaultTime: "14:00",
      extraFeeTooltip: {
        pt: "Horários fora do padrão (14:00) estão sujeitos a taxa adicional de R$ 250 por trecho.",
        en: "Times outside the standard window (14:00) are subject to an additional fee of R$ 250 per segment."
      }
    });
  }
  const CHANNEL_OPTIONS = {
    pt: [
      { value: "Google", text: "Google" },
      { value: "Instagram", text: "Instagram" },
      { value: "Facebook", text: "Facebook" },
      { value: "Indicação de amigo", text: "Indicação de amigo" },
      { value: "TripAdvisor", text: "TripAdvisor" },
      { value: "Booking.com", text: "Booking.com" },
      { value: "ChatGPT", text: "ChatGPT" },
      { value: "Outro", text: "Outro" }
    ],
    en: [
      { value: "Google", text: "Google" },
      { value: "Instagram", text: "Instagram" },
      { value: "Facebook", text: "Facebook" },
      { value: "Friend recommendation", text: "Friend recommendation" },
      { value: "TripAdvisor", text: "TripAdvisor" },
      { value: "Booking.com", text: "Booking.com" },
      { value: "ChatGPT", text: "ChatGPT" },
      { value: "Other", text: "Other" }
    ]
  };
  const CHANNEL_OTHER_VALUE = {
    pt: "Outro",
    en: "Other"
  };
  function initializeChannelField() {
    const input = document.querySelector(SELECTORS.channelInput);
    if (!input || isInitialized(input, "channelApplied"))
      return;
    markAsInitialized(input, "channelApplied");
    const isEnglish = detectPageLanguage();
    const lang = isEnglish ? "en" : "pt";
    const options = CHANNEL_OPTIONS[lang];
    const otherValue = CHANNEL_OTHER_VALUE[lang];
    const otherPlaceholder = lang === "pt" ? "Digite como nos conheceu" : "Enter how you found us";
    input.style.display = "none";
    const wrapper = document.createElement("div");
    wrapper.id = `channel-wrapper-${Date.now()}`;
    wrapper.style.cssText = "width:100%;font-family:inherit;position:relative;";
    const styleTag = document.createElement("style");
    styleTag.textContent = `
#${wrapper.id}{--border-color:#e5e7eb;--border-color-focus:var(--booking-engine-colors-primary-500,#32c0a0);--border-color-error:#ef4444;--bg-color:#ffffff;--bg-color-error:#fef2f2;}
#${wrapper.id} .custom-input-wrapper{width:100%;margin-top:4px;margin-bottom:10px;}
#${wrapper.id} .custom-input-label{font-size:0.8125rem;font-weight:500;color:#6b7280;margin:0 0 6px 0;display:block;}
#${wrapper.id} .custom-input{padding:10px 12px;font-size:16px;border:1.5px solid var(--border-color);border-radius:7px;background:var(--bg-color);width:100%;transition:all 0.2s cubic-bezier(0.4,0,0.2,1);color:#111827;font-weight:400;box-shadow:0 1px 2px rgba(0,0,0,0.05);height:48px;box-sizing:border-box;outline:none;font-family:inherit;}
#${wrapper.id} .custom-input:focus{border-color:var(--border-color-focus);box-shadow:0 0 0 2px color-mix(in srgb,var(--border-color-focus) 12%,transparent);}
#${wrapper.id} .custom-input.error{border-color:var(--border-color-error);background:var(--bg-color-error);}
#${wrapper.id} .custom-input::placeholder{color:#9ca3af;}
`;
    document.head.appendChild(styleTag);
    let selectedValue = input.value || "";
    let isCustomMode = false;
    function checkIfCustom(value) {
      return !!value && !options.some((opt) => opt.value === value);
    }
    if (input.value)
      isCustomMode = checkIfCustom(input.value);
    const customInputLabel = document.createElement("label");
    customInputLabel.className = "custom-input-label";
    customInputLabel.textContent = lang === "pt" ? "Especifique:" : "Please specify:";
    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.id = `${wrapper.id}-other`;
    customInputLabel.htmlFor = customInput.id;
    customInput.className = "custom-input";
    customInput.placeholder = otherPlaceholder;
    customInput.maxLength = 100;
    customInput.value = isCustomMode ? input.value : "";
    const customInputWrapper = document.createElement("div");
    customInputWrapper.className = "custom-input-wrapper";
    customInputWrapper.style.display = isCustomMode ? "block" : "none";
    customInputWrapper.appendChild(customInputLabel);
    customInputWrapper.appendChild(customInput);
    const dropdown = CustomDropdown({
      styles: COMPACT_DROPDOWN_STYLES$1,
      placeholder: lang === "pt" ? "Selecione como nos conheceu" : "Select how you found us",
      options,
      value: isCustomMode ? "" : selectedValue,
      id: `channel-dropdown-${Date.now()}`,
      onChange: (newValue) => {
        if (newValue === otherValue) {
          isCustomMode = true;
          customInputWrapper.style.display = "block";
          customInput.focus();
          selectedValue = "";
          triggerReactInput(input, "");
        } else {
          isCustomMode = false;
          customInputWrapper.style.display = "none";
          customInput.value = "";
          selectedValue = newValue;
          triggerReactInput(input, newValue);
        }
        dropdown.setError(false);
      }
    });
    customInput.addEventListener("input", (e) => {
      const customValue = e.target.value.trim();
      selectedValue = customValue;
      triggerReactInput(input, customValue);
      customInput.classList.remove("error");
    });
    customInput.addEventListener("blur", () => {
      customInput.classList.toggle("error", isCustomMode && !customInput.value.trim());
    });
    if (isCustomMode && input.value)
      dropdown.setValue("");
    else if (input.value)
      dropdown.setValue(input.value);
    decorateCompactDropdown(dropdown, "channel");
    wrapper.appendChild(dropdown);
    wrapper.appendChild(customInputWrapper);
    input.parentElement.insertBefore(wrapper, input);
  }
  const MODAL_CONTENT = {
    title: {
      pt: "⚠️ Aviso Importante",
      en: "⚠️ Important Notice"
    },
    subtitle: {
      pt: "Acesso à RDS Rio Negro",
      en: "Access to RDS Rio Negro"
    },
    content: {
      pt: [
        { type: "paragraph", text: "A Caboclos House está localizada dentro da Reserva de Desenvolvimento Sustentável(RDS)Rio Negro,uma área ambiental protegida." },
        { type: "paragraph", text: "Conforme o Decreto nº 30.873/2010,a entrada e permanência na reserva exigem autorização prévia do órgão ambiental responsável." },
        { type: "highlight", text: "Após a confirmação da sua reserva,entraremos em contato para solicitar informações e documentos necessários à emissão da autorização de acesso." },
        { type: "paragraph", text: "Esse procedimento é obrigatório,gratuito e tem como objetivo contribuir para a preservação da região." },
        { type: "footerNote", text: "Agradecemos pela compreensão e por ajudar a proteger a Amazônia." }
      ],
      en: [
        { type: "paragraph", text: "Caboclos House is located within the Rio Negro Sustainable Development Reserve(RDS),a protected environmental area." },
        { type: "paragraph", text: "According to Decree No. 30.873/2010,entry and stay in the reserve require prior authorization from the responsible environmental agency." },
        { type: "highlight", text: "After confirming your reservation,we will contact you to request the information and documents necessary for issuing the access authorization." },
        { type: "paragraph", text: "This procedure is mandatory,free of charge,and aims to contribute to the preservation of the region." },
        { type: "footerNote", text: "We thank you for your understanding and for helping to protect the Amazon." }
      ]
    },
    buttonText: {
      pt: "Entendi",
      en: "I Understand"
    },
    closeButtonLabel: {
      pt: "Fechar modal",
      en: "Close modal"
    }
  };
  const MODAL_STYLES = {
    overlay: 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s ease;backdrop-filter:blur(2px);font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    container: 'background:white;border-radius:16px;max-width:560px;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);transform:scale(0.95)translateY(20px);transition:transform 0.3s ease,opacity 0.3s ease;position:relative;opacity:0;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    header: "display:flex;justify-content:space-between;align-items:center;padding:20px 24px 16px 24px;border-bottom:1px solid #f0f0f0;",
    title: 'font-size:1.25rem;font-weight:600;color:#1a1a1a;margin:0;display:flex;align-items:center;gap:10px;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    icon: "font-size:1.5rem;line-height:1;",
    closeButton: "background:none;border:none;font-size:28px;color:#999;cursor:pointer;line-height:1;padding:4px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:8px;transition:all 0.2s ease;",
    content: "padding:28px 24px;",
    subtitle: 'font-size:1.1rem;font-weight:600;color:#1a1a1a;margin:0 0 16px 0;line-height:1.4;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    paragraph: 'font-size:0.95rem;color:#555;margin:0 0 16px 0;line-height:1.7;text-align:left;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:400;',
    highlight: "background:#e8f4f8;border-left:4px solid #32c0a0;padding:12px 16px;border-radius:6px;margin:16px 0;",
    highlightText: 'font-size:0.95rem;color:#333;margin:0;line-height:1.7;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:400;',
    footerNote: 'font-size:0.9rem;color:#666;margin:20px 0 0 0;line-height:1.6;font-style:italic;text-align:center;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-weight:400;',
    footer: "padding:16px 24px 24px 24px;border-top:1px solid #f0f0f0;display:flex;justify-content:flex-end;",
    button: 'background:#32c0a0;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:all 0.2s ease;font-family:Poppins,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    buttonHover: "background:#28a085;transform:translateY(-1px);box-shadow:0 4px 12px rgba(50,192,160,0.3);"
  };
  function isFormLoaded() {
    const firstName = document.querySelector(SELECTORS.firstName);
    const lastName = document.querySelector(SELECTORS.lastName);
    const cpfInput = document.querySelector(SELECTORS.cpfInput);
    return !!(firstName && lastName && cpfInput);
  }
  function createModal() {
    if (document.getElementById("custom-modal"))
      return;
    const lang = detectPageLanguage() ? "en" : "pt";
    const overlay = document.createElement("div");
    overlay.id = "custom-modal-overlay";
    overlay.style.cssText = MODAL_STYLES.overlay;
    const modal = document.createElement("div");
    modal.id = "custom-modal";
    modal.style.cssText = MODAL_STYLES.container;
    const header = document.createElement("div");
    header.style.cssText = MODAL_STYLES.header;
    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = MODAL_STYLES.title;
    const icon = document.createElement("span");
    icon.innerHTML = "⚠️";
    icon.style.cssText = MODAL_STYLES.icon;
    const title = document.createElement("span");
    title.textContent = MODAL_CONTENT.title[lang].replace("⚠️ ", "");
    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.cssText = MODAL_STYLES.closeButton;
    closeButton.setAttribute("aria-label", MODAL_CONTENT.closeButtonLabel[lang]);
    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.background = "#f5f5f5";
      closeButton.style.color = "#333";
    });
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.background = "none";
      closeButton.style.color = "#999";
    });
    const content = document.createElement("div");
    content.style.cssText = MODAL_STYLES.content;
    const subtitle = document.createElement("h3");
    subtitle.textContent = MODAL_CONTENT.subtitle[lang];
    subtitle.style.cssText = MODAL_STYLES.subtitle;
    content.appendChild(subtitle);
    MODAL_CONTENT.content[lang].forEach((item) => {
      if (item.type === "highlight") {
        const highlightContainer = document.createElement("div");
        highlightContainer.style.cssText = MODAL_STYLES.highlight;
        const highlightText = document.createElement("p");
        highlightText.textContent = item.text;
        highlightText.style.cssText = MODAL_STYLES.highlightText;
        highlightContainer.appendChild(highlightText);
        content.appendChild(highlightContainer);
      } else if (item.type === "footerNote") {
        const footerNote = document.createElement("p");
        footerNote.textContent = item.text;
        footerNote.style.cssText = MODAL_STYLES.footerNote;
        content.appendChild(footerNote);
      } else {
        const paragraph = document.createElement("p");
        paragraph.textContent = item.text;
        paragraph.style.cssText = MODAL_STYLES.paragraph;
        content.appendChild(paragraph);
      }
    });
    const footer = document.createElement("div");
    footer.style.cssText = MODAL_STYLES.footer;
    const confirmButton = document.createElement("button");
    confirmButton.textContent = MODAL_CONTENT.buttonText[lang];
    confirmButton.style.cssText = MODAL_STYLES.button;
    confirmButton.addEventListener("mouseenter", () => {
      confirmButton.style.cssText = `${MODAL_STYLES.button};${MODAL_STYLES.buttonHover}`;
    });
    confirmButton.addEventListener("mouseleave", () => {
      confirmButton.style.cssText = MODAL_STYLES.button;
    });
    header.appendChild(titleContainer);
    header.appendChild(closeButton);
    footer.appendChild(confirmButton);
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    function closeModal() {
      overlay.style.opacity = "0";
      modal.style.opacity = "0";
      modal.style.transform = "scale(0.95)translateY(20px)";
      setTimeout(() => {
        var _a;
        return (_a = overlay.parentNode) == null ? void 0 : _a.removeChild(overlay);
      }, 300);
    }
    closeButton.addEventListener("click", closeModal);
    confirmButton.addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay)
        closeModal();
    });
    function escHandler(e) {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    }
    document.addEventListener("keydown", escHandler);
    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.opacity = "1";
      modal.style.transform = "scale(1)translateY(0)";
    }, 10);
  }
  function initializeModalPopup() {
    if (isInitialized(document.body, "modalInitialized"))
      return;
    if (!isFormLoaded()) {
      setTimeout(() => {
        if (!isInitialized(document.body, "modalInitialized") && isFormLoaded()) {
          markAsInitialized(document.body, "modalInitialized");
          createModal();
        }
      }, 500);
      return;
    }
    markAsInitialized(document.body, "modalInitialized");
    createModal();
  }
  const initializers = [
    initializeRestrictionsField,
    initializeCPFField,
    initializeTaxNumberField,
    initializeLanguageDropdown,
    initializeBirthDateField,
    initializeAdditionalBirthDates,
    initializeDocumentTypeDropdown,
    initializeRouteSelect,
    initializeChildrenField,
    initializeGuestsField,
    initializeFieldsLayout,
    adjustCPFLabel,
    initializeEmergencyContactField,
    initializeTransferInField,
    initializeTransferOutField,
    initializeChannelField,
    initializeObservationsField,
    initializeModalPopup
  ];
  function runInitializers() {
    initializers.forEach((initializer) => {
      try {
        initializer();
      } catch (error) {
        console.warn("Erro ao executar inicializador:", error);
      }
    });
  }
  const debouncedRun = debounce$1(runInitializers, 100);
  function init() {
    runInitializers();
    new MutationObserver(debouncedRun).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else
    init();
})();
