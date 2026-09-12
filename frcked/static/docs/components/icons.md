# @icons

Icon components library with categorized SVG icons for common UI needs.

## Icon Categories

### AccountIcons

User and authentication-related icons.

**Props:**

- `name: AccountIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** user, login, logout, register, profile, users, shield, key, lock, unlock

---

### ActionIcons

Action and interaction-related icons.

**Props:**

- `name: ActionIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** edit, save, delete, copy, paste, cut, undo, redo, print, heart, thumbs-up, thumbs-down, star, flag, filter, sort, export, import, send, reply, trash

---

### FileIcons

File and folder-related icons.

**Props:**

- `name: FileIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** file, file-text, folder, folder-open, document, pdf, spreadsheet, presentation, archive, zip, cloud, cloud-upload, cloud-download, database, hard-drive, usb, cd, server, storage, backup, export, import, attachment, paperclip, certificate, key, lock, unlock

---

### MediaIcons

Media and playback-related icons.

**Props:**

- `name: MediaIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** camera, image, picture, video, play, pause, stop, volume, volume-up, volume-down, volume-mute, microphone, microphone-off, film, music, headphones, speaker, screen, projector, tv, radio

---

### NavigationIcons

Navigation and UI control icons.

**Props:**

- `name: NavigationIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** home, dashboard, back, forward, chevron-left, chevron-right, chevron-up, chevron-down, menu, close, plus, minus, refresh, link, download, upload, share, search, notification, bookmark

---

### SocialIcons

Social media and communication icons.

**Props:**

- `name: SocialIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** github, twitter, linkedin, facebook, youtube, instagram, mail, phone, message, whatsapp, telegram, discord, slack

---

### StatusIcons

Status and state indicator icons.

**Props:**

- `name: StatusIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** error, warning, info, loading, check, x, exclamation, question, pause, play, stop, connection, offline, online, busy, away, invisible

---

### ThemeIcons

Theme and settings-related icons.

**Props:**

- `name: ThemeIconName` (required) - Icon name
- `size?: string` (default: `'h-4 w-4'`) - Tailwind size classes
- `class?: string` (default: `''`) - Additional CSS classes

**Available Icons:** sun, moon, settings, cog, wrench, adjustments, sliders, contrast, palette, brush, desktop, mobile, tablet, globe, language

---

## Sizing

All icons use Tailwind CSS classes for sizing. Default is `h-4 w-4`. Common sizes:

- `h-3 w-3` - Extra small
- `h-4 w-4` - Small (default)
- `h-5 w-5` - Medium
- `h-6 w-6` - Large
- `h-8 w-8` - Extra large

## Styling

Icons inherit the current text color and can be styled with Tailwind classes:

- `text-blue-500` - Change color
- `opacity-50` - Change opacity
- Any other standard Tailwind utilities
