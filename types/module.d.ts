export {};

declare global {
    interface JQuery {
        /**
         * Creates a new Extend Select instance for the selected element
         */
        extendSelect: (params?: {
            /**
             * Search input placeholder
             * Default: Search
             */
            search?: string,

            /**
             * Title if option not selected
             * Default: Nothing to show
             */
            notSelectedTitle?: string,

            /**
             * Message if select list is empty
             * Default: Nothing to show
             */
            empty?: string,

            /**
             * Class to the active element
             * Default: active
             */
            activeClass?: string,

            /**
             * Class to the disabled element
             * Default: disabled
             */
            disabledClass?: string,

            /**
             * Custom error message for all selects (use placeholder %items)
             * Default: Limit reached (%items items max)
             */
            maxOptionMessage?: string,

            /**
             * Delay to hide the max option error message
             * Default: 2000
             */
            maxOptionMessageDelay?: number,

            /**
             * Popover logic (resize or save height)
             * Default: false
             */
            popoverResize?: boolean,

            /**
             * Auto resize dropdown by button width
             * Default: false
             */
            dropdownResize?: boolean
        }) => JQuery
    }
}