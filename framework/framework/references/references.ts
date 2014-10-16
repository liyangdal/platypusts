﻿/* tslint:disable:no-unused-variable */
/*
 * Injectables
 */
var __AppStatic = '$AppStatic',
    __App = '$App',
    __Http = '$Http',
    __HttpConfig = '$HttpConfig',
    __Promise = '$Promise',
    __Compat = '$Compat',
    __ControlFactory = '$ControlFactory',
    __AttributeControlFactory = '$AttributeControlFactory',
    __Document = '$Document',
    __DispatchEventInstance = '$DispatchEventInstance',
    __ErrorEventStatic = '$ErrorEventStatic',
    __EventManagerStatic = '$EventManagerStatic',
    __LifecycleEventStatic = '$LifecycleEventStatic',
    __NavigationEventStatic = '$NavigationEventStatic',
    __ExceptionStatic = '$ExceptionStatic',
    __Parser = '$Parser',
    __Regex = '$Regex',
    __Tokenizer = '$Tokenizer',
    __NavigatorInstance = '$NavigatorInstance',
    __RoutingNavigator = '$RoutingNavigator',
    __ContextManagerStatic = '$ContextManagerStatic',
    __Compiler = '$Compiler',
    __CommentManagerFactory = '$CommentManagerFactory',
    __ElementManagerFactory = '$ElementManagerFactory',
    __NodeManagerStatic = '$NodeManagerStatic',
    __TextManagerFactory = '$TextManagerFactory',
    __CacheFactory = '$CacheFactory',
    __ManagerCache = '$ManagerCache',
    __TemplateCache = '$TemplateCache',
    __Animator = '$Animator',
    __AttributesInstance = '$AttributesInstance',
    __BindableTemplatesFactory = '$BindableTemplatesFactory',
    __Dom = '$Dom',
    __DomEvents = '$DomEvents',
    __DomEventsConfig = '$DomEventsConfig',
    __DomEventInstance = '$DomEventInstance',
    __ResourcesFactory = '$ResourcesFactory',
    __TemplateControlFactory = '$TemplateControlFactory',
    __BaseViewControlFactory = '$BaseViewControlFactory',
    __Utils = '$Utils',
    __Browser = '$Browser',
    __BrowserConfig = '$BrowserConfig',
    __Router = '$Router',
    __UrlUtilsInstance = '$UrlUtilsInstance',
    __Window = '$Window',
    __LocalStorage = '$LocalStorage',
    __SessionStorage = '$SessionStorage',
    __Geolocation = '$Geolocation',

    /**
     * Controls
     */
    __Plat = 'plat-',
    __Bind = __Plat + 'bind',
    __Href = __Plat + 'href',
    __Src = __Plat + 'src',
    __KeyDown = __Plat + 'keydown',
    __KeyPress = __Plat + 'keypress',
    __KeyUp = __Plat + 'keyup',
    __Name = __Plat + 'name',
    __Options = __Plat + 'options',
    __Checked = __Plat + 'checked',
    __Disabled = __Plat + 'disabled',
    __Selected = __Plat + 'selected',
    __ReadOnly = __Plat + 'readonly',
    __Visible = __Plat + 'visible',
    __Style = __Plat + 'style',
    __Tap = __Plat + 'tap',
    __Blur = __Plat + 'blur',
    __Change = __Plat + 'change',
    __Copy = __Plat + 'copy',
    __Cut = __Plat + 'cut',
    __Paste = __Plat + 'paste',
    __DblTap = __Plat + 'dbltap',
    __Focus = __Plat + 'focus',
    __Submit = __Plat + 'submit',
    __TouchStart = __Plat + 'touchstart',
    __TouchEnd = __Plat + 'touchend',
    __TouchMove = __Plat + 'touchmove',
    __TouchCancel = __Plat + 'touchcancel',
    __Hold = __Plat + 'hold',
    __Release = __Plat + 'release',
    __Swipe = __Plat + 'swipe',
    __SwipeLeft = __Plat + 'swipeleft',
    __SwipeRight = __Plat + 'swiperight',
    __SwipeUp = __Plat + 'swipeup',
    __SwipeDown = __Plat + 'swipedown',
    __Track = __Plat + 'track',
    __TrackLeft = __Plat + 'trackleft',
    __TrackRight = __Plat + 'trackright',
    __TrackUp = __Plat + 'trackup',
    __TrackDown = __Plat + 'trackdown',
    __TrackEnd = __Plat + 'trackend',
    __Anchor = 'a',
    __ForEach = __Plat + 'foreach',
    __Html = __Plat + 'html',
    __If = __Plat + 'if',
    __Ignore = __Plat + 'ignore',
    __Select = __Plat + 'select',
    __Template = __Plat + 'template',
    __Routeport = __Plat + 'routeport',
    __Viewport = __Plat + 'viewport',

    /**
     * Animations
     */
    __Hide = __Plat + 'hide',
    __Animating = __Plat + 'animating',
    __SimpleAnimation = __Plat + 'animation',
    __SimpleTransition = __Plat + 'transition',
    __Enter = __Plat + 'enter',
    __Leave = __Plat + 'leave',
    __Move = __Plat + 'move',
    __FadeIn = __Plat + 'fadein',
    __FadeOut = __Plat + 'fadeout',

    /**
     * Custom events
     */
    __$tap = '$tap',
    __$dbltap = '$dbltap',
    __$touchstart = '$touchstart',
    __$touchend = '$touchend',
    __$touchmove = '$touchmove',
    __$touchcancel = '$touchcancel',
    __$hold = '$hold',
    __$release = '$release',
    __$swipe = '$swipe',
    __$swipeleft = '$swipeleft',
    __$swiperight = '$swiperight',
    __$swipeup = '$swipeup',
    __$swipedown = '$swipedown',
    __$track = '$track',
    __$trackleft = '$trackleft',
    __$trackright = '$trackright',
    __$trackup = '$trackup',
    __$trackdown = '$trackdown',
    __$trackend = '$trackend',

    /**
     * Constants
     */
    __startSymbol = '{{',
    __endSymbol = '}}',
    __STATIC = 'static',
    __SINGLETON = 'singleton',
    __INSTANCE = 'instance',
    __FACTORY = 'factory',
    __CLASS = 'class',
    __CSS = 'css',
    __COMPILED = '-compiled',
    __BOUND_PREFIX = '-@',
    __END_SUFFIX = '-end',
    __START_NODE = ': start node',
    __END_NODE = ': end node',
    __JS = 'js',
    __noopInjector = 'noop';
/* tslint:enable:no-unused-variable */
