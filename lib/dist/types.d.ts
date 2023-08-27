import type { Reactive } from "./index";

export type { JSX };
export declare type ComponentChild =
  | ComponentChild[]
  | JSX.Element
  | string
  | number
  | boolean
  | undefined
  | null
  | Reactive<any>;
export declare type ComponentChildren = ComponentChild | ComponentChild[];
export interface BaseProps {
  children?: ComponentChildren;
}
export declare type ComponentFactory = (props: BaseProps) => JSX.Element;
export declare type ComponentAttributes = {
  [s: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | Partial<CSSStyleDeclaration>
    | EventListenerOrEventListenerObject;
};
interface BaseSyntheticEvent<E = object, C = any, T = any> {
  nativeEvent: E;
  currentTarget: C;
  target: T;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  preventDefault(): void;
  isDefaultPrevented(): boolean;
  stopPropagation(): void;
  isPropagationStopped(): boolean;
  persist(): void;
  timeStamp: number;
  type: string;
}
interface SyntheticEvent<T = Element, E = Event>
  extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}
export declare interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
  target: EventTarget & T;
}
declare global {
  namespace JSX {
    type Element = HTMLElement | SVGElement;

    interface ArrayElement extends Array<Element> {}

    interface FunctionElement {
      (): Element;
    }

    interface ElementAttributesProperty {
      props: any;
    }
    interface ElementChildrenAttribute {
      children: any;
    }
    type EventHandler<TEvent extends Event> = (
      this: HTMLElement,
      ev: TEvent
    ) => void;
    type ClipboardEventHandler = EventHandler<ClipboardEvent>;
    type CompositionEventHandler = EventHandler<CompositionEvent>;
    type DragEventHandler = EventHandler<DragEvent>;
    type FocusEventHandler = EventHandler<FocusEvent>;
    type KeyboardEventHandler = EventHandler<KeyboardEvent>;
    type MouseEventHandler = EventHandler<MouseEvent>;
    type TouchEventHandler = EventHandler<TouchEvent>;
    type UIEventHandler = EventHandler<UIEvent>;
    type WheelEventHandler = EventHandler<WheelEvent>;
    type AnimationEventHandler = EventHandler<AnimationEvent>;
    type TransitionEventHandler = EventHandler<TransitionEvent>;
    type GenericEventHandler = EventHandler<Event>;
    type PointerEventHandler = EventHandler<PointerEvent>;
    interface DOMAttributes {
      children?: ComponentChildren[] | ComponentChildren;
      onLoad?: GenericEventHandler;
      onLoadCapture?: GenericEventHandler;
      onError?: GenericEventHandler;
      onErrorCapture?: GenericEventHandler;
      onCopy?: ClipboardEventHandler;
      onCopyCapture?: ClipboardEventHandler;
      onCut?: ClipboardEventHandler;
      onCutCapture?: ClipboardEventHandler;
      onPaste?: ClipboardEventHandler;
      onPasteCapture?: ClipboardEventHandler;
      onCompositionEnd?: CompositionEventHandler;
      onCompositionEndCapture?: CompositionEventHandler;
      onCompositionStart?: CompositionEventHandler;
      onCompositionStartCapture?: CompositionEventHandler;
      onCompositionUpdate?: CompositionEventHandler;
      onCompositionUpdateCapture?: CompositionEventHandler;
      onToggle?: GenericEventHandler;
      onFocus?: FocusEventHandler;
      onFocusCapture?: FocusEventHandler;
      onBlur?: FocusEventHandler;
      onBlurCapture?: FocusEventHandler;
      onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
      onChangeCapture?: GenericEventHandler;
      onInput?: GenericEventHandler;
      onInputCapture?: GenericEventHandler;
      onSearch?: GenericEventHandler;
      onSearchCapture?: GenericEventHandler;
      onSubmit?: GenericEventHandler;
      onSubmitCapture?: GenericEventHandler;
      onInvalid?: GenericEventHandler;
      onInvalidCapture?: GenericEventHandler;
      onReset?: GenericEventHandler;
      onResetCapture?: GenericEventHandler;
      onFormData?: GenericEventHandler;
      onFormDataCapture?: GenericEventHandler;
      onKeyDown?: KeyboardEventHandler;
      onKeyDownCapture?: KeyboardEventHandler;
      onKeyPress?: KeyboardEventHandler;
      onKeyPressCapture?: KeyboardEventHandler;
      onKeyUp?: KeyboardEventHandler;
      onKeyUpCapture?: KeyboardEventHandler;
      onAbort?: GenericEventHandler;
      onAbortCapture?: GenericEventHandler;
      onCanPlay?: GenericEventHandler;
      onCanPlayCapture?: GenericEventHandler;
      onCanPlayThrough?: GenericEventHandler;
      onCanPlayThroughCapture?: GenericEventHandler;
      onDurationChange?: GenericEventHandler;
      onDurationChangeCapture?: GenericEventHandler;
      onEmptied?: GenericEventHandler;
      onEmptiedCapture?: GenericEventHandler;
      onEncrypted?: GenericEventHandler;
      onEncryptedCapture?: GenericEventHandler;
      onEnded?: GenericEventHandler;
      onEndedCapture?: GenericEventHandler;
      onLoadedData?: GenericEventHandler;
      onLoadedDataCapture?: GenericEventHandler;
      onLoadedMetadata?: GenericEventHandler;
      onLoadedMetadataCapture?: GenericEventHandler;
      onLoadStart?: GenericEventHandler;
      onLoadStartCapture?: GenericEventHandler;
      onPause?: GenericEventHandler;
      onPauseCapture?: GenericEventHandler;
      onPlay?: GenericEventHandler;
      onPlayCapture?: GenericEventHandler;
      onPlaying?: GenericEventHandler;
      onPlayingCapture?: GenericEventHandler;
      onProgress?: GenericEventHandler;
      onProgressCapture?: GenericEventHandler;
      onRateChange?: GenericEventHandler;
      onRateChangeCapture?: GenericEventHandler;
      onSeeked?: GenericEventHandler;
      onSeekedCapture?: GenericEventHandler;
      onSeeking?: GenericEventHandler;
      onSeekingCapture?: GenericEventHandler;
      onStalled?: GenericEventHandler;
      onStalledCapture?: GenericEventHandler;
      onSuspend?: GenericEventHandler;
      onSuspendCapture?: GenericEventHandler;
      onTimeUpdate?: GenericEventHandler;
      onTimeUpdateCapture?: GenericEventHandler;
      onVolumeChange?: GenericEventHandler;
      onVolumeChangeCapture?: GenericEventHandler;
      onWaiting?: GenericEventHandler;
      onWaitingCapture?: GenericEventHandler;
      onClick?: MouseEventHandler;
      onClickCapture?: MouseEventHandler;
      onContextMenu?: MouseEventHandler;
      onContextMenuCapture?: MouseEventHandler;
      onDblClick?: MouseEventHandler;
      onDblClickCapture?: MouseEventHandler;
      onDrag?: DragEventHandler;
      onDragCapture?: DragEventHandler;
      onDragEnd?: DragEventHandler;
      onDragEndCapture?: DragEventHandler;
      onDragEnter?: DragEventHandler;
      onDragEnterCapture?: DragEventHandler;
      onDragExit?: DragEventHandler;
      onDragExitCapture?: DragEventHandler;
      onDragLeave?: DragEventHandler;
      onDragLeaveCapture?: DragEventHandler;
      onDragOver?: DragEventHandler;
      onDragOverCapture?: DragEventHandler;
      onDragStart?: DragEventHandler;
      onDragStartCapture?: DragEventHandler;
      onDrop?: DragEventHandler;
      onDropCapture?: DragEventHandler;
      onMouseDown?: MouseEventHandler;
      onMouseDownCapture?: MouseEventHandler;
      onMouseEnter?: MouseEventHandler;
      onMouseEnterCapture?: MouseEventHandler;
      onMouseLeave?: MouseEventHandler;
      onMouseLeaveCapture?: MouseEventHandler;
      onMouseMove?: MouseEventHandler;
      onMouseMoveCapture?: MouseEventHandler;
      onMouseOut?: MouseEventHandler;
      onMouseOutCapture?: MouseEventHandler;
      onMouseOver?: MouseEventHandler;
      onMouseOverCapture?: MouseEventHandler;
      onMouseUp?: MouseEventHandler;
      onMouseUpCapture?: MouseEventHandler;
      onSelect?: GenericEventHandler;
      onSelectCapture?: GenericEventHandler;
      onTouchCancel?: TouchEventHandler;
      onTouchCancelCapture?: TouchEventHandler;
      onTouchEnd?: TouchEventHandler;
      onTouchEndCapture?: TouchEventHandler;
      onTouchMove?: TouchEventHandler;
      onTouchMoveCapture?: TouchEventHandler;
      onTouchStart?: TouchEventHandler;
      onTouchStartCapture?: TouchEventHandler;
      onPointerOver?: PointerEventHandler;
      onPointerOverCapture?: PointerEventHandler;
      onPointerEnter?: PointerEventHandler;
      onPointerEnterCapture?: PointerEventHandler;
      onPointerDown?: PointerEventHandler;
      onPointerDownCapture?: PointerEventHandler;
      onPointerMove?: PointerEventHandler;
      onPointerMoveCapture?: PointerEventHandler;
      onPointerUp?: PointerEventHandler;
      onPointerUpCapture?: PointerEventHandler;
      onPointerCancel?: PointerEventHandler;
      onPointerCancelCapture?: PointerEventHandler;
      onPointerOut?: PointerEventHandler;
      onPointerOutCapture?: PointerEventHandler;
      onPointerLeave?: PointerEventHandler;
      onPointerLeaveCapture?: PointerEventHandler;
      onGotPointerCapture?: PointerEventHandler;
      onGotPointerCaptureCapture?: PointerEventHandler;
      onLostPointerCapture?: PointerEventHandler;
      onLostPointerCaptureCapture?: PointerEventHandler;
      onScroll?: UIEventHandler;
      onScrollCapture?: UIEventHandler;
      onWheel?: WheelEventHandler;
      onWheelCapture?: WheelEventHandler;
      onAnimationStart?: AnimationEventHandler;
      onAnimationStartCapture?: AnimationEventHandler;
      onAnimationEnd?: AnimationEventHandler;
      onAnimationEndCapture?: AnimationEventHandler;
      onAnimationIteration?: AnimationEventHandler;
      onAnimationIterationCapture?: AnimationEventHandler;
      onTransitionEnd?: TransitionEventHandler;
      onTransitionEndCapture?: TransitionEventHandler;
    }
    interface HTMLAttributes extends DOMAttributes {
      accept?: string | Reactive<string>;
      acceptCharset?: string | Reactive<string>;
      accessKey?: string | Reactive<string>;
      action?: string | Reactive<string>;
      allowFullScreen?: boolean | Reactive<boolean>;
      allowTransparency?: boolean | Reactive<boolean>;
      alt?: string | Reactive<string>;
      as?: string | Reactive<string>;
      async?: boolean | Reactive<boolean>;
      autocomplete?: string | Reactive<string>;
      autoComplete?: string | Reactive<string>;
      autocorrect?: string | Reactive<string>;
      autoCorrect?: string | Reactive<string>;
      autofocus?: boolean | Reactive<boolean>;
      autoFocus?: boolean | Reactive<boolean>;
      autoPlay?: boolean | Reactive<boolean>;
      capture?: boolean | string | Reactive<boolean | string>;
      cellPadding?: number | string | Reactive<number | string>;
      cellSpacing?: number | string | Reactive<number | string>;
      charSet?: string | Reactive<string>;
      challenge?: string | Reactive<string>;
      checked?: boolean | Reactive<boolean>;
      class?: string | Reactive<string>;
      cols?: number | Reactive<number>;
      colSpan?: number | Reactive<number>;
      content?: string | Reactive<string>;
      contentEditable?: boolean | Reactive<boolean>;
      contextMenu?: string | Reactive<string>;
      controls?: boolean | Reactive<boolean>;
      controlsList?: string | Reactive<string>;
      coords?: string | Reactive<string>;
      crossOrigin?: string | Reactive<string>;
      data?: string | Reactive<string>;
      dateTime?: string | Reactive<string>;
      default?: boolean | Reactive<boolean>;
      defer?: boolean | Reactive<boolean>;
      dir?: "auto" | "rtl" | "ltr" | Reactive<"auto" | "rtl" | "ltr">;
      disabled?: boolean | Reactive<boolean>;
      disableRemotePlayback?: boolean | Reactive<boolean>;
      download?: string | Reactive<string>;
      draggable?: boolean | Reactive<boolean>;
      encType?: string | Reactive<string>;
      form?: string | Reactive<string>;
      formAction?: string | Reactive<string>;
      formEncType?: string | Reactive<string>;
      formMethod?: string | Reactive<string>;
      formNoValidate?: boolean | Reactive<boolean>;
      formTarget?: string | Reactive<string>;
      frameBorder?: number | string | Reactive<number | string>;
      headers?: string | Reactive<string>;
      height?: number | string | Reactive<number | string>;
      hidden?: boolean | Reactive<boolean>;
      high?: number | Reactive<number>;
      href?: string | Reactive<string>;
      ref?: Reactive<any>;
      hrefLang?: string | Reactive<string>;
      for?: string | Reactive<string>;
      htmlFor?: string | Reactive<string>;
      httpEquiv?: string | Reactive<string>;
      icon?: string | Reactive<string>;
      id?: string | Reactive<string>;
      inputMode?: string | Reactive<string>;
      integrity?: string | Reactive<string>;
      is?: string | Reactive<string>;
      keyParams?: string | Reactive<string>;
      keyType?: string | Reactive<string>;
      kind?: string | Reactive<string>;
      label?: string | Reactive<string>;
      lang?: string | Reactive<string>;
      list?: string | Reactive<string>;
      loading?: "eager" | "lazy" | Reactive<"eager" | "lazy">;
      loop?: boolean | Reactive<boolean>;
      low?: number | Reactive<number>;
      manifest?: string | Reactive<string>;
      marginHeight?: number | Reactive<number>;
      marginWidth?: number | Reactive<number>;
      max?: number | string | Reactive<number | string>;
      maxLength?: number | Reactive<number>;
      media?: string | Reactive<string>;
      mediaGroup?: string | Reactive<string>;
      method?: string | Reactive<string>;
      min?: number | string | Reactive<number | string>;
      minLength?: number | Reactive<number>;
      multiple?: boolean | Reactive<boolean>;
      muted?: boolean | Reactive<boolean>;
      name?: string | Reactive<string>;
      nonce?: string | Reactive<string>;
      noValidate?: boolean | Reactive<boolean>;
      open?: boolean | Reactive<boolean>;
      optimum?: number | Reactive<number>;
      pattern?: string | Reactive<string>;
      placeholder?: string | Reactive<string>;
      playsInline?: boolean | Reactive<boolean>;
      poster?: string | Reactive<string>;
      preload?: string | Reactive<string>;
      radioGroup?: string | Reactive<string>;
      readOnly?: boolean | Reactive<boolean>;
      rel?: string | Reactive<string>;
      required?: boolean | Reactive<boolean>;
      role?: string | Reactive<string>;
      rows?: number | Reactive<number>;
      rowSpan?: number | Reactive<number>;
      sandbox?: string | Reactive<string>;
      scope?: string | Reactive<string>;
      scoped?: boolean | Reactive<boolean>;
      scrolling?: string | Reactive<string>;
      seamless?: boolean | Reactive<boolean>;
      selected?: boolean | Reactive<boolean>;
      shape?: string | Reactive<string>;
      size?: number | Reactive<number>;
      sizes?: string | Reactive<string>;
      slot?: string | Reactive<string>;
      span?: number | Reactive<number>;
      spellcheck?: boolean | Reactive<boolean>;
      src?: string | Reactive<string>;
      srcset?: string | Reactive<string>;
      srcDoc?: string | Reactive<string>;
      srcLang?: string | Reactive<string>;
      srcSet?: string | Reactive<string>;
      start?: number | Reactive<number>;
      step?: number | string | Reactive<number | string>;
      style?:
        | string
        | Partial<CSSStyleDeclaration>
        | Reactive<string | Partial<CSSStyleDeclaration>>;
      summary?: string | Reactive<string>;
      tabIndex?: number | Reactive<number>;
      target?: string | Reactive<string>;
      title?: string | Reactive<string>;
      type?: string | Reactive<string>;
      useMap?: string | Reactive<string>;
      value?: string | string[] | number | Reactive<string | string[] | number>;
      volume?: string | number | Reactive<string | number>;
      width?: number | string | Reactive<number | string>;
      wmode?: string | Reactive<string>;
      wrap?: string | Reactive<string>;
      about?: string | Reactive<string>;
      datatype?: string | Reactive<string>;
      inlist?: boolean | Reactive<boolean>;
      prefix?: string | Reactive<string>;
      property?: string | Reactive<string>;
      resource?: string | Reactive<string>;
      typeof?: string | Reactive<string>;
      vocab?: string | Reactive<string>;
      itemProp?: string | Reactive<string>;
      itemScope?: boolean | Reactive<boolean>;
      itemType?: string | Reactive<string>;
      itemID?: string | Reactive<string>;
      itemRef?: string | Reactive<string>;
    }
    type IntrinsicElementsHTML = {
      [TKey in keyof HTMLElementTagNameMap]?: HTMLAttributes;
    };
    type IntrinsicElements = IntrinsicElementsHTML;
  }
}
