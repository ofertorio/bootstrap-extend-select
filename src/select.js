(function ($) {
    const pureElement = "select-extend";
    const selectSearch = "select-search";
    const lastElement = "select-last-element";

    let options = {
        search: "Search",
        notSelectedTitle: "Nothing to shown",
        empty: "Nothing to shown",
        activeClass: "active",
        disabledClass: "disabled",
        maxOptionMessage: "Limit reached (%items items max)",
        maxOptionMessageDelay: 2000,
        popoverResize: false,
        dropdownResize: false,
        elementContainer: "select-extended-element"
    };

    function rendPopperPosition(element) {
        if (element.attr("x-placement") !== "top-start") {
            return;
        }

        const elementPosition = element.outerHeight(true);
        element.css("transform", `translate3d(0px, -${elementPosition}px, 0px)`);
    }

    function renderDropdown(menu, items, select) {
        // First, clear all existing children elements
        $(menu).find(".dropdown-header, .dropdown-item, .dropdown-divider").remove();

        const appendItem = (element) => {
            if ($(element).hasClass("separator")) {
                return menu.append(/*html*/`<div class="dropdown-divider"></div>`);
            }

            const label = element.innerText;
            const item = $(/*html*/`<a href="#" class="dropdown-item" />`).text(label);

            item.attr("data-index", $(element).data("index"));

            if ($(element).is("option:selected")) {
                item.addClass(options.activeClass);
            }

            if ($(element).is("option:disabled")) {
                item.addClass(options.disabledClass);
            }

            menu.append(item);
        };

        const appendHeader = (element) => {
            const label = $(element).attr("label");
            const item = $(/*html*/`<span class="dropdown-header"/>`).text(label);
            menu.append(item);
        };

        const appendNotSownElement = () => {
            const empty= select.data("empty") || options.empty;
            const item = $(/*html*/`<span class="dropdown-header"/>`).text(empty);
            menu.append(item);
        };

        const randElements = (elements) => {
            $(elements).each((index, element) => {
                if (select.data("hide-disabled") && $(element).is(":disabled")) {
                    return;
                }

                if ($(element).is("optgroup")) {
                    const childElements = $(element).children();

                    appendHeader(element);
                    randElements(childElements);
                }

                if ($(element).is("option")) {
                    appendItem(element);
                }
            })
        };

        items = items.filter((index, item) => select.data("hide-disabled") ? $(item).is(":enabled") : true);

        if (items.length === 0) {
            appendNotSownElement();
            return;
        }

        randElements(items);
    }

    function showDropdown(event) {
        const select = $(this).next(`.${pureElement}`);
        const menu = $(this).find(".dropdown-menu");
        const button = $(this).find(".btn");
        const liveSearch = $(select).data("live-search");

        function optionFilter(search) {
            return function (index, item) {
                return $(item).text().toLowerCase().includes(search.toLowerCase());
            };
        }

        function changeSearch() {
            const search = $(this).val();

            const filtered = select.find("option").filter(optionFilter(search));
            const elements = search ? filtered : select.children();

            if (!options.popoverResize) {
                menu.css("height", menu.outerHeight());
            }

            renderDropdown(menu, elements, select);
            options.popoverResize && rendPopperPosition(menu);
        }

        if (liveSearch) {
            const searchPlaceholder = $(select).data("live-search-placeholder") || options.search;
            const item = $(/*html*/`<input class="form-control" type="text" autofocus>`).addClass(selectSearch).attr("placeholder", searchPlaceholder);

            $(`.${selectSearch}`).remove();

            menu.append(item);
            menu.find(`.${selectSearch}`).on("input", changeSearch);
        }

        renderDropdown(menu, select.children(), select);
        setTimeout(() => $("[autofocus]", event.target).focus(), 100);

        if (options.dropdownResize) {
            menu.css("min-width", button.outerWidth());
        }
    }

    function hideDropdown() {
        $(this).find(".dropdown-menu .select-search").off("change");
    }

    /**
     * Called when clicking a select option
     * @param {Event} event 
     * @returns 
     */
    function toggleElement(event) {
        event.preventDefault();

        const select = $(this).parents(2).next(`.${pureElement}`);
        const dropdown = $(this).parent();
        const multiple = select.attr("multiple");
        const maxOptions = select.data("max-options");
        const maxOptionsMessage = select.data("max-options-message") || options.maxOptionMessage;
        const selectedCount = select.find("option:selected").length;
        const index = $(this).data("index");

        // Find the option related to this element
        const option = select.find("option[data-index='" + index + "']");

        if (multiple) {
            event.stopPropagation();
        }

        // If it's disabled, has no header or it's a search element
        if ($(this).hasClass(options.disabledClass) || $(this).hasClass("dropdown-header") || $(this).hasClass(selectSearch)) {
            return;
        }

        if (maxOptions && !$(option).attr("selected") && selectedCount >= maxOptions) {
            const selectExtendAlert = $(dropdown).find(".select-extend-alert");

            $(selectExtendAlert).text(maxOptionsMessage.replace("%items", maxOptions));
            $(selectExtendAlert).fadeIn(200);

            setTimeout(() => $(selectExtendAlert).fadeOut(200), options.maxOptionMessageDelay);
            return;
        }

        // If it's not a multiple select
        if (!multiple) {
            select.find("option").attr("selected", false);
            dropdown.find(`.${options.activeClass}`).removeClass(options.activeClass);
        }

        $(option).prop("selected", !$(option).attr("selected")).trigger("change");
        $(this).toggleClass(options.activeClass);

        changeOption(select);
    }

    /**
     * Retrieves the selected option label
     * @param {HTMLElement|JQuery} element The parent element
     * @returns 
     */
    function getSelectedLabel(element) {
        const selected = $(element).find("option:selected");
        const selectedArray = [];
        const notSelectedTitle = $(element).data("not-selected") || options.notSelectedTitle;

        selected.each((index, option) => {
            selectedArray.push(option.innerText)
        });

        return selected.length !== 0 ? selectedArray.join(", ") : notSelectedTitle;
    }

    /**
     * Updates the element currently selected item label
     * @param {HTMLElement|JQuery} select The select element
     * @param {HTMLElement|JQuery} extended The extended selected element (dropdown)
     */
    function updateElement(select, extended) {
        const label = getSelectedLabel(select);
        $(extended).find(".btn").text(label)
    }

    /**
     * Changes the currently selected option
     * @param {HTMLElement|JQuery} select The selected option
     */
    function changeOption(select) {
        const selectElement = $(select);
        const selectExtendedElement = $(selectElement).prev(`.${options.elementContainer}`);

        updateElement(selectElement, selectExtendedElement);
    }

    /**
     * Creates a new extend select for a given element
     * @param {HTMLElement|JQuery} element The element that will receive the extend select
     * @returns 
     */
    function createSelectElement(element) {
        const $el = $(element);

        // If it's not a select
        if (!$el.is("select")) {
            throw new Error("Only <select /> elements are allowed")
        }

        // If it's already an instance of the extend select
        if ($el.hasClass(pureElement)) {
            return;
        }

        const type = $el.data("type") ? `select-${$el.data("type")}` : "";
        const group = $el.data("input-group") ? "input-group-prepend" : "";
        const btnClasses = $el.data("btn-class") || "btn-secondary";
        const label = getSelectedLabel(element);

        const button = $(/*html*/`<button class="btn dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"/>`).addClass(btnClasses);
        const alert = $(/*html*/`<div class="alert alert-danger select-extend-alert" role="alert"/>`);
        const $dropdownMenu = $(/*html*/`<div class="dropdown-menu dropdown-menu-right"/>`).append(alert);
        const types = [options.elementContainer, group, type].join(" ");
        const $dropdown = $(/*html*/`<div class="dropdown"/>`).addClass(types);

        $el.find("option:not(.separator)").each((index, option) => $(option).attr("data-index", index));

        $el.addClass(pureElement);
        $el.before($dropdown.append(button.text(label), $dropdownMenu));

        if ($el.data("input-group")) {
            $el.parent().children(":visible:last").addClass(lastElement)
        }

        // When clicking anything inside the dropdown menu
        $dropdownMenu.on("click", "*", toggleElement);

        // When the dropdown is shown or hidden, call the hook for it
        $dropdown.on("show.bs.dropdown", showDropdown);
        $dropdown.on("hide.bs.dropdown", hideDropdown);

        // When the select changes, change the option
        $el.on("change", (e) => changeOption(e.target));
    }

    // jQuery plugin with options
    $.fn.extendSelect = function(overrideOptions) {
        try {
            if (overrideOptions) {
                options = Object.assign(options, overrideOptions);
            }

            $(this).each((index, element) => createSelectElement(element));
        } catch (e) {
            console.error(e);
        }
    };
})(window.jQuery);
