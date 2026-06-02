# COMPONENT_LIBRARY.md

# COMPONENT LIBRARY SPECIFICATION

Project:
Landing Builder Platform

Version:
1.0

Purpose:

Define all supported Builder Components.

Every component must be:

* Reusable
* Configurable
* Responsive
* Theme Compatible
* Versionable

All components must support:

Content Tab

Style Tab

Advanced Tab

Visibility Settings

Animation Settings

---

# COMPONENT STRUCTURE

Each component must contain:

```text
Component

Editor

Preview

Schema

Default Config
```

Example

```text
Hero/

Hero.tsx

HeroEditor.tsx

HeroPreview.tsx

schema.ts

defaultConfig.ts
```

---

# GLOBAL SETTINGS

All components support:

## Visibility

Desktop

Tablet

Mobile

---

## Animation

None

Fade In

Fade Up

Fade Down

Zoom In

Zoom Out

Slide Left

Slide Right

---

## Spacing

Margin

Padding

Container Width

Section Height

---

## Background

Color

Gradient

Image

Video

---

# HERO SECTION

Purpose

Top section of landing page.

---

Fields

```json
{
  "title":"",
  "subtitle":"",
  "description":"",
  "buttonText":"",
  "buttonUrl":"",
  "image":"",
  "backgroundImage":""
}
```

---

Variants

Hero Center

Hero Split

Hero Full Width

Hero Video

Hero Minimal

---

# FEATURES SECTION

Purpose

Display features.

---

Fields

```json
{
  "title":"",
  "items":[]
}
```

Feature Item

```json
{
  "icon":"",
  "title":"",
  "description":""
}
```

---

Variants

2 Columns

3 Columns

4 Columns

Grid

Cards

---

# BENEFITS SECTION

Purpose

Display benefits.

---

Fields

```json
{
  "title":"",
  "benefits":[]
}
```

Benefit Item

```json
{
  "title":"",
  "description":"",
  "icon":""
}
```

---

# ABOUT SECTION

Purpose

About company or organization.

---

Fields

```json
{
  "title":"",
  "content":"",
  "image":""
}
```

---

Variants

Image Left

Image Right

Centered

---

# TIMELINE SECTION

Purpose

Display journey or process.

---

Item

```json
{
  "year":"",
  "title":"",
  "description":""
}
```

---

# PROCESS SECTION

Purpose

Display workflow.

---

Fields

```json
{
  "steps":[]
}
```

Step

```json
{
  "title":"",
  "description":""
}
```

---

# STATISTICS SECTION

Purpose

Display metrics.

---

Fields

```json
{
  "items":[]
}
```

Item

```json
{
  "number":"",
  "label":""
}
```

Examples

10000+

500+

95%

---

# TESTIMONIALS SECTION

Purpose

Display customer feedback.

---

Fields

```json
{
  "items":[]
}
```

Item

```json
{
  "avatar":"",
  "name":"",
  "position":"",
  "content":""
}
```

---

Variants

Slider

Grid

Cards

---

# TEAM SECTION

Purpose

Display team members.

---

Item

```json
{
  "avatar":"",
  "name":"",
  "role":"",
  "bio":""
}
```

---

# PARTNERS SECTION

Purpose

Display partner logos.

---

Item

```json
{
  "logo":"",
  "url":""
}
```

---

# GALLERY SECTION

Purpose

Display images.

---

Item

```json
{
  "image":"",
  "caption":""
}
```

---

Variants

Grid

Masonry

Slider

Carousel

---

# VIDEO SECTION

Purpose

Embed videos.

---

Fields

```json
{
  "title":"",
  "videoUrl":"",
  "thumbnail":""
}
```

Providers

YouTube

Vimeo

Self Hosted

---

# FAQ SECTION

Purpose

Frequently asked questions.

---

Item

```json
{
  "question":"",
  "answer":""
}
```

---

Variants

Accordion

List

Cards

---

# PRICING SECTION

Purpose

Display plans.

---

Item

```json
{
  "name":"",
  "price":"",
  "features":[]
}
```

---

Variants

1 Plan

2 Plans

3 Plans

4 Plans

---

# CTA SECTION

Purpose

Call To Action.

---

Fields

```json
{
  "title":"",
  "description":"",
  "buttonText":"",
  "buttonUrl":""
}
```

---

Variants

Simple

Banner

Centered

Split

---

# CONTACT FORM SECTION

Purpose

Collect leads.

---

Fields

```json
{
  "formId":"",
  "title":"",
  "description":""
}
```

---

Integration

Internal Forms

Dify

Webhook

CRM

---

# CONTACT INFO SECTION

Purpose

Display contact information.

---

Fields

```json
{
  "phone":"",
  "email":"",
  "address":"",
  "mapUrl":""
}
```

---

# MAP SECTION

Purpose

Display location.

---

Providers

Google Maps

OpenStreetMap

---

# RICH TEXT SECTION

Purpose

Flexible content.

---

Editor

Tiptap

---

Supported

Heading

Paragraph

List

Quote

Image

Table

Link

Video

---

# BUTTON SECTION

Purpose

Single action button.

---

Fields

```json
{
  "text":"",
  "url":""
}
```

---

# DIVIDER SECTION

Purpose

Visual separation.

---

Types

Line

Dashed

Gradient

Icon Divider

---

# SPACER SECTION

Purpose

Add vertical spacing.

---

Fields

```json
{
  "height":""
}
```

---

# COUNTDOWN SECTION

Purpose

Campaign landing pages.

---

Fields

```json
{
  "endDate":""
}
```

---

# POPUP SECTION

Purpose

Lead capture.

---

Triggers

Page Load

Exit Intent

Scroll Depth

Button Click

---

# DOWNLOAD SECTION

Purpose

Download files.

---

Fields

```json
{
  "title":"",
  "file":""
}
```

---

# SOCIAL PROOF SECTION

Purpose

Build trust.

---

Fields

```json
{
  "reviews":"",
  "customers":"",
  "rating":""
}
```

---

# LOGO CLOUD SECTION

Purpose

Display brand logos.

---

Fields

```json
{
  "logos":[]
}
```

---

# HTML SECTION

Purpose

Custom embed.

---

Fields

```json
{
  "html":""
}
```

Restrictions

Admin Only

---

# REUSABLE BLOCK

Purpose

Shared component.

---

Examples

Header

Footer

CTA

Newsletter

Contact

---

Changes propagate to all pages.

---

# BUILDER REQUIREMENTS

All components must support:

Drag

Drop

Duplicate

Copy

Paste

Hide

Delete

Move

Save

Restore

---

# RESPONSIVE SETTINGS

Each component supports:

Desktop

Tablet

Mobile

Custom visibility

Custom spacing

Custom typography

---

# SEO SETTINGS

Supported Components

Hero

FAQ

Article

Rich Text

Pricing

---

Features

Schema Markup

Open Graph Support

Structured Data

---

# FUTURE COMPONENTS

Architecture must allow adding:

Chatbot

Dify Widget

CRM Widget

Calendar Booking

Payment Form

Knowledge Search

AI Assistant

without changing Builder Core.

---

# FINAL REQUIREMENT

All Builder Components must be registered through a centralized Component Registry.

No component should be hardcoded directly inside Builder Engine.

The Builder must dynamically render components based on component schema and registry configuration.
