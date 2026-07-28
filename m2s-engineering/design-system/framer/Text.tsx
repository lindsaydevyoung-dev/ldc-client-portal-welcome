import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import tokens from "./tokens.json"

type Breakpoint = "desktop" | "tablet" | "mobile"

type StyleValues = {
    fontSize: string
    lineHeight: string
    letterSpacing: string
}

type TextStyle = {
    fontFamily: keyof typeof tokens.typography.fontFamilies | string
    fontWeight: keyof typeof tokens.typography.fontWeights | number | string
    fontStyle?: string
    textTransform?: string
    desktop: StyleValues
    tablet: StyleValues
    mobile: StyleValues
}

const textStyles = tokens.typography.textStyles as Record<string, TextStyle>
const fontFamilies = tokens.typography.fontFamilies as Record<string, string>
const fontWeights = tokens.typography.fontWeights as Record<string, number>

const variantOptions = Object.keys(textStyles)
const defaultVariant = variantOptions[0]

const BREAKPOINTS = {
    desktop: "(min-width: 1200px)",
    tablet: "(min-width: 810px) and (max-width: 1199px)",
    mobile: "(max-width: 809px)",
} as const

function resolveFamily(key: string) {
    return fontFamilies[key] ?? key
}

function resolveWeight(key: string | number) {
    if (typeof key === "number") return key
    return fontWeights[key] ?? key
}

function styleBlock(selector: string, style: TextStyle, bp: Breakpoint) {
    const v = style[bp]
    return `${selector}{font-size:${v.fontSize};line-height:${v.lineHeight};letter-spacing:${v.letterSpacing};}`
}

function buildCSS(id: string, style: TextStyle) {
    const selector = `[data-ds-text="${id}"]`
    const base =
        `${selector}{` +
        `font-family:${resolveFamily(style.fontFamily as string)};` +
        `font-weight:${resolveWeight(style.fontWeight as string)};` +
        (style.fontStyle ? `font-style:${style.fontStyle};` : "") +
        (style.textTransform ? `text-transform:${style.textTransform};` : "") +
        `margin:0;padding:0;}`

    return (
        base +
        `@media ${BREAKPOINTS.desktop}{${styleBlock(selector, style, "desktop")}}` +
        `@media ${BREAKPOINTS.tablet}{${styleBlock(selector, style, "tablet")}}` +
        `@media ${BREAKPOINTS.mobile}{${styleBlock(selector, style, "mobile")}}`
    )
}

type Props = {
    variant: string
    as: string
    text: string
    color: string
    align: "left" | "center" | "right"
    style?: React.CSSProperties
}

export default function Text({
    variant = defaultVariant,
    as = "p",
    text = "The quick brown fox jumps over the lazy dog",
    color = "#111",
    align = "left",
    style,
}: Props) {
    const cfg = textStyles[variant]
    if (!cfg) {
        return <span>Unknown variant: {variant}</span>
    }

    const id = `${variant}`
    const css = React.useMemo(() => buildCSS(id, cfg), [id, cfg])

    const Tag = as as keyof JSX.IntrinsicElements

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <Tag
                data-ds-text={id}
                style={{ color, textAlign: align, ...style }}
            >
                {text}
            </Tag>
        </>
    )
}

addPropertyControls(Text, {
    variant: {
        type: ControlType.Enum,
        title: "Variant",
        options: variantOptions,
        defaultValue: defaultVariant,
    },
    as: {
        type: ControlType.Enum,
        title: "Tag",
        options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div", "label"],
        defaultValue: "p",
    },
    text: {
        type: ControlType.String,
        title: "Text",
        defaultValue: "The quick brown fox jumps over the lazy dog",
        displayTextArea: true,
    },
    color: {
        type: ControlType.Color,
        title: "Color",
        defaultValue: "#111111",
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center", "right"],
        defaultValue: "left",
    },
})
