---
title: Aria Reference Log
---

role="button"
When to use: The click performs an action, opens a modal/dialog, triggers a dropdown, or submits data without navigating to a new URL.
Toggle button variant: If it has an active/pressed state, pair with aria-pressed="true|false".
Disclosure variant: If it expands/collapses content, pair with aria-expanded="true|false" and aria-controls="<id>".

role="link"
When to use: The click navigates the user to a new document, URL, or anchor on the page.

role="switch"
When to use: The click toggles a feature on or off (like an instant settings toggle).
Required state: aria-checked="true|false".

role="checkbox"
When to use: The click selects/unselects an option, often within a form or list.
Required state: aria-checked="true|false|mixed".

role="radio"
When to use: The click selects a single option from a mutually exclusive group (must be contained within a role="radiogroup").
Required state: aria-checked="true|false".

role="tab"
When to use: The click activates a tab panel (contained inside a role="tablist").
Required state: aria-selected="true|false", aria-controls="<panel-id>".

role="menuitem" / role="menuitemcheckbox" / role="menuitemradio"
When to use: The click triggers an action or selection inside an application menu (role="menu" or role="menubar").

role="option"
When to use: The click selects an item in a custom dropdown/picker (role="listbox").
Required state: aria-selected="true|false".

role="treeitem"
When to use: The click selects or expands a node in a hierarchical tree view (role="tree").

role="tablist"
Purpose: A container for a set of tabs.
Expected Children: role="tab".
Associated Target: Each tab controls a role="tabpanel".
Example: Switching between "Profile", "Security", and "Notifications" views on a dashboard.

role="listbox"
Purpose: A list of selectable items from which a user can choose one or more options. This is the ARIA equivalent of a native <select> dropdown or list.
Expected Children: role="option".
Example: A custom font selector, country picker, or auto-suggest combobox results.

role="menu" and role="menubar"
role="menubar": A horizontal bar of menus, mimicking native desktop application menus (e.g., File, Edit, View, Window).
role="menu": A vertical list of actions or commands presented to the user (e.g., a right-click context menu or a dropdown from a menubar).
Expected Children: role="menuitem", role="menuitemcheckbox", or role="menuitemradio".
Example: The "Actions" menu on a table row (Edit, Duplicate, Delete).
There is no standard role called menubox in WAI-ARIA. It is usually a common confusion blending menu and listbox.

### Quick Relationship Matrix
Container Role (Composite)	Expected Child Items	Common Pattern / Real-world Analog
tablist	tab	Tab strip / tabbed panel switcher
listbox	option	Custom <select> dropdown or multi-select list
menu	menuitem, menuitemcheckbox, menuitemradio	Context menu, popup action menu
menubar	menuitem (triggers menu)	Desktop application menu bar (File / Edit)
radiogroup	radio	Group of mutually exclusive radio buttons
tree	treeitem	File explorer tree / nested folder view
The Fundamental Rule: Focus Management
What makes composite containers unique is how keyboard focus works:

Only One Tab Stop on the Page:
The entire composite widget should only be focused once when tabbing through the page. A user should not have to press Tab through 10 items in a menu or tablist to move past it.
Arrow Key Navigation:
Once focus enters the container, users navigate between items using Arrow Keys (← / → or ↑ / ↓), and select or activate items with Enter or Space.
Implementation Patterns:
This keyboard behavior is typically implemented using either:
Roving tabindex: Setting tabindex="0" on the currently focused item and tabindex="-1" on all other siblings.
aria-activedescendant: Keeping focus on the parent container (or input) while updating aria-activedescendant="<item-id>" as the user arrows through items.

If you use role="..." on a non-interactive element (like a <div> or <span>) instead of a native element, you must also provide:
Focusability: tabindex="0" so keyboard users can reach it.
Keyboard Handlers:
For button: Trigger on both Enter and Space.
For link: Trigger on Enter.
For checkbox / switch: Toggle on Space.
For tab / menuitem: Arrow key navigation between items + Enter/Space to activate.
Accessible Name: Ensure it has visible text or an aria-label / aria-labelledby.
Best Practice (Rule 1 of ARIA): Always prefer native HTML elements (<button>, <a href="...">, <input type="checkbox">) whenever possible. They provide keyboard navigation, focus management, and accessibility tree semantics for free.