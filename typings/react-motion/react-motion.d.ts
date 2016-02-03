/// <reference path="../react/react.d.ts" />

// declare module "react-motion" {
//     import React = __React;
//
//     export function spring(val: number, config?: SpringHelperConfig): OpaqueConfig;
//
//     export const presets: {
//         gentle: SpringHelperConfig,
//         noWobble: SpringHelperConfig,
//         stiff: SpringHelperConfig,
//         wobbly: SpringHelperConfig
//     };
//
//     // === basic reused types ===
//     // type of the second parameter of `spring(val, config)` all fields are optional
//     export type SpringHelperConfig = {
//       stiffness?: number,
//       damping?: number,
//       precision?: number,
//       // TODO: add onRest. Not public yet
//     };
//     // the object returned by `spring(value, yourConfig)`. Used internally only!
//     export type OpaqueConfig = {
//       val: number,
//       stiffness: number,
//       damping: number,
//       precision: number,
//       // TODO: add onRest. Not public yet
//     };
//     // your typical style object given in props. Maps to a number or a spring config
//     export type Style = {[key: string]: number | OpaqueConfig};
//     // the interpolating style object, with the same keys as the above Style object,
//     // with the values mapped to numbers, naturally
//     export type PlainStyle = {[key: string]: number};
//     // internal velocity object. Similar to PlainStyle, but whose numbers represent
//     // speed. Might be exposed one day.
//     export type Velocity = {[key: string]: number};
//
//     // === Motion ===
//     export type MotionProps = {
//       defaultStyle?: PlainStyle,
//       style: Style,
//       children: (interpolatedStyle: PlainStyle) => React.ReactElement<any>,
//     };
//
//     // === StaggeredMotion ===
//     export type StaggeredProps = {
//       defaultStyles?: Array<PlainStyle>,
//       styles: (previousInterpolatedStyles?: Array<PlainStyle>) => Array<Style>,
//       children: (interpolatedStyles: Array<PlainStyle>) => React.ReactElement<any>,
//     };
//
//     // === TransitionMotion ===
//     export type TransitionStyle<T> = {
//       key: string, // unique ID to identify component across render animations
//       data?: T, // optional data you want to carry along the style, e.g. itemText
//       style: Style, // actual style you're passing
//     };
//     export type TransitionPlainStyle<T> = {
//       key: string,
//       data?: T,
//       // same as TransitionStyle, passed as argument to style/children function
//       style: PlainStyle,
//     };
//     export type WillEnter<T> = (styleThatEntered: TransitionStyle<T>) => PlainStyle;
//     export type WillLeave<T> = (styleThatLeft: TransitionStyle<T>) => Style;
//
//     export type TransitionProps<T> = {
//       defaultStyles?: Array<TransitionPlainStyle<T>>,
//       styles: Array<TransitionStyle<T>>,
//       children?: (interpolatedStyles: Array<TransitionPlainStyle<T>>) => React.ReactElement<any>,
//       willEnter?: WillEnter<T>,
//       willLeave?: WillLeave<T>,
//     };
//
//     export interface TransitionMotion<T> extends React.Component<TransitionProps<T>, {}> { }
// }
