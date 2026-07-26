(function() {
  "use strict";
  const BASE_STYLES = {
    error: "color:var(--pinx-error);font-size:0.8125rem;font-weight:500;margin-top:4px;display:none",
    select: "width:100%;min-height:44px;padding:10px 12px;border-radius:var(--pinx-radius-small);border:1px solid var(--pinx-border-strong);background:var(--pinx-surface);color:var(--pinx-text);font-family:var(--pinx-font-body);font-size:0.9375rem"
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
  function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
  function isInitialized(element, flag) {
    return !!element && element.dataset[flag] === "true";
  }
  function markAsInitialized(element, flag) {
    if (element)
      element.dataset[flag] = "true";
  }
  const SELECTORS = {
    cpfInput: 'input[data-testid="form-custom-field-cf_p176878i174377078310-input"]',
    languageInput: 'input[data-testid="form-custom-field-cf_idioma-input"]',
    birthDateInput: 'input[data-testid="form-custom-field-cf_p176878i174377093000-input"]',
    documentTypeInput: "#cf_p176878i174377087477-input",
    routeInput: 'input[data-testid="form-custom-field-cf_roteiro-input"]',
    firstName: '[data-testid="guest-form-first-name-input"]',
    lastName: '[data-testid="guest-form-last-name-input"]',
    detailsButton: 'button[data-testid="shopping-cart-summary-toggle-details-button"]',
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
  function initializeCPFField() {
    const input = document.querySelector(SELECTORS.cpfInput);
    if (!input || isInitialized(input, "validatorApplied"))
      return;
    markAsInitialized(input, "validatorApplied");
    const isEnglish = detectPageLanguage();
    const errorElement = createErrorElement("cpf-passport-error", input.parentElement);
    input.addEventListener("input", (e) => {
      const target = e.target;
      const value = target.value;
      if (hasInvalidTerms(value)) {
        showError(errorElement, isEnglish ? "Invalid" : "Invalido");
        triggerReactInput(target, value);
        return;
      }
      const numbers = value.replace(/\D/g, "");
      if (numbers.length === 11) {
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
    },
    route: {
      getOptions(totalNights, isEnglish) {
        const options = [];
        const days = totalNights + 1;
        if (isEnglish) {
          options.push({ text: "Select your Package", value: "", label: "Select your Package", badge: null, days: 0, nights: 0 });
          if (totalNights >= 6) {
            options.push({ text: `Imersion ${days} Days and ${totalNights} Nights`, value: "Imersão", label: "Imersion", badge: `${days} Days and ${totalNights} Nights`, days, nights: totalNights });
          } else {
            options.push({ text: `Connection ${days} Days and ${totalNights} Nights`, value: "Conexão", label: "Connection", badge: `${days} Days and ${totalNights} Nights`, days, nights: totalNights });
            options.push({ text: `Wild ${days} Days and ${totalNights} Nights`, value: "Selvagem", label: "Wild", badge: `${days} Days and ${totalNights} Nights`, days, nights: totalNights });
          }
        } else {
          options.push({ text: "Selecione o Roteiro", value: "", label: "Selecione o Roteiro", badge: null, days: 0, nights: 0 });
          if (totalNights >= 6) {
            options.push({ text: `Imersão ${days} Dias e ${totalNights} Noites`, value: "Imersão", label: "Imersão", badge: `${days} Dias e ${totalNights} Noites`, days, nights: totalNights });
          } else {
            options.push({ text: `Conexão ${days} Dias e ${totalNights} Noites`, value: "Conexão", label: "Conexão", badge: `${days} Dias e ${totalNights} Noites`, days, nights: totalNights });
            options.push({ text: `Selvagem ${days} Dias e ${totalNights} Noites`, value: "Selvagem", label: "Selvagem", badge: `${days} Dias e ${totalNights} Noites`, days, nights: totalNights });
          }
        }
        return options;
      },
      // NOTE: same "pt|en" pipe artifact as documentType.errorMessage — the
      // two halves are swapped depending on isEnglish, but never split.
      getErrorMessage(isEnglish) {
        return isEnglish ? "The 'Imersion' package requires at least 6 nights.|Roteiro 'Imersão' exige no mínimo 6 noites." : "Roteiro 'Imersão' exige no mínimo 6 noites.|The 'Imersion' package requires at least 6 nights.";
      }
    }
  };
  const DEFAULT_STYLES = {
    wrapper: "position:relative;width:100%;",
    button: "padding:12px 14px;font-family:var(--pinx-font-body);font-size:0.9375rem;border:1px solid var(--pinx-border-strong);border-radius:var(--pinx-radius-small);background:var(--pinx-surface);width:100%;transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease;color:var(--pinx-text);font-weight:400;box-shadow:var(--pinx-shadow-sm);display:flex;align-items:center;justify-content:space-between;min-height:46px;cursor:pointer;",
    buttonPlaceholder: "color:var(--pinx-text-tertiary);",
    buttonActive: "border-color:var(--pinx-primary);box-shadow:0 0 0 3px var(--pinx-primary-ring);",
    buttonHover: "border-color:var(--pinx-primary);background:var(--pinx-hover);",
    buttonError: "border-color:var(--pinx-error);background:var(--pinx-error-soft);",
    buttonContent: "display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;",
    buttonLeft: "display:flex;align-items:center;flex:1;min-width:0;",
    badge: "background:var(--pinx-primary-soft);color:var(--pinx-primary-strong);padding:5px 10px;border-radius:999px;font-size:0.75rem;font-weight:600;white-space:nowrap;border:1px solid var(--pinx-primary);",
    dropdown: "position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius);box-shadow:var(--pinx-shadow-md);z-index:1000;max-height:240px;overflow-y:auto;display:none;opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;",
    dropdownOpen: "display:block;opacity:1;transform:translateY(0);",
    option: "padding:11px 14px;font-family:var(--pinx-font-body);font-size:0.9375rem;color:var(--pinx-text);cursor:pointer;transition:background-color .15s ease,color .15s ease;border-bottom:1px solid var(--pinx-border);display:flex;align-items:center;justify-content:space-between;gap:12px;",
    optionLeft: "display:flex;align-items:center;flex:1;min-width:0;",
    optionBadge: "background:var(--pinx-primary-soft);color:var(--pinx-primary-strong);padding:4px 9px;border-radius:999px;font-size:0.75rem;font-weight:600;white-space:nowrap;border:1px solid var(--pinx-primary);",
    optionHover: "background:var(--pinx-hover);color:var(--pinx-primary-strong);",
    optionSelected: "background:var(--pinx-primary-soft);color:var(--pinx-primary-strong);font-weight:600;",
    icon: "width:20px;height:20px;color:var(--pinx-text-tertiary);transition:transform .18s ease,color .18s ease;flex-shrink:0;",
    iconOpen: "transform:rotate(180deg);color:var(--pinx-primary);"
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
    const mergedStyles = { ...DEFAULT_STYLES, ...styles };
    const finalStyles = {
      ...mergedStyles,
      button: `${mergedStyles.button};box-sizing:border-box;`,
      dropdown: `${mergedStyles.dropdown};box-sizing:border-box;`
    };
    const wrapper = document.createElement("div");
    wrapper.style.cssText = finalStyles.wrapper;
    wrapper.id = id;
    const container = document.createElement("div");
    container.style.cssText = "position:relative;width:100%;";
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-haspopup", "listbox");
    button.setAttribute("aria-expanded", "false");
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
      buttonText.style.color = "var(--pinx-text-tertiary)";
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
    dropdown.id = `${id}-listbox`;
    dropdown.setAttribute("role", "listbox");
    button.setAttribute("aria-controls", dropdown.id);
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
        const selected = opt.dataset.value === selectedValue;
        opt.style.cssText = selected ? `${finalStyles.option};${finalStyles.optionSelected}` : finalStyles.option;
        opt.setAttribute("aria-selected", String(selected));
      });
    }
    options.forEach((option) => {
      const optionElement = document.createElement("div");
      optionElement.style.cssText = value === option.value ? `${finalStyles.option};${finalStyles.optionSelected}` : finalStyles.option;
      optionElement.dataset.value = option.value;
      optionElement.setAttribute("role", "option");
      optionElement.setAttribute("aria-selected", String(value === option.value));
      optionElement.tabIndex = 0;
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
      function selectOption() {
        buttonText.textContent = option.label || option.text;
        buttonText.style.color = "var(--pinx-text)";
        button.style.cssText = finalStyles.button;
        syncBadge(option);
        syncOptionSelection(option.value);
        closeDropdown();
        onChange(option.value, option);
      }
      optionElement.addEventListener("click", selectOption);
      optionElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption();
          button.focus();
        } else if (e.key === "Escape") {
          closeDropdown();
          button.focus();
        }
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
      button.setAttribute("aria-expanded", "true");
      dropdown.style.cssText = `${finalStyles.dropdown};${finalStyles.dropdownOpen}`;
      icon.style.cssText = `${finalStyles.icon};${finalStyles.iconOpen}`;
      button.style.cssText = `${finalStyles.button};${finalStyles.buttonActive}`;
      setTimeout(() => document.addEventListener("click", closeOnOutsideClick), 0);
    }
    function closeDropdown() {
      isOpen = false;
      button.setAttribute("aria-expanded", "false");
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
    button.addEventListener("keydown", (e) => {
      var _a;
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeDropdown();
      } else if (e.key === "ArrowDown" && isOpen) {
        e.preventDefault();
        (_a = dropdown.querySelector('[role="option"]')) == null ? void 0 : _a.focus();
      }
    });
    container.appendChild(button);
    container.appendChild(dropdown);
    wrapper.appendChild(container);
    wrapper.setValue = (newValue) => {
      const option = options.find((opt) => opt.value === newValue);
      if (!option)
        return;
      buttonText.textContent = option.label || option.text;
      buttonText.style.color = "var(--pinx-text)";
      button.style.cssText = finalStyles.button;
      if (!newValue) {
        button.style.cssText += `;${finalStyles.buttonPlaceholder}`;
        buttonText.style.color = "var(--pinx-text-tertiary)";
      }
      syncBadge(option);
      syncOptionSelection(newValue);
    };
    wrapper.getValue = () => value;
    wrapper.setError = (hasError) => {
      button.style.borderColor = hasError ? "var(--pinx-error)" : "var(--pinx-border-strong)";
      button.style.background = hasError ? "var(--pinx-error-soft)" : "var(--pinx-surface)";
    };
    wrapper.setDisabled = (disabled) => {
      isDisabled = disabled;
      button.disabled = disabled;
      if (disabled) {
        button.style.cursor = "not-allowed";
        button.style.opacity = "0.6";
        button.style.background = "var(--pinx-surface-secondary)";
        button.style.color = "var(--pinx-text-tertiary)";
        if (isOpen)
          closeDropdown();
      } else {
        button.style.cursor = "pointer";
        button.style.opacity = "1";
        button.style.background = "var(--pinx-surface)";
        button.style.color = "var(--pinx-text)";
      }
    };
    wrapper.close = closeDropdown;
    return wrapper;
  }
  function initializeLanguageDropdown() {
    const input = document.querySelector(SELECTORS.languageInput);
    if (!input || isInitialized(input, "dropdownApplied"))
      return;
    markAsInitialized(input, "dropdownApplied");
    const isEnglish = detectPageLanguage();
    const mapper = DropdownMappers.language;
    const options = mapper.getOptions(isEnglish);
    const dropdownOptions = options.filter((opt) => opt.value !== "").map((opt) => ({ value: opt.value, text: opt.text }));
    const errorElement = createErrorElement("guide-language-error", input.parentElement);
    input.style.display = "none";
    const dropdown = CustomDropdown({
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
    if (input.value)
      dropdown.setValue(input.value);
    input.parentElement.insertBefore(dropdown, input);
  }
  function initializeBirthDateField() {
    const input = document.querySelector(SELECTORS.birthDateInput);
    if (!input || isInitialized(input, "maskApplied"))
      return;
    markAsInitialized(input, "maskApplied");
    const isEnglish = detectPageLanguage();
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("maxlength", "10");
    const errorElement = createErrorElement("birth-date-error", input.parentElement);
    input.addEventListener("input", (e) => {
      const target = e.target;
      const numbers = target.value.replace(/\D/g, "").slice(0, 8);
      let formatted = "";
      if (numbers.length > 0)
        formatted = numbers.slice(0, 2);
      if (numbers.length >= 3)
        formatted += `/${numbers.slice(2, 4)}`;
      if (numbers.length >= 5)
        formatted += `/${numbers.slice(4, 8)}`;
      triggerReactInput(target, formatted);
      if (formatted.length === 10) {
        if (!isValidBirthDate(formatted))
          showError(errorElement, isEnglish ? "Invalid date or age not allowed." : "Data inválida ou idade não permitida.");
        else
          hideError(errorElement);
      } else {
        hideError(errorElement);
      }
    });
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
  function createRouteDropdown(input, totalNights) {
    var _a;
    const parent = input.parentElement;
    if (!parent)
      return;
    const existingDropdowns = Array.from(parent.querySelectorAll('[id^="route-dropdown-"]'));
    if (existingDropdowns.length > 0) {
      if (existingDropdowns.length > 1)
        existingDropdowns.slice(1).forEach((dup) => dup.remove());
      input.style.display = "none";
      markAsInitialized(input, "routeApplied");
      return;
    }
    markAsInitialized(input, "routeApplied");
    const isEnglish = detectPageLanguage();
    const mapper = DropdownMappers.route;
    const routeOptions = mapper.getOptions(totalNights, isEnglish);
    const dropdownOptions = routeOptions.filter((opt) => opt.value !== "");
    const placeholder = ((_a = routeOptions.find((opt) => opt.value === "")) == null ? void 0 : _a.text) || (isEnglish ? "Select your Package" : "Selecione o Roteiro");
    const errorElement = createErrorElement("route-error", input.parentElement);
    const initialValue = input.value || "";
    const customDropdown = CustomDropdown({
      placeholder,
      options: dropdownOptions,
      value: initialValue,
      id: `route-dropdown-${Date.now()}`,
      onChange: (value) => {
        if (value === "Imersão" && totalNights < 6) {
          customDropdown.setError(true);
          showError(errorElement, mapper.getErrorMessage(isEnglish));
          triggerReactInput(input, "");
        } else {
          customDropdown.setError(false);
          hideError(errorElement);
          triggerReactInput(input, value);
        }
      }
    });
    input.style.display = "none";
    input.parentElement.insertBefore(customDropdown, input);
    if (initialValue)
      customDropdown.setValue(initialValue);
  }
  function initializeRouteSelect() {
    const input = document.querySelector(SELECTORS.routeInput);
    if (!input || isInitialized(input, "routeApplied"))
      return;
    const totalNights = calculateNightsFromURL();
    if (totalNights !== null && totalNights >= 0)
      createRouteDropdown(input, totalNights);
  }
  const MAX_CHILD_AGE = 12;
  const FIELD_STYLE_SHEET$1 = `
#children-field-wrapper{--spacing-xs:4px;--spacing-sm:8px;--spacing-md:12px;--border-radius:var(--pinx-radius-small);--border-color:var(--pinx-border-strong);--border-color-focus:var(--pinx-primary);--border-color-error:var(--pinx-error);--text-color:var(--pinx-text);--bg-color:var(--pinx-surface);--bg-color-error:var(--pinx-error-soft);--accent:var(--pinx-primary);--accent-hover:var(--pinx-primary-strong);}
#children-field-wrapper .children-layout{display:flex;flex-direction:column;gap:var(--spacing-md);align-items:stretch;width:100%;}
@media(min-width:640px){#children-field-wrapper .children-layout{flex-direction:row;align-items:center;gap:var(--spacing-md);}}
#children-field-wrapper .stepper{display:flex;align-items:center;gap:var(--spacing-sm);background:var(--bg-color);border:1px solid var(--border-color);border-radius:var(--pinx-radius);padding:4px;transition:border-color .18s ease,box-shadow .18s ease;box-shadow:var(--pinx-shadow-sm);min-height:36px;width:100%;justify-content:space-between;}
@media(min-width:640px){#children-field-wrapper .stepper{width:auto;justify-content:center;}}
#children-field-wrapper .stepper-btn{width:28px;height:28px;border:none;background:var(--accent);color:white;font-size:1.1rem;font-weight:500;line-height:1;border-radius:var(--pinx-radius-small);cursor:pointer;transition:background-color .18s ease,transform .18s ease;display:flex;align-items:center;justify-content:center;user-select:none;box-shadow:var(--pinx-shadow-sm);flex-shrink:0;}
#children-field-wrapper .stepper-btn:hover:not(:disabled){background:var(--accent-hover);transform:translateY(-1px);}
#children-field-wrapper .stepper-btn:active:not(:disabled){transform:translateY(0);}
#children-field-wrapper .stepper-btn:disabled{background:var(--pinx-surface-secondary);color:var(--pinx-text-tertiary);cursor:not-allowed;transform:none;box-shadow:none;}
#children-field-wrapper .stepper-count{min-width:32px;text-align:center;font-weight:600;font-size:0.875rem;color:var(--text-color);padding:0 6px;}
#children-field-wrapper .ages-container{display:grid;gap:var(--spacing-sm);flex:1;min-width:0;width:100%;grid-template-columns:1fr;}
#children-field-wrapper .ages-container.cols-2{grid-template-columns:repeat(2,1fr);}
#children-field-wrapper .ages-container.cols-3{grid-template-columns:repeat(3,1fr);}
#children-field-wrapper .ages-container.cols-4{grid-template-columns:repeat(4,1fr);}
@media(max-width:640px){#children-field-wrapper .ages-container{width:100%;}#children-field-wrapper .ages-container.cols-2,#children-field-wrapper .ages-container.cols-3,#children-field-wrapper .ages-container.cols-4{grid-template-columns:1fr;}}
#children-field-wrapper .error-text{color:var(--pinx-error);font-size:0.75rem;margin-top:var(--spacing-xs);font-weight:500;display:none;}
#children-field-wrapper .error-text.show{display:block;}
#children-field-wrapper.has-error{border:1px solid var(--border-color-error);border-radius:var(--pinx-radius);padding:var(--spacing-md);background:var(--bg-color-error);}
`;
  const COMPACT_DROPDOWN_STYLES$1 = {
    button: "padding:8px 10px;font-family:var(--pinx-font-body);font-size:0.8125rem;border:1px solid var(--pinx-border-strong);border-radius:var(--pinx-radius-small);background:var(--pinx-surface);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--pinx-text);font-weight:400;box-shadow:var(--pinx-shadow-sm);display:flex;align-items:center;justify-content:space-between;min-height:36px;cursor:pointer;",
    buttonPlaceholder: "color:var(--pinx-text-tertiary);",
    buttonActive: "border-color:var(--pinx-primary);box-shadow:0 0 0 3px var(--pinx-primary-ring);",
    buttonHover: "border-color:var(--pinx-primary);background:var(--pinx-hover);",
    dropdown: "position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius-small);box-shadow:var(--pinx-shadow-md);z-index:1000;max-height:180px;overflow-y:auto;display:none;opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;",
    option: "padding:8px 10px;font-size:0.8125rem;color:var(--pinx-text);cursor:pointer;transition:background-color .15s ease;border-bottom:1px solid var(--pinx-border);"
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
    styleTag.textContent = FIELD_STYLE_SHEET$1;
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
          styles: COMPACT_DROPDOWN_STYLES$1,
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
  const EMERGENCY_CONTACT_LABELS = {
    pt: {
      name: "Nome",
      relationship: "Parentesco",
      phone: "Telefone",
      namePlaceholder: "Primeiro nome",
      phonePlaceholder: "Apenas números",
      nameError: "Nome é obrigatório",
      relationshipError: "Parentesco é obrigatório",
      phoneError: "Telefone é obrigatório"
    },
    en: {
      name: "Name",
      relationship: "Relationship",
      phone: "Phone",
      namePlaceholder: "First name",
      phonePlaceholder: "Numbers only",
      nameError: "Name is required",
      relationshipError: "Relationship is required",
      phoneError: "Phone is required"
    }
  };
  const FIELD_STYLE_SHEET = `
#emergency-contact-wrapper{--spacing-xs:2px;--spacing-sm:6px;--border-radius:var(--pinx-radius-small);--border-color:var(--pinx-border-strong);--border-color-focus:var(--pinx-primary);--border-color-error:var(--pinx-error);--text-color:var(--pinx-text);--text-color-placeholder:var(--pinx-text-tertiary);--bg-color:var(--pinx-surface);--bg-color-error:var(--pinx-error-soft);--shadow:var(--pinx-shadow-sm);--shadow-focus:0 0 0 3px var(--pinx-primary-ring);}
#emergency-contact-wrapper .fields-compact{display:flex;flex-direction:column;gap:10px;}
@media(min-width:640px){#emergency-contact-wrapper .fields-compact{flex-direction:row;gap:8px;align-items:flex-start;}#emergency-contact-wrapper .field-group.field-name{flex:1.2;min-width:0;}#emergency-contact-wrapper .field-group.field-relationship{flex:1;min-width:0;}#emergency-contact-wrapper .field-group.field-phone{flex:1.3;min-width:0;}}
#emergency-contact-wrapper .field-group{display:flex;flex-direction:column;gap:var(--spacing-xs);position:relative;}
#emergency-contact-wrapper .field-label{font-size:0.75rem;font-weight:500;color:var(--pinx-text-secondary);margin:0;line-height:1.2;white-space:nowrap;}
#emergency-contact-wrapper .field-input{padding:8px 10px;font-family:var(--pinx-font-body);font-size:0.8125rem;border:1px solid var(--border-color);border-radius:var(--border-radius);background:var(--bg-color);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--text-color);font-weight:400;box-shadow:var(--shadow);min-height:36px;box-sizing:border-box;outline:none;}
#emergency-contact-wrapper .field-input::placeholder{color:var(--text-color-placeholder);}
#emergency-contact-wrapper .field-input:focus{border-color:var(--border-color-focus);box-shadow:var(--shadow-focus);}
#emergency-contact-wrapper .field-input.error{border-color:var(--border-color-error);background:var(--bg-color-error);}
#emergency-contact-wrapper .field-error{color:var(--pinx-error);font-size:0.7rem;margin-top:2px;font-weight:500;display:none;line-height:1.2;white-space:nowrap;}
#emergency-contact-wrapper .field-error.show{display:block;}
`;
  const COMPACT_DROPDOWN_STYLES = {
    button: "padding:8px 10px;font-family:var(--pinx-font-body);font-size:0.8125rem;border:1px solid var(--pinx-border-strong);border-radius:var(--pinx-radius-small);background:var(--pinx-surface);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--pinx-text);font-weight:400;box-shadow:var(--pinx-shadow-sm);display:flex;align-items:center;justify-content:space-between;min-height:36px;cursor:pointer;",
    buttonPlaceholder: "color:var(--pinx-text-tertiary);",
    buttonActive: "border-color:var(--pinx-primary);box-shadow:0 0 0 3px var(--pinx-primary-ring);",
    buttonHover: "border-color:var(--pinx-primary);background:var(--pinx-hover);",
    dropdown: "position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius-small);box-shadow:var(--pinx-shadow-md);z-index:1000;max-height:200px;overflow-y:auto;display:none;opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;",
    option: "padding:10px 12px;font-size:0.8125rem;color:var(--pinx-text);cursor:pointer;transition:background-color .15s ease;border-bottom:1px solid var(--pinx-border);display:flex;align-items:center;justify-content:space-between;gap:12px;"
  };
  function createField(labelText, inputElement, errorText, extraClass = "") {
    const container = document.createElement("div");
    container.className = `field-group ${extraClass}`.trim();
    const label = document.createElement("label");
    label.className = "field-label";
    label.textContent = labelText;
    const error = document.createElement("div");
    error.className = "field-error";
    error.textContent = errorText;
    container.appendChild(label);
    container.appendChild(inputElement);
    container.appendChild(error);
    return { container, error };
  }
  function initializeEmergencyContactField() {
    const textarea = document.querySelector(SELECTORS.emergencyContactInput);
    if (!textarea || isInitialized(textarea, "emergencyContactApplied"))
      return;
    markAsInitialized(textarea, "emergencyContactApplied");
    const isEnglish = detectPageLanguage();
    const lang = isEnglish ? "en" : "pt";
    const labels = EMERGENCY_CONTACT_LABELS[lang];
    const relationshipOptions = EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS[lang];
    textarea.style.display = "none";
    const wrapper = document.createElement("div");
    wrapper.id = "emergency-contact-wrapper";
    wrapper.style.cssText = "width:100%;font-family:inherit;";
    const styleTag = document.createElement("style");
    styleTag.textContent = FIELD_STYLE_SHEET;
    document.head.appendChild(styleTag);
    const fieldsGrid = document.createElement("div");
    fieldsGrid.className = "fields-compact";
    let nameValue = "";
    let relationshipValue = "";
    let phoneValue = "";
    let nameTouched = false;
    let relationshipTouched = false;
    let phoneTouched = false;
    function parseExistingValue() {
      const existingValue = textarea.value.trim();
      if (!existingValue)
        return;
      const parts = existingValue.split("|").map((p) => p.trim());
      if (parts.length === 3) {
        nameValue = parts[0] || "";
        relationshipValue = parts[1] || "";
        phoneValue = parts[2] || "";
        if (nameValue)
          nameTouched = true;
        if (relationshipValue)
          relationshipTouched = true;
        if (phoneValue)
          phoneTouched = true;
      }
    }
    parseExistingValue();
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "field-input";
    nameInput.placeholder = labels.namePlaceholder;
    nameInput.value = nameValue;
    const nameField = createField(labels.name, nameInput, labels.nameError, "field-name");
    const relationshipDropdown = CustomDropdown({
      placeholder: labels.relationship,
      options: relationshipOptions,
      value: relationshipValue,
      id: `emergency-relationship-${Date.now()}`,
      styles: COMPACT_DROPDOWN_STYLES,
      onChange: (newValue) => {
        relationshipValue = newValue;
        relationshipTouched = true;
        relationshipDropdown.setError(false);
        updateHiddenInput();
        validateFields();
      }
    });
    const relationshipLabel = document.createElement("label");
    relationshipLabel.className = "field-label";
    relationshipLabel.textContent = labels.relationship;
    const relationshipError = document.createElement("div");
    relationshipError.className = "field-error";
    relationshipError.textContent = labels.relationshipError;
    const relationshipContainer = document.createElement("div");
    relationshipContainer.className = "field-group field-relationship";
    relationshipContainer.appendChild(relationshipLabel);
    relationshipContainer.appendChild(relationshipDropdown);
    relationshipContainer.appendChild(relationshipError);
    const phoneInput = document.createElement("input");
    phoneInput.type = "text";
    phoneInput.className = "field-input";
    phoneInput.inputMode = "numeric";
    phoneInput.placeholder = labels.phonePlaceholder;
    phoneInput.value = phoneValue;
    const phoneField = createField(labels.phone, phoneInput, labels.phoneError, "field-phone");
    nameInput.addEventListener("input", (e) => {
      nameValue = e.target.value.trim();
      nameInput.classList.remove("error");
      updateHiddenInput();
      if (nameTouched)
        validateFields();
    });
    nameInput.addEventListener("focus", () => nameInput.classList.remove("error"));
    nameInput.addEventListener("blur", () => {
      nameTouched = true;
      validateFields();
    });
    phoneInput.addEventListener("input", (e) => {
      const numbers = e.target.value.replace(/\D/g, "");
      phoneValue = numbers;
      phoneInput.value = numbers;
      phoneInput.classList.remove("error");
      updateHiddenInput();
      if (phoneTouched)
        validateFields();
    });
    phoneInput.addEventListener("focus", () => phoneInput.classList.remove("error"));
    phoneInput.addEventListener("blur", () => {
      phoneTouched = true;
      validateFields();
    });
    function updateHiddenInput() {
      const formatted = `${nameValue || ""} | ${relationshipValue || ""} | ${phoneValue || ""}`;
      triggerReactInput(textarea, formatted);
    }
    function validateFields() {
      let hasError = false;
      if (!nameValue || nameValue.length < 2) {
        if (nameTouched) {
          nameField.error.classList.add("show");
          nameInput.classList.add("error");
        }
        hasError = true;
      } else {
        nameField.error.classList.remove("show");
        nameInput.classList.remove("error");
      }
      if (!relationshipValue) {
        if (relationshipTouched) {
          relationshipError.classList.add("show");
          relationshipDropdown.setError(true);
        }
        hasError = true;
      } else {
        relationshipError.classList.remove("show");
        relationshipDropdown.setError(false);
      }
      if (!phoneValue || phoneValue.length < 8) {
        if (phoneTouched) {
          phoneField.error.classList.add("show");
          phoneInput.classList.add("error");
        }
        hasError = true;
      } else {
        phoneField.error.classList.remove("show");
        phoneInput.classList.remove("error");
      }
      return !hasError;
    }
    fieldsGrid.appendChild(nameField.container);
    fieldsGrid.appendChild(relationshipContainer);
    fieldsGrid.appendChild(phoneField.container);
    wrapper.appendChild(fieldsGrid);
    textarea.parentElement.insertBefore(wrapper, textarea);
    updateHiddenInput();
    if (nameTouched || relationshipTouched || phoneTouched)
      validateFields();
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
#${wrapperId}{--spacing-sm:8px;--spacing-md:12px;--border-radius:var(--pinx-radius-small);--border-color:var(--pinx-border-strong);--border-color-focus:var(--pinx-primary);--border-color-error:var(--pinx-error);--text-color:var(--pinx-text);--text-color-placeholder:var(--pinx-text-tertiary);--bg-color:var(--pinx-surface);--bg-color-error:var(--pinx-error-soft);--shadow:var(--pinx-shadow-sm);--shadow-focus:0 0 0 3px var(--pinx-primary-ring);}
#${wrapperId} .fields-row{display:flex;flex-direction:column;gap:var(--spacing-md);width:100%;}
@media(min-width:640px){#${wrapperId} .fields-row{flex-direction:row;gap:var(--spacing-md);align-items:flex-start;}#${wrapperId} .field-group.field-time{flex:0 0 180px;min-width:0;}#${wrapperId} .field-group.field-address{flex:1;min-width:0;}}
#${wrapperId} .field-group{display:flex;flex-direction:column;gap:6px;position:relative;}
#${wrapperId} .field-label{font-size:0.875rem;font-weight:500;color:var(--pinx-text-secondary);margin:0;}
#${wrapperId} .field-input{padding:12px 14px;font-size:0.9375rem;border:1px solid var(--border-color);border-radius:var(--border-radius);background:var(--bg-color);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--text-color);font-weight:400;box-shadow:var(--shadow);min-height:46px;box-sizing:border-box;outline:none;font-family:var(--pinx-font-body);}
#${wrapperId} .field-input::placeholder{color:var(--text-color-placeholder);}
#${wrapperId} .field-input:focus{border-color:var(--border-color-focus);box-shadow:var(--shadow-focus);}
#${wrapperId} .field-input.error{border-color:var(--border-color-error);background:var(--bg-color-error);}
#${wrapperId} .field-input:disabled{background:var(--pinx-surface-secondary);color:var(--pinx-text-tertiary);cursor:not-allowed;}
#${wrapperId} .field-error{color:var(--pinx-error);font-size:0.8125rem;margin-top:4px;font-weight:500;display:none;}
#${wrapperId} .field-error.show{display:block;}
#${wrapperId} .checkbox-container{display:flex;align-items:center;gap:8px;margin-top:8px;cursor:pointer;user-select:none;justify-content:flex-end;}
#${wrapperId} .checkbox-container input[type="checkbox"]{width:18px;height:18px;cursor:pointer;accent-color:var(--pinx-primary);}
#${wrapperId} .checkbox-container label{font-size:0.875rem;color:var(--pinx-text-secondary);cursor:pointer;margin:0;font-weight:400;}
#${wrapperId} .checkbox-container:hover label{color:var(--pinx-text);}
#${wrapperId} .time-dropdown-wrapper .tooltip{position:absolute;bottom:calc(100% + 16px);left:0;right:0;background:var(--pinx-warning-soft);border:1px solid var(--pinx-warning);border-radius:var(--pinx-radius);padding:12px 16px;font-size:0.8125rem;color:var(--pinx-text);box-shadow:var(--pinx-shadow-md);z-index:1001;opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .2s ease,transform .2s ease;line-height:1.5;cursor:pointer;}
#${wrapperId} .time-dropdown-wrapper .tooltip.show{opacity:1;pointer-events:auto;transform:translateY(0);}
#${wrapperId} .time-dropdown-wrapper .tooltip:hover{filter:brightness(.98);}
#${wrapperId} .field-group.field-time{position:relative;}
#${wrapperId} .time-dropdown-wrapper{position:relative;width:100%;}
#${wrapperId} .address-autocomplete-wrapper{position:relative;width:100%;}
#${wrapperId} .autocomplete-dropdown{position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius);box-shadow:var(--pinx-shadow-md);z-index:1000;max-height:300px;overflow-y:auto;display:none;opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;}
#${wrapperId} .autocomplete-dropdown.show{display:block;opacity:1;transform:translateY(0);}
#${wrapperId} .autocomplete-item{padding:12px 14px;cursor:pointer;transition:background-color .15s ease;border-bottom:1px solid var(--pinx-border);display:flex;flex-direction:column;gap:2px;}
#${wrapperId} .autocomplete-item:last-child{border-bottom:none;}
#${wrapperId} .autocomplete-item:hover{background:var(--pinx-hover);}
#${wrapperId} .autocomplete-item:hover .autocomplete-item-name{color:var(--pinx-primary-strong);}
#${wrapperId} .autocomplete-item.selected{background:var(--pinx-primary-soft);}
#${wrapperId} .autocomplete-item.selected .autocomplete-item-name{color:var(--pinx-primary-strong);font-weight:600;}
#${wrapperId} .autocomplete-item-name{font-size:0.9375rem;color:var(--pinx-text);font-weight:500;}
#${wrapperId} .autocomplete-item-address{font-size:0.8125rem;color:var(--pinx-text-secondary);}
#${wrapperId} .autocomplete-loading{padding:12px 16px;font-size:0.875rem;color:var(--pinx-text-secondary);text-align:center;}
`;
  }
  const TIME_DROPDOWN_STYLES = {
    button: "padding:12px 14px;font-family:var(--pinx-font-body);font-size:0.9375rem;border:1px solid var(--pinx-border-strong);border-radius:var(--pinx-radius-small);background:var(--pinx-surface);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--pinx-text);font-weight:400;box-shadow:var(--pinx-shadow-sm);display:flex;align-items:center;justify-content:space-between;min-height:46px;cursor:pointer;",
    buttonPlaceholder: "color:var(--pinx-text-tertiary);",
    buttonActive: "border-color:var(--pinx-primary);box-shadow:0 0 0 3px var(--pinx-primary-ring);",
    buttonHover: "border-color:var(--pinx-primary);background:var(--pinx-hover);",
    dropdown: "position:absolute;top:calc(100% + 6px);left:0;right:0;background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius);box-shadow:var(--pinx-shadow-md);z-index:1000;max-height:300px;overflow-y:auto;display:none;opacity:0;transform:translateY(-6px);transition:opacity .18s ease,transform .18s ease;",
    option: "padding:11px 14px;font-size:0.9375rem;color:var(--pinx-text);cursor:pointer;transition:background-color .15s ease;border-bottom:1px solid var(--pinx-border);"
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
    textarea.style.display = "none";
    const wrapper = document.createElement("div");
    wrapper.id = wrapperId;
    wrapper.style.cssText = "width:100%;font-family:inherit;";
    const styleTag = document.createElement("style");
    styleTag.textContent = buildStyleSheet(wrapperId);
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
      if (existingValue.toLowerCase().includes(sendLaterText.toLowerCase())) {
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
    wrapper.appendChild(checkboxContainer);
    textarea.parentElement.insertBefore(wrapper, textarea);
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
        pt: "Horários fora do padrão(08:00)estão sujeitos a taxa adicional de R$ 250 por trecho.",
        en: "Times outside the standard window(08:00 AM)are subject to an additional fee of R$ 250 per segment."
      }
    });
  }
  function initializeTransferOutField() {
    createTransferField({
      direction: "out",
      selector: SELECTORS.transferOutInput,
      defaultTime: "14:00",
      extraFeeTooltip: {
        pt: "Horários fora do padrão(14:00)estão sujeitos a taxa adicional de R$ 250 por trecho.",
        en: "Times outside the standard window(14:00)are subject to an additional fee of R$ 250 per segment."
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
#${wrapper.id}{--border-color:var(--pinx-border-strong);--border-color-focus:var(--pinx-primary);--border-color-error:var(--pinx-error);--bg-color:var(--pinx-surface);--bg-color-error:var(--pinx-error-soft);}
#${wrapper.id} .custom-input-wrapper{width:100%;margin-top:12px;}
#${wrapper.id} .custom-input-label{font-size:0.8125rem;font-weight:500;color:var(--pinx-text-secondary);margin:0 0 6px;display:block;}
#${wrapper.id} .custom-input{padding:12px 14px;font-size:0.9375rem;border:1px solid var(--border-color);border-radius:var(--pinx-radius-small);background:var(--bg-color);width:100%;transition:border-color .18s ease,box-shadow .18s ease;color:var(--pinx-text);font-weight:400;box-shadow:var(--pinx-shadow-sm);height:46px;box-sizing:border-box;outline:none;font-family:var(--pinx-font-body);}
#${wrapper.id} .custom-input:focus{border-color:var(--border-color-focus);box-shadow:0 0 0 3px var(--pinx-primary-ring);}
#${wrapper.id} .custom-input.error{border-color:var(--border-color-error);background:var(--bg-color-error);}
#${wrapper.id} .custom-input::placeholder{color:var(--pinx-text-tertiary);}
`;
    document.head.appendChild(styleTag);
    let selectedValue = input.value || "";
    let isCustomMode = false;
    function checkIfCustom(value) {
      return !!value && !options.some((opt) => opt.value === value);
    }
    if (input.value)
      isCustomMode = checkIfCustom(input.value);
    const customInputLabel = document.createElement("p");
    customInputLabel.className = "custom-input-label";
    customInputLabel.textContent = lang === "pt" ? "Especifique:" : "Please specify:";
    const customInput = document.createElement("input");
    customInput.type = "text";
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
    overlay: "position:fixed;inset:0;width:100%;height:100%;padding:20px;background:rgba(18,15,12,.62);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s ease;backdrop-filter:blur(4px);font-family:var(--pinx-font-body);box-sizing:border-box;",
    container: "background:var(--pinx-surface);border:1px solid var(--pinx-border);border-radius:var(--pinx-radius);max-width:600px;width:100%;max-height:calc(100vh - 40px);overflow-y:auto;box-shadow:0 24px 70px rgba(18,15,12,.34);transform:scale(.97) translateY(16px);transition:transform .25s ease,opacity .25s ease;position:relative;opacity:0;font-family:var(--pinx-font-body);color:var(--pinx-text);",
    header: "display:flex;justify-content:space-between;align-items:center;padding:20px 24px 16px;border-bottom:1px solid var(--pinx-border);",
    title: "font-size:1.375rem;line-height:1.3;font-weight:700;color:var(--pinx-text);margin:0;display:flex;align-items:center;gap:10px;font-family:var(--pinx-font-display);",
    icon: "font-size:1.5rem;line-height:1;",
    closeButton: "background:transparent;border:1px solid transparent;font-size:26px;color:var(--pinx-text-tertiary);cursor:pointer;line-height:1;padding:4px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:var(--pinx-radius-small);transition:background-color .18s ease,color .18s ease,border-color .18s ease;",
    content: "padding:28px 24px;",
    subtitle: "font-size:1.125rem;font-weight:600;color:var(--pinx-text);margin:0 0 16px;line-height:1.4;font-family:var(--pinx-font-display);",
    paragraph: "font-size:0.9375rem;color:var(--pinx-text-secondary);margin:0 0 16px;line-height:1.65;text-align:left;font-family:var(--pinx-font-body);font-weight:400;",
    highlight: "background:var(--pinx-primary-soft);border-left:4px solid var(--pinx-primary);padding:12px 16px;border-radius:var(--pinx-radius-small);margin:16px 0;",
    highlightText: "font-size:0.9375rem;color:var(--pinx-text);margin:0;line-height:1.65;font-family:var(--pinx-font-body);font-weight:500;",
    footerNote: "font-size:0.875rem;color:var(--pinx-text-tertiary);margin:20px 0 0;line-height:1.6;font-style:italic;text-align:center;font-family:var(--pinx-font-body);font-weight:400;",
    footer: "padding:16px 24px 24px;border-top:1px solid var(--pinx-border);display:flex;justify-content:flex-end;",
    button: "background:var(--pinx-primary);color:white;border:1px solid var(--pinx-primary);padding:11px 24px;border-radius:var(--pinx-radius);font-size:0.9375rem;font-weight:600;cursor:pointer;transition:background-color .18s ease,box-shadow .18s ease,transform .18s ease;font-family:var(--pinx-font-body);",
    buttonHover: "background:var(--pinx-primary-strong);border-color:var(--pinx-primary-strong);transform:translateY(-1px);box-shadow:0 6px 16px var(--pinx-primary-ring);"
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
      closeButton.style.background = "var(--pinx-hover)";
      closeButton.style.borderColor = "var(--pinx-border)";
      closeButton.style.color = "var(--pinx-text)";
    });
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.background = "transparent";
      closeButton.style.borderColor = "transparent";
      closeButton.style.color = "var(--pinx-text-tertiary)";
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
  const THEME_STYLE_ID = "pinx-booking-engine-theme";
  const FONT_LINK_ID = "pinx-booking-engine-fonts";
  const THEME_STYLE_SHEET = `
:root,
body.chakra-ui-light {
	--pinx-font-body:'Montserrat','Apple Color Emoji',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
	--pinx-font-display:'Playfair Display','Apple Color Emoji',Georgia,serif;
	--pinx-font-numeric:'Outfit','Apple Color Emoji',system-ui,-apple-system,sans-serif;
	--pinx-radius:8px;
	--pinx-radius-small:6px;
	--pinx-body-bg:rgb(247,244,237);
	--pinx-sidebar-bg:rgb(242,238,229);
	--pinx-surface:rgb(253,251,245);
	--pinx-surface-secondary:rgb(246,243,235);
	--pinx-text:rgb(36,36,36);
	--pinx-text-secondary:rgb(85,85,85);
	--pinx-text-tertiary:rgb(119,119,119);
	--pinx-border:rgb(231,224,210);
	--pinx-border-strong:rgb(217,209,191);
	--pinx-hover:rgba(163,181,90,.09);
	--pinx-primary:rgb(147,162,74);
	--pinx-primary-strong:rgb(117,132,48);
	--pinx-primary-soft:rgb(240,247,215);
	--pinx-primary-ring:rgba(147,162,74,.22);
	--pinx-info:rgb(90,140,181);
	--pinx-success:rgb(163,181,90);
	--pinx-warning:rgb(213,121,59);
	--pinx-warning-soft:rgb(255,246,231);
	--pinx-error:rgb(201,76,46);
	--pinx-error-soft:rgb(255,241,236);
	--pinx-shadow-sm:0 1px 2px rgba(58,48,36,.08);
	--pinx-shadow-md:0 8px 24px rgba(58,48,36,.12);
	--pinx-shadow-card:0 2px 10px rgba(58,48,36,.08);
}

body.chakra-ui-dark {
	--pinx-body-bg:rgb(18,15,12);
	--pinx-sidebar-bg:rgb(22,19,16);
	--pinx-surface:rgb(32,28,24);
	--pinx-surface-secondary:rgb(42,37,32);
	--pinx-text:rgb(245,238,228);
	--pinx-text-secondary:rgb(194,182,164);
	--pinx-text-tertiary:rgb(140,130,118);
	--pinx-border:rgb(56,50,43);
	--pinx-border-strong:rgb(74,66,57);
	--pinx-hover:rgba(163,181,90,.08);
	--pinx-primary:rgb(163,181,90);
	--pinx-primary-strong:rgb(197,213,130);
	--pinx-primary-soft:rgb(65,76,30);
	--pinx-primary-ring:rgba(163,181,90,.24);
	--pinx-info:rgb(107,163,204);
	--pinx-success:rgb(163,181,90);
	--pinx-warning:rgb(224,138,69);
	--pinx-warning-soft:rgb(66,43,25);
	--pinx-error:rgb(212,92,60);
	--pinx-error-soft:rgb(69,34,26);
	--pinx-shadow-sm:0 1px 2px rgba(0,0,0,.25);
	--pinx-shadow-md:0 8px 24px rgba(0,0,0,.32);
	--pinx-shadow-card:0 2px 10px rgba(0,0,0,.24);
}

html,
body {
	background:var(--pinx-body-bg)!important;
	color:var(--pinx-text)!important;
	font-family:var(--pinx-font-body)!important;
	font-size:15px;
	line-height:1.6;
	transition:background-color .2s ease,color .2s ease;
}

body :where(button,input,textarea,select) {
	font-family:var(--pinx-font-body)!important;
}

body :where(h1,h2,h3,h4) {
	color:var(--pinx-text)!important;
	font-family:var(--pinx-font-display)!important;
	letter-spacing:-.015em;
}

body h1 { font-size:30px!important;line-height:38px!important;font-weight:700!important; }
body h2 { font-size:26px!important;line-height:33px!important;font-weight:700!important; }
body h3 { font-size:22px!important;line-height:28px!important;font-weight:700!important; }
body h4 { font-size:18px!important;line-height:23px!important;font-weight:600!important; }
body h5 { font-size:14px!important;line-height:18px!important;font-weight:700!important; }
body h6 { font-size:12px!important;line-height:15px!important;font-weight:600!important; }

body :where(p,.chakra-text,label) {
	color:var(--pinx-text-secondary);
}

body > div > header,
body [role="banner"] {
	background:var(--pinx-sidebar-bg)!important;
	border-bottom:1px solid var(--pinx-border)!important;
	box-shadow:0 1px 0 rgba(58,48,36,.04)!important;
	color:var(--pinx-text)!important;
}

body :where(.cb-header,[data-testid="header"]) {
	background:var(--pinx-sidebar-bg)!important;
	color:var(--pinx-text)!important;
}

body :where(.cb-search-card,[data-testid="header-search-panel"]) {
	background:var(--pinx-surface)!important;
	border:1px solid var(--pinx-border)!important;
	border-radius:var(--pinx-radius)!important;
	box-shadow:var(--pinx-shadow-sm)!important;
}

body .cb-card,
body [class~="cb-card"] {
	background:var(--pinx-surface)!important;
	border:1px solid var(--pinx-border)!important;
	border-radius:var(--pinx-radius)!important;
	box-shadow:var(--pinx-shadow-card)!important;
	color:var(--pinx-text)!important;
}

body :where(.chakra-input,.chakra-select,.chakra-textarea,input:not([type="checkbox"]):not([type="radio"]),textarea,select) {
	background:var(--pinx-surface)!important;
	border-color:var(--pinx-border-strong)!important;
	border-radius:var(--pinx-radius-small)!important;
	box-sizing:border-box;
	color:var(--pinx-text)!important;
	box-shadow:var(--pinx-shadow-sm);
}

body :where(.chakra-input,.chakra-select,.chakra-textarea,input:not([type="checkbox"]):not([type="radio"]),textarea,select):focus {
	border-color:var(--pinx-primary)!important;
	box-shadow:0 0 0 3px var(--pinx-primary-ring)!important;
	outline:none!important;
}

body :where(input,textarea)::placeholder {
	color:var(--pinx-text-tertiary)!important;
	opacity:1;
}

body :where(input[type="checkbox"],input[type="radio"]) {
	accent-color:var(--pinx-primary);
}

body .chakra-button {
	border-radius:var(--pinx-radius)!important;
	transition:background-color .18s ease,border-color .18s ease,color .18s ease,box-shadow .18s ease,transform .18s ease!important;
}

body .chakra-button:hover:not(:disabled) {
	border-color:var(--pinx-primary)!important;
}

body :where(
	button[data-testid*="continue"],
	button[data-testid*="submit"],
	button[data-testid*="book"],
	button[data-testid*="checkout"],
	button[data-testid*="add-room"]
) {
	background:var(--pinx-primary)!important;
	border-color:var(--pinx-primary)!important;
	color:rgb(255,255,255)!important;
	box-shadow:var(--pinx-shadow-sm)!important;
}

body :where(
	button[data-testid*="continue"],
	button[data-testid*="submit"],
	button[data-testid*="book"],
	button[data-testid*="checkout"],
	button[data-testid*="add-room"]
):hover:not(:disabled) {
	background:var(--pinx-primary-strong)!important;
	transform:translateY(-1px);
}

body :where([role="alert"],.chakra-alert) {
	border-radius:var(--pinx-radius)!important;
}

body [data-testid="no-availability-message"] {
	background:var(--pinx-error-soft)!important;
	border:1px solid var(--pinx-error)!important;
	border-radius:var(--pinx-radius)!important;
	color:var(--pinx-text)!important;
}

body a {
	text-decoration-color:var(--pinx-primary);
	text-underline-offset:2px;
}

body a:hover {
	color:var(--pinx-primary-strong);
}

body hr {
	border-color:var(--pinx-border)!important;
}

body :where(.cb-language-selector,.cb-currency-selector) {
	color:var(--pinx-text)!important;
}

body :where([role="dialog"],[role="menu"],[role="listbox"],.chakra-popover__content,.chakra-menu__menu-list) {
	background:var(--pinx-surface)!important;
	border-color:var(--pinx-border)!important;
	color:var(--pinx-text)!important;
}

@media(max-width:640px) {
	body h1 { font-size:26px!important;line-height:33px!important; }
	body h2 { font-size:22px!important;line-height:28px!important; }
	body h3 { font-size:18px!important;line-height:23px!important; }
}

@media(prefers-reduced-motion:reduce) {
	*,*::before,*::after {
		scroll-behavior:auto!important;
		transition-duration:.01ms!important;
		animation-duration:.01ms!important;
		animation-iteration-count:1!important;
	}
}
`;
  function initializePinxTheme() {
    if (!document.getElementById(FONT_LINK_ID)) {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = "https://fonts.googleapis.com";
      document.head.appendChild(preconnect);
      const fontLink = document.createElement("link");
      fontLink.id = FONT_LINK_ID;
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Outfit:wght@400;500&family=Playfair+Display:wght@600;700&display=swap";
      document.head.appendChild(fontLink);
    }
    if (document.getElementById(THEME_STYLE_ID))
      return;
    const style = document.createElement("style");
    style.id = THEME_STYLE_ID;
    style.textContent = THEME_STYLE_SHEET;
    document.head.appendChild(style);
  }
  const initializers = [
    initializePinxTheme,
    initializeCPFField,
    initializeLanguageDropdown,
    initializeBirthDateField,
    initializeDocumentTypeDropdown,
    initializeRouteSelect,
    initializeChildrenField,
    initializeFieldsLayout,
    adjustCPFLabel,
    initializeEmergencyContactField,
    initializeTransferInField,
    initializeTransferOutField,
    initializeChannelField,
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
  const debouncedRun = debounce(runInitializers, 100);
  function init() {
    runInitializers();
    new MutationObserver(debouncedRun).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else
    init();
})();
